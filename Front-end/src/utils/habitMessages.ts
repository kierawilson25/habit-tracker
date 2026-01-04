/**
 * Unhinged, pop-culture-inspired habit completion messages
 * Because productivity should be FUN (and slightly chaotic)
 */

export interface HabitMessage {
  title: string;
  message: string;
  badge?: string;
  icon?: string;
}

/**
 * Get a random message for when ALL habits are completed
 * Duolingo energy: Chaotic celebration with underlying threats
 */
export function getAllHabitsMessage(totalCount: number): HabitMessage {
  const messages: HabitMessage[] = [
    {
      title: "LOOK AT YOU. LOOK. AT. YOU. 👁️",
      message: `All ${totalCount} habit${totalCount !== 1 ? 's' : ''} done. I'm watching. Always watching. Do it again tomorrow.`,
      badge: "Gold Star Day! ⭐",
      icon: "👁️"
    },
    {
      title: "I KNEW you had it in you",
      message: `(I didn't.) But all ${totalCount} habit${totalCount !== 1 ? 's' : ''} completed! Prove me wrong again tomorrow.`,
      badge: "Shocked ⭐",
      icon: "😮"
    },
    {
      title: "Finally. FINALLY. 🎉",
      message: `${totalCount}/${totalCount} habits? Was that so hard? (Don't answer that.)`,
      badge: "Gold Star Day! ⭐",
      icon: "🎉"
    },
    {
      title: "Okay now do it again tomorrow 🔄",
      message: `All ${totalCount} done TODAY. But tomorrow? We'll see. I'll be here. Waiting.`,
      badge: "Gold Star Day! ⭐",
      icon: "🔄"
    },
    {
      title: "Don't get used to this praise 😤",
      message: `${totalCount}/${totalCount} completed. Great. Now make it a streak or it doesn't count.`,
      badge: "Gold Star Day! ⭐",
      icon: "😤"
    },
    {
      title: "YESSSS THAT'S WHAT I'M TALKING ABOUT",
      message: `All ${totalCount} habits! This is the energy I've been WAITING for! Keep it up or else.`,
      badge: "Gold Star Day! ⭐",
      icon: "🔥"
    },
    {
      title: "You actually did it... 😳",
      message: `All ${totalCount}? I'm... impressed? Don't make this a one-time thing.`,
      badge: "Gold Star Day! ⭐",
      icon: "😳"
    },
    {
      title: "PERFECTION. NOW DON'T RUIN IT. ⭐",
      message: `${totalCount}/${totalCount} habits completed. The pressure is ON for tomorrow.`,
      badge: "Gold Star Day! ⭐",
      icon: "⭐"
    }
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get a message for when MOST (70-99%) habits are completed
 * Duolingo energy: SO CLOSE but make it weird
 */
export function getMostHabitsMessage(completed: number, total: number): HabitMessage {
  const messages: HabitMessage[] = [
    {
      title: "So close I can TASTE it 👅",
      message: `${completed}/${total} habits done. Just finish. FINISH. Do it. DO IT NOW.`,
      badge: `Almost Gold ⭐`,
      icon: "👅"
    },
    {
      title: "ONE. MORE. HABIT. 😤",
      message: `${completed}/${total}??? You're RIGHT THERE. Finish what you started or I'll remember this.`,
      badge: "SO CLOSE",
      icon: "😤"
    },
    {
      title: "Almost doesn't count 🙃",
      message: `${completed}/${total} is cute but Gold Star Day requires ALL. You know what to do.`,
      badge: "Almost There!",
      icon: "🙃"
    },
    {
      title: "You're KILLING me here 💀",
      message: `${completed}/${total} done. ONE MORE and we're golden. Why are you like this?`,
      badge: "Agony",
      icon: "💀"
    },
    {
      title: "I'm not leaving until you finish 🪑",
      message: `${completed}/${total} habits. I'll wait. Take your time. I have NOWHERE to be.`,
      badge: "Waiting...",
      icon: "🪑"
    }
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get a message for when SOME (30-69%) habits are completed
 * Duolingo energy: Judgmental but still hopeful you'll do better
 */
export function getSomeHabitsMessage(completed: number, total: number): HabitMessage {
  const messages: HabitMessage[] = [
    {
      title: "Interesting choice... 🤨",
      message: `${completed}/${total} habits? Bold of you to stop there. Very bold. I'm taking notes.`,
      badge: "Questionable",
      icon: "🤨"
    },
    {
      title: "I mean... if you say so 😬",
      message: `${completed}/${total} done. If that's what you're calling 'done' then sure. I won't judge. (I will.)`,
      badge: "Sure Jan",
      icon: "😬"
    },
    {
      title: "Not the half-effort energy 💅",
      message: `${completed}/${total} done. Okay werk... but I KNOW you can do better. Don't play with me.`,
      badge: "It's Giving... Meh",
      icon: "💅"
    },
    {
      title: "You're gonna leave it like this? 👀",
      message: `${completed}/${total} habits. Really? That's the final answer? Lock it in? ...I'll wait.`,
      badge: "Really Though?",
      icon: "👀"
    },
    {
      title: "I've seen better... 🛋️",
      message: `${completed}/${total}? I've seen you do ${total}/${total}. I KNOW what you're capable of. This ain't it.`,
      badge: "Disappointed",
      icon: "🛋️"
    },
    {
      title: "We both know you can do more 👁️👄👁️",
      message: `${completed}/${total}. It's cute. But those other ${total - completed} habits? They're lonely. Finish them.`,
      badge: "Unfinished Business",
      icon: "👁️"
    }
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get a message for when FEW or NO (0-29%) habits are completed
 * Duolingo energy: Maximum desperation and passive-aggressive shade
 */
export function getFewHabitsMessage(completed: number, total: number): HabitMessage {
  if (completed === 0) {
    const zeroMessages: HabitMessage[] = [
      {
        title: "You can't ignore me all day 👁️",
        message: `0/${total} habits done. I'll be here. Waiting. Watching. Always watching.`,
        badge: "Still Waiting...",
        icon: "👁️"
      },
      {
        title: "I'll do ANYTHING",
        message: `Seriously. ANYTHING to get you to check off just ONE habit. I'm begging you.`,
        badge: "Desperate Times",
        icon: "🥺"
      },
      {
        title: "These habits don't track themselves 💀",
        message: `0/${total}? I mean... I could be doing other things right now but here we are. Together. Forever.`,
        badge: "Still Here...",
        icon: "💀"
      },
      {
        title: "Hello?? IS THIS THING ON?! 📢",
        message: `0/${total}??? Wake up! There are ${total} habits SCREAMING for attention!`,
        badge: "SOS",
        icon: "📢"
      },
      {
        title: "It's been 84 years... ⏰",
        message: `Still 0 habits. I've been refreshing. Checking. Hoping. Crying. Nothing.`,
        badge: "Rock Bottom",
        icon: "⏰"
      },
      {
        title: "I miss you 🥺",
        message: `Remember when you used to check off habits? That was nice. I miss that version of you. Come back.`,
        badge: "Come Back",
        icon: "🥺"
      },
      {
        title: "Don't make me beg 🙏",
        message: `${total} habits waiting. I'm not above begging. I'll get on my knees. Please. Just one.`,
        badge: "Begging Now",
        icon: "🙏"
      },
      {
        title: "We need to talk 😐",
        message: `0/${total}. I'm not angry. I'm just... concerned. About us. About your choices.`,
        badge: "Intervention Time",
        icon: "😐"
      }
    ];
    return zeroMessages[Math.floor(Math.random() * zeroMessages.length)];
  }

  const fewMessages: HabitMessage[] = [
    {
      title: "Is this all I get? 😬",
      message: `${completed}/${total} habits? After everything we've been through? I was expecting... more. Way more.`,
      badge: "Underwhelming",
      icon: "😬"
    },
    {
      title: "I'm not mad... 🙃",
      message: `${completed}/${total}? I'm just disappointed. My expectations were low but WOW. You know what to do.`,
      badge: "Disappointed",
      icon: "🙃"
    },
    {
      title: "Not this... 🤦",
      message: `${completed}/${total} habits? The potential is RIGHT THERE. You're SO CLOSE to mediocre. Keep going.`,
      badge: "Could Be Better",
      icon: "🤦"
    },
    {
      title: "I'll pretend I didn't see this 👀",
      message: `${completed}/${total} done. Want to try again? I'll give you a do-over. I'm generous like that.`,
      badge: "Second Chances",
      icon: "👀"
    },
    {
      title: "This is awkward... 😶",
      message: `${completed}/${total}. I don't even know what to say. The bar was on the floor and you still... okay.`,
      badge: "Speechless",
      icon: "😶"
    }
  ];

  return fewMessages[Math.floor(Math.random() * fewMessages.length)];
}

/**
 * Get the appropriate message based on completion percentage
 */
export function getHabitCompletionMessage(completed: number, total: number): HabitMessage {
  if (total === 0) {
    return {
      title: "No habits yet? 🤔",
      message: "Add some habits to get started on your journey!",
      badge: "Getting Started",
      icon: "🌱"
    };
  }

  const percentage = (completed / total) * 100;

  if (percentage === 100) {
    return getAllHabitsMessage(total);
  } else if (percentage >= 70) {
    return getMostHabitsMessage(completed, total);
  } else if (percentage >= 30) {
    return getSomeHabitsMessage(completed, total);
  } else {
    return getFewHabitsMessage(completed, total);
  }
}
