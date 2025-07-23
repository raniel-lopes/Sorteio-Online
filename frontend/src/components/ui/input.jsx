// src/components/ui/input.jsx
import React from 'react';

export function Input({ type = "text", placeholder, className, ...props }) {
    return (
        <input
            type={type}
            placeholder={placeholder}
            className={`p-2 border rounded-md ${className}`}
            {...props}
        />
    );
}
