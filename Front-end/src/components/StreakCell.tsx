interface StreakCellProps {
  streak: number;
}

export default function StreakCell({ streak }: StreakCellProps) {
  return (
    <div className="w-16 sm:w-20 flex-shrink-0">
      <div
        className="border-2 rounded-lg p-2 sm:p-3 flex items-center justify-center h-[56px] sm:h-[64px] transition-transform duration-200"
        style={{
          backgroundColor: "rgba(34, 197, 94, 0.05)",
          borderColor: "rgba(34, 197, 94, 1)",
        }}
      >
        <div className="flex items-center justify-center">
          <span className="text-base sm:text-lg font-bold text-white">
            {streak || 0}
          </span>
        </div>
      </div>
    </div>
  );
}
