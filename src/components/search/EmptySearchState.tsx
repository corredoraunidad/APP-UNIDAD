/**
 * Componente EmptySearchState
 * 
 * Muestra diferentes estados vacíos según el contexto de la búsqueda.
 * - Sin query: Muestra sugerencias de uso
 * - Query muy corto: Indica mínimo de caracteres
 * - Sin resultados: Ofrece sugerencias
 */

import React from 'react';
import { Search, FileSearch, Lightbulb } from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { useTheme } from '../../contexts/ThemeContext';

interface EmptySearchStateProps {
  query: string;
  minQueryLength?: number;
}

const EmptySearchState: React.FC<EmptySearchStateProps> = ({
  query,
  minQueryLength = 3,
}) => {
  const { text, textSecondary } = useThemeClasses();
  const { isDarkMode } = useTheme();

  // Sin query: Estado inicial
  if (!query || query.trim().length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <Search className={`w-16 h-16 ${textSecondary} mb-4`} />
        <h3 className={`text-lg font-medium ${text} mb-2`}>
          Busca en toda la app
        </h3>
        <p className={`${textSecondary} text-sm max-w-md mb-3`}>
          Encuentra usuarios, archivos, compañías, contactos y métodos de pago de forma rápida.
        </p>
        
        {/* Indicación del comando */}
        <div className={`${textSecondary} text-xs flex items-center gap-2`}>
          <span>Presiona</span>
          <kbd className={`px-2 py-1 rounded text-xs font-mono ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
            {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}
          </kbd>
          <kbd className={`px-2 py-1 rounded text-xs font-mono ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
            K
          </kbd>
          <span>para abrir desde cualquier lugar</span>
        </div>

 

        {/* Shortcut hint */}
        <div className={`mt-4 ${textSecondary} text-xs`}>
          <span className="inline-flex items-center gap-1">
            Presiona <kbd className={`px-2 py-1 rounded font-mono text-xs ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>Esc</kbd> para cerrar
          </span>
        </div>
      </div>
    );
  }

  // Query muy corto
  if (query.trim().length < minQueryLength) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <Lightbulb className={`w-12 h-12 ${textSecondary} mb-4`} />
        <p className={`${textSecondary} text-sm`}>
          Escribe al menos {minQueryLength} caracteres para buscar
        </p>
      </div>
    );
  }

  // Sin resultados
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <FileSearch className={`w-16 h-16 ${textSecondary} mb-4`} />
      <h3 className={`text-lg font-medium ${text} mb-2`}>
        No se encontraron resultados
      </h3>
      <p className={`${textSecondary} text-sm mb-6`}>
        No encontramos nada para <span className="font-semibold">"{query}"</span>
      </p>

      {/* Sugerencias */}
      <div className={`${textSecondary} text-sm text-left max-w-md`}>
        <p className="font-medium mb-2 flex items-center gap-1.5">
          <Lightbulb className="w-4 h-4" />
          Sugerencias:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Verifica la ortografía</li>
          <li>Intenta con términos más generales</li>
          <li>Usa menos palabras</li>
          <li>Verifica que tengas permisos para ver el contenido</li>
        </ul>
      </div>
    </div>
  );
};

export default EmptySearchState;

