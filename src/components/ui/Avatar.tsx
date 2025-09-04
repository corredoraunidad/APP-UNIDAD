import React from 'react';
import type { AvatarProps } from '../../types';

const Avatar: React.FC<AvatarProps> = ({
  size = 80,
  label,
  src,
  className = '',
  backgroundColor = '#fd8412',
  textColor = '#ffffff'
}) => {
  const getInitials = (text: string): string => {
    return text
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(label || '');

  const baseStyles = `
    inline-flex items-center justify-center rounded-full
    font-bold text-center select-none flex-shrink-0
    ${className}
  `;

  if (src) {
    return (
      <img
        src={src}
        alt={label}
        className={`${baseStyles} object-cover`}
        style={{
          width: size,
          height: size,
        }}
      />
    );
  }

  return (
    <div
      className={baseStyles}
      style={{
        width: size,
        height: size,
        backgroundColor,
        color: textColor,
        fontSize: size * 0.4, // Tamaño de fuente proporcional
      }}
    >
      {initials}
    </div>
  );
};

export default Avatar; 