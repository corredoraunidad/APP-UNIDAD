import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Copy, Edit, Trash2 } from 'lucide-react';
import { AnnouncementService } from '../../services/announcementService';
import { usePermissions } from '../../hooks/usePermissions';
import type {
  Announcement
} from '../../types/announcements';
import Button from '../ui/Button';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { useNotificationContext } from '../../contexts/NotificationContext';

interface AnnouncementModalProps {
  announcementId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (announcement: Announcement) => void;
  onDelete: (announcement: Announcement) => void;
  onMarkAsRead?: () => void;
}

const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
  announcementId,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onMarkAsRead
}) => {
  const { can } = usePermissions();
  const { modalBg, text, textSecondary, textMuted, border, bgSurface } = useThemeClasses();
  const { refreshBadge } = useNotificationContext();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos del anuncio
  const loadAnnouncement = async () => {
    if (!announcementId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await AnnouncementService.getAnnouncementById(announcementId);
      
      if (response.success && response.data) {
        setAnnouncement(response.data.announcement);
        
        // Marcar como leído automáticamente
        await AnnouncementService.markAsRead(announcementId);
        
        // Refrescar badge inmediatamente después de marcar como leído
        refreshBadge();
        
        // Notificar al componente padre para refrescar la lista
        if (onMarkAsRead) {
          onMarkAsRead();
        }
      } else {
        setError(response.error || 'Error al cargar el anuncio');
      }
    } catch (err) {
      setError('Error inesperado al cargar el anuncio');
      console.error('Error loading announcement:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar anuncio cuando se abre el modal
  useEffect(() => {
    if (isOpen && announcementId) {
      loadAnnouncement();
    }
  }, [isOpen, announcementId]);

  // Limpiar estado cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setAnnouncement(null);
      setError(null);
    }
  }, [isOpen]);


  // Obtener color de prioridad
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Obtener color de estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'archived':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Copiar al portapapeles
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Aquí podrías mostrar una notificación de éxito
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Overlay */}
        <div 
          className="absolute inset-0 transition-opacity"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={onClose}
        />

        {/* Modal */}
        <div className={`relative ${modalBg} rounded-2xl shadow-xl w-full max-w-4xl mx-4 transform transition-all max-h-[calc(100vh-2rem)] overflow-hidden`}>
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${border}`}>
            <div className="flex items-center gap-3">
              <h2 className={`text-xl font-semibold ${text}`}>
                {loading ? 'Cargando...' : announcement?.title || 'Anuncio'}
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              {announcement && can('anuncios', 'edit') && (
                <Button
                  onClick={() => onEdit(announcement)}
                  variant="outlined"
                  className="flex items-center gap-1 px-3 py-2 text-sm"
                >
                  <Edit size={14} />
                  Editar
                </Button>
              )}
              
              {announcement && can('anuncios', 'delete') && (
                <Button
                  onClick={() => onDelete(announcement)}
                  variant="outlined"
                  className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:border-red-300"
                >
                  <Trash2 size={14} />
                  Eliminar
                </Button>
              )}
              
              <button
                onClick={onClose}
                className={`p-2 ${textMuted} hover:${textSecondary} transition-colors`}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-auto max-h-[calc(100vh-140px)]">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#fd8412] mx-auto mb-4"></div>
                  <p className={textSecondary}>Cargando anuncio...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={loadAnnouncement} variant="outlined">
                    Reintentar
                  </Button>
                </div>
              </div>
            ) : announcement ? (
              <div className="space-y-6">
                {/* Metadatos */}
                <div className={`${bgSurface} rounded-lg p-4`}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className={`text-sm ${textMuted} mb-1`}>Creado</p>
                      <p className={`${text} font-medium`}>
                        {formatDate(announcement.created_at)}
                      </p>
                    </div>
                    
                    <div>
                      <p className={`text-sm ${textMuted} mb-1`}>Prioridad</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                        {announcement.priority === 'high' ? 'Alta' : 
                         announcement.priority === 'medium' ? 'Media' : 'Baja'}
                      </span>
                    </div>
                    
                    <div>
                      <p className={`text-sm ${textMuted} mb-1`}>Estado</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(announcement.status)}`}>
                        {announcement.status === 'published' ? 'Publicado' :
                         announcement.status === 'draft' ? 'Borrador' : 'Archivado'}
                      </span>
                    </div>
                  </div>
                </div>


                {/* Contenido */}
                <div>
                  <h3 className={`text-lg font-semibold ${text} mb-2`}>Contenido</h3>
                  <div className={`${bgSurface} rounded-lg p-4`}>
                    <div 
                      className={`${textSecondary} prose prose-sm max-w-none`}
                      dangerouslySetInnerHTML={{ __html: announcement.content }}
                    />
                  </div>
                </div>


                {/* Información adicional */}
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t ${border}`}>
                  <div>
                    <h4 className={`text-sm font-medium ${text} mb-2`}>Información del Anuncio</h4>
                    <div className={`space-y-1 text-sm ${textSecondary}`}>
                      <p><span className="font-medium">Creado:</span> {formatDate(announcement.created_at)}</p>
                      {announcement.updated_at !== announcement.created_at && (
                        <p><span className="font-medium">Actualizado:</span> {formatDate(announcement.updated_at)}</p>
                      )}
                      {announcement.scheduled_at && (
                        <p><span className="font-medium">Programado para:</span> {formatDate(announcement.scheduled_at)}</p>
                      )}
                      {announcement.published_at && (
                        <p><span className="font-medium">Publicado:</span> {formatDate(announcement.published_at)}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className={`text-sm font-medium ${text} mb-2`}>Acciones Rápidas</h4>
                    <div className="space-y-2">
                      <Button
                        onClick={() => copyToClipboard(announcement.content)}
                        variant="outlined"
                        className="w-full justify-start px-3 py-2 text-sm"
                      >
                        <Copy size={14} className="mr-2" />
                        Copiar contenido
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};

export default AnnouncementModal;
