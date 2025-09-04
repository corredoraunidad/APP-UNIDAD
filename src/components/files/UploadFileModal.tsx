import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';
import { useThemeClasses } from '../../hooks/useThemeClasses';

interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File) => void;
  currentPath: string;
  loading?: boolean;
}

const UploadFileModal: React.FC<UploadFileModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentPath,
  loading = false
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { modalBg, text, textSecondary, textMuted, border, bgSurface } = useThemeClasses();

  // Configuración de archivos permitidos
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ];

  const maxFileSize = 50 * 1024 * 1024; // 50MB

  const validateFile = (file: File): string | null => {
    // Validar tipo de archivo
    if (!allowedTypes.includes(file.type)) {
      return 'Tipo de archivo no permitido. Solo se permiten: imágenes, PDF, documentos, hojas de cálculo y archivos de texto.';
    }

    // Validar tamaño
    if (file.size > maxFileSize) {
      return 'El archivo es demasiado grande. El tamaño máximo es 50MB.';
    }

    // Validar nombre
    if (file.name.length > 100) {
      return 'El nombre del archivo es demasiado largo. Máximo 100 caracteres.';
    }

    // Validar caracteres especiales en el nombre
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(file.name)) {
      return 'El nombre del archivo no puede contener caracteres especiales: < > : " / \\ | ? *';
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }

    setError(null);
    setSelectedFile(file);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Por favor selecciona un archivo');
      return;
    }

    setError(null);
    onSubmit(selectedFile);
  };

  const handleClose = () => {
    setSelectedFile(null);
    setError(null);
    setDragActive(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 transition-opacity"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className={`relative ${modalBg} rounded-2xl shadow-xl w-full max-w-lg mx-4 transform transition-all`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${border}`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 ${bgSurface} rounded-lg`}>
              <Upload size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${text}`}>
                Subir Archivo
              </h3>
              <p className={`text-sm ${textSecondary}`}>
                Subir a: {currentPath === '/' ? 'Raíz' : currentPath}
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
            {/* Drag & Drop Area */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                dragActive 
                  ? 'border-blue-400 bg-blue-50' 
                  : selectedFile 
                    ? 'border-green-400 bg-green-50' 
                    : `${border} hover:border-gray-400`
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="space-y-3">
                  <CheckCircle size={48} className="text-green-500 mx-auto" />
                  <div>
                    <p className={`text-sm font-medium ${text}`}>
                      {selectedFile.name}
                    </p>
                    <p className={`text-xs ${textSecondary}`}>
                      {formatFileSize(selectedFile.size)} • {selectedFile.type}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outlined"
                    color="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    disabled={loading}
                  >
                    Cambiar archivo
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload size={48} className={`${textMuted} mx-auto`} />
                  <div>
                    <p className={`text-sm font-medium ${text}`}>
                      Arrastra y suelta tu archivo aquí
                    </p>
                    <p className={`text-xs ${textSecondary}`}>
                      o haz clic para seleccionar
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outlined"
                    color="primary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                  >
                    Seleccionar archivo
                  </Button>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileInputChange}
                className="hidden"
                accept={allowedTypes.join(',')}
                disabled={loading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* File Info */}
            <div className={`${bgSurface} rounded-lg p-3`}>
              <p className={`text-xs ${textSecondary}`}>
                <strong>Tipos de archivo permitidos:</strong>
              </p>
              <ul className={`text-xs ${textSecondary} mt-1 space-y-1`}>
                <li>• Imágenes: JPG, PNG, GIF, WebP</li>
                <li>• Documentos: PDF, DOC, DOCX</li>
                <li>• Hojas de cálculo: XLS, XLSX</li>
                <li>• Texto: TXT, CSV</li>
                <li>• Tamaño máximo: 50MB</li>
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
              disabled={loading || !selectedFile}
              className="flex-1"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Subiendo...
                </div>
              ) : (
                'Subir Archivo'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadFileModal; 