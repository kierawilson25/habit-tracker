/**
 * Unhinged, Duolingo-style messages for the activity feed
 * Because even feed updates should have ENERGY
 */

export interface FeedMessage {
  message: string;
}

/**
 * Get a random message for habit completion posts
 */
export function getHabitCompletionFeedMessage(habitTitle?: string): FeedMessage {
  const withHabit: FeedMessage[] = [
    { message: `just CRUSHED ${habitTitle}` },
    { message: `did the thing: ${habitTitle} ✓` },
    { message: `completed ${habitTitle} (it's giving discipline 💪)` },
    { message: `checked off ${habitTitle} and lived to tell the tale` },
    { message: `knocked out ${habitTitle} like a CHAMPION` },
    { message: `${habitTitle}? DONE. Next.` },
    { message: `didn't skip ${habitTitle} today 👀` },
  ];

  const withoutHabit: FeedMessage[] = [
    { message: 'checked off a habit (mysterious vibes ✨)' },
    { message: 'completed a secret habit 🤫' },
    { message: 'did something productive (allegedly)' },
    { message: 'checked a box and felt ALIVE' },
  ];

  if (habitTitle) {
    return withHabit[Math.floor(Math.random() * withHabit.length)];
  } else {
    return withoutHabit[Math.floor(Math.random() * withoutHabit.length)];
  }
}

/**
 * Get a random message for Gold Star Day achievement
 */
export function getGoldStarDayFeedMessage(totalHabits: number): FeedMessage {
  const messages: FeedMessage[] = [
    { message: `earned a ⭐ GOLD STAR DAY ⭐ (${totalHabits}/${totalHabits} habits crushed!)` },
    { message: `unlocked GOLD STAR DAY status (all ${totalHabits} habits? LEGENDARY.)` },
    { message: `got that GOLD STAR ENERGY ⭐ (${totalHabits}/${totalHabits} completed)` },
    { message: `achieved PERFECTION (${totalHabits} habits done! WOW!)` },
    { message: `went FULL SEND on all ${totalHabits} habits ⭐ GOLD STAR UNLOCKED` },
    { message: `said "watch this" and completed ALL ${totalHabits} habits 🌟` },
    { message: `just had a GOLD STAR DAY (${totalHabits} habits don't stand a chance)` },
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get a random message for streak milestone
 */
export function getStreakMilestoneFeedMessage(streakCount: number, habitTitle?: string): FeedMessage {
  const withHabit: FeedMessage[] = [
    { message: `hit a ${streakCount}-DAY STREAK on ${habitTitle}! 🔥 (unstoppable energy)` },
    { message: `reached ${streakCount} days straight on ${habitTitle}! (CONSISTENCY QUEEN/KING 👑)` },
    { message: `just hit ${streakCount} days of ${habitTitle} (and counting 📈)` },
    { message: `${streakCount}-day streak UNLOCKED on ${habitTitle} 🔓` },
    { message: `made it to ${streakCount} days on ${habitTitle}! (the dedication is REAL)` },
    { message: `${habitTitle}: ${streakCount} days and THRIVING 🔥` },
    { message: `${streakCount} days of ${habitTitle}! (someone stop them! actually don't)` },
  ];

  const withoutHabit: FeedMessage[] = [
    { message: `reached a ${streakCount}-day streak! 🔥 (built different)` },
    { message: `hit ${streakCount} days in a row! (the grind never stops)` },
    { message: `${streakCount}-day streak ACTIVATED 🚀` },
    { message: `${streakCount} days of EXCELLENCE achieved` },
  ];

  if (habitTitle) {
    return withHabit[Math.floor(Math.random() * withHabit.length)];
  } else {
    return withoutHabit[Math.floor(Math.random() * withoutHabit.length)];
  }
}

/**
 * Get a random message for new longest streak achievement
 */
export function getNewLongestStreakFeedMessage(
  newStreak: number,
  previousLongest: number,
  habitTitle?: string
): FeedMessage {
  const withHabit: FeedMessage[] = [
    { message: `just SET A NEW RECORD on ${habitTitle}! ${newStreak} days (beat their ${previousLongest}-day streak!)` },
    { message: `SHATTERED their old record on ${habitTitle}! ${newStreak} days (previous best: ${previousLongest})` },
    { message: `leveled UP on ${habitTitle}: ${newStreak} days! (old record: ${previousLongest}... cute.)` },
    { message: `new LONGEST STREAK on ${habitTitle}: ${newStreak} days! 💜 (was ${previousLongest}, now LOOK AT THEM)` },
    { message: `${habitTitle} new record: ${newStreak} DAYS 📈 (previous: ${previousLongest}. that's growth baby!)` },
    { message: `broke their own record on ${habitTitle}! ${newStreak} days (${previousLongest} who? we don't know her)` },
    { message: `NEW HIGH SCORE on ${habitTitle}: ${newStreak} days! (old record: ${previousLongest} - DEMOLISHED)` },
  ];

  const withoutHabit: FeedMessage[] = [
    { message: `set a NEW LONGEST STREAK: ${newStreak} days! 💜 (previous: ${previousLongest})` },
    { message: `RECORD BROKEN: ${newStreak}-day streak! (beat their old ${previousLongest}-day record!)` },
    { message: `new personal best: ${newStreak} DAYS! 📈 (was ${previousLongest}, now we're HERE)` },
    { message: `leveled up to ${newStreak} days! (previous record: ${previousLongest} - CRUSHED)` },
  ];

  if (habitTitle) {
    return withHabit[Math.floor(Math.random() * withHabit.length)];
  } else {
    return withoutHabit[Math.floor(Math.random() * withoutHabit.length)];
  }
}
