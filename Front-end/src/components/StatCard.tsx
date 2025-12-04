interface StatCardProps {
  value: number | string;
  label: string;
  color?: "blue" | "purple" | "yellow" | "orange" | "pink" | "green" | "red";
  className?: string;
}

export default function StatCard({
  value,
  label,
  color = "green",
  className = ""
}: StatCardProps) {
  const colorClasses = {
    blue: {
      text: "text-blue-400",
      bg: "bg-blue-900/40",
      border: "border-blue-400/80"
    },
    purple: {
      text: "text-purple-400",
      bg: "bg-purple-900/40",
      border: "border-purple-400/80"
    },
    yellow: {
      text: "text-yellow-400",
      bg: "bg-yellow-900/40",
      border: "border-yellow-400/80"
    },
    orange: {
      text: "text-orange-400",
      bg: "bg-orange-900/40",
      border: "border-orange-400/80"
    },
    pink: {
      text: "text-pink-400",
      bg: "bg-pink-900/40",
      border: "border-pink-400/80"
    },
    green: {
      text: "text-green-400",
      bg: "bg-green-900/40",
      border: "border-green-500/80"
    },
    red: {
      text: "text-rose-400",
      bg: "bg-rose-900/40",
      border: "border-rose-400/80"
    }
  };

  const colors = colorClasses[color];

  return (
    <div className={`${colors.bg} rounded-lg p-4 border ${colors.border} text-center ${className}`}>
      <div className={`text-2xl sm:text-3xl font-bold ${colors.text}`}>
        {value}
      </div>
      <div className="text-sm text-gray-400 mt-1">{label}</div>
    </div>
  );
}
