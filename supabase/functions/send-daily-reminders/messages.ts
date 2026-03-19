/**
 * Funny message templates for daily habit reminder emails
 * Inspired by Duolingo's playful, guilt-inducing style
 */

export const INCOMPLETE_MESSAGES = [
  "Please I'm begging, complete a habit",
  "I'm yearning for you to track some habits",
  "Hey queen, I miss you 👑",
  "Your habits are feeling lonely...",
  "Don't leave me hanging! Track those habits 🌟",
  "I'm not mad, just disappointed 😔",
  "Your future self called, they want those habits tracked",
  "Come back... the habits need you",
  "Just checking in... your habits are getting cold",
  "I'll be here. Waiting. Patiently. Forever... 🥺",
];

export const INCOMPLETE_SUBJECTS = [
  "Your habits are giving me abandonment issues 🥺",
  "We need to talk about your habits...",
  "Your habits: 📉 My disappointment: 📈",
  "I see you started... but didn't finish 👀",
  "So close, yet so far... (from completing your habits)",
  "Your habits miss you already",
];

export const NO_TRACKING_MESSAGES = [
  "Seriously? Not even ONE habit today? 😱",
  "I'm not crying, you're crying (because no habits tracked)",
  "This is your sign to track a habit. This is it. Right now.",
  "Your habits miss you more than I do",
  "Zero habits tracked. My disappointment is immeasurable.",
  "I see how it is... leaving me on read AND your habits untracked",
  "The habits are sad. I'm sad. Everyone's sad. Except you, apparently.",
  "NOT A SINGLE HABIT? Bold strategy.",
  "Your habits called. They want to know if you're okay.",
  "Breaking news: Local person forgets they have habits to track",
];

export const NO_TRACKING_SUBJECTS = [
  "This is fine. Everything is fine. (It's not fine) 🔥",
  "We need to talk about today... 😬",
  "Your habits: 0. My concern: 📈",
  "Houston, we have a problem...",
  "NOT EVEN ONE?! 😱",
  "Your habits are filing a missing person report",
];

/**
 * Get a random message from an array
 */
export function getRandomMessage(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get subject line and message for email based on completion type
 */
export function getEmailContent(type: 'incomplete' | 'none'): {
  subject: string;
  message: string;
} {
  if (type === 'incomplete') {
    return {
      subject: getRandomMessage(INCOMPLETE_SUBJECTS),
      message: getRandomMessage(INCOMPLETE_MESSAGES),
    };
  } else {
    return {
      subject: getRandomMessage(NO_TRACKING_SUBJECTS),
      message: getRandomMessage(NO_TRACKING_MESSAGES),
    };
  }
}
