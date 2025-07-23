// src/components/ui/button.jsx
import React from 'react';

export function Button({ children, variant = 'solid', className, ...props }) {
    const buttonClass = variant === 'outline'
        ? 'border border-gray-500 text-gray-700'
        : 'bg-blue-600 text-white hover:bg-blue-700';

    return (
        <button className={`px-4 py-2 rounded-md ${buttonClass} ${className}`} {...props}>
            {children}
        </button>
    );
}
