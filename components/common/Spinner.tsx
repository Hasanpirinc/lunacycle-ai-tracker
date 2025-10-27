import React from 'react';

export const Spinner: React.FC<{large?: boolean}> = ({ large=false }) => {
  const size = large ? "h-12 w-12" : "h-8 w-8";
  return (
    <div className={`animate-spin rounded-full ${size} border-t-2 border-b-2 border-pink-500`}></div>
  );
};