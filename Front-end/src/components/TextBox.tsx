"use client";
// components/TextBox.tsx
import { useState } from "react";

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
  disabled?: boolean;
  showPasswordToggle?: boolean;
  error?: boolean;
  errorMessage?: string;
  maxLength?: number;
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
  disabled = false,
  showPasswordToggle = false,
  error = false,
  errorMessage,
  maxLength,
}: TextBoxProps) {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = showPasswordToggle && type === "password"
    ? (showPassword ? "text" : "password")
    : type;

  const borderStyle = error
    ? "1px solid #dc2626"
    : "1px solid #ccc";

  return (
    <div style={{ marginBottom: "1rem" }}>
      {label && (
        <label htmlFor={id} className="text-white">
          {label}
        </label>
      )}
      <div style={{ position: "relative" }}>
        <input
          type={inputType}
          name={name}
          id={id}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          style={{
            width: "100%",
            padding: "0.5rem",
            paddingRight: showPasswordToggle ? "4rem" : "0.5rem",
            borderRadius: "4px",
            border: borderStyle,
            marginTop: "0.25rem",
          }}
          className={`text-black ${className}`}
        />
        {showPasswordToggle && type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "0.5rem",
              top: "50%",
              transform: "translateY(-50%)",
              padding: "0.25rem 0.5rem",
              fontSize: "0.875rem",
              color: "#16a34a",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {error && errorMessage && (
        <p style={{ color: "#dc2626", fontSize: "0.875rem", marginTop: "0.25rem" }}>
          {errorMessage}
        </p>
      )}
    </div>
  );
}