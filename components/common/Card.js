import React from 'react';

export const Card = React.forwardRef(
    ({ children, className = '' }, ref) => {
        return (
            <div ref={ref} className={`bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden ${className}`}>
                {children}
            </div>
        );
    }
);
Card.displayName = 'Card';