import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, FolderOpen, Megaphone, Shield, CreditCard } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { useNotificationContext } from '../../contexts/NotificationContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { canAccess } = usePermissions();
  const { bgSidebar, border, text, textSecondary, activeBg, activeText, activeBorder, hoverBg, hoverText } = useThemeClasses();
  const { unreadCount } = useNotificationContext();

  const menuItems = [
    { id: 'inicio', label: 'Inicio', path: '/dashboard', icon: Home, module: 'dashboard' as const },
    { id: 'usuarios', label: 'Usuarios', path: '/usuarios', icon: Users, module: 'usuarios' as const },
    { id: 'archivos', label: 'Archivos', path: '/archivos', icon: FolderOpen, module: 'archivos' as const },
    { id: 'anuncios', label: 'Anuncios', path: '/anuncios', icon: Megaphone, module: 'anuncios' as const, hasNotifications: true },
    { id: 'asistencias-siniestros', label: 'Asistencias y Siniestros', path: '/asistencias-siniestros', icon: Shield, module: 'asistencias_siniestros' as const },
    { id: 'metodos-pago', label: 'Métodos de Pago', path: '/metodos-pago', icon: CreditCard, module: 'metodos_pago' as const },
  ];

  // Filtrar elementos del menú según permisos
  const filteredMenuItems = menuItems.filter(item => canAccess(item.module));

  const handleNavigation = (path: string) => {
    navigate(path);
    // Cerrar sidebar en móvil después de navegar
    if (window.innerWidth <= 768) {
      onClose();
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Función para obtener el badge de notificaciones
  const getNotificationBadge = (item: any) => {
    if (!item.hasNotifications || !canAccess('anuncios')) {
      return null;
    }
    
    if (unreadCount === 0) {
      return null;
    }

    return (
      <span className={`
        ml-auto
        inline-flex items-center justify-center
        w-5 h-5
        text-[10px] font-semibold
        bg-red-500/90 backdrop-blur-sm
        text-white
        rounded-full
        shadow-sm
        border border-red-400/20
        transition-all duration-200 ease-in-out
        hover:bg-red-500 hover:scale-105
      `}>
        {unreadCount > 99 ? '99+' : unreadCount}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay para móvil */}
      {window.innerWidth <= 768 && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
        w-64 ${bgSidebar} border-r ${border} shadow-lg lg:shadow-none
        transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        transition-transform duration-300 ease-in-out
        flex flex-col
      `}>
        {/* Spacer para TopNav */}
        <div className="h-32 lg:h-16"></div>
        
        {/* Menu Items */}
        <nav className="flex-1 px-4 py-1 space-y-1">
          {filteredMenuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`
                  w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg
                  transition-colors duration-200
                  ${isActive(item.path)
                    ? `${activeBg} ${activeText} border-l-4 ${activeBorder}`
                    : `${text} ${hoverBg} ${hoverText}`
                  }
                `}
              >
                <IconComponent 
                  size={20} 
                  className={`mr-3 ${isActive(item.path) ? activeText : textSecondary}`} 
                />
                {item.label}
                {getNotificationBadge(item)}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`mt-auto p-4 border-t ${border}`}>
          <div className="text-center">
            <span className={`text-xs ${textSecondary}`}>
              Versión Beta
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
