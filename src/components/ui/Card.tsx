import React from 'react';
import type { CardProps } from '../../types';
import { useThemeClasses } from '../../hooks/useThemeClasses';

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = true,
}) => {
  const { bgCard, border, shadowCard } = useThemeClasses();
  const getPaddingStyles = () => {
    const paddingMap = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };
    return paddingMap[padding];
  };

  const baseStyles = `
    ${bgCard} rounded-2xl border ${border}
    ${shadow ? shadowCard : ''}
    ${getPaddingStyles()}
    ${className}
  `;

  return (
    <div className={baseStyles}>
      {children}
    </div>
  );
};

export default Card; 