import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Check, AlertCircle, Loader } from 'lucide-react';
import { useChangePassword } from '../../hooks/useChangePassword';
import Button from '../ui/Button';
import { useThemeClasses } from '../../hooks/useThemeClasses';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const {
    formData,
    errors,
    isLoading,
    error,
    success,
    updateField,
    changePassword,
    resetForm,
    isFormValid
  } = useChangePassword();
  const { modalBg, text, textSecondary, border, inputBg, inputBorder, inputText, inputPlaceholder, bgSurface } = useThemeClasses();

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Cerrar modal con ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await changePassword();
    if (success) {
      // Cerrar modal después de mostrar éxito
      setTimeout(() => {
        handleClose();
      }, 2000);
    }
  };

  const handleCancel = () => {
    if (isLoading) return;
    
    if (formData.currentPassword || formData.newPassword || formData.confirmPassword) {
      if (window.confirm('¿Estás seguro de que quieres cancelar? Los cambios no se guardarán.')) {
        handleClose();
      }
    } else {
      handleClose();
    }
  };

  // Función para verificar requisitos de contraseña
  const getPasswordRequirements = () => {
    const password = formData.newPassword;
    return [
      {
        text: 'Al menos 8 caracteres',
        valid: password.length >= 8,
        icon: password.length >= 8 ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />
      },
      {
        text: 'Al menos una letra minúscula',
        valid: /(?=.*[a-z])/.test(password),
        icon: /(?=.*[a-z])/.test(password) ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />
      },
      {
        text: 'Al menos una letra mayúscula',
        valid: /(?=.*[A-Z])/.test(password),
        icon: /(?=.*[A-Z])/.test(password) ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />
      },
      {
        text: 'Al menos un número',
        valid: /(?=.*\d)/.test(password),
        icon: /(?=.*\d)/.test(password) ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />
      },
      {
        text: 'Al menos un carácter especial (@$!%*?&)',
        valid: /(?=.*[@$!%*?&])/.test(password),
        icon: /(?=.*[@$!%*?&])/.test(password) ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />
      }
    ];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 transition-opacity"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={handleClose}
      />

      {/* Modal */}
              <div className={`relative ${modalBg} rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[calc(100vh-2rem)] overflow-hidden modal-content`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${border}`}>
          <h2 className={`text-xl font-semibold ${text}`}>
            Cambiar Contraseña
          </h2>
          <button
            onClick={handleClose}
            className={`p-2 ${textSecondary} hover:${text} rounded-lg hover:${bgSurface} transition-colors`}
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Contraseña Actual */}
          <div>
            <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
              Contraseña Actual *
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={(e) => updateField('currentPassword', e.target.value)}
                disabled={isLoading}
                className={`w-full px-4 py-3 pr-12 ${inputBg} ${inputText} ${inputPlaceholder} border rounded-xl focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412] transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed ${
                  errors.currentPassword ? 'border-red-300' : inputBorder
                }`}
                placeholder="Ingresa tu contraseña actual"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${textSecondary} hover:${text}`}
                disabled={isLoading}
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
            )}
          </div>

          {/* Nueva Contraseña */}
          <div>
            <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
              Nueva Contraseña *
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => updateField('newPassword', e.target.value)}
                disabled={isLoading}
                className={`w-full px-4 py-3 pr-12 ${inputBg} ${inputText} ${inputPlaceholder} border rounded-xl focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412] transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed ${
                  errors.newPassword ? 'border-red-300' : inputBorder
                }`}
                placeholder="Ingresa la nueva contraseña"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${textSecondary} hover:${text}`}
                disabled={isLoading}
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
            )}
          </div>

          {/* Confirmar Nueva Contraseña */}
          <div>
            <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
              Confirmar Nueva Contraseña *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                disabled={isLoading}
                className={`w-full px-4 py-3 pr-12 ${inputBg} ${inputText} ${inputPlaceholder} border rounded-xl focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412] transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed ${
                  errors.confirmPassword ? 'border-red-300' : inputBorder
                }`}
                placeholder="Confirma la nueva contraseña"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${textSecondary} hover:${text}`}
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Requisitos de contraseña */}
          {formData.newPassword && (
            <div className={`p-4 ${bgSurface} rounded-xl`}>
              <h4 className={`text-sm font-medium ${textSecondary} mb-3`}>
                La nueva contraseña debe cumplir:
              </h4>
              <div className="space-y-2">
                {getPasswordRequirements().map((requirement, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className={`${requirement.valid ? 'text-green-600' : textSecondary}`}>
                      {requirement.icon}
                    </span>
                    <span className={`text-xs ${requirement.valid ? 'text-green-600' : textSecondary}`}>
                      {requirement.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm">¡Contraseña cambiada exitosamente!</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading || !isFormValid}
              className="flex-1 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Cambiando...
                </>
              ) : (
                'Cambiar Contraseña'
              )}
            </Button>
            
            <Button
              type="button"
              variant="outlined"
              color="primary"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal; 