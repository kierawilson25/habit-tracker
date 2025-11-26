"use client";

interface PopupBannerProps {
  isVisible: boolean;
  isAnimating: boolean;
  title: string;
  message: string;
  badge?: string;
  icon?: string;
}

export default function PopupBanner({
  isVisible,
  isAnimating,
  title,
  message,
  badge,
  icon = "⭐"
}: PopupBannerProps) {
  if (!isVisible && !isAnimating) return null;

  return (
    <div className={`w-full px-4 ${isVisible ? 'animate-slide-down' : 'animate-slide-up'}`}>
      <div
        className="px-6 py-5 rounded-lg text-center border-2 shadow-xl relative overflow-hidden"
        style={{
          backgroundColor: "rgba(34, 197, 94, 0.15)",
          borderColor: "rgba(251, 191, 36, 0.8)",
        }}
      >
        {/* Subtle glow effect */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: "radial-gradient(circle at center, rgba(251, 191, 36, 0.3) 0%, transparent 70%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Icon */}
          <div className="text-5xl mb-2 animate-pulse">{icon}</div>

          {/* Title */}
          <div className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {title}
          </div>

          {/* Message */}
          <div className="text-base sm:text-lg text-gray-200 mb-3">
            {message}
          </div>

          {/* Optional badge */}
          {badge && (
            <div className="inline-block px-4 py-2 rounded-full border-2 border-yellow-400 bg-yellow-400/10">
              <span className="text-lg sm:text-xl font-bold text-yellow-300">
                {badge}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
