import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import logoUnidad from '../../assets/LogoUnidad.png';
import { useThemeClasses } from '../../hooks/useThemeClasses';

interface TopNavProps {
  onLogout?: () => void;
  showLogout?: boolean;
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
  showUserIcon?: boolean;
  onUserIconClick?: () => void;
  isSidebarOpen?: boolean; // Nuevo prop para saber si el sidebar está abierto
}

const TopNav = ({ 
  onLogout, 
  showLogout = false, 
  onMenuToggle, 
  showMenuButton = false,
  showUserIcon = true,
  onUserIconClick,
  isSidebarOpen = false
}: TopNavProps) => {
  const navigate = useNavigate();
  const { bgTopNav, shadow, border } = useThemeClasses();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Lógica por defecto de logout
      navigate('/login');
    }
  };

  const handleUserIconClick = () => {
    if (onUserIconClick) {
      onUserIconClick();
    } else {
      // Fallback: navegación por defecto (aunque ya no la usaremos)
      navigate('/profile');
    }
  };

  return (
    <>
      <header className={`${bgTopNav} ${shadow} border-b ${border} fixed top-0 left-0 right-0 z-50`}>
        <div className="w-full px-6">
          {/* Layout móvil: Grid de 3 columnas con logo centrado */}
          <div className="grid grid-cols-3 items-center py-4 lg:hidden">
            {/* Botón de menú - Lado izquierdo */}
            <div className="flex justify-start">
              {showMenuButton && (
                <button
                  onClick={onMenuToggle}
                  className="p-2 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
                >
                  {isSidebarOpen ? (
                    // Icono X cuando está abierto
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    // Icono hamburguesa cuando está cerrado
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              )}
            </div>

            {/* Logo - Centro (solo en móvil) */}
            <div className="flex justify-center">
              <div className="h-20 w-auto">
                <img 
                  src={logoUnidad} 
                  alt="Logo Unidad Seguros" 
                  className="h-full w-auto object-contain"
                />
              </div>
            </div>

            {/* Icono de usuario - Lado derecho */}
            <div className="flex justify-end">
              {showUserIcon && (
                <button
                  onClick={handleUserIconClick}
                  className="p-2 text-white rounded-lg transition-all duration-200 ease-in-out"
                  style={{
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  title="Perfil de usuario"
                >
                  <User className="w-6 h-6" />
                </button>
              )}
              
              {showLogout && (
                <button
                  onClick={handleLogout}
                  className="ml-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Cerrar sesión
                </button>
              )}
            </div>
          </div>

          {/* Layout desktop: Flex con logo a la izquierda (como antes) */}
          <div className="hidden lg:flex justify-between items-center py-4">
            {/* Logo y botón de menú */}
            <div className="flex items-center">
              <div className="h-20 w-auto">
                <img 
                  src={logoUnidad} 
                  alt="Logo Unidad Seguros" 
                  className="h-full w-auto object-contain"
                />
              </div>
            </div>

            {/* Icono de usuario o botón de logout */}
            <div className="flex items-center">
              {showUserIcon && (
                <button
                  onClick={handleUserIconClick}
                  className="p-2 text-white rounded-lg transition-all duration-200 ease-in-out"
                  style={{
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                  title="Perfil de usuario"
                >
                  <User className="w-6 h-6" />
                </button>
              )}
              
              {showLogout && (
                <button
                  onClick={handleLogout}
                  className="ml-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Cerrar sesión
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default TopNav;
