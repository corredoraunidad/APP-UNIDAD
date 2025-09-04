import { useState, useEffect } from 'react';

// Definición de breakpoints basados en Tailwind CSS
export const BREAKPOINTS = {
  xs: 0,      // 0px - Móviles pequeños
  sm: 640,    // 640px - Móviles grandes
  md: 768,    // 768px - Tablets
  lg: 1024,   // 1024px - Laptops
  xl: 1280,   // 1280px - Desktops
  '2xl': 1536 // 1536px - Pantallas grandes
} as const;

// Tipos para TypeScript
export type BreakpointKey = keyof typeof BREAKPOINTS;
export type BreakpointValue = typeof BREAKPOINTS[BreakpointKey];

// Hook principal para breakpoints
export const useBreakpoints = () => {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<BreakpointKey>('xs');
  const [windowWidth, setWindowWidth] = useState<number>(0);

  useEffect(() => {
    // Función para determinar el breakpoint actual
    const getCurrentBreakpoint = (width: number): BreakpointKey => {
      if (width >= BREAKPOINTS['2xl']) return '2xl';
      if (width >= BREAKPOINTS.xl) return 'xl';
      if (width >= BREAKPOINTS.lg) return 'lg';
      if (width >= BREAKPOINTS.md) return 'md';
      if (width >= BREAKPOINTS.sm) return 'sm';
      return 'xs';
    };

    // Función para manejar cambios de tamaño
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setCurrentBreakpoint(getCurrentBreakpoint(width));
    };

    // Configurar el estado inicial
    handleResize();

    // Agregar event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helpers para facilitar el uso
  const isMobile = currentBreakpoint === 'xs' || currentBreakpoint === 'sm';
  const isTablet = currentBreakpoint === 'md';
  const isDesktop = currentBreakpoint === 'lg' || currentBreakpoint === 'xl' || currentBreakpoint === '2xl';
  const isLargeScreen = currentBreakpoint === 'xl' || currentBreakpoint === '2xl';

  // Helpers específicos para casos de uso comunes
  const isSmallMobile = currentBreakpoint === 'xs';
  const isLargeMobile = currentBreakpoint === 'sm';
  const isSmallDesktop = currentBreakpoint === 'lg';

  // Función para verificar si estamos en un breakpoint específico o superior
  const isAtLeast = (breakpoint: BreakpointKey): boolean => {
    return windowWidth >= BREAKPOINTS[breakpoint];
  };

  // Función para verificar si estamos en un breakpoint específico o inferior
  const isAtMost = (breakpoint: BreakpointKey): boolean => {
    return windowWidth <= BREAKPOINTS[breakpoint];
  };

  // Función para verificar si estamos en un rango específico de breakpoints
  const isBetween = (min: BreakpointKey, max: BreakpointKey): boolean => {
    return windowWidth >= BREAKPOINTS[min] && windowWidth <= BREAKPOINTS[max];
  };

  return {
    // Estado actual
    currentBreakpoint,
    windowWidth,
    
    // Helpers booleanos
    isMobile,
    isTablet,
    isDesktop,
    isLargeScreen,
    isSmallMobile,
    isLargeMobile,
    isSmallDesktop,
    
    // Funciones de comparación
    isAtLeast,
    isAtMost,
    isBetween,
    
    // Breakpoints constantes para referencia
    breakpoints: BREAKPOINTS
  };
};

// Hook simplificado para casos de uso básicos
export const useIsMobile = () => {
  const { isMobile } = useBreakpoints();
  return isMobile;
};

// Hook para detectar si el sidebar debe estar abierto por defecto
export const useSidebarDefaultState = () => {
  const { isDesktop } = useBreakpoints();
  return isDesktop;
};

// Hook para detectar si mostrar el botón de menú
export const useShowMenuButton = () => {
  const { isMobile, isTablet } = useBreakpoints();
  return isMobile || isTablet;
};
