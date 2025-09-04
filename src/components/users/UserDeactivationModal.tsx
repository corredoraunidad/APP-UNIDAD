import React from 'react';
import { X } from 'lucide-react';
import Button from '../ui/Button';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import type { UserWithContract } from '../../types';

interface UserDeactivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserWithContract | null;
  onConfirm: () => Promise<void>;
  isDeactivating?: boolean;
}

const UserDeactivationModal: React.FC<UserDeactivationModalProps> = ({
  isOpen,
  onClose,
  user,
  onConfirm,
  isDeactivating = false
}) => {
  const { modalBg, text, textSecondary, border, inputBg } = useThemeClasses();

  // Validar que el contexto esté disponible
  if (!modalBg || !text || !textSecondary || !border || !inputBg) {
    return null;
  }

  if (!isOpen || !user) return null;

  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 transition-opacity"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative ${modalBg} rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${border}`}>
          <h3 className={`text-lg font-semibold ${text}`}>
            Confirmar Desactivación
          </h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:${inputBg} transition-colors`}
          >
            <X size={20} className={textSecondary} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#fd8412] to-orange-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg font-bold">
                {user.nombres.charAt(0)}{user.apellido_paterno.charAt(0)}
              </span>
            </div>
            <div>
              <p className={`font-medium ${text}`}>
                {user.nombres} {user.apellido_paterno}
              </p>
              <p className={`text-sm ${textSecondary}`}>
                @{user.username}
              </p>
            </div>
          </div>
          
          <p className={`${textSecondary} mb-6`}>
            ¿Estás seguro de que quieres desactivar este usuario? 
            <strong className={text}> No podrá acceder a la aplicación</strong> hasta que sea reactivado.
          </p>
          
          {/* Botones */}
          <div className="flex space-x-3">
            <Button
              onClick={onClose}
              variant="outlined"
              className="flex-1"
              disabled={isDeactivating}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              variant="contained"
              color="error"
              className="flex-1"
              disabled={isDeactivating}
            >
              {isDeactivating ? 'Desactivando...' : 'Desactivar Usuario'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDeactivationModal;
