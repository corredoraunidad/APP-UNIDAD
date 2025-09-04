import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Eye, Edit, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { AnnouncementService } from '../../services/announcementService';
import { usePermissions } from '../../hooks/usePermissions';
import type {
  Announcement,
  AnnouncementWithReadStatus,
  AnnouncementFilters,
  AnnouncementPriority,
  AnnouncementStatus
} from '../../types/announcements';
import Button from '../ui/Button';
import { useThemeClasses } from '../../hooks/useThemeClasses';

interface AnnouncementListProps {
  onAnnouncementSelect: (announcement: Announcement) => void;
  onEditAnnouncement: (announcement: Announcement) => void;
  onDeleteAnnouncement: (announcement: Announcement) => void;
  onCreateNew: () => void;
}

const AnnouncementList: React.FC<AnnouncementListProps> = ({
  onAnnouncementSelect,
  onEditAnnouncement,
  onDeleteAnnouncement,
  onCreateNew
}) => {
  const { can } = usePermissions();
  const { bgCard, text, textSecondary, textMuted, inputBg, inputBorder, inputText, inputPlaceholder, hoverBg } = useThemeClasses();
  const [announcements, setAnnouncements] = useState<AnnouncementWithReadStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnnouncementFilters>({
    page: 1,
    limit: 10
  });
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Cargar anuncios
  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await AnnouncementService.getAnnouncements(filters);
      
      if (response.success && response.data) {
        setAnnouncements(response.data.announcements);
        setTotal(response.data.total);
        setHasMore(response.data.hasMore);
      } else {
        setError(response.error || 'Error al cargar anuncios');
      }
    } catch (err) {
      setError('Error inesperado al cargar anuncios');
      console.error('Error loading announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar anuncios al montar y cuando cambien los filtros
  useEffect(() => {
    loadAnnouncements();
  }, [filters]);

  // Manejar búsqueda
  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm || undefined,
      page: 1 // Resetear a primera página
    }));
  };

  // Manejar filtros
  const handleFilterChange = (key: keyof AnnouncementFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Resetear a primera página
    }));
  };

  // Cargar más anuncios
  const loadMore = () => {
    if (hasMore && !loading) {
      setFilters(prev => ({
        ...prev,
        page: (prev.page || 1) + 1
      }));
    }
  };


  // Obtener color de prioridad
  const getPriorityColor = (priority: AnnouncementPriority) => {
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
  const getStatusColor = (status: AnnouncementStatus) => {
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

  // Obtener color de estado de lectura
  const getReadStatusColor = (isRead: boolean) => {
    if (isRead) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    } else {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && announcements.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#fd8412] mx-auto mb-4"></div>
          <p className={textSecondary}>Cargando anuncios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadAnnouncements} variant="outlined">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con búsqueda y filtros */}
      <div className={`${bgCard} rounded-lg shadow-sm p-4`}>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Búsqueda */}
          <div className="relative flex-1 max-w-md">
            <Search size={20} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textMuted}`} />
            <input
              type="text"
              placeholder="Buscar anuncios..."
              className={`w-full pl-10 pr-4 py-2 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-transparent`}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outlined"
              className="flex items-center gap-2"
            >
              <Filter size={16} />
              Filtros
            </Button>
            
            {can('anuncios', 'create') && (
              <Button
                onClick={onCreateNew}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Nuevo Anuncio
              </Button>
            )}
          </div>
        </div>

        {/* Filtros expandibles */}
        {showFilters && (
          <div className="mt-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Prioridad */}
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
                  Prioridad
                </label>
                <select
                  className={`w-full px-3 py-2 ${inputBg} ${inputText} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-transparent`}
                  onChange={(e) => handleFilterChange('priority', e.target.value || undefined)}
                  value={filters.priority || ''}
                >
                  <option value="">Todas</option>
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                </select>
              </div>

              {/* Estado */}
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
                  Estado
                </label>
                <select
                  className={`w-full px-3 py-2 ${inputBg} ${inputText} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-transparent`}
                  onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                  value={filters.status || ''}
                >
                  <option value="">Todos</option>
                  <option value="draft">Borrador</option>
                  <option value="published">Publicado</option>
                  <option value="archived">Archivado</option>
                </select>
              </div>

              {/* Limpiar filtros */}
              <div className="flex items-end">
                <Button
                  onClick={() => setFilters({ page: 1, limit: 10 })}
                  variant="outlined"
                  className="w-full"
                >
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lista de anuncios */}
      <div className={`${bgCard} rounded-lg shadow-sm overflow-hidden`}>
        {announcements.length === 0 ? (
          <div className="text-center py-12">
            <Calendar size={48} className={`${textMuted} mx-auto mb-4`} />
            <h3 className={`text-lg font-medium ${text} mb-2`}>
              No hay anuncios
            </h3>
            <p className={`${textSecondary} mb-4`}>
              {filters.search || filters.priority || filters.status
                ? 'No se encontraron anuncios con los filtros aplicados.'
                : 'Aún no hay anuncios publicados.'}
            </p>
            {can('anuncios', 'create') && (
              <Button onClick={onCreateNew}>
                Crear primer anuncio
              </Button>
            )}
          </div>
        ) : (
          <div>
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className={`p-6 ${hoverBg} transition-colors duration-200`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Header del anuncio */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-2">
                      <h3 className={`text-lg font-semibold ${text} truncate`}>
                        {announcement.title}
                      </h3>
                    </div>

                    {/* Metadatos */}
                    <div className={`flex flex-wrap items-center gap-2 text-sm ${textSecondary}`}>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(announcement.created_at)}
                      </span>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                        {announcement.priority === 'high' ? 'Alta' : 
                         announcement.priority === 'medium' ? 'Media' : 'Baja'}
                      </span>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(announcement.status)}`}>
                        {announcement.status === 'published' ? 'Publicado' :
                         announcement.status === 'draft' ? 'Borrador' : 'Archivado'}
                      </span>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReadStatusColor(announcement.isRead || false)}`}>
                        {announcement.isRead ? 'Leído' : 'No leído'}
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-col sm:flex-row gap-2 lg:ml-4">
                    {/* Botones con texto para tablet y desktop */}
                    <div className="hidden sm:flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={() => onAnnouncementSelect(announcement)}
                        variant="outlined"
                        className="flex items-center gap-1 px-3 py-2 text-sm"
                      >
                        <Eye size={14} />
                        Ver
                      </Button>
                      
                      {can('anuncios', 'edit') && (
                        <Button
                          onClick={() => onEditAnnouncement(announcement)}
                          variant="outlined"
                          className="flex items-center gap-1 px-3 py-2 text-sm"
                        >
                          <Edit size={14} />
                          Editar
                        </Button>
                      )}
                      
                      {can('anuncios', 'delete') && (
                        <Button
                          onClick={() => onDeleteAnnouncement(announcement)}
                          variant="outlined"
                          className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          <Trash2 size={14} />
                          Eliminar
                        </Button>
                      )}
                    </div>

                    {/* Botones solo iconos para móvil */}
                    <div className="flex sm:hidden gap-2">
                      <Button
                        onClick={() => onAnnouncementSelect(announcement)}
                        variant="outlined"
                        className="p-2"
                      >
                        <Eye size={16} />
                      </Button>
                      
                      {can('anuncios', 'edit') && (
                        <Button
                          onClick={() => onEditAnnouncement(announcement)}
                          variant="outlined"
                          className="p-2"
                        >
                          <Edit size={16} />
                        </Button>
                      )}
                      
                      {can('anuncios', 'delete') && (
                        <Button
                          onClick={() => onDeleteAnnouncement(announcement)}
                          variant="outlined"
                          className="p-2 text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginación */}
        {hasMore && (
          <div className="p-4">
            <Button
              onClick={loadMore}
              variant="outlined"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Cargando...' : 'Cargar más anuncios'}
            </Button>
          </div>
        )}
      </div>

      {/* Contador de resultados */}
      {announcements.length > 0 && (
        <div className={`text-center text-sm ${textSecondary}`}>
          Mostrando {announcements.length} de {total} anuncios
        </div>
      )}
    </div>
  );
};

export default AnnouncementList;
