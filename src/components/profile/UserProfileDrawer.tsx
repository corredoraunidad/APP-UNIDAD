import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { UserService } from '../../services/userService';
import type { User } from '../../types';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import Switch from '../ui/Switch';

interface UserProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChangePasswordModal?: () => void;
}

const UserProfileDrawer: React.FC<UserProfileDrawerProps> = ({ isOpen, onClose, onOpenChangePasswordModal }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { bgCard, text, textSecondary, textMuted, border, bgSurface } = useThemeClasses();
  
  // Estado para el jefe comercial
  const [jefeComercial, setJefeComercial] = useState<User | null>(null);
  const [loadingJefe, setLoadingJefe] = useState(false);

  // Función para cargar jefe comercial
  const loadJefeComercial = async (jefeId: string) => {
    setLoadingJefe(true);
    try {
      const { user: jefeData, error } = await UserService.getUserById(jefeId);
      if (error) {
        setJefeComercial(null);
      } else {
        setJefeComercial(jefeData);
      }
    } catch (error) {
      setJefeComercial(null);
    } finally {
      setLoadingJefe(false);
    }
  };

  // Cargar jefe comercial cuando sea broker (funcionalidad removida)
  useEffect(() => {
    if (user?.rol === 'broker' && user?.jefe_comercial_id) {
      loadJefeComercial(user.jefe_comercial_id);
    } else {
      setJefeComercial(null);
    }
  }, [user?.rol, user?.jefe_comercial_id]);

  if (!user) {
    return null;
  }

  const getInitials = (nombres: string, apellido: string): string => {
    return `${nombres} ${apellido}`;
  };

  const getRolDisplayName = (rol: string): string => {
    const roleMap: { [key: string]: string } = {
      admin: 'Administrador',
      admin_comercial: 'Admin Comercial',
      admin_operaciones: 'Admin Operaciones',
      broker: 'Corredor',
    };
    return roleMap[rol] || rol;
  };

  const handleNavigateToChangePassword = () => {
    // Cerrar el drawer primero para dar atención al modal
    onClose();
    // Abrir el modal después de un breve delay para que se vea la transición
    setTimeout(() => {
      if (onOpenChangePasswordModal) {
        onOpenChangePasswordModal();
      }
    }, 150); // Delay para que se vea el cierre del drawer
  };

  const handleLogout = async () => {
    await logout();
    onClose();
    navigate('/login');
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[60] transition-opacity duration-300"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={handleOverlayClick}
        />
      )}

      {/* Drawer */}
      <div
        className={`
          fixed top-0 right-0 h-full w-80 sm:w-96 ${bgCard} shadow-2xl z-[70]
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          overflow-y-auto drawer-content
        `}
      >
        {/* Header del drawer */}
        <div className={`flex items-center justify-between p-6 border-b ${border}`}>
          <h2 className={`text-xl font-semibold ${text}`}>
            Perfil de Usuario
          </h2>
          <button
            onClick={onClose}
            className={`p-2 ${textMuted} hover:${textSecondary} rounded-lg hover:${bgSurface} transition-colors`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido del drawer */}
        <div className="p-6">
          {/* Información del usuario */}
          <div className="text-center mb-8">
            <Avatar
              size={80}
              label={getInitials(user.nombres, user.apellido_paterno)}
              backgroundColor="#fd8412"
              className="mx-auto mb-4"
            />
            
            <h3 className={`text-xl font-bold ${text} mb-1`}>
              {`${user.nombres || ''} ${user.apellido_paterno || ''}`.trim() || 'Usuario'}
            </h3>
            
            <p className={`${textSecondary} mb-3`}>
              @{user.username || 'No disponible'}
            </p>
            
            <div 
              className="inline-flex px-3 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(147, 51, 234, 0.1)' }}
            >
              <span 
                className="font-semibold text-xs"
                style={{ color: 'rgba(147, 51, 234, 0.8)' }}
              >
                {getRolDisplayName(user.rol)}
              </span>
            </div>
          </div>

          {/* Detalles del usuario */}
          <div className="mb-8">
            <div className="space-y-3">
              <div className={`flex justify-between items-center py-3 border-b ${border}`}>
                <span className={`${textSecondary} text-sm font-medium`}>Correo:</span>
                <span className={`${text} font-semibold text-sm text-right`}>
                  {user.email || 'No disponible'}
                </span>
              </div>
              
              <div className={`flex justify-between items-center py-3 border-b ${border}`}>
                <span className={`${textSecondary} text-sm font-medium`}>ID:</span>
                <span className={`${text} font-semibold text-sm text-right`}>
                  {user.id || 'No disponible'}
                </span>
              </div>
              
            </div>
          </div>

          {/* Jefe Comercial (funcionalidad removida) */}
          {user.rol === 'broker' && user.jefe_comercial_id && (
            <div className="mb-8">
              <h3 className={`text-sm font-medium ${textMuted} mb-3`}>Jefe Comercial</h3>
              {loadingJefe ? (
                <div className={`flex items-center space-x-3 p-4 ${bgSurface} rounded-xl`}>
                  <div className={`w-10 h-10 ${bgSurface} rounded-full animate-pulse`}></div>
                  <div className="flex-1">
                    <div className={`h-4 ${bgSurface} rounded animate-pulse mb-2`}></div>
                    <div className={`h-3 ${bgSurface} rounded animate-pulse w-2/3`}></div>
                  </div>
                </div>
              ) : jefeComercial ? (
                <div className={`flex items-center space-x-3 p-4 ${bgSurface} rounded-xl`}>
                  <Avatar
                    size={40}
                    label={getInitials(jefeComercial.nombres, jefeComercial.apellido_paterno)}
                    backgroundColor="#fd8412"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${text} text-sm truncate`}>
                      {`${jefeComercial.nombres} ${jefeComercial.apellido_paterno}`}
                    </p>
                    <p className={`${textMuted} text-xs truncate`}>
                      {jefeComercial.email}
                    </p>
                  </div>
                </div>
              ) : (
                <div className={`p-4 ${bgSurface} rounded-xl`}>
                  <p className={`${textMuted} text-sm text-center`}>
                    No se pudo cargar la información del jefe comercial
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Acciones */}
          <div className="space-y-4">
            {/* Toggle de modo oscuro */}
            <div className={`flex items-center justify-between p-4 ${bgSurface} rounded-xl`}>
              <span className={`${text} font-medium text-sm`}>Modo oscuro</span>
              <Switch
                checked={isDarkMode}
                onChange={toggleTheme}
              />
            </div>
            
            {/* Botón cambiar contraseña */}
            <Button
              variant="outlined"
              color="primary"
              onClick={handleNavigateToChangePassword}
              fullWidth
              size="sm"
            >
              Cambiar Contraseña
            </Button>
            
            {/* Botón cerrar sesión */}
            <Button
              variant="contained"
              color="error"
              onClick={handleLogout}
              fullWidth
              size="sm"
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

    </>
  );
};

export default UserProfileDrawer; 