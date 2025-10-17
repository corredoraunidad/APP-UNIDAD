// Exportaciones de tipos

// Tipos existentes
export * from './announcements';
export * from './asistencias-siniestros';
export * from './files';
export * from './metodos-pago';
export * from './users';

// Nuevos tipos de navegación
export * from './navigation';

// Tipos de búsqueda global
export * from './search';

// Tipos de UI
export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'error' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  fullWidth?: boolean;
}

export interface AvatarProps {
  size?: number;
  label?: string;
  src?: string;
  className?: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: boolean;
}

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean | null;
  className?: string;
  label?: string;
}

// Tipos de tema
export interface AppTheme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    surfaceVariant: string;
    text: string;
    textSecondary: string;
    error: string;
    success: string;
    warning: string;
    border: string;
    shadow: string;
  };
}

export interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: AppTheme;
}

// Tipos de autenticación
export interface AuthContextType {
  user: import('./users').User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<import('./users').User>) => void;
  verifyUserInDB: () => Promise<boolean>;
} 