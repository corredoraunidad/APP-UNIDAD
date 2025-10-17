/**
 * Componente SearchResultItem
 * 
 * Representa un resultado individual de búsqueda.
 * Muestra icono, título, subtítulo y badge opcional.
 */

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { useTheme } from '../../contexts/ThemeContext';
import { getSearchResultIcon, getSearchResultColor } from '../../utils/searchUtils';
import type { SearchResult } from '../../types/search';

interface SearchResultItemProps {
  result: SearchResult;
  onClick: (result: SearchResult) => void;
  isSelected?: boolean;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({
  result,
  onClick,
  isSelected = false,
}) => {
  const { text, textSecondary, hoverBg } = useThemeClasses();
  const { isDarkMode } = useTheme();

  // Obtener icono dinámico según el tipo
  const IconComponent = getSearchResultIcon(result.type, result.metadata);
  const iconColorClass = getSearchResultColor(result.type);

  const handleClick = () => {
    onClick(result);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(result);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        px-4 py-3
        cursor-pointer
        transition-colors
        flex items-center gap-3
        ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : hoverBg}
        group
      `}
      aria-label={`Ir a ${result.title}`}
    >
      {/* Icono */}
      <div className={`flex-shrink-0 ${iconColorClass}`}>
        <IconComponent className="w-5 h-5" />
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        {/* Título */}
        <div className={`font-medium ${text} truncate`}>
          {result.title}
        </div>

        {/* Subtítulo */}
        {result.subtitle && (
          <div className={`text-sm ${textSecondary} truncate`}>
            {result.subtitle}
          </div>
        )}
      </div>

      {/* Badge opcional */}
      {result.badge && (
        <div className="flex-shrink-0">
          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
            {result.badge}
          </span>
        </div>
      )}

      {/* Icono de flecha */}
      <div className={`flex-shrink-0 ${textSecondary} opacity-0 group-hover:opacity-100 transition-opacity`}>
        <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  );
};

export default SearchResultItem;

