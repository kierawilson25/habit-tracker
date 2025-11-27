import React from 'react';
import Link from 'next/link';

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  type?: 'primary' | 'secondary' | 'danger';
  variant?: 'solid' | 'outline';
  htmlType?: 'button' | 'submit' | 'reset';
  loading?: boolean;
  fullWidth?: boolean;
  roundedFull?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  href,
  disabled = false,
  onClick,
  className = '',
  type = 'primary',
  variant = 'solid',
  htmlType = 'button',
  loading = false,
  fullWidth = false,
  roundedFull = false
}) => {
  const baseStyles = `${roundedFull ? 'rounded-full' : 'rounded'} px-4 py-2 transition-colors duration-200 text-center ${fullWidth ? 'w-full' : ''}`;

  let buttonClass = '';

  if (disabled || loading) {
    buttonClass = `${baseStyles} bg-gray-600 text-gray-200 cursor-not-allowed disabled:bg-gray-600 disabled:cursor-not-allowed ${className}`;
  } else {
    // Determine color scheme based on type
    if (type === 'danger') {
      if (variant === 'outline') {
        buttonClass = `${baseStyles} border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white ${className}`;
      } else {
        buttonClass = `${baseStyles} bg-red-600 text-white hover:bg-red-700 ${className}`;
      }
    } else if (type === 'secondary') {
      if (variant === 'outline') {
        buttonClass = `${baseStyles} border-2 border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white ${className}`;
      } else {
        buttonClass = `${baseStyles} bg-gray-600 hover:bg-gray-700 text-white ${className}`;
      }
    } else {
      // primary
      if (variant === 'outline') {
        buttonClass = `${baseStyles} border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white ${className}`;
      } else {
        buttonClass = `${baseStyles} bg-green-600 text-white hover:bg-green-700 ${className}`;
      }
    }
  }

  // If href is provided, render as Link
  if (href && !disabled && !loading) {
    return (
      <Link href={href} className={buttonClass}>
        {children}
      </Link>
    );
  }

  // Otherwise render as button
  return (
    <button
      type={htmlType}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {children}
    </button>
  );
};

export default Button;