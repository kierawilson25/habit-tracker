// pages/about.tsx
import React from 'react';
import Link from "next/link";
import "../../utils/styles/global.css"; // Import global styles

const ResetPassword = () => {
    const activeButtonClass = "bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 transition-colors duration-200"

  return (
    <div className="page-dark">
      <div className="min-h-screen px-6 py-12 flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl font-bold text-green-600 text-center mb-8 pb-4">
          Coming Soon ....
        </h1>
        
      </div>
    </div>
  );
};

export default ResetPassword;