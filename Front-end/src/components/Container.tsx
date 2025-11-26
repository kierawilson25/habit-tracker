import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
  color?: "green" | "blue" | "red" | "yellow";
}

export default function Container({
  children,
  className = "",
  padding = "md",
  color = "green"
}: ContainerProps) {
  const paddingClasses = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8"
  };

  const colorClasses = {
    green: "bg-green-900/40 border-green-500/80",
    blue: "bg-blue-900/40 border-blue-400/80",
    red: "bg-red-900/40 border-red-400/80",
    yellow: "bg-yellow-900/40 border-yellow-400/80"
  };

  return (
    <div className={`rounded-lg ${paddingClasses[padding]} border ${colorClasses[color]} ${className}`}>
      {children}
    </div>
  );
}
