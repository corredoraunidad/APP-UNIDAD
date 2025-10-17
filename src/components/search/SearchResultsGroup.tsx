/**
 * Componente SearchResultsGroup
 * 
 * Agrupa resultados de búsqueda por módulo.
 * Muestra header con nombre del módulo, emoji y cantidad de resultados.
 */

import React from 'react';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { getModuleLabel, getModuleIcon } from '../../utils/searchUtils';
import SearchResultItem from './SearchResultItem';
import type { SearchResult, SearchResultType } from '../../types/search';

interface SearchResultsGroupProps {
  moduleType: SearchResultType;
  results: SearchResult[];
  onResultClick: (result: SearchResult) => void;
  selectedIndex?: number;
  startIndex?: number;
}

const SearchResultsGroup: React.FC<SearchResultsGroupProps> = ({
  moduleType,
  results,
  onResultClick,
  selectedIndex = -1,
  startIndex = 0,
}) => {
  const { textSecondary, border } = useThemeClasses();

  // Si no hay resultados, no mostrar nada
  if (results.length === 0) {
    return null;
  }

  const moduleLabel = getModuleLabel(moduleType);
  const ModuleIcon = getModuleIcon(moduleType);

  return (
    <div className="py-2">
      {/* Header del grupo */}
      <div className={`px-4 py-2 ${textSecondary} text-xs font-semibold uppercase tracking-wider flex items-center gap-2`}>
        <ModuleIcon className="w-4 h-4" />
        <span>{moduleLabel}</span>
        <span className="ml-auto">({results.length})</span>
      </div>

      {/* Separador */}
      <div className={`border-t ${border} mx-4 mb-2`}></div>

      {/* Lista de resultados */}
      <div>
        {results.map((result, index) => {
          const globalIndex = startIndex + index;
          const isSelected = globalIndex === selectedIndex;
          
          return (
            <SearchResultItem
              key={result.id}
              result={result}
              onClick={onResultClick}
              isSelected={isSelected}
            />
          );
        })}
      </div>
    </div>
  );
};

export default SearchResultsGroup;

