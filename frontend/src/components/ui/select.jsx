// src/components/ui/select.jsx
import React, { useState } from 'react';

export function Select({ children }) {
    return <div className="relative">{children}</div>;
}

export function SelectTrigger({ onClick, children }) {
    return (
        <button
            type="button"
            className="p-2 border rounded-md w-full text-left"
            onClick={onClick}
        >
            {children}
        </button>
    );
}

export function SelectValue({ children }) {
    return <span>{children}</span>;
}

export function SelectContent({ isOpen, children }) {
    if (!isOpen) return null;
    return (
        <div className="absolute bg-white border mt-1 w-full rounded-md shadow">
            {children}
        </div>
    );
}

export function SelectItem({ value, onSelect, children }) {
    return (
        <div
            className="p-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => onSelect(value)}
        >
            {children}
        </div>
    );
}
