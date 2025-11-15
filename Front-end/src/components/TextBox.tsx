// components/TextBox.tsx
interface TextBoxProps {
  label: string;
  type?: string;
  name: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export default function TextBox({
  label,
  type = "text",
  name,
  id,
  value,
  onChange,
  required = false,
  placeholder,
  className = "",
}: TextBoxProps) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label htmlFor={id} className="text-white">
        {label}
      </label>
      <input
        type={type}
        name={name}
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        style={{ width: "100%", padding: "0.5rem" }}
        className={`text-black ${className}`}
      />
    </div>
  );
}