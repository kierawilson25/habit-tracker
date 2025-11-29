import { ReactNode } from "react";

interface AlertBoxProps {
  children: ReactNode;
  type?: "error" | "success" | "info" | "warning";
  className?: string;
}

const alertStyles = {
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800"
  },
  success: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-800"
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800"
  },
  warning: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-800"
  }
};

export default function AlertBox({
  children,
  type = "info",
  className = ""
}: AlertBoxProps) {
  const styles = alertStyles[type];

  return (
    <div className={`${styles.bg} border-2 ${styles.border} rounded-lg p-4 ${className}`}>
      <div className={styles.text}>
        {children}
      </div>
    </div>
  );
}
