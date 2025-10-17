/**
 * Hook personalizado para búsqueda global
 * 
 * Maneja el estado de búsqueda, debounce, y ejecución de queries.
 * Obtiene automáticamente información del usuario para aplicar permisos.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { GlobalSearchService } from '../services/globalSearchService';
import { useAuth } from './useAuth';
import { isValidSearchQuery, sanitizeSearchQuery } from '../utils/searchUtils';
import { DEFAULT_SEARCH_CONFIG } from '../types/search';
import type { SearchResponse, SearchError } from '../types/search';

const DEBOUNCE_DELAY = DEFAULT_SEARCH_CONFIG.debounceMs;
const MIN_QUERY_LENGTH = DEFAULT_SEARCH_CONFIG.minQueryLength;

interface UseGlobalSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  isSearching: boolean;
  results: SearchResponse | null;
  error: SearchError | null;
  clearSearch: () => void;
  hasResults: boolean;
  totalResults: number;
}

/**
 * Hook para búsqueda global con debounce automático
 */
export const useGlobalSearch = (): UseGlobalSearchReturn => {
  // Estados
  const [query, setQueryState] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<SearchError | null>(null);

  // Obtener información del usuario autenticado
  const { user } = useAuth();

  // Refs para cleanup
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const abortControllerRef = useRef<AbortController | undefined>(undefined);

  /**
   * Actualizar query con sanitización
   */
  const setQuery = useCallback((newQuery: string) => {
    const sanitized = sanitizeSearchQuery(newQuery);
    setQueryState(sanitized);
  }, []);

  /**
   * Limpiar búsqueda y resetear estados
   */
  const clearSearch = useCallback(() => {
    setQueryState('');
    setDebouncedQuery('');
    setResults(null);
    setError(null);
    setIsSearching(false);
    
    // Limpiar timers y requests pendientes
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  /**
   * Efecto de debounce: actualiza debouncedQuery después del delay
   */
  useEffect(() => {
    // Limpiar timeout anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Si el query está vacío, limpiar inmediatamente
    if (!query || query.trim().length === 0) {
      setDebouncedQuery('');
      setResults(null);
      setError(null);
      setIsSearching(false);
      return;
    }

    // Si el query es muy corto, no hacer nada
    if (!isValidSearchQuery(query, MIN_QUERY_LENGTH)) {
      setDebouncedQuery('');
      setResults(null);
      setIsSearching(false);
      return;
    }

    // ✨ Mostrar "Buscando..." inmediatamente cuando el usuario escribe
    setIsSearching(true);

    // Establecer nuevo timeout
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, DEBOUNCE_DELAY);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  /**
   * Efecto de búsqueda: ejecuta cuando debouncedQuery cambia
   */
  useEffect(() => {
    // Si no hay query debounced, no buscar
    if (!debouncedQuery || debouncedQuery.trim().length === 0) {
      setIsSearching(false);
      return;
    }

    // Si no hay usuario autenticado, no buscar
    if (!user) {
      setError({
        message: 'Usuario no autenticado',
        code: 'UNAUTHENTICATED',
      });
      return;
    }

    // Ejecutar búsqueda
    const executeSearch = async () => {
      setIsSearching(true);
      setError(null);

      // Crear nuevo AbortController para esta búsqueda
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        const response = await GlobalSearchService.globalSearch(debouncedQuery, {
          userId: user.id,
          userRole: user.rol,
        });

        // Verificar si la búsqueda fue abortada
        if (abortControllerRef.current.signal.aborted) {
          return;
        }

        if (response.success && response.data) {
          setResults(response.data);
          setError(null);
        } else {
          setResults(null);
          setError(response.error || {
            message: 'Error desconocido en la búsqueda',
            code: 'UNKNOWN_ERROR',
          });
        }
      } catch (err) {
        // Verificar si la búsqueda fue abortada
        if (abortControllerRef.current.signal.aborted) {
          return;
        }

        console.error('Error en búsqueda:', err);
        setResults(null);
        setError({
          message: err instanceof Error ? err.message : 'Error al realizar la búsqueda',
          code: 'SEARCH_EXCEPTION',
        });
      } finally {
        // Verificar si la búsqueda fue abortada antes de actualizar estado
        if (!abortControllerRef.current.signal.aborted) {
          setIsSearching(false);
        }
      }
    };

    executeSearch();

    // Cleanup: abortar búsqueda si el componente se desmonta o el query cambia
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedQuery, user]);

  /**
   * Calcular valores derivados
   */
  const hasResults = results ? results.totalResults > 0 : false;
  const totalResults = results?.totalResults || 0;

  return {
    query,
    setQuery,
    isSearching,
    results,
    error,
    clearSearch,
    hasResults,
    totalResults,
  };
};

export default useGlobalSearch;

