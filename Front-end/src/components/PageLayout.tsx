import { ReactNode } from 'react';

interface PageLayoutProps {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
  padding?: "sm" | "md" | "lg";
  centered?: boolean;
  className?: string;
}

const maxWidthMap = {
  sm: "400px",
  md: "600px",
  lg: "800px",
  xl: "1024px",
  "2xl": "1280px"
};

const paddingMap = {
  sm: "1rem",
  md: "2rem",
  lg: "3rem"
};

export default function PageLayout({
  children,
  maxWidth = "md",
  padding = "md",
  centered = true,
  className = ""
}: PageLayoutProps) {
  const containerStyle = centered
    ? {
        maxWidth: maxWidthMap[maxWidth],
        margin: "auto",
        padding: paddingMap[padding]
      }
    : {
        padding: paddingMap[padding]
      };

  return (
    <div className={`page-dark min-h-screen ${className}`}>
      <div style={containerStyle}>
        {children}
      </div>
    </div>
  );
}
