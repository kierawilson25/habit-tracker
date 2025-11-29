import { ReactNode } from "react";
import { H1 } from "@/components";

interface PageHeaderProps {
  icon: ReactNode;
  iconBgColor?: "red" | "green" | "blue" | "yellow" | "purple";
  title: string;
  subtitle?: string;
  className?: string;
}

const iconBgColorMap = {
  red: "bg-red-500",
  green: "bg-green-500",
  blue: "bg-blue-500",
  yellow: "bg-yellow-500",
  purple: "bg-purple-500"
};

export default function PageHeader({
  icon,
  iconBgColor = "green",
  title,
  subtitle,
  className = ""
}: PageHeaderProps) {
  return (
    <div className={`text-center mb-6 ${className}`}>
      <div className={`w-20 h-20 ${iconBgColorMap[iconBgColor]} rounded-lg flex items-center justify-center mx-auto mb-4`}>
        {icon}
      </div>
      <H1 text={title} />
      {subtitle && (
        <p className="text-gray-300 text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}
