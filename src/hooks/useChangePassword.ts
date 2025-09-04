import { useState, useEffect } from 'react';
import { AuthService } from '../services/authService';

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ValidationErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export const useChangePassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<ChangePasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Validaciones en tiempo real
  useEffect(() => {
    const newErrors: ValidationErrors = {};

    // Validar contraseña actual
    if (formData.currentPassword.length > 0 && formData.currentPassword.length < 6) {
      newErrors.currentPassword = 'La contraseña actual debe tener al menos 6 caracteres';
    }

    // Validar nueva contraseña
    if (formData.newPassword.length > 0) {
      if (formData.newPassword.length < 8) {
        newErrors.newPassword = 'La nueva contraseña debe tener al menos 8 caracteres';
      } else if (!/(?=.*[a-z])/.test(formData.newPassword)) {
        newErrors.newPassword = 'La contraseña debe contener al menos una letra minúscula';
      } else if (!/(?=.*[A-Z])/.test(formData.newPassword)) {
        newErrors.newPassword = 'La contraseña debe contener al menos una letra mayúscula';
      } else if (!/(?=.*\d)/.test(formData.newPassword)) {
        newErrors.newPassword = 'La contraseña debe contener al menos un número';
      } else if (!/(?=.*[@$!%*?&])/.test(formData.newPassword)) {
        newErrors.newPassword = 'La contraseña debe contener al menos un carácter especial (@$!%*?&)';
      }
    }

    // Validar confirmación de contraseña
    if (formData.confirmPassword.length > 0 && formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
  }, [formData]);

  const updateField = (field: keyof ChangePasswordData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Limpiar errores al escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const isFormValid = (): boolean => {
    return formData.currentPassword.trim() !== '' && 
           formData.newPassword.trim() !== '' && 
           formData.confirmPassword.trim() !== '' && 
           Object.keys(errors).length === 0;
  };

  const changePassword = async (): Promise<boolean> => {
    if (!isFormValid()) {
      setError('Por favor completa todos los campos correctamente');
      return false;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await AuthService.changePassword(
        formData.currentPassword,
        formData.newPassword
      );

      if (result.success) {
        setSuccess(true);
        // Limpiar formulario después de un breve delay
        setTimeout(() => {
          setFormData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
          setErrors({});
        }, 1000);
        return true;
      } else {
        setError(result.error || 'Error al cambiar la contraseña');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const resetForm = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setErrors({});
    setError(null);
    setSuccess(false);
  };

  return {
    formData,
    errors,
    isLoading,
    error,
    success,
    updateField,
    changePassword,
    clearError,
    resetForm,
    isFormValid: isFormValid()
  };
}; 