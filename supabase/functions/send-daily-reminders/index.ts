// @ts-nocheck - Deno Edge Function (uses Deno runtime, not Node.js)
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import { Resend } from 'https://esm.sh/resend@3.2.0';
import { getEmailContent } from './messages.ts';

// CORS headers for allowing requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HabitCompletionStatus {
  totalHabits: number;
  completedToday: number;
  status: 'all' | 'some' | 'none';
}

interface UserToNotify {
  user_id: string;
  email: string;
  username: string;
  reminder_if_incomplete_enabled: boolean;
  reminder_if_none_enabled: boolean;
  reminder_time: string;
  timezone: string;
}

/**
 * Main handler for daily habit reminder emails
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Starting daily habit reminder job...');

    // Initialize Supabase client with service role key (needed to access auth.users)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!;

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toLocaleDateString('en-CA');
    console.log(`Processing reminders for date: ${today}`);

    // Step 1: Get all users who have email notifications enabled
    const { data: notificationPrefs, error: prefsError } = await supabase
      .from('notification_preferences')
      .select('user_id, reminder_if_incomplete_enabled, reminder_if_none_enabled, reminder_time, timezone')
      .eq('email_enabled', true)
      .eq('daily_reminder_enabled', true);

    if (prefsError) {
      console.error('Error fetching notification preferences:', prefsError);
      throw prefsError;
    }

    if (!notificationPrefs || notificationPrefs.length === 0) {
      console.log('No users with email notifications enabled');
      return new Response(
        JSON.stringify({ message: 'No users to notify' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    console.log(`Found ${notificationPrefs.length} users with notifications enabled`);

    // Step 2: Get user emails and usernames from auth and profiles
    const usersToNotify: UserToNotify[] = [];

    for (const pref of notificationPrefs) {
      try {
        // Get user email from auth.users
        const { data: authData, error: authError } = await supabase.auth.admin.getUserById(pref.user_id);

        if (authError || !authData.user || !authData.user.email) {
          console.log(`Skipping user ${pref.user_id} - no email found`);
          continue;
        }

        // Get username from user_profiles
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('username')
          .eq('id', pref.user_id)
          .single();

        if (profileError || !profileData) {
          console.log(`Skipping user ${pref.user_id} - no profile found`);
          continue;
        }

        usersToNotify.push({
          user_id: pref.user_id,
          email: authData.user.email,
          username: profileData.username,
          reminder_if_incomplete_enabled: pref.reminder_if_incomplete_enabled,
          reminder_if_none_enabled: pref.reminder_if_none_enabled,
          reminder_time: pref.reminder_time,
          timezone: pref.timezone,
        });
      } catch (err) {
        console.error(`Error processing user ${pref.user_id}:`, err);
      }
    }

    console.log(`Processing ${usersToNotify.length} users for habit completion status`);

    // Get current UTC hour
    const currentUtcHour = new Date().getUTCHours();

    // Step 3: For each user, check if it's their reminder time, then check habits and send email
    let emailsSent = 0;
    let emailsSkipped = 0;

    for (const user of usersToNotify) {
      // Check if it's the right time for this user based on their timezone
      if (!isReminderTime(user.timezone, user.reminder_time, currentUtcHour)) {
        console.log(`Skipping user ${user.username} - not their reminder time yet`);
        emailsSkipped++;
        continue;
      }
      try {
        // Get habit completion status
        const status = await getHabitCompletionStatus(supabase, user.user_id, today);

        console.log(`User ${user.username}: ${status.completedToday}/${status.totalHabits} habits completed`);

        // Determine if we should send an email
        const shouldSend = shouldSendEmail(user, status);

        if (!shouldSend) {
          console.log(`Skipping user ${user.username} - no email needed`);
          emailsSkipped++;
          continue;
        }

        // Determine email type
        const emailType = status.status === 'none' ? 'none' : 'incomplete';

        // Get email content with random funny message
        const { subject, message } = getEmailContent(emailType);

        // Send email via Resend
        await sendReminderEmail(
          resend,
          user.email,
          user.username,
          subject,
          message,
          status
        );

        console.log(`Sent ${emailType} email to ${user.username} (${user.email})`);
        emailsSent++;

      } catch (err) {
        console.error(`Error processing user ${user.username}:`, err);
      }
    }

    console.log(`Job complete. Sent: ${emailsSent}, Skipped: ${emailsSkipped}`);

    return new Response(
      JSON.stringify({
        message: 'Daily reminders processed',
        emailsSent,
        emailsSkipped,
        totalUsers: usersToNotify.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in daily reminder function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

/**
 * Get habit completion status for a user on a specific date
 */
