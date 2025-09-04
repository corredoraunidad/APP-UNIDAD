import React, { useEffect } from 'react';
import { 
  X, 
  AlertTriangle, 
} from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import type { PaymentMethod } from '../../types/metodos-pago';

interface DeletePaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  paymentMethod: PaymentMethod | null;
  isLoading?: boolean;
}

const DeletePaymentMethodModal: React.FC<DeletePaymentMethodModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  paymentMethod,
  isLoading = false,
}) => {
  const { modalBg, text, textSecondary } = useThemeClasses();

  // Manejar scroll del body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !paymentMethod) return null;

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error('Error deleting payment method:', error);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 transition-opacity"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className={`relative ${modalBg} rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle size={24} className="text-red-600" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${text}`}>
                Confirmar Eliminación
              </h2>
              <p className={`text-sm ${textSecondary}`}>
                Esta acción no se puede deshacer
              </p>
            </div>
          </div>
          
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} className={textSecondary} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className={`${text} mb-4`}>
            ¿Estás seguro de que quieres eliminar el método de pago de{' '}
            <span className="font-semibold text-[#1D1F3C]">{paymentMethod.company_name}</span>?
          </p>
          <p className={`text-sm ${textSecondary} mb-6`}>
            Esta acción no se puede deshacer. Se eliminará toda la información bancaria, enlaces de pago y datos asociados a este método de pago.
          </p>
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700`}>
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className={`px-4 py-2 ${text} bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50`}
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
  );
};

export default DeletePaymentMethodModal;
