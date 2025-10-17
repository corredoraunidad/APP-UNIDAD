/**
 * Componente GlobalSearchModal
 * 
 * Modal principal de búsqueda global estilo Spotlight.
 * Integra todos los componentes de búsqueda y maneja la lógica de navegación.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, X } from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { useTheme } from '../../contexts/ThemeContext';
import { useGlobalSearch } from '../../hooks/useGlobalSearch';
import SearchInput from './SearchInput';
import SearchResultsGroup from './SearchResultsGroup';
import EmptySearchState from './EmptySearchState';
import type { SearchResult } from '../../types/search';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { bgCard, textSecondary, border } = useThemeClasses();
  const { isDarkMode } = useTheme();
  
  // Hook de búsqueda
  const {
    query,
    setQuery,
    isSearching,
    results,
    error,
    clearSearch,
    hasResults,
  } = useGlobalSearch();

  // Estado para navegación con teclado
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  // Resetear al cerrar
  useEffect(() => {
    if (!isOpen) {
      clearSearch();
      setSelectedIndex(-1);
    }
  }, [isOpen, clearSearch]);

  // Manejar teclas
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape: cerrar modal
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Si no hay resultados, no manejar otras teclas
      if (!hasResults) return;

      // Calcular total de resultados
      const totalResults = results
        ? results.users.length +
          results.files.length +
          results.companies.length +
          results.contacts.length +
          results.paymentMethods.length
        : 0;

      // Arrow Down: siguiente resultado
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < totalResults - 1 ? prev + 1 : prev));
      }

      // Arrow Up: resultado anterior
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      }

      // Enter: navegar al resultado seleccionado
      if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        const allResults = getAllResults();
        const selectedResult = allResults[selectedIndex];
        if (selectedResult) {
          handleResultClick(selectedResult);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasResults, results, selectedIndex, onClose]);

  // Obtener todos los resultados en un array plano
  const getAllResults = useCallback((): SearchResult[] => {
    if (!results) return [];
    
    return [
      ...results.users,
      ...results.files,
      ...results.companies,
      ...results.contacts,
      ...results.paymentMethods,
    ];
  }, [results]);

  // Manejar click en resultado
  const handleResultClick = (result: SearchResult) => {
    navigate(result.navigationPath);
    onClose();
  };

  // Manejar click en backdrop
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Si no está abierto, no renderizar nada
  if (!isOpen) {
    return null;
  }

  // Calcular índices de inicio para cada grupo (para navegación con teclado)
  const getUsersStartIndex = 0;
  const getFilesStartIndex = results ? getUsersStartIndex + results.users.length : 0;
  const getCompaniesStartIndex = results ? getFilesStartIndex + results.files.length : 0;
  const getContactsStartIndex = results ? getCompaniesStartIndex + results.companies.length : 0;
  const getPaymentMethodsStartIndex = results ? getContactsStartIndex + results.contacts.length : 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[70] transition-opacity"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[80] flex items-start justify-center pt-[10vh] px-4">
        <div
          className={`
            ${bgCard}
            ${border}
            border
            rounded-lg
            shadow-2xl
            w-full
            max-w-2xl
            max-h-[70vh]
            overflow-hidden
            flex flex-col
            animate-in fade-in slide-in-from-top-4
            duration-200
            relative
          `}
          role="dialog"
          aria-modal="true"
          aria-label="Búsqueda global"
        >
          {/* Botón de cerrar */}
          <button
            onClick={onClose}
            className={`
              absolute top-4 right-4 z-10
              ${textSecondary}
              ${isDarkMode ? 'hover:text-gray-100' : 'hover:text-gray-900'}
              ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
              rounded-lg
              p-1.5
              transition-all duration-200
            `}
            aria-label="Cerrar búsqueda"
            title="Cerrar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Input de búsqueda */}
          <SearchInput
            value={query}
            onChange={setQuery}
            onClear={clearSearch}
            placeholder="Buscar usuarios, archivos, compañías..."
            autoFocus
          />

          {/* Resultados */}
          <div className="flex-1 overflow-y-auto">
            {/* Loading */}
            {isSearching && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className={`w-8 h-8 ${textSecondary} animate-spin`} />
                <span className={`ml-3 ${textSecondary}`}>Buscando...</span>
              </div>
            )}

            {/* Error */}
            {error && !isSearching && (
              <div className="flex items-center justify-center py-12 px-6 text-center">
                <div className="text-red-600 dark:text-red-400">
                  <p className="font-medium">Error en la búsqueda</p>
                  <p className="text-sm mt-1">{error.message}</p>
                </div>
              </div>
            )}

            {/* Sin resultados o estado inicial */}
            {!isSearching && !error && !hasResults && (
              <EmptySearchState query={query} />
            )}

            {/* Resultados agrupados */}
            {!isSearching && !error && hasResults && results && (
              <div className="pb-4">
                <SearchResultsGroup
                  moduleType="user"
                  results={results.users}
                  onResultClick={handleResultClick}
                  selectedIndex={selectedIndex}
                  startIndex={getUsersStartIndex}
                />

                <SearchResultsGroup
                  moduleType="file"
                  results={results.files}
                  onResultClick={handleResultClick}
                  selectedIndex={selectedIndex}
                  startIndex={getFilesStartIndex}
                />

                <SearchResultsGroup
                  moduleType="company"
                  results={results.companies}
                  onResultClick={handleResultClick}
                  selectedIndex={selectedIndex}
                  startIndex={getCompaniesStartIndex}
                />

                <SearchResultsGroup
                  moduleType="contact"
                  results={results.contacts}
                  onResultClick={handleResultClick}
                  selectedIndex={selectedIndex}
                  startIndex={getContactsStartIndex}
                />

                <SearchResultsGroup
                  moduleType="payment_method"
                  results={results.paymentMethods}
                  onResultClick={handleResultClick}
                  selectedIndex={selectedIndex}
                  startIndex={getPaymentMethodsStartIndex}
                />
              </div>
            )}
          </div>

          {/* Footer con atajos de teclado */}
          {!isSearching && hasResults && (
            <div className={`px-4 py-2 border-t ${border} ${textSecondary} text-xs flex items-center justify-between`}>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className={`px-2 py-1 rounded font-mono ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>↑</kbd>
                  <kbd className={`px-2 py-1 rounded font-mono ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>↓</kbd>
                  <span className="ml-1">Navegar</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className={`px-2 py-1 rounded font-mono ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>Enter</kbd>
                  <span className="ml-1">Seleccionar</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className={`px-2 py-1 rounded font-mono ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>Esc</kbd>
                  <span className="ml-1">Cerrar</span>
                </span>
              </div>
              
              {results && (
                <span className="text-xs">
                  {results.totalResults} {results.totalResults === 1 ? 'resultado' : 'resultados'}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GlobalSearchModal;

