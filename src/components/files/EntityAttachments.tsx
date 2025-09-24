import React, { useEffect, useState } from 'react';
import { FileText, Upload, Download, Eye, Trash2 } from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { FileService } from '../../services/fileService';
import { useChangePasswordModal } from '../../contexts/ModalContext';
import type { FileItem } from '../../types/files';

interface EntityAttachmentsProps {
  entityId: string;
  entityName: string;
  attachmentIds: string[];
  onAttachmentsChange: (newIds: string[]) => void;
  onPersist: (entityId: string, ids: string[]) => Promise<{ error?: string | null }>;
  onPreviewFile: (file: FileItem) => void;
  basePath: string; // e.g. '/instructivos-metodos-pago'
  canEdit?: boolean;
}

const EntityAttachments: React.FC<EntityAttachmentsProps> = ({
  entityId,
  entityName,
  attachmentIds,
  onAttachmentsChange,
  onPersist,
  basePath,
  canEdit = true
}) => {
  const { bgCard, text, textSecondary, textMuted, border, bgSurface } = useThemeClasses();
  const { openFilePreview } = useChangePasswordModal();
  const [attachments, setAttachments] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const cleanName = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  useEffect(() => {
    const load = async () => {
      if (!attachmentIds || attachmentIds.length === 0) {
        setAttachments([]);
        return;
      }
      setIsLoading(true);
      try {
        const { data, error } = await FileService.getFilesByIds(attachmentIds);
        if (error) {
          setAttachments([]);
        } else {
          setAttachments(data || []);
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [attachmentIds, entityId]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Solo se permiten archivos PDF');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo no puede ser mayor a 10MB');
      return;
    }

    setIsUploading(true);
    try {
      const { data: uploadedFile, error } = await FileService.uploadFile(
        file.name,
        file,
        file.type,
        file.size,
        `${basePath}/${cleanName(entityName)}`
      );
      if (error) throw new Error(error);
      if (uploadedFile) {
        const newIds = [...attachmentIds, uploadedFile.id];
        const { error: persistError } = await onPersist(entityId, newIds);
        if (persistError) {
          await FileService.deleteItem(uploadedFile.id);
          alert('Error al guardar el archivo');
          return;
        }
        // Actualizar inmediatamente la UI
        setAttachments(prev => {
          const exists = prev.some(f => f.id === uploadedFile.id);
          return exists ? prev : [...prev, uploadedFile];
        });
        onAttachmentsChange(newIds);
      }
      event.target.value = '';
    } catch (err) {
      console.error('Error subiendo archivo:', err);
      alert('Error al subir el archivo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const newIds = attachmentIds.filter(id => id !== fileId);
      const { error } = await onPersist(entityId, newIds);
      if (error) {
        alert('Error al eliminar el archivo');
        return;
      }
      const { error: deleteError } = await FileService.deleteItem(fileId);
      if (deleteError) {
        await onPersist(entityId, attachmentIds);
        alert('No se pudo eliminar el archivo físicamente. Se revirtió el cambio.');
        return;
      }
      // Actualizar inmediatamente la UI
      setAttachments(prev => prev.filter(f => f.id !== fileId));
      onAttachmentsChange(newIds);
    } catch (err) {
      console.error('Error eliminando archivo:', err);
      alert('Error al eliminar el archivo');
    }
  };

  const handleDownloadFile = async (file: FileItem) => {
    const { data: url, error } = await FileService.getFileDownloadUrl(file.id);
    if (error || !url) {
      alert('Error al obtener URL de descarga');
      return;
    }
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreviewFile = (file: FileItem) => {
    // Usar modal global
    openFilePreview({ id: file.id, name: file.name, type: file.mime_type || 'application/pdf', size: file.size || 0 });
  };

  return (
    <div className={`${bgSurface} rounded-xl p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FileText className={`w-6 h-6 ${textSecondary} mr-3`} />
          <h3 className={`text-xl font-semibold ${text}`}>Adjuntos</h3>
        </div>
        <span className={`text-sm ${textMuted}`}>
          {attachments.length} archivo{attachments.length !== 1 ? 's' : ''}
        </span>
      </div>

      {canEdit && (
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
                    <p className={`text-sm ${textMuted}`}>{(file.size / 1024).toFixed(1)} KB</p>
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
                  {canEdit && (
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
          <p>No hay archivos adjuntos</p>
          {canEdit && <p className="text-sm mt-1">Haz clic en "Agregar Instructivo" para subir archivos PDF</p>}
        </div>
      )}
    </div>
  );
};

export default EntityAttachments;


