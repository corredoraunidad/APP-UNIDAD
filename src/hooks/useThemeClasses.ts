import { useTheme } from '../contexts/ThemeContext';

export const useThemeClasses = () => {
  try {
    const { isDarkMode } = useTheme();
    
    return {
      // Fondos principales
      bg: isDarkMode ? 'bg-gray-900' : 'bg-gray-50',
      bgCard: isDarkMode ? 'bg-gray-800' : 'bg-white',
      bgSurface: isDarkMode ? 'bg-gray-700' : 'bg-gray-100',
      bgTopNav: isDarkMode ? 'bg-gray-800' : 'bg-[#1D1F3C]',
      bgSidebar: isDarkMode ? 'bg-gray-800' : 'bg-white',
      
      // Textos
      text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
      textSecondary: isDarkMode ? 'text-gray-400' : 'text-gray-600',
      textMuted: isDarkMode ? 'text-gray-500' : 'text-gray-500',
      
      // Bordes
      border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
      borderLight: isDarkMode ? 'border-gray-600' : 'border-gray-300',
      
      // Sombras
      shadow: isDarkMode ? 'shadow-lg shadow-black/20' : 'shadow-sm',
      shadowCard: isDarkMode ? 'shadow-xl shadow-black/30' : 'shadow-md',
      
      // Estados de hover
      hoverBg: isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100',
      hoverText: isDarkMode ? 'hover:text-gray-200' : 'hover:text-gray-800',
      
      // Estados activos
      activeBg: isDarkMode ? 'bg-gray-700' : 'bg-orange-50',
      activeText: isDarkMode ? 'text-orange-400' : 'text-[#fd8412]',
      activeBorder: isDarkMode ? 'border-orange-400' : 'border-[#fd8412]',
      
      // Inputs y formularios
      inputBg: isDarkMode ? 'bg-gray-700' : 'bg-white',
      inputBorder: isDarkMode ? 'border-gray-600' : 'border-gray-300',
      inputText: isDarkMode ? 'text-gray-100' : 'text-gray-900',
      inputPlaceholder: isDarkMode ? 'placeholder-gray-400' : 'placeholder-gray-500',
      
      // Modales y overlays
      modalBg: isDarkMode ? 'bg-gray-800' : 'bg-white',
      overlayBg: isDarkMode ? 'bg-black/60' : 'bg-black/50',
      
      // Skeleton loading
      skeletonBg: isDarkMode ? 'bg-gray-700' : 'bg-gray-200',
    };
  } catch (error) {
    // Fallback a tema claro si hay error
    console.warn('Error al obtener tema, usando tema claro por defecto:', error);
    return {
      bg: 'bg-gray-50',
      bgCard: 'bg-white',
      bgSurface: 'bg-gray-100',
      bgTopNav: 'bg-[#1D1F3C]',
      bgSidebar: 'bg-white',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      textMuted: 'text-gray-500',
      border: 'border-gray-200',
      borderLight: 'border-gray-300',
      shadow: 'shadow-sm',
      shadowCard: 'shadow-md',
      hoverBg: 'hover:bg-gray-100',
      hoverText: 'hover:text-gray-800',
      activeBg: 'bg-orange-50',
      activeText: 'text-[#fd8412]',
      activeBorder: 'border-[#fd8412]',
      inputBg: 'bg-white',
      inputBorder: 'border-gray-300',
      inputText: 'text-gray-900',
      inputPlaceholder: 'placeholder-gray-500',
      modalBg: 'bg-white',
      overlayBg: 'bg-black/50',
      skeletonBg: 'bg-gray-200',
    };
  }
};
