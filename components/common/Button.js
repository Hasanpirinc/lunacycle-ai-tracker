import React from 'react';

export const Button = ({ children, className = '', size = 'md', ...props }) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`font-semibold text-white bg-pink-500 rounded-full shadow-sm hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-transform transform hover:scale-105 ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};