import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: string | LucideIcon;
  mainStat: {
    label: string;
    value: string | number;
  };
  onClick: () => void;
  className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  icon,
  mainStat,
  onClick,
  className = '',
}) => {
  const { bgCard, text, textSecondary, textMuted, shadowCard } = useThemeClasses();
  // Función para renderizar el icono
  const renderIcon = () => {
    if (typeof icon === 'string') {
      // Si es string (emoji), lo renderizamos como antes
      return (
        <div className="text-3xl mr-4 group-hover:scale-110 transition-transform duration-200">
          {icon}
        </div>
      );
    } else {
      // Si es un componente Lucide, lo renderizamos con las props adecuadas
      const IconComponent = icon;
      return (
        <div className="mr-4 group-hover:scale-110 transition-transform duration-200">
          <IconComponent 
            size={32} 
            className="text-[#1e3a8a] group-hover:text-[#1d4ed8] transition-colors duration-200" 
          />
        </div>
      );
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        ${bgCard} rounded-xl ${shadowCard} hover:shadow-lg p-8
        cursor-pointer transition-all duration-300
        group ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-center mb-6">
        {renderIcon()}
        <div>
          <h3 className={`text-xl font-bold ${text}`}>
            {title}
          </h3>
          <p className={`text-sm ${textSecondary} mt-1`}>
            {description}
          </p>
        </div>
      </div>

      {/* Estadística principal */}
      <div className="text-center mb-6">
        <div className="text-4xl font-bold text-[#fd8412] mb-2">
          {mainStat.value}
        </div>
        <div className={`text-sm ${textMuted} font-medium`}>
          {mainStat.label}
        </div>
      </div>

      {/* Ver detalles */}
      <div className="flex items-center justify-center text-blue-600 hover:text-blue-800 transition-colors">
        <span className="text-sm font-medium">
          Ver detalles
        </span>
        <svg 
          className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 5l7 7-7 7" 
          />
        </svg>
      </div>
    </div>
  );
};

export default DashboardCard; 