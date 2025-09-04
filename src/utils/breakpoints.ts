// Constantes de breakpoints para toda la aplicación
// Basadas en Tailwind CSS v3

export const BREAKPOINTS = {
  xs: 0,      // 0px - Móviles pequeños
  sm: 640,    // 640px - Móviles grandes  
  md: 768,    // 768px - Tablets
  lg: 1024,   // 1024px - Laptops
  xl: 1280,   // 1280px - Desktops
  '2xl': 1536 // 1536px - Pantallas grandes
} as const;

// Clases de Tailwind para responsive design
export const RESPONSIVE_CLASSES = {
  // Grid responsive
  grid: {
    mobile: 'grid-cols-1',
    tablet: 'md:grid-cols-2',
    desktop: 'lg:grid-cols-3',
    large: 'xl:grid-cols-4'
  },
  
  // Padding responsive
  padding: {
    mobile: 'px-4 py-3',
    tablet: 'md:px-6 md:py-4',
    desktop: 'lg:px-8 lg:py-6'
  },
  
  // Margin responsive
  margin: {
    mobile: 'mx-4 my-3',
    tablet: 'md:mx-6 md:my-4',
    desktop: 'lg:mx-8 lg:my-6'
  },
  
  // Text responsive
  text: {
    h1: {
      mobile: 'text-xl',
      tablet: 'md:text-2xl',
      desktop: 'lg:text-3xl'
    },
    h2: {
      mobile: 'text-lg',
      tablet: 'md:text-xl',
      desktop: 'lg:text-2xl'
    },
    body: {
      mobile: 'text-sm',
      tablet: 'md:text-base',
      desktop: 'lg:text-lg'
    }
  },
  
  // Spacing responsive
  spacing: {
    section: {
      mobile: 'space-y-4',
      tablet: 'md:space-y-6',
      desktop: 'lg:space-y-8'
    },
    container: {
      mobile: 'max-w-full px-4',
      tablet: 'md:max-w-4xl md:px-6',
      desktop: 'lg:max-w-6xl lg:px-8'
    }
  }
} as const;

// Helpers para clases condicionales
export const getResponsiveClass = (
  baseClass: string,
  mobileClass: string = '',
  tabletClass: string = '',
  desktopClass: string = ''
) => {
  return `${baseClass} ${mobileClass} ${tabletClass} ${desktopClass}`.trim();
};

// Clases específicas para navegación
export const NAVIGATION_CLASSES = {
  // TopNav
  topNav: {
    container: 'w-full px-4 md:px-6 lg:px-8',
    logo: {
      mobile: 'h-12 w-auto',
      tablet: 'md:h-16',
      desktop: 'lg:h-20'
    },
    button: {
      mobile: 'p-2',
      tablet: 'md:p-2.5',
      desktop: 'lg:p-3'
    }
  },
  
  // Sidebar
  sidebar: {
    width: {
      mobile: 'w-80',
      tablet: 'md:w-72',
      desktop: 'lg:w-64'
    },
    padding: {
      mobile: 'px-3 py-2',
      tablet: 'md:px-4 md:py-3',
      desktop: 'lg:px-4 lg:py-2'
    }
  }
} as const;

// Tipos para TypeScript
export type BreakpointKey = keyof typeof BREAKPOINTS;
export type BreakpointValue = typeof BREAKPOINTS[BreakpointKey];
