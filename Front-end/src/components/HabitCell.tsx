import Checkbox from "./Checkbox";

interface HabitCellProps {
  title: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function HabitCell({ title, checked, onChange }: HabitCellProps) {
  return (
    <div className="flex-1 min-w-0">
      <div
        className="w-full px-3 py-3 sm:px-4 sm:py-4 rounded-lg border-2 transition-transform duration-200"
        style={{
          backgroundColor: "rgba(34, 197, 94, 0.2)",
          borderColor: "rgba(34, 197, 94, 1)",
        }}
      >
        <Checkbox
          label={title}
          checked={checked}
          onChange={onChange}
        />
      </div>
    </div>
  );
}
