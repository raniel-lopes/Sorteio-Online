import React from 'react';

export function Checkbox({ id, label, checked, onCheckedChange, onChange }) {
    // Use onCheckedChange se existir, senão use onChange
    const handleChange = (e) => {
        if (onCheckedChange) {
            onCheckedChange(e.target.checked);
        }
        if (onChange) {
            onChange(e);
        }
    };

    return (
        <div className="flex items-center space-x-2">
            <input type="checkbox" id={id} checked={checked} onChange={handleChange} />
            <label htmlFor={id}>{label}</label>
        </div>
    );
}