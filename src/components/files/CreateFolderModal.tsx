import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import Button from '../ui/Button';
import { useThemeClasses } from '../../hooks/useThemeClasses';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (folderName: string) => void;
  currentPath: string;
  loading?: boolean;
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentPath,
  loading = false
}) => {
  const [folderName, setFolderName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { modalBg, text, textSecondary, textMuted, border, inputBg, inputBorder, inputText, inputPlaceholder, bgSurface } = useThemeClasses();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!folderName.trim()) {
      setError('El nombre de la carpeta es requerido');
      return;
    }

    if (folderName.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres');
      return;
    }

    if (folderName.trim().length > 50) {
      setError('El nombre no puede exceder 50 caracteres');
      return;
    }

    // Validar caracteres especiales
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(folderName.trim())) {
      setError('El nombre no puede contener caracteres especiales: < > : " / \\ | ? *');
      return;
    }

    setError(null);
    onSubmit(folderName.trim());
  };

  const handleClose = () => {
    setFolderName('');
    setError(null);
    onClose();
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
      <div className={`relative ${modalBg} rounded-2xl shadow-xl w-full max-w-md mx-4 transform transition-all`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${border}`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 ${bgSurface} rounded-lg`}>
              <FolderPlus size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${text}`}>
                Nueva Carpeta
              </h3>
              <p className={`text-sm ${textSecondary}`}>
                Crear carpeta en: {currentPath === '/' ? 'Raíz' : currentPath}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className={`p-2 ${textMuted} hover:${textSecondary} transition-colors`}
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="folderName" className={`block text-sm font-medium ${textSecondary} mb-2`}>
                Nombre de la carpeta
              </label>
              <input
                type="text"
                id="folderName"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className={`w-full px-4 py-3 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-xl focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412] transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed`}
                placeholder="Ingresa el nombre de la carpeta"
                disabled={loading}
                autoFocus
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outlined"
                color="secondary"
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                loading={loading}
                disabled={loading}
              >
                Crear Carpeta
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFolderModal; 