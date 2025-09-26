import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { canDeleteUser } from '../../utils/userPermissions';
import type { User } from '../../types';

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: User | null;
  isLoading?: boolean;
}

const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  user,
  isLoading = false
}) => {
  const { user: currentUser } = useAuth();
  
  // Verificar permisos antes de mostrar el modal
  if (!isOpen || !user || !currentUser || !canDeleteUser(currentUser, user)) {
    return null;
  }

  const getFullName = (user: User) => {
    return `${user.nombres} ${user.apellido_paterno}${user.apellido_materno ? ` ${user.apellido_materno}` : ''}`;
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

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Eliminar Usuario
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-700 mb-4">
              ¿Estás seguro de que quieres eliminar al siguiente usuario?
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-gray-900">Nombre:</span>
                  <span className="ml-2 text-gray-700">{getFullName(user)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Email:</span>
                  <span className="ml-2 text-gray-700">{user.email}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Rol:</span>
                  <span className="ml-2 text-gray-700">{getRolDisplayName(user.rol)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Username:</span>
                  <span className="ml-2 text-gray-700">@{user.username}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-800 font-medium">
                  Esta acción no se puede deshacer
                </p>
                <p className="text-sm text-red-700 mt-1">
                  El usuario será eliminado permanentemente de la base de datos y no podrá acceder al sistema.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <Button
            onClick={onClose}
            variant="outlined"
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            color="error"
            disabled={isLoading}
            loading={isLoading}
          >
            {isLoading ? 'Eliminando...' : 'Eliminar Usuario'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal; 