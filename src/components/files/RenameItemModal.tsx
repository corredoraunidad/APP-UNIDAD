import React, { useState, useEffect } from 'react';
import { X, Edit3 } from 'lucide-react';
import Button from '../ui/Button';
import { useThemeClasses } from '../../hooks/useThemeClasses';

interface RenameItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newName: string) => void;
  currentName: string;
  itemType: 'file' | 'folder';
  loading?: boolean;
}

const RenameItemModal: React.FC<RenameItemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentName,
  itemType,
  loading = false
}) => {
  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { modalBg, text, textSecondary, textMuted, border, inputBg, inputBorder, inputText, inputPlaceholder, bgSurface } = useThemeClasses();

  // Actualizar el nombre cuando cambie el item
  useEffect(() => {
    if (isOpen) {
      setNewName(currentName);
      setError(null);
    }
  }, [isOpen, currentName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!newName.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (newName.trim() === currentName) {
      setError('El nuevo nombre debe ser diferente al actual');
      return;
    }

    if (newName.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres');
      return;
    }

    if (newName.trim().length > 50) {
      setError('El nombre no puede exceder 50 caracteres');
      return;
    }

    // Validar caracteres especiales
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(newName.trim())) {
      setError('El nombre no puede contener caracteres especiales: < > : " / \\ | ? *');
      return;
    }

    setError(null);
    onSubmit(newName.trim());
  };

  const handleClose = () => {
    setNewName('');
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
              <Edit3 size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${text}`}>
                Renombrar {itemType === 'folder' ? 'Carpeta' : 'Archivo'}
              </h3>
              <p className={`text-sm ${textSecondary}`}>
                Nombre actual: {currentName}
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
              <label htmlFor="newName" className={`block text-sm font-medium ${textSecondary} mb-2`}>
                Nuevo nombre
              </label>
              <input
                type="text"
                id="newName"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  if (error) setError(null);
                }}
                placeholder={`Nuevo nombre para ${itemType === 'folder' ? 'la carpeta' : 'el archivo'}`}
                className={`w-full px-4 py-3 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-xl focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412] transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed`}
                disabled={loading}
                autoFocus
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

            <div className={`${bgSurface} rounded-lg p-3`}>
              <p className={`text-xs ${textSecondary}`}>
                <strong>Consejos:</strong>
              </p>
              <ul className={`text-xs ${textSecondary} mt-1 space-y-1`}>
                <li>• Usa nombres descriptivos y organizados</li>
                <li>• Evita caracteres especiales</li>
                <li>• No excedas 50 caracteres</li>
                {itemType === 'file' && (
                  <li>• Mantén la extensión del archivo</li>
                )}
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 mt-6">
            <Button
              type="button"
              variant="outlined"
              color="secondary"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || !newName.trim() || newName.trim() === currentName}
              className="flex-1"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Renombrando...
                </div>
              ) : (
                'Renombrar'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RenameItemModal; 