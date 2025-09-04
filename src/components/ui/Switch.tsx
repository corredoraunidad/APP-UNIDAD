import React from 'react';
import type { SwitchProps } from '../../types';

const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  className = '',
  label,
}) => {
  const handleChange = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const baseStyles = `
    relative inline-flex h-6 w-11 items-center rounded-full
    transition-colors duration-200 ease-in-out focus:outline-none
    focus:ring-2 focus:ring-[#fd8412] focus:ring-offset-2
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${checked ? 'bg-[#fd8412]' : 'bg-gray-300'}
  `;

  const toggleStyles = `
    inline-block h-4 w-4 transform rounded-full bg-white
    transition-transform duration-200 ease-in-out
    ${checked ? 'translate-x-6' : 'translate-x-1'}
  `;

  return (
    <div className={`flex items-center ${className}`}>
      {label && (
        <label className="mr-3 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <button
        type="button"
        className={baseStyles}
        onClick={handleChange}
        disabled={disabled ?? undefined}
        role="switch"
        aria-checked={checked}
        aria-label={label || 'Toggle switch'}
      >
        <span className={toggleStyles} />
      </button>
    </div>
  );
};

export default Switch; 