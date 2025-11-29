// Design System Color Palette
export const colorPalette = {
  primary: [
    {
      name: "Green 50",
      hex: "#f0fdf4",
      rgb: "rgb(240, 253, 244)",
      usage: "Lightest green, used for subtle backgrounds and highlights",
      contrast: "AAA"
    },
    {
      name: "Green 100",
      hex: "#dcfce7",
      rgb: "rgb(220, 252, 231)",
      usage: "Light green, used for container backgrounds",
      contrast: "AAA"
    },
    {
      name: "Green 200",
      hex: "#bbf7d0",
      rgb: "rgb(187, 247, 208)",
      usage: "Soft green, used for borders and accents",
      contrast: "AA"
    },
    {
      name: "Green 300",
      hex: "#86efac",
      rgb: "rgb(134, 239, 172)",
      usage: "Medium light green, for hover states",
      contrast: "AA"
    },
    {
      name: "Green 400",
      hex: "#4ade80",
      rgb: "rgb(74, 222, 128)",
      usage: "Primary green, main brand color",
      contrast: "AA"
    },
    {
      name: "Green 500",
      hex: "#22c55e",
      rgb: "rgb(34, 197, 94)",
      usage: "Default green, buttons and primary actions",
      contrast: "AAA"
    },
    {
      name: "Green 600",
      hex: "#16a34a",
      rgb: "rgb(22, 163, 74)",
      usage: "Darker green, active states and emphasis",
      contrast: "AAA"
    }
  ],
  secondary: [
    {
      name: "Blue 50",
      hex: "#eff6ff",
      rgb: "rgb(239, 246, 255)",
      usage: "Lightest blue, info backgrounds",
      contrast: "AAA"
    },
    {
      name: "Blue 200",
      hex: "#bfdbfe",
      rgb: "rgb(191, 219, 254)",
      usage: "Light blue, info borders",
      contrast: "AA"
    },
    {
      name: "Blue 500",
      hex: "#3b82f6",
      rgb: "rgb(59, 130, 246)",
      usage: "Primary blue, informational elements",
      contrast: "AAA"
    },
    {
      name: "Blue 800",
      hex: "#1e40af",
      rgb: "rgb(30, 64, 175)",
      usage: "Dark blue, info text",
      contrast: "AAA"
    }
  ],
  accent: [
    {
      name: "Red 50",
      hex: "#fef2f2",
      rgb: "rgb(254, 242, 242)",
      usage: "Lightest red, error backgrounds",
      contrast: "AAA"
    },
    {
      name: "Red 200",
      hex: "#fecaca",
      rgb: "rgb(254, 202, 202)",
      usage: "Light red, error borders",
      contrast: "AA"
    },
    {
      name: "Red 500",
      hex: "#ef4444",
      rgb: "rgb(239, 68, 68)",
      usage: "Primary red, error states",
      contrast: "AAA"
    },
    {
      name: "Red 800",
      hex: "#991b1b",
      rgb: "rgb(153, 27, 27)",
      usage: "Dark red, error text",
      contrast: "AAA"
    },
    {
      name: "Yellow 50",
      hex: "#fefce8",
      rgb: "rgb(254, 252, 232)",
      usage: "Lightest yellow, warning backgrounds",
      contrast: "AAA"
    },
    {
      name: "Yellow 200",
      hex: "#fef08a",
      rgb: "rgb(254, 240, 138)",
      usage: "Light yellow, warning borders",
      contrast: "AA"
    },
    {
      name: "Yellow 500",
      hex: "#eab308",
      rgb: "rgb(234, 179, 8)",
      usage: "Primary yellow, warning states",
      contrast: "AA"
    },
    {
      name: "Yellow 800",
      hex: "#854d0e",
      rgb: "rgb(133, 77, 14)",
      usage: "Dark yellow, warning text",
      contrast: "AAA"
    }
  ],
  neutral: [
    {
      name: "Black",
      hex: "#000000",
      rgb: "rgb(0, 0, 0)",
      usage: "Pure black, main background",
      contrast: "AAA"
    },
    {
      name: "Gray 100",
      hex: "#f3f4f6",
      rgb: "rgb(243, 244, 246)",
      usage: "Lightest gray, subtle backgrounds",
      contrast: "AAA"
    },
    {
      name: "Gray 200",
      hex: "#e5e7eb",
      rgb: "rgb(229, 231, 235)",
      usage: "Light gray, borders",
      contrast: "AA"
    },
    {
      name: "Gray 300",
      hex: "#d1d5db",
      rgb: "rgb(209, 213, 219)",
      usage: "Medium light gray, disabled states",
      contrast: "AA"
    },
    {
      name: "Gray 400",
      hex: "#9ca3af",
      rgb: "rgb(156, 163, 175)",
      usage: "Medium gray, secondary text",
      contrast: "AA"
    },
    {
      name: "Gray 700",
      hex: "#374151",
      rgb: "rgb(55, 65, 81)",
      usage: "Dark gray, text on light backgrounds",
      contrast: "AAA"
    },
    {
      name: "Gray 800",
      hex: "#1f2937",
      rgb: "rgb(31, 41, 55)",
      usage: "Very dark gray, cards and containers",
      contrast: "AAA"
    },
    {
      name: "White",
      hex: "#ffffff",
      rgb: "rgb(255, 255, 255)",
      usage: "Pure white, text on dark backgrounds",
      contrast: "AAA"
    }
  ]
};

// Component categories for navigation
export const componentCategories = {
  layout: {
    name: "Layout",
    components: ["PageLayout", "Container"]
  },
  typography: {
    name: "Typography",
    components: ["H1"]
  },
  forms: {
    name: "Forms & Inputs",
    components: ["Button", "TextBox", "Checkbox", "EditableHabitInput"]
  },
  feedback: {
    name: "Feedback",
    components: ["AlertBox", "Loading", "Toast", "PopupBanner"]
  },
  navigation: {
    name: "Navigation",
    components: ["AppHeader", "Footer", "SecondaryLink", "PageHeader"]
  },
  dataDisplay: {
    name: "Data Display",
    components: ["StatCard", "HabitCell", "StreakCell", "StreakCalendar"]
  }
};
