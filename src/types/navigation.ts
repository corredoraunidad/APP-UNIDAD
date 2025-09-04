// Tipos para el sistema de navegación

// Props del TopNav
export interface TopNavProps {
  onLogout?: () => void;
  showLogout?: boolean;
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
  showUserIcon?: boolean;
  onUserIconClick?: () => void;
  // Nuevas props para responsive design
  className?: string;
  logoSize?: 'small' | 'medium' | 'large';
}

// Props del Sidebar
export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  // Nuevas props para responsive design
  className?: string;
  onNavigation?: () => void;
}

// Elementos del menú del sidebar
export interface SidebarMenuItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  module: string;
  hasNotifications?: boolean;
  badge?: number | string;
  children?: SidebarMenuItem[];
}

// Estado de la navegación
export interface NavigationState {
  sidebarOpen: boolean;
  isOverlayMode: boolean;
  currentBreakpoint: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

// Configuración de breakpoints
export interface BreakpointConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

// Clases CSS responsive
export interface ResponsiveClasses {
  mobile: string;
  tablet: string;
  desktop: string;
  large?: string;
}

// Configuración de navegación
export interface NavigationConfig {
  sidebarWidth: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
  logoSize: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
  padding: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
}

// Eventos de navegación
export interface NavigationEvents {
  onSidebarToggle: () => void;
  onSidebarOpen: () => void;
  onSidebarClose: () => void;
  onNavigation: (path: string) => void;
  onOutsideClick: () => void;
}

// Hook de navegación
export interface UseNavigationReturn {
  // Estado
  sidebarOpen: boolean;
  isOverlayMode: boolean;
  
  // Funciones de control
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  handleNavigation: () => void;
  handleOutsideClick: () => void;
  
  // Helpers de clases
  getSidebarClasses: () => string;
  getOverlayClasses: () => string;
  
  // Información del dispositivo
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  
  // Estado derivado
  shouldShowMenuButton: boolean;
  shouldShowOverlay: boolean;
}

// Hook de breakpoints
export interface UseBreakpointsReturn {
  currentBreakpoint: string;
  windowWidth: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeScreen: boolean;
  isSmallMobile: boolean;
  isLargeMobile: boolean;
  isSmallDesktop: boolean;
  isAtLeast: (breakpoint: string) => boolean;
  isAtMost: (breakpoint: string) => boolean;
  isBetween: (min: string, max: string) => boolean;
  breakpoints: BreakpointConfig;
}

// Tipos para el sistema de temas en navegación
export interface NavigationTheme {
  bgTopNav: string;
  bgSidebar: string;
  border: string;
  text: string;
  textSecondary: string;
  activeBg: string;
  activeText: string;
  activeBorder: string;
  hoverBg: string;
  hoverText: string;
  shadow: string;
}
