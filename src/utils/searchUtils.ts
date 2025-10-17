/**
 * Utilidades para el sistema de búsqueda global
 * 
 * Funciones helper para procesamiento de resultados, formateo,
 * navegación y ranking de resultados.
 */

import { 
  User, 
  File, 
  Folder, 
  Building2, 
  UserCircle, 
  CreditCard,
  FileText,
  Image,
  FileSpreadsheet,
} from 'lucide-react';
import type { 
  SearchResult, 
  SearchResultType,
} from '../types/search';

/**
 * Obtener icono de Lucide React según el tipo de resultado
 */
export const getSearchResultIcon = (type: SearchResultType, metadata?: any) => {
  switch (type) {
    case 'user':
      return User;
    case 'file':
      // Diferenciar entre archivo y carpeta
      if (metadata?.fileType === 'folder') {
        return Folder;
      }
      // Iconos específicos por tipo de archivo
      const mimeType = metadata?.mimeType || '';
      if (mimeType.includes('pdf')) {
        return FileText;
      }
      if (mimeType.includes('image')) {
        return Image;
      }
      if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
        return FileSpreadsheet;
      }
      return File;
    case 'company':
      return Building2;
    case 'contact':
      return UserCircle;
    case 'payment_method':
      return CreditCard;
    default:
      return File;
  }
};

/**
 * Obtener clase de color para el icono según tipo de resultado
 */
export const getSearchResultColor = (type: SearchResultType): string => {
  const colors: Record<SearchResultType, string> = {
    user: 'text-blue-500',
    file: 'text-green-500',
    company: 'text-purple-500',
    contact: 'text-orange-500',
    payment_method: 'text-pink-500',
  };
  return colors[type] || 'text-gray-500';
};

/**
 * Obtener clase de color de fondo para el badge según tipo
 */
export const getSearchResultBadgeColor = (type: SearchResultType): string => {
  const colors: Record<SearchResultType, string> = {
    user: 'bg-blue-100 text-blue-700',
    file: 'bg-green-100 text-green-700',
    company: 'bg-purple-100 text-purple-700',
    contact: 'bg-orange-100 text-orange-700',
    payment_method: 'bg-pink-100 text-pink-700',
  };
  return colors[type] || 'bg-gray-100 text-gray-700';
};

/**
 * Obtener clase de color de fondo para el badge en dark mode
 */
export const getSearchResultBadgeColorDark = (type: SearchResultType): string => {
  const colors: Record<SearchResultType, string> = {
    user: 'bg-blue-900 text-blue-300',
    file: 'bg-green-900 text-green-300',
    company: 'bg-purple-900 text-purple-300',
    contact: 'bg-orange-900 text-orange-300',
    payment_method: 'bg-pink-900 text-pink-300',
  };
  return colors[type] || 'bg-gray-800 text-gray-300';
};

/**
 * Resaltar coincidencias en el texto
 * Retorna el texto sin modificar (el highlighting se hará en los componentes)
 * Esta función solo sirve como placeholder para futuras mejoras
 */
export const highlightMatch = (text: string, _query: string): string => {
  // Por ahora retornamos el texto sin modificar
  // El highlighting se puede implementar en los componentes con dangerouslySetInnerHTML
  // o usando una librería como react-highlight-words
  return text;
};

/**
 * Obtener label legible para el tipo de módulo
 */
export const getModuleLabel = (type: SearchResultType): string => {
  const labels: Record<SearchResultType, string> = {
    user: 'Usuarios',
    file: 'Archivos',
    company: 'Compañías',
    contact: 'Contactos',
    payment_method: 'Métodos de Pago',
  };
  return labels[type] || type;
};

/**
 * Obtener icono de Lucide React para el tipo de módulo (para headers)
 */
export const getModuleIcon = (type: SearchResultType) => {
  const icons: Record<SearchResultType, any> = {
    user: User,
    file: Folder,
    company: Building2,
    contact: UserCircle,
    payment_method: CreditCard,
  };
  return icons[type] || File;
};

/**
 * Calcular score de relevancia para un resultado
 * Criterios:
 * - Coincidencia exacta en título: +100
 * - Coincidencia al inicio de título: +50
 * - Coincidencia en título: +30
 * - Coincidencia en subtítulo: +10
 * - Longitud del match: +5 por cada 10% del query
 */
export const calculateRelevanceScore = (
  result: SearchResult,
  query: string
): number => {
  let score = 0;
  const normalizedQuery = query.toLowerCase().trim();
  const normalizedTitle = result.title.toLowerCase();
  const normalizedSubtitle = result.subtitle?.toLowerCase() || '';

  // Coincidencia exacta en título
  if (normalizedTitle === normalizedQuery) {
    score += 100;
  }
  // Coincidencia al inicio del título
  else if (normalizedTitle.startsWith(normalizedQuery)) {
    score += 50;
  }
  // Coincidencia en cualquier parte del título
  else if (normalizedTitle.includes(normalizedQuery)) {
    score += 30;
  }

  // Coincidencia en subtítulo
  if (normalizedSubtitle.includes(normalizedQuery)) {
    score += 10;
  }

  // Bonus por longitud del match
  const matchPercentage = (normalizedQuery.length / normalizedTitle.length) * 100;
  score += Math.floor(matchPercentage / 10) * 5;

  return score;
};

/**
 * Ordenar resultados por relevancia
 */
export const rankResults = (
  results: SearchResult[],
  query: string
): SearchResult[] => {
  return results
    .map(result => ({
      ...result,
      score: calculateRelevanceScore(result, query),
    }))
    .sort((a, b) => (b.score || 0) - (a.score || 0));
};

/**
 * Truncar texto largo para preview
 */
export const truncateText = (text: string, maxLength: number = 60): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
};

/**
 * Formatear tamaño de archivo
 */
export const formatFileSize = (bytes?: number): string => {
  if (!bytes) {
    return 'Desconocido';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

/**
 * Generar URL de navegación con query params
 */
export const buildNavigationUrl = (
  basePath: string,
  params?: Record<string, string>
): string => {
  if (!params || Object.keys(params).length === 0) {
    return basePath;
  }

  const queryString = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

  return `${basePath}?${queryString}`;
};

/**
 * Extraer extensión de archivo
 */
export const getFileExtension = (filename: string): string => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'FILE';
};

/**
 * Validar si el query es válido para búsqueda
 */
export const isValidSearchQuery = (query: string, minLength: number = 3): boolean => {
  const trimmed = query.trim();
  return trimmed.length >= minLength;
};

/**
 * Limpiar query de caracteres especiales peligrosos
 */
export const sanitizeSearchQuery = (query: string): string => {
  // Remover caracteres que podrían causar problemas en SQL
  return query
    .trim()
    .replace(/[<>;"']/g, '') // Remover caracteres peligrosos
    .substring(0, 100); // Limitar longitud
};

/**
 * Debounce function para búsqueda
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

