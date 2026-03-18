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
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${subject}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    :root { color-scheme: light dark; supported-color-schemes: light dark; }
    body { margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #ffffff; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse; mso-table-lspace: 0; mso-table-rspace: 0; }
    .email-wrapper { width: 100%; background-color: #000000; }
    .email-container { max-width: 600px; background-color: #000000; }
    .header { text-align: center; padding: 40px 40px 20px; border-bottom: 2px solid #333333; }
    .app-name { color: #22c55e; font-size: 32px; font-weight: 600; margin: 0; }
    .content { text-align: center; padding: 32px 40px; }
    .greeting { color: #22c55e !important; font-size: 24px; font-weight: 600; margin: 0 0 20px; }
    .message { font-size: 20px; color: #ffffff !important; margin: 30px 0; font-weight: 500; line-height: 1.5; }
    .stats-text { color: #cccccc !important; font-size: 15px; margin: 0; }
    .cta-button { display: inline-block; background-color: #22c55e; color: #ffffff !important; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; mso-padding-alt: 0; }
    .footer { padding: 20px 40px 40px; border-top: 1px solid #333333; text-align: center; }
    .footer-text { color: #cccccc !important; font-size: 14px; margin: 10px 0; }

    /* ── Light mode overrides ── */
    @media (prefers-color-scheme: light) {
      body, .email-wrapper, .email-container { background-color: #f9fafb !important; }
      .header { border-bottom-color: #e5e7eb !important; }
      .message { color: #111827 !important; }
      .stats-text { color: #374151 !important; }
      .footer { border-top-color: #e5e7eb !important; }
      .footer-text { color: #6b7280 !important; }
    }

    /* Outlook.com dark mode */
    [data-ogsc] body, [data-ogsc] .email-wrapper, [data-ogsc] .email-container { background-color: #000000 !important; }
    [data-ogsc] .message { color: #ffffff !important; }
    [data-ogsc] .stats-text { color: #cccccc !important; }

    /* ── Mobile ── */
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .header, .content, .footer { padding-left: 24px !important; padding-right: 24px !important; }
      .app-name { font-size: 28px !important; }
      .message { font-size: 18px !important; }
      .cta-button { padding: 14px 28px !important; font-size: 15px !important; }
    }
  </style>
</head>
<body>
  <!-- Preheader -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${status.completedToday} of ${status.totalHabits} habits tracked today — don't stop now! &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="email-wrapper">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" class="email-container">

          <!-- Header -->
          <tr>
            <td class="header">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto 16px;">
                <tr>
                  <td style="width:48px;height:48px;background-color:#22c55e;border-radius:12px;text-align:center;vertical-align:middle;">
                    <span style="color:#ffffff;font-size:24px;font-weight:700;line-height:1;">H</span>
                  </td>
                </tr>
              </table>
              <h1 class="app-name">Grains of Sand</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td class="content">
              <h2 class="greeting">Hey ${username}! 👋</h2>

              <p class="message">${message}</p>

              <!-- Stats box -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px auto; width: 100%; max-width: 400px;">
                <tr>
                  <td style="background-color:#1a1a1a;border-left:4px solid #22c55e;border-radius:4px;padding:16px;text-align:left;">
                    <p class="stats-text">
                      <strong style="color:#22c55e;">Today's Progress:</strong>
                      ${status.completedToday} of ${status.totalHabits} habits tracked
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <!--[if mso]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"
                href="https://grainsofsand.app"
                style="height:52px;v-text-anchor:middle;width:260px;"
                arcsize="15%" fillcolor="#22c55e" strokecolor="#22c55e">
                <w:anchorlock/>
                <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:600;">Track Your Habits Now →</center>
              </v:roundrect>
              <![endif]-->
              <!--[if !mso]><!-->
              <div style="padding: 10px 0 30px;">
                <a href="https://grainsofsand.app" class="cta-button">Track Your Habits Now →</a>
              </div>
              <!--<![endif]-->
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer">
              <p class="footer-text">You're receiving this because you enabled daily habit reminders in your notification settings.</p>
              <p class="footer-text"><a href="https://grainsofsand.app/profile/edit" style="color:#22c55e;text-decoration:none;">Manage notification preferences</a></p>
              <p style="color:#22c55e;font-weight:600;font-size:14px;margin:10px 0 0;">Keep building those habits! 🌱</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    await resend.emails.send({
      from: 'Grains of Sand <noreply@grainsofsand.app>',
      to: email,
      subject: subject,
      html: htmlContent,
    });
  } catch (error) {
    console.error('Error sending email via Resend:', error);
    throw error;
  }
}
