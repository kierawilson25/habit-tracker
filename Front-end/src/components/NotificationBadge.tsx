/**
 * NotificationBadge Component
 *
 * Displays a red badge with unread notification count.
 * Hides when count is 0, truncates at 99+.
 *
 * @example
 * <NotificationBadge count={5} className="absolute -top-1 -right-2" />
 */

export interface NotificationBadgeProps {
  /**
   * Number of unread notifications
   */
  count: number;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export default function NotificationBadge({
  count,
  className = '',
}: NotificationBadgeProps) {
  // Don't render anything if count is 0
  if (count === 0) return null;

  // Truncate at 99+
  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <span
      className={`min-w-[20px] h-5 flex items-center justify-center bg-red-600 text-white text-xs font-bold px-1.5 rounded-full ${className}`}
      aria-label={`${count} unread notification${count === 1 ? '' : 's'}`}
    >
      {displayCount}
    </span>
  );
}
