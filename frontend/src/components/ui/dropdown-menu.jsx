// src/components/ui/dropdown-menu.jsx
import React from 'react';

export function DropdownMenu({ children }) {
    return <div>{children}</div>;
}

export function DropdownMenuTrigger({ children }) {
    return <button>{children}</button>;
}

export function DropdownMenuContent({ children }) {
    return <div>{children}</div>;
}

export function DropdownMenuItem({ onClick, children }) {
    return (
        <div onClick={onClick} className="cursor-pointer">
            {children}
        </div>
    );
}
