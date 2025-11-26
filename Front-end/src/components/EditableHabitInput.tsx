"use client";
import { HiOutlinePencil } from "react-icons/hi2";
import { IoIosCloseCircleOutline, IoIosCheckmarkCircle } from "react-icons/io";
import TextBox from "./TextBox";

interface EditableHabitInputProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onDelete: () => void;
  onEdit: () => void;
  disabled: boolean;
  placeholder?: string;
  maxLength?: number;
  name: string;
  id: string;
}

export default function EditableHabitInput({
  value,
  onChange,
  onSave,
  onDelete,
  onEdit,
  disabled,
  placeholder,
  maxLength = 50,
  name,
  id
}: EditableHabitInputProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1" style={{ marginBottom: 0 }}>
        <TextBox
          label=""
          type="text"
          name={name}
          id={id}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={
            disabled
              ? "bg-gray-300 disabled focus:outline-none"
              : "hover:ring-2 hover:ring-green-500 focus:outline-none transition-colors duration-200"
          }
        />
      </div>

      {/* Show edit/delete buttons when disabled (viewing mode) */}
      {value !== "" && disabled ? (
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="p-1 text-gray-500 hover:text-green-600"
            onClick={onEdit}
            aria-label="Edit habit"
          >
            <HiOutlinePencil className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="p-1 text-gray-500 hover:text-red-600"
            onClick={onDelete}
            aria-label="Delete habit"
          >
            <IoIosCloseCircleOutline className="h-6 w-6" />
          </button>
        </div>
      ) : (
        /* Show save/delete buttons when enabled (editing mode) */
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="p-1"
            onClick={onSave}
            aria-label="Save habit"
          >
            <IoIosCheckmarkCircle className="h-6 w-6 text-green-500 hover:text-green-800" />
          </button>
          <button
            type="button"
            className="p-1 text-gray-500 hover:text-red-600"
            onClick={onDelete}
            aria-label="Delete habit"
          >
            <IoIosCloseCircleOutline className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  );
}
