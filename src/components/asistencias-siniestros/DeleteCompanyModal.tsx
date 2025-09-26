import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import type { Company } from '../../types/asistencias-siniestros';
import { useThemeClasses } from '../../hooks/useThemeClasses';

interface DeleteCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

const DeleteCompanyModal: React.FC<DeleteCompanyModalProps> = ({
  isOpen,
  onClose,
  company,
  onConfirm,
  isLoading = false
}) => {
  const { modalBg, text, textSecondary, border, bgSurface } = useThemeClasses();

  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error deleting company:', error);
    }
  };

  if (!isOpen || !company) return null;

  return (
    <>
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
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mr-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className={`text-xl font-bold ${text}`}>
                Eliminar Compañía
              </h2>
            </div>
            <button
              onClick={onClose}
              className={`p-2 text-gray-400 hover:text-gray-600 transition-colors`}
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className={`${text} mb-4`}>
              ¿Estás seguro de que quieres eliminar la compañía{' '}
              <span className="font-semibold text-[#1D1F3C]">{company.name}</span>?
            </p>
            <p className={`text-sm ${textSecondary} mb-6`}>
              Esta acción no se puede deshacer. Se eliminarán todos los datos asociados a esta compañía, incluyendo contactos y comentarios.
            </p>
          </div>

          {/* Footer */}
          <div className={`flex items-center justify-end space-x-3 p-6 border-t ${border}`}>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className={`px-4 py-2 ${text} ${bgSurface} rounded-lg hover:${bgSurface} transition-colors disabled:opacity-50`}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeleteCompanyModal;
