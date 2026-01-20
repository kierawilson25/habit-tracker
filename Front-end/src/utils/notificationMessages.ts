/**
 * Fun, varied notification messages with a bit of personality
 * Because even notifications should be interesting!
 */

export interface NotificationMessage {
  message: string;
}

/**
 * Get a random message for friend post notifications
 */
export function getFriendPostMessage(): NotificationMessage {
  const messages: NotificationMessage[] = [
    { message: 'just posted something 👀' },
    { message: 'has activity to share ✨' },
    { message: 'posted an update (check it out!)' },
    { message: 'is up to something... 📢' },
    { message: 'dropped a new post' },
    { message: 'shared their progress 🎯' },
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get a random message for like notifications
 */
export function getLikeMessage(): NotificationMessage {
  const messages: NotificationMessage[] = [
    { message: 'liked your activity ❤️' },
    { message: 'gave you a like! 💚' },
    { message: 'is a fan of your post ⭐' },
    { message: 'showed your post some love 💕' },
    { message: 'appreciated your activity ✨' },
    { message: 'liked what you did 👍' },
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get a random message for comment notifications (with comment text)
 */
export function getCommentMessageWithText(commentText: string): NotificationMessage {
  const truncated = commentText.slice(0, 60);
  const suffix = commentText.length > 60 ? '...' : '';

  const messages: NotificationMessage[] = [
    { message: `commented: "${truncated}${suffix}"` },
    { message: `said: "${truncated}${suffix}" 💬` },
    { message: `left a comment: "${truncated}${suffix}"` },
    { message: `dropped a comment: "${truncated}${suffix}"` },
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get a random message for comment notifications (without comment text)
 */
export function getCommentMessage(): NotificationMessage {
  const messages: NotificationMessage[] = [
    { message: 'commented on your activity 💬' },
    { message: 'left a comment 💭' },
    { message: 'had something to say about your post' },
    { message: 'dropped a comment on your activity' },
    { message: 'commented on what you did 💬' },
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get a random message for friend request notifications
 */
export function getFriendRequestMessage(): NotificationMessage {
  const messages: NotificationMessage[] = [
    { message: 'sent you a friend request 👋' },
    { message: 'wants to be friends! 🤝' },
    { message: 'sent a friend request ✨' },
    { message: 'wants to connect with you 🌟' },
    { message: 'sent you a friend request 💫' },
    { message: 'would like to be your friend 🎯' },
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}
