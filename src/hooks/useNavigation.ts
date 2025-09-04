import { useState, useEffect, useCallback } from 'react';
import { useBreakpoints } from './useBreakpoints';

// Hook para manejar la navegación responsive
export const useNavigation = () => {
  const { isMobile, isTablet, isDesktop } = useBreakpoints();
  
  // Estado del sidebar
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Estado para controlar si el sidebar está en modo overlay
  const [isOverlayMode, setIsOverlayMode] = useState(false);

  // Determinar el estado inicial del sidebar
  useEffect(() => {
    // En desktop, el sidebar está siempre visible
    // En móvil/tablet, el sidebar está oculto por defecto
    if (isDesktop) {
      setSidebarOpen(true);
      setIsOverlayMode(false);
    } else {
      setSidebarOpen(false);
      setIsOverlayMode(true);
    }
  }, [isDesktop]);

  // Función para alternar el sidebar
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  // Función para abrir el sidebar
  const openSidebar = useCallback(() => {
    setSidebarOpen(true);
  }, []);

  // Función para cerrar el sidebar
  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  // Función para cerrar el sidebar en móvil después de navegar
  const handleNavigation = useCallback(() => {
    if (isMobile || isTablet) {
      closeSidebar();
    }
  }, [isMobile, isTablet, closeSidebar]);

  // Función para cerrar el sidebar cuando se hace clic fuera (solo en overlay mode)
  const handleOutsideClick = useCallback(() => {
    if (isOverlayMode) {
      closeSidebar();
    }
  }, [isOverlayMode, closeSidebar]);

  // Función para manejar el resize de la ventana
  const handleResize = useCallback(() => {
    if (isDesktop && !sidebarOpen) {
      // En desktop, si se redimensiona y el sidebar está cerrado, abrirlo
      setSidebarOpen(true);
      setIsOverlayMode(false);
    } else if ((isMobile || isTablet) && sidebarOpen) {
      // En móvil/tablet, si se redimensiona y el sidebar está abierto, cerrarlo
      setSidebarOpen(false);
      setIsOverlayMode(true);
    }
  }, [isDesktop, isMobile, isTablet, sidebarOpen]);

  // Escuchar cambios de breakpoint
  useEffect(() => {
    handleResize();
  }, [handleResize]);

  // Función para obtener las clases CSS del sidebar según el estado
  const getSidebarClasses = useCallback(() => {
    const baseClasses = 'fixed lg:static inset-y-0 left-0 z-50 lg:z-auto border-r shadow-lg lg:shadow-none transition-transform duration-300 ease-in-out flex flex-col';
    
    // Clases de ancho responsive
    const widthClasses = isMobile ? 'w-80' : isTablet ? 'w-72' : 'w-64';
    
    // Clases de transformación
    const transformClasses = sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0';
    
    return `${baseClasses} ${widthClasses} ${transformClasses}`;
  }, [sidebarOpen, isMobile, isTablet]);

  // Función para obtener las clases del overlay
  const getOverlayClasses = useCallback(() => {
    if (!isOverlayMode) return '';
    
    return 'fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden';
  }, [isOverlayMode]);

  return {
    // Estado
    sidebarOpen,
    isOverlayMode,
    
    // Funciones de control
    toggleSidebar,
    openSidebar,
    closeSidebar,
    handleNavigation,
    handleOutsideClick,
    
    // Helpers de clases
    getSidebarClasses,
    getOverlayClasses,
    
    // Información del dispositivo
    isMobile,
    isTablet,
    isDesktop,
    
    // Estado derivado
    shouldShowMenuButton: isMobile || isTablet,
    shouldShowOverlay: isOverlayMode && sidebarOpen
  };
};

// Hook simplificado para solo el estado del sidebar
export const useSidebar = () => {
  const { sidebarOpen, toggleSidebar, openSidebar, closeSidebar } = useNavigation();
  
  return {
    isOpen: sidebarOpen,
    toggle: toggleSidebar,
    open: openSidebar,
    close: closeSidebar
  };
};

// Hook para detectar si mostrar el botón de menú
export const useMenuButton = () => {
  const { shouldShowMenuButton } = useNavigation();
  return shouldShowMenuButton;
};
