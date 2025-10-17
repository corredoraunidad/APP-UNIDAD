/**
 * Componente SearchInput
 * 
 * Input de búsqueda con icono de lupa, autofocus y botón de limpiar.
 * Se integra con el tema light/dark de la aplicación.
 */

import React, { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { useTheme } from '../../contexts/ThemeContext';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  disabled?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Buscar en toda la app...',
  autoFocus = true,
  disabled = false,
}) => {
  const { text, textSecondary, border, bgCard } = useThemeClasses();
  const { isDarkMode } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);

  // Autofocus al montar
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleClear = () => {
    onClear();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Evitar que Escape cierre el modal desde el input
    if (e.key === 'Escape') {
      e.stopPropagation();
      handleClear();
    }
  };

  return (
    <div className="relative w-full">
      {/* Icono de búsqueda */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <Search className={`w-5 h-5 ${textSecondary}`} />
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full
          pl-12 pr-12 py-4
          ${bgCard}
          ${text}
          ${border}
          border-b
          outline-none
          text-lg
          placeholder:${textSecondary}
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
        `}
        aria-label="Buscar"
      />

      {/* Botón de limpiar */}
      {value && (
        <button
          onClick={handleClear}
          className={`
            absolute right-4 top-1/2 transform -translate-y-1/2
            ${textSecondary}
            ${isDarkMode ? 'hover:text-gray-100' : 'hover:text-gray-900'}
            ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
            transition-colors
            p-1
            rounded
          `}
          aria-label="Limpiar búsqueda"
          type="button"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;

