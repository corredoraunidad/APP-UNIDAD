// Rutas de la aplicación
export const ROUTES = {
  HOME: '/home',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;

// Configuración de la aplicación
export const APP_CONFIG = {
  NAME: 'App Unidad',
  VERSION: '1.0.0',
  DESCRIPTION: 'Aplicación moderna y escalable',
} as const;

// Configuración de la API
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 10000,
} as const;

// Configuración de autenticación
export const AUTH_CONFIG = {
  TOKEN_KEY: 'auth_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 horas
} as const;

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet.',
  UNAUTHORIZED: 'No tienes permisos para acceder a este recurso.',
  NOT_FOUND: 'El recurso solicitado no fue encontrado.',
  VALIDATION_ERROR: 'Por favor, verifica los datos ingresados.',
  SERVER_ERROR: 'Error del servidor. Intenta más tarde.',
} as const;

// Configuración de validación
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
} as const; 