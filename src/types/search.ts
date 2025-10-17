/**
 * Tipos para el sistema de búsqueda global
 * 
 * Este archivo define todas las interfaces y tipos necesarios para el buscador global.
 * Incluye tipos para resultados de diferentes módulos y configuraciones de búsqueda.
 */

// Tipos de módulos que se pueden buscar
export type SearchResultType = 
  | 'user' 
  | 'file' 
  | 'company' 
  | 'contact' 
  | 'payment_method';

// Interfaz base para todos los resultados de búsqueda
export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;              // Texto principal a mostrar
  subtitle?: string;          // Texto secundario (descripción, contexto)
  description?: string;       // Descripción adicional
  badge?: string;             // Badge opcional (ej: "PDF", "Activo", rol)
  navigationPath: string;     // Ruta para navegar al hacer click
  metadata?: Record<string, any>; // Metadata adicional del resultado
  score?: number;             // Puntuación de relevancia (para ranking)
}

/**
 * Resultado de búsqueda específico para Usuarios
 */
export interface SearchResultUser extends SearchResult {
  type: 'user';
  metadata: {
    email: string;
    rol: 'admin' | 'admin_comercial' | 'admin_operaciones' | 'broker';
    rut?: string;
    isActive: boolean;
  };
}

/**
 * Resultado de búsqueda específico para Archivos
 */
export interface SearchResultFile extends SearchResult {
  type: 'file';
  metadata: {
    fileType: 'file' | 'folder';
    mimeType?: string;
    size?: number;
    path: string;
    extension?: string;
  };
}

/**
 * Resultado de búsqueda específico para Compañías
 */
export interface SearchResultCompany extends SearchResult {
  type: 'company';
  metadata: {
    companyType: 'asistencias' | 'siniestros' | 'ambos';
    hasContacts: boolean;
  };
}

/**
 * Resultado de búsqueda específico para Contactos
 */
export interface SearchResultContact extends SearchResult {
  type: 'contact';
  metadata: {
    companyName: string;
    companyId: string;
    position?: string;
    email?: string;
    phone?: string;
    isPrimary: boolean;
  };
}

/**
 * Resultado de búsqueda específico para Métodos de Pago
 */
export interface SearchResultPaymentMethod extends SearchResult {
  type: 'payment_method';
  metadata: {
    companyRut: string;
    bankName: string;
    accountType: string;
    isActive: boolean;
  };
}

/**
 * Respuesta agrupada del servicio de búsqueda
 */
export interface SearchResponse {
  users: SearchResultUser[];
  files: SearchResultFile[];
  companies: SearchResultCompany[];
  contacts: SearchResultContact[];
  paymentMethods: SearchResultPaymentMethod[];
  totalResults: number;
  searchTime?: number; // Tiempo de búsqueda en ms
}

/**
 * Filtros opcionales para la búsqueda
 */
export interface SearchFilters {
  modules?: SearchResultType[]; // Filtrar por módulos específicos
  limit?: number;               // Límite de resultados por módulo
  includeInactive?: boolean;    // Incluir elementos inactivos
}

/**
 * Opciones de configuración para la búsqueda
 */
export interface SearchOptions extends SearchFilters {
  userId?: string;              // ID del usuario que realiza la búsqueda
  userRole?: string;            // Rol del usuario (para permisos)
  timeout?: number;             // Timeout en ms
}

/**
 * Configuración de búsqueda
 */
export interface SearchConfig {
  minQueryLength: number;       // Mínimo de caracteres para buscar
  debounceMs: number;          // Tiempo de debounce en ms
  maxResultsPerModule: number; // Máximo de resultados por módulo
  timeoutMs: number;           // Timeout de búsqueda en ms
}

/**
 * Estado de error en la búsqueda
 */
export interface SearchError {
  message: string;
  code?: string;
  module?: SearchResultType;
}

/**
 * Resultado de una búsqueda con posible error
 */
export interface SearchServiceResponse {
  success: boolean;
  data?: SearchResponse;
  error?: SearchError;
}

/**
 * Mapeo de iconos por tipo de resultado
 */
export const SEARCH_RESULT_ICONS: Record<SearchResultType, string> = {
  user: 'User',
  file: 'File',
  company: 'Building2',
  contact: 'UserCircle',
  payment_method: 'CreditCard',
};

/**
 * Mapeo de colores por tipo de resultado (para badges/iconos)
 */
export const SEARCH_RESULT_COLORS: Record<SearchResultType, string> = {
  user: 'text-blue-600',
  file: 'text-green-600',
  company: 'text-purple-600',
  contact: 'text-orange-600',
  payment_method: 'text-pink-600',
};

/**
 * Labels legibles para módulos
 */
export const SEARCH_MODULE_LABELS: Record<SearchResultType, string> = {
  user: 'Usuarios',
  file: 'Archivos',
  company: 'Compañías',
  contact: 'Contactos',
  payment_method: 'Métodos de Pago',
};

/**
 * Configuración por defecto
 */
export const DEFAULT_SEARCH_CONFIG: SearchConfig = {
  minQueryLength: 3,
  debounceMs: 500,
  maxResultsPerModule: 5,
  timeoutMs: 5000,
};

