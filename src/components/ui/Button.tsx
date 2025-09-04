import React from 'react';
import type { ButtonProps } from '../../types';

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'contained',
  color = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  fullWidth = false,
}) => {
  const getVariantStyles = () => {
    const colorMap = {
      primary: {
        contained: 'bg-[#fd8412] text-white hover:bg-[#e6760f] focus:ring-[#fd8412]',
        outlined: 'border-[#fd8412] text-[#fd8412] hover:bg-[#fd8412] hover:text-white focus:ring-[#fd8412]',
        text: 'text-[#fd8412] hover:bg-[#fd8412] hover:bg-opacity-10 focus:ring-[#fd8412]',
      },
      secondary: {
        contained: 'bg-[#1D1F3C] text-white hover:bg-opacity-90 focus:ring-[#1D1F3C]',
        outlined: 'border-[#1D1F3C] text-[#1D1F3C] hover:bg-[#1D1F3C] hover:text-white focus:ring-[#1D1F3C]',
        text: 'text-[#1D1F3C] hover:bg-[#1D1F3C] hover:bg-opacity-10 focus:ring-[#1D1F3C]',
      },
      error: {
        contained: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        outlined: 'border-red-600 text-red-600 hover:bg-red-600 hover:text-white focus:ring-red-500',
        text: 'text-red-600 hover:bg-red-600 hover:bg-opacity-10 focus:ring-red-500',
      },
      success: {
        contained: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
        outlined: 'border-green-600 text-green-600 hover:bg-green-600 hover:text-white focus:ring-green-500',
        text: 'text-green-600 hover:bg-green-600 hover:bg-opacity-10 focus:ring-green-500',
      },
    };

    return colorMap[color][variant];
  };

  const getSizeStyles = () => {
    const sizeMap = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return sizeMap[size];
  };

  const baseStyles = `
    inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variant === 'outlined' ? 'border-2' : ''}
    ${fullWidth ? 'w-full' : ''}
  `;

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
      )}
      {children}
    </button>
  );
};

export default Button; 