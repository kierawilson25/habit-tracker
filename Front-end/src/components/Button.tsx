import React from 'react';
import Link from 'next/link';

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  type?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({
  children,
  href,
  disabled = false,
  onClick,
  className = '',
  type 
}) => {
  // Your original styles
  const baseStyles = 'rounded px-4 py-2 transition-colors duration-200 text-center';
  
  let buttonClass = '';
//   disabled
//     ? `${baseStyles} bg-gray-400 text-gray-200 cursor-not-allowed ${className}`
//     : `${baseStyles} bg-green-600 text-white hover:bg-green-700 ${className}`;

    if (disabled){
        buttonClass = `${baseStyles} bg-gray-400 text-gray-200 cursor-not-allowed ${className}`
    } else if (type == "secondary"){
        buttonClass = `${baseStyles} bg-gray-600 hover:bg-gray-700 text-white ${className}`
    } else {
        buttonClass = `${baseStyles} bg-green-600 text-white hover:bg-green-700 ${className}`;
    }



  // If href is provided, render as Link
  if (href && !disabled) {
    return (
      <Link href={href} className={buttonClass}>
        {children}
      </Link>
    );
  }

  // Otherwise render as button
  return (
    <button
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;