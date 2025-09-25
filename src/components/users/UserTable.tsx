import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MoreVertical, Trash2, Eye, AlertCircle } from 'lucide-react';
import { UserService } from '../../services/userService';
import Button from '../ui/Button';
import type { UserWithContract, UserFilters } from '../../types';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { useAuth } from '../../contexts/AuthContext';
import { canDeleteUser } from '../../utils/userPermissions';

interface UserTableProps {
  onEditUser?: (user: UserWithContract) => void;
  onDeleteUser?: (userId: string) => void;
  onViewUser?: (user: UserWithContract) => void;
  onRefresh?: () => void;
  filters?: UserFilters;
  onPageChange?: (page: number) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  onDeleteUser,
  onViewUser,
  onRefresh,
  filters,
  onPageChange
}) => {
  const { bgCard, text, textSecondary, textMuted, border, bgSurface, hoverBg } = useThemeClasses();
  const { user: currentUser } = useAuth();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [users, setUsers] = useState<UserWithContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 5,
    hasMore: false
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Función para cargar usuarios
  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { users: fetchedUsers, total, page, limit, hasMore, error: fetchError } = await UserService.getUsersWithFilters(filters || {});
      
      if (fetchError) {
        setError(fetchError);
        setUsers([]);
        setPagination({ total: 0, page: 1, limit: 5, hasMore: false });
      } else {
        setUsers(fetchedUsers || []);
        setPagination({ total, page, limit, hasMore });
      }
    } catch (err) {
      setError('Error de conexión al cargar usuarios');
      setUsers([]);
      setPagination({ total: 0, page: 1, limit: 5, hasMore: false });
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar usuarios al montar el componente y cuando cambien los filtros
  useEffect(() => {
    loadUsers();
  }, [filters]);

  // Función para refrescar desde el componente padre
  useEffect(() => {
    if (onRefresh) {
      loadUsers();
    }
  }, [onRefresh]);

  // Función para obtener nombre completo
  const getFullName = (user: UserWithContract) => {
    return `${user.nombres} ${user.apellido_paterno}${user.apellido_materno ? ` ${user.apellido_materno}` : ''}`;
  };


  // Función para obtener el nombre del rol
  const getRolDisplayName = (rol: string): string => {
    const roleMap: { [key: string]: string } = {
      admin: 'Administrador',
      admin_comercial: 'Admin Comercial',
      admin_operaciones: 'Admin Operaciones',
      broker: 'Corredor',
    };
    return roleMap[rol] || rol;
  };

  // Función para manejar el toggle del menú
  const toggleMenu = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === userId ? null : userId);
  };

  // Función para manejar clics fuera del menú
  const handleOutsideClick = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setOpenMenuId(null);
    }
  }, []);

  // Función para cerrar el menú
  const closeMenu = useCallback(() => {
    setOpenMenuId(null);
  }, []);

  // Función para determinar si el menú debe aparecer arriba
  const shouldMenuAppearAbove = (index: number) => {
    return index >= users.length - 2;
  };

  // Agregar event listener para clics fuera del menú
  useEffect(() => {
    if (openMenuId) {
      document.addEventListener('mousedown', handleOutsideClick);
      return () => {
        document.removeEventListener('mousedown', handleOutsideClick);
      };
    }
  }, [openMenuId, handleOutsideClick]);

  // Estado de carga
  if (isLoading) {
    return (
      <div className={`${bgCard} rounded-2xl shadow-sm overflow-hidden`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#fd8412] mr-3"></div>
          <span className={textSecondary}>Cargando usuarios...</span>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className={`${bgCard} rounded-2xl shadow-sm overflow-hidden`}>
        <div className="flex items-center justify-center py-12">
          <AlertCircle className="w-8 h-8 text-red-500 mr-3" />
          <div className="text-center">
            <p className="text-red-600 font-medium">{error}</p>
            <Button
              onClick={loadUsers}
              variant="outlined"
              size="sm"
              className="mt-2"
            >
              Intentar nuevamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Estado sin usuarios
  if (users.length === 0) {
    return (
      <div className={`${bgCard} rounded-2xl shadow-sm overflow-hidden`}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className={`${textSecondary} font-medium`}>No hay usuarios registrados</p>
            <p className={`${textMuted} text-sm mt-1`}>Los usuarios aparecerán aquí cuando se registren</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${bgCard} rounded-2xl shadow-sm overflow-hidden relative`}>
      {/* Header */}
      <div className={`${bgSurface} px-6 py-4 border-b ${border}`}>
        <div className={`grid grid-cols-12 gap-4 text-xs font-semibold ${textSecondary} uppercase tracking-wider`}>
          <div className="col-span-4 lg:col-span-3">Nombre</div>
          <div className="hidden lg:block col-span-3">Email</div>
          <div className="col-span-4 lg:col-span-2">Rol</div>
          <div className="hidden lg:block col-span-2 text-center">Estado</div>
          <div className="col-span-4 lg:col-span-2 text-center">Acciones</div>
        </div>
      </div>

      {/* Contenido */}
      <div className="">
        {users.map((user, index) => (
          <div
            key={user.id}
            className={`px-6 py-4 transition-colors duration-150
              ${openMenuId === user.id ? 'relative z-20' : ''}
              ${openMenuId === user.id ? 'hover:bg-transparent' : hoverBg}
            `}
          >
            <div className="grid grid-cols-12 gap-4 items-center">
              {/* Nombre */}
              <div className="col-span-4 lg:col-span-3">
                <div className={`font-medium ${text}`}>
                  {getFullName(user)}
                </div>
                <div className={`text-sm ${textMuted}`}>
                  @{user.username}
                </div>
              </div>

              {/* Email */}
              <div className="hidden lg:block col-span-3">
                <div className={`text-sm ${text}`}>
                  {user.email}
                </div>
              </div>

              {/* Rol */}
              <div className="col-span-4 lg:col-span-2">
                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {getRolDisplayName(user.rol)}
                </span>
              </div>

              {/* Estado */}
              <div className="hidden lg:flex col-span-2 justify-center">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  user.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              {/* Acciones */}
              <div className="col-span-4 lg:col-span-2 flex justify-center">
                <div className="relative">
                  {/* Menú de acciones - ANTES del botón para dropdowns hacia abajo */}
                  {openMenuId === user.id && !shouldMenuAppearAbove(index) && (
                    <div
                      ref={dropdownRef}
                      className="absolute right-0 w-48 rounded-lg shadow-2xl py-1 z-50 top-full mt-2"
                      onClick={(e) => e.stopPropagation()}
                      style={{ 
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        backdropFilter: 'none',
                        WebkitBackdropFilter: 'none'
                      }}
                    >
                      <button
                        onClick={() => {
                          onViewUser?.(user);
                          closeMenu();
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-3" />
                        Ver detalles
                      </button>
                      {currentUser && canDeleteUser(currentUser, user) && (
                        <button
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (onDeleteUser) {
                              await onDeleteUser(user.id);
                            }
                            closeMenu();
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 mr-3" />
                          Eliminar
                        </button>
                      )}
                    </div>
                  )}
                  

                  
                  <button
                    onClick={(e) => {
                      toggleMenu(e, user.id);
                    }}
                    className={`p-2 ${textMuted} hover:${text} rounded-lg hover:${bgSurface} transition-colors relative`}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Menú de acciones - DESPUÉS del botón para dropdowns hacia arriba */}
                  {openMenuId === user.id && shouldMenuAppearAbove(index) && (
                    <div
                      ref={dropdownRef}
                      className="absolute right-0 w-48 rounded-lg shadow-2xl py-1 z-50 bottom-full mb-2"
                      onClick={(e) => e.stopPropagation()}
                      style={{ 
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        backdropFilter: 'none',
                        WebkitBackdropFilter: 'none'
                      }}
                    >
                      <button
                        onClick={() => {
                          onViewUser?.(user);
                          closeMenu();
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-3" />
                        Ver detalles
                      </button>
                      {currentUser && canDeleteUser(currentUser, user) && (
                        <button
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (onDeleteUser) {
                              await onDeleteUser(user.id);
                            }
                            closeMenu();
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 mr-3" />
                          Eliminar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer con paginación */}
      <div className={`${bgSurface} px-6 py-4 border-t ${border}`}>
        <div className="flex items-center justify-between">
          <div className={`text-sm ${textSecondary}`}>
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} usuario{pagination.total !== 1 ? 's' : ''}
          </div>
          
          {/* Controles de paginación */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                pagination.page <= 1 
                  ? `${textMuted} cursor-not-allowed` 
                  : `${text} hover:${hoverBg}`
              }`}
            >
              Anterior
            </button>
            
            <span className={`text-sm ${textSecondary} px-2`}>
              Página {pagination.page}
            </span>
            
            <button
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={!pagination.hasMore}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                !pagination.hasMore 
                  ? `${textMuted} cursor-not-allowed` 
                  : `${text} hover:${hoverBg}`
              }`}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTable; 