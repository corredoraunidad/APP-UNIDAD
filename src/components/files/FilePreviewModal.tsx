import React, { useState, useEffect } from 'react';
import { X, Download, ExternalLink, FileText, Image, FileSpreadsheet, Archive, File, Maximize, Minimize } from 'lucide-react';
import Button from '../ui/Button';
import { FileService } from '../../services/fileService';
import { ContractService } from '../../services/contractService';
import { FilePermissionService } from '../../services/filePermissionService';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { useAuth } from '../../hooks/useAuth';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  contractPath?: string; // Ruta del contrato en el bucket 'contracts' (opcional)
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  onClose,
  fileId,
  fileName,
  fileType,
  fileSize,
  contractPath
}) => {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canDownload, setCanDownload] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { modalBg, text, textSecondary, textMuted, border, bgSurface } = useThemeClasses();
  const { user } = useAuth();

  // Obtener URL de descarga cuando se abre el modal
  useEffect(() => {
    if (isOpen && (fileId || contractPath)) {
      loadDownloadUrl();
    }
  }, [isOpen, fileId, contractPath]);

  // Resetear pantalla completa cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setIsFullscreen(false);
    }
  }, [isOpen]);

  const loadDownloadUrl = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let result;
      
      // Si es un contrato, usar ContractService
      if (contractPath) {
        const contractResult = await ContractService.getContractDownloadUrl(contractPath);
        result = {
          data: contractResult.success ? contractResult.data?.url : null,
          error: contractResult.success ? null : contractResult.error
        };
        // Para contratos, asumimos que si puede ver, puede descargar
        setCanDownload(true);
      } else {
        // Si es un archivo normal, usar FileService para previsualización (solo verifica permisos de visualización)
        result = await FileService.getFilePreviewUrl(fileId);
        
        // Verificar permisos de descarga por separado
        if (user?.rol) {
          const canDownloadFile = await FilePermissionService.canRoleDownloadFile(fileId, user.rol);
          setCanDownload(canDownloadFile);
        }
      }
      
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setDownloadUrl(result.data);
      }
    } catch (err: any) {
      setError('Error al cargar el archivo');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!canDownload) {
      setError('No tienes permisos para descargar este archivo');
      return;
    }

    try {
      // Obtener URL de descarga real (con verificación de permisos)
      const result = await FileService.getFileDownloadUrl(fileId);
      
      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.data) {
        const link = document.createElement('a');
        link.href = result.data;
        link.download = fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err: any) {
      setError('Error al descargar el archivo');
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleOpenInNewTab = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = () => {
    const mimeType = fileType.toLowerCase();
    
    if (mimeType.startsWith('image/')) {
      return <Image size={32} className="text-purple-500" />;
    } else if (mimeType === 'application/pdf') {
      return <FileText size={32} className="text-red-500" />;
    } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
      return <FileSpreadsheet size={32} className="text-green-600" />;
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
      return <FileText size={32} className="text-blue-600" />;
    } else if (mimeType.includes('zip') || mimeType.includes('rar')) {
      return <Archive size={32} className="text-yellow-600" />;
    } else {
      return <File size={32} className="text-gray-500" />;
    }
  };

  const canPreview = () => {
    const mimeType = fileType.toLowerCase();
    return (
      mimeType.startsWith('image/') ||
      mimeType === 'application/pdf' ||
      mimeType.includes('text/')
    );
  };

  const renderPreview = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#fd8412] mx-auto mb-4"></div>
            <p className={textSecondary}>Cargando archivo...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="p-3 bg-red-50 rounded-full mx-auto mb-4">
              <File size={32} className="text-red-500" />
            </div>
            <p className="text-red-600 mb-2">Error al cargar el archivo</p>
            <p className={`text-sm ${textSecondary}`}>{error}</p>
          </div>
        </div>
      );
    }

    if (!downloadUrl) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className={`p-3 ${bgSurface} rounded-full mx-auto mb-4`}>
              <File size={32} className={textMuted} />
            </div>
            <p className={textSecondary}>No se pudo cargar el archivo</p>
          </div>
        </div>
      );
    }

    const mimeType = fileType.toLowerCase();

    // Vista previa de imágenes
    if (mimeType.startsWith('image/')) {
      return (
        <div className="flex justify-center">
          <img
            src={downloadUrl}
            alt={fileName}
            className="max-w-full max-h-96 object-contain rounded-lg shadow-sm"
            onError={() => setError('Error al cargar la imagen')}
          />
        </div>
      );
    }

    // Vista previa de PDFs
    if (mimeType === 'application/pdf') {
      return (
        <div className="w-full h-96">
          <iframe
            src={`${downloadUrl}#toolbar=0`}
            className={`w-full h-full border ${border} rounded-lg`}
            title={fileName}
          />
        </div>
      );
    }

    // Para otros tipos de archivo, mostrar información
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className={`p-3 ${bgSurface} rounded-full mx-auto mb-4`}>
            {getFileIcon()}
          </div>
          <p className={`${text} font-medium mb-2`}>{fileName}</p>
          <p className={`text-sm ${textSecondary} mb-4`}>
            {formatFileSize(fileSize)} • {fileType}
          </p>
          <p className={`text-sm ${textMuted}`}>
            Vista previa no disponible para este tipo de archivo
          </p>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 transition-opacity"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative ${modalBg} rounded-2xl shadow-xl w-full ${
        isFullscreen 
          ? 'w-screen h-screen max-w-none mx-0 rounded-none' 
          : 'max-w-4xl mx-4 max-h-[calc(100vh-2rem)]'
      } transform transition-all overflow-hidden modal-content`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${border}`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 ${bgSurface} rounded-lg`}>
              {getFileIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-lg font-semibold ${text} truncate`}>
                {fileName}
              </h3>
              <p className={`text-sm ${textSecondary}`}>
                {formatFileSize(fileSize)} • {fileType}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Botones de acción - solo visibles en desktop */}
            <div className="hidden lg:flex items-center space-x-2">
              {downloadUrl && (
                <>
                  {canPreview() && user?.rol !== 'broker' && (
                    <Button
                      variant="outlined"
                      color="primary"
                      size="sm"
                      onClick={handleOpenInNewTab}
                      className="flex items-center"
                    >
                      <ExternalLink size={16} className="mr-1" />
                      Abrir
                    </Button>
                  )}
                  {canDownload && (
                    <Button
                      variant="outlined"
                      color="primary"
                      size="sm"
                      onClick={handleDownload}
                      className="flex items-center"
                    >
                      <Download size={16} className="mr-1" />
                      Descargar
                    </Button>
                  )}
                </>
              )}
            </div>
            
            {/* Botón de pantalla completa - siempre visible */}
            <button
              onClick={toggleFullscreen}
              className={`p-2 ${textMuted} hover:${textSecondary} transition-colors`}
              title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
            
            {/* Botón de cerrar - siempre visible */}
            <button
              onClick={onClose}
              className={`p-2 ${textMuted} hover:${textSecondary} transition-colors`}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={`p-6 overflow-auto ${
          isFullscreen 
            ? 'h-[calc(100vh-140px)]' 
            : 'max-h-[calc(90vh-140px)]'
        }`}>
          {renderPreview()}
        </div>

        {/* Botones para móvil - solo se muestran en pantallas pequeñas */}
        {downloadUrl && (
          <div className="lg:hidden p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-3 justify-center">
              {canPreview() && user?.rol !== 'broker' && (
                <Button
                  variant="outlined"
                  color="primary"
                  size="sm"
                  onClick={handleOpenInNewTab}
                  className="flex items-center"
                >
                  <ExternalLink size={16} className="mr-1" />
                  Abrir
                </Button>
              )}
              {canDownload && (
                <Button
                  variant="outlined"
                  color="primary"
                  size="sm"
                  onClick={handleDownload}
                  className="flex items-center"
                >
                  <Download size={16} className="mr-1" />
                  Descargar
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilePreviewModal; 