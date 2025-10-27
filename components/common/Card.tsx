import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ children, className = '' }, ref) => {
        return (
            <div ref={ref} className={`bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden ${className}`}>
                {children}
            </div>
        );
    }
);
Card.displayName = 'Card';