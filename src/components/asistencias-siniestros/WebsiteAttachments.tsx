import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Trash2, 
  
} from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { usePermissions } from '../../hooks/usePermissions';
import { FileService } from '../../services/fileService';
import { AsistenciasSiniestrosService } from '../../services/asistenciasSiniestrosService';
import type { FileItem } from '../../types/files';

interface WebsiteAttachmentsProps {
  companyId: string;
  attachmentIds: string[];
  onAttachmentsChange: (newAttachmentIds: string[]) => void;
}

const WebsiteAttachments: React.FC<WebsiteAttachmentsProps> = ({
  companyId,
  attachmentIds,
  onAttachmentsChange
}) => {
  const { bgCard, text, textSecondary, textMuted, border, bgSurface } = useThemeClasses();
  const { isBroker } = usePermissions();
  const [attachments, setAttachments] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Cargar archivos adjuntos
  useEffect(() => {
    const loadAttachments = async () => {
      if (attachmentIds.length === 0) {
        setAttachments([]);
        return;
      }

      setIsLoading(true);
      try {
        const { data: files, error } = await FileService.getFilesByIds(attachmentIds);
        
        if (error) {
          console.error('Error cargando archivos adjuntos:', error);
          setAttachments([]);
        } else {
          setAttachments(files || []);
        }
      } catch (error) {
        console.error('Error cargando archivos adjuntos:', error);
        setAttachments([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAttachments();
  }, [attachmentIds, companyId]);

  // Manejar subida de archivo
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (file.type !== 'application/pdf') {
      alert('Solo se permiten archivos PDF');
      return;
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo no puede ser mayor a 10MB');
      return;
    }

    setIsUploading(true);
    try {
      // Subir archivo usando FileService con nombre único
      const timestamp = Date.now();
      const uniqueFileName = `${timestamp}_${file.name}`;
      
      const { data: uploadedFile, error } = await FileService.uploadFile(
        uniqueFileName,
        file,
        file.type,
        file.size,
        `/companies/${companyId}/attachments`
      );
      
      if (error) {
        throw new Error(error);
      }

              if (uploadedFile) {
          const newAttachmentIds = [...attachmentIds, uploadedFile.id];
          
          // Persistir el cambio en la base de datos
          const { error: updateError } = await AsistenciasSiniestrosService.updateWebsiteAttachments(
            companyId, 
            newAttachmentIds
          );
          
          if (updateError) {
            // Si falla la persistencia, eliminar el archivo subido
            await FileService.deleteItem(uploadedFile.id);
            alert('Error al guardar el archivo');
            return;
          }
          
          // Actualizar el estado local
          onAttachmentsChange(newAttachmentIds);
        }
      
      // Limpiar input
      event.target.value = '';
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      alert('Error al subir el archivo');
    } finally {
      setIsUploading(false);
    }
  };

  // Eliminar archivo
  const handleDeleteFile = async (fileId: string) => {
    try {
      const newAttachmentIds = attachmentIds.filter(id => id !== fileId);
      
      // Persistir el cambio en la base de datos
      const { error } = await AsistenciasSiniestrosService.updateWebsiteAttachments(
        companyId, 
        newAttachmentIds
      );
      
      if (error) {
        alert('Error al eliminar el archivo');
        return;
      }
      
      // Actualizar el estado local
      onAttachmentsChange(newAttachmentIds);
    } catch (error) {
      console.error('Error eliminando archivo:', error);
      alert('Error al eliminar el archivo');
    }
  };

  // Descargar archivo
  const handleDownloadFile = async (file: FileItem) => {
    try {
      const { data: downloadUrl, error } = await FileService.getFileDownloadUrl(file.id);
      
      if (error) {
        alert('Error al obtener URL de descarga');
        return;
      }

      if (downloadUrl) {
        // Crear un enlace temporal para descargar
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error descargando archivo:', error);
      alert('Error al descargar el archivo');
    }
  };

  // Vista previa archivo
  const handlePreviewFile = async (file: FileItem) => {
    try {
      const { data: downloadUrl, error } = await FileService.getFileDownloadUrl(file.id);
      
      if (error) {
        alert('Error al obtener URL de vista previa');
        return;
      }

      if (downloadUrl) {
        // Abrir en nueva pestaña para vista previa
        window.open(downloadUrl, '_blank');
      }
    } catch (error) {
      console.error('Error en vista previa:', error);
      alert('Error al abrir vista previa');
    }
  };

  // Formatear tamaño de archivo
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`${bgSurface} rounded-xl p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FileText className={`w-6 h-6 ${textSecondary} mr-3`} />
          <h3 className={`text-xl font-semibold ${text}`}>Instructivos</h3>
        </div>
        <span className={`text-sm ${textMuted}`}>
          {attachments.length} archivo{attachments.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Botón de subida - Solo para admins */}
      {!isBroker() && (
        <div className="mb-4">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
            <div className={`
              flex items-center justify-center p-4 border-2 border-dashed rounded-lg
              ${border} ${textMuted} hover:${text} hover:border-blue-500 transition-colors
              ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}>
              <Upload className="w-5 h-5 mr-2" />
              <span>{isUploading ? 'Subiendo...' : 'Agregar Instructivo (PDF)'}</span>
            </div>
          </label>
        </div>
      )}

      {/* Lista de archivos */}
      {isLoading ? (
        <div className={`text-center py-8 ${textMuted}`}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2">Cargando archivos...</p>
        </div>
      ) : attachments.length > 0 ? (
        <div className="space-y-3">
          {attachments.map((file) => (
            <div key={file.id} className={`${bgCard} rounded-lg p-4 border ${border}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1 min-w-0">
                  <FileText className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${text} truncate`}>{file.name}</p>
                    <p className={`text-sm ${textMuted}`}>
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handlePreviewFile(file)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Vista previa"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDownloadFile(file)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Descargar"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  {!isBroker() && (
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`text-center py-8 ${textMuted}`}>
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No hay instructivos disponibles</p>
          {!isBroker() && (
            <p className="text-sm mt-1">Haz clic en "Agregar Instructivo" para subir archivos PDF</p>
          )}
        </div>
      )}
    </div>
  );
};

export default WebsiteAttachments;