async function getHabitCompletionStatus(
  supabase: any,
  userId: string,
  date: string
): Promise<HabitCompletionStatus> {
  // Get total active habits (not archived)
  const { data: habits, error: habitsError } = await supabase
    .from('habits')
    .select('id')
    .eq('user_id', userId)
    .eq('is_archived', false);

  if (habitsError) {
    console.error('Error fetching habits:', habitsError);
    throw habitsError;
  }

  const totalHabits = habits?.length ?? 0;

  // Get today's completions
  const { data: completions, error: completionsError } = await supabase
    .from('habit_completions')
    .select('habit_id')
    .eq('user_id', userId)
    .eq('completion_date', date);

  if (completionsError) {
    console.error('Error fetching completions:', completionsError);
    throw completionsError;
  }

  const completedToday = completions?.length ?? 0;

  // Determine status
  let status: 'all' | 'some' | 'none';
  if (totalHabits === 0 || completedToday === 0) {
    status = 'none';
  } else if (completedToday === totalHabits) {
    status = 'all';
  } else {
    status = 'some';
  }

  return {
    totalHabits,
    completedToday,
    status,
  };
}

/**
 * Determine if we should send an email to this user based on their preferences and status
 */
function shouldSendEmail(user: UserToNotify, status: HabitCompletionStatus): boolean {
  // Don't send if all habits completed
  if (status.status === 'all') {
    return false;
  }

  // Don't send if user has no habits
  if (status.totalHabits === 0) {
    return false;
  }

  // Check user preferences
  if (status.status === 'none' && !user.reminder_if_none_enabled) {
    return false;
  }

  if (status.status === 'some' && !user.reminder_if_incomplete_enabled) {
    return false;
  }

  return true;
}

/**
 * Check if current UTC hour matches user's reminder time in their timezone
 */
function isReminderTime(timezone: string, reminderTime: string, currentUtcHour: number): boolean {
  try {
    // Parse the reminder time (HH:MM:SS format)
    const reminderHour = parseInt(reminderTime.split(':')[0]);

    // Calculate timezone offset in hours
    const now = new Date();

    // Create a date in the user's timezone
    const userTimeString = now.toLocaleString('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false
    });

    const userHour = parseInt(userTimeString);

    // Check if user's current hour matches their reminder hour
    return userHour === reminderHour;
  } catch (error) {
    console.error(`Error checking reminder time for timezone ${timezone}:`, error);
    // Default to sending if there's an error parsing timezone
    return true;
  }
}

/**
 * Send reminder email using Resend
 */
async function sendReminderEmail(
  resend: any,
  email: string,
  username: string,
  subject: string,
  message: string,
  status: HabitCompletionStatus
): Promise<void> {
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #000000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #ffffff;
    }

    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #000000;
      padding: 40px 20px;
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #333333;
    }

    .logo-section {
      margin-bottom: 20px;
    }

    .habit-icon {
      width: 48px;
      height: 48px;
      background-color: #22c55e;
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }

    .habit-icon::before {
      content: "H";
      color: white;
      font-size: 24px;
      font-weight: bold;
    }

    h1 {
      color: #22c55e;
      font-size: 32px;
      font-weight: 600;
      margin: 0;
      text-align: center;
    }

    .content {
      text-align: center;
      padding: 20px 0;
    }

    h2 {
      color: #22c55e;
      font-size: 24px;
      margin-bottom: 20px;
    }

    p {
      color: #ffffff;
      font-size: 16px;
      margin: 20px 0;
      line-height: 1.6;
    }

    .message {
      font-size: 20px;
      color: #ffffff;
      margin: 30px 0;
      font-weight: 500;
    }

    .stats {
      background-color: #1a1a1a;
      border-left: 4px solid #22c55e;
      padding: 16px;
      margin: 24px auto;
      border-radius: 4px;
      max-width: 400px;
      text-align: left;
    }

    .stats-text {
      color: #cccccc;
      font-size: 15px;
    }

    .confirmation-button {
      display: inline-block;
      background-color: #22c55e;
      color: #ffffff !important;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      margin: 30px 0;
      transition: background-color 0.2s ease;
    }

    .confirmation-button:hover {
      background-color: #16a34a;
    }

    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #333333;
      text-align: center;
    }

    .footer p {
      font-size: 14px;
      color: #cccccc;
      margin: 10px 0;
    }

    .footer a {
      color: #22c55e;
      text-decoration: none;
    }

    @media only screen and (max-width: 600px) {
      .email-container {
        padding: 20px 15px;
      }

      h1 {
        font-size: 28px;
      }

      .confirmation-button {
        padding: 14px 28px;
        font-size: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo-section">
        <div class="habit-icon"></div>
      </div>
      <h1>Grains of Sand</h1>
    </div>

    <div class="content">
      <h2>Hey ${username}! 👋</h2>

      <div class="message">
        ${message}
      </div>

      <div class="stats">
        <div class="stats-text">
          <strong style="color: #22c55e;">Today's Progress:</strong> ${status.completedToday} of ${status.totalHabits} habits tracked
        </div>
      </div>

      <a href="https://grainsofsand.app" class="confirmation-button">
        Track Your Habits Now →
      </a>
    </div>

    <div class="footer">
      <p>You're receiving this because you enabled daily habit reminders in your notification settings.</p>
      <p><a href="https://grainsofsand.app/profile/edit">Manage notification preferences</a></p>
      <p style="color: #22c55e; font-weight: 600;">Keep building those habits! 🌱</p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    await resend.emails.send({
      from: 'Habit Tracker <noreply@grainsofsand.app>',
      to: email,
      subject: subject,
      html: htmlContent,
    });
  } catch (error) {
    console.error('Error sending email via Resend:', error);
    throw error;
  }
}
