import React from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';
import { useThemeClasses } from '../../hooks/useThemeClasses';

interface DeleteItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType: 'file' | 'folder';
  loading?: boolean;
}

const DeleteItemModal: React.FC<DeleteItemModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType,
  loading = false
}) => {
  const { modalBg, text, textSecondary, textMuted, border} = useThemeClasses();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 transition-opacity"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative ${modalBg} rounded-2xl shadow-xl w-full max-w-md mx-4 transform transition-all`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${border}`}>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <Trash2 size={20} className="text-red-600" />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${text}`}>
                Eliminar {itemType === 'folder' ? 'Carpeta' : 'Archivo'}
              </h3>
              <p className={`text-sm ${textSecondary}`}>
                Esta acción no se puede deshacer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 ${textMuted} hover:${textSecondary} transition-colors`}
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Warning Icon */}
            <div className="flex justify-center">
              <div className="p-3 bg-red-50 rounded-full">
                <AlertTriangle size={32} className="text-red-500" />
              </div>
            </div>

            {/* Message */}
            <div className="text-center">
              <h4 className={`text-lg font-medium ${text} mb-2`}>
                ¿Estás seguro?
              </h4>
              <p className={`text-sm ${textSecondary} mb-4`}>
                Estás a punto de eliminar <strong>"{itemName}"</strong>
              </p>
              
              {itemType === 'folder' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-800">
                    <strong>⚠️ Atención:</strong> Al eliminar esta carpeta, también se eliminarán todos los archivos y subcarpetas que contenga.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 mt-6">
            <Button
              type="button"
              variant="outlined"
              color="secondary"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="contained"
              color="error"
              onClick={onConfirm}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Eliminando...
                </div>
              ) : (
                'Eliminar'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteItemModal; 