import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { AnnouncementService } from '../../services/announcementService';
import type {
  Announcement,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
  AnnouncementRoleType
} from '../../types/announcements';
import Button from '../ui/Button';
import RichTextEditor from './RichTextEditor';
import { useThemeClasses } from '../../hooks/useThemeClasses';

interface AnnouncementFormProps {
  announcement?: Announcement | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AnnouncementForm: React.FC<AnnouncementFormProps> = ({
  announcement,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { modalBg, text, textSecondary, textMuted, border, inputBg, inputBorder, inputText, inputPlaceholder } = useThemeClasses();
  const [formData, setFormData] = useState<CreateAnnouncementRequest>({
    title: '',
    content: '',
    priority: 'medium',
    status: 'draft',
    target_roles: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializar formulario cuando se abre
  useEffect(() => {
    if (isOpen) {
      if (announcement) {
        // Modo edición
        const newFormData: CreateAnnouncementRequest = {
          title: announcement.title,
          content: announcement.content,
          priority: announcement.priority,
          status: announcement.status,
          target_roles: [] // Se cargará desde la base de datos
        };
        setFormData(newFormData);
      } else {
        // Modo creación
        const newFormData: CreateAnnouncementRequest = {
          title: '',
          content: '',
          priority: 'medium',
          status: 'draft',
          target_roles: []
        };
        setFormData(newFormData);
      }
      setError(null);
    }
  }, [isOpen, announcement]);

  // Manejar cambios en el formulario
  const handleInputChange = (field: keyof CreateAnnouncementRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Manejar selección de roles
  const handleRoleToggle = (role: AnnouncementRoleType) => {
    setFormData(prev => ({
      ...prev,
      target_roles: prev.target_roles.includes(role)
        ? prev.target_roles.filter(r => r !== role)
        : [...prev.target_roles, role]
    }));
  };

  // Manejar selección de todos los roles
  const handleSelectAllRoles = () => {
    const allRoles: AnnouncementRoleType[] = ['admin', 'admin_comercial', 'admin_operaciones', 'broker'];
    const isAllSelected = allRoles.every(role => formData.target_roles.includes(role));
    
    setFormData(prev => ({
      ...prev,
      target_roles: isAllSelected ? [] : allRoles
    }));
  };

  // Verificar si todos los roles están seleccionados
  const allRoles: AnnouncementRoleType[] = ['admin', 'admin_comercial', 'admin_operaciones', 'broker'];
  const isAllSelected = allRoles.every(role => formData.target_roles.includes(role));
  const isIndeterminate = formData.target_roles.length > 0 && formData.target_roles.length < allRoles.length;


  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('El título es obligatorio');
      return;
    }

    if (!formData.content.trim()) {
      setError('El contenido es obligatorio');
      return;
    }

    if (formData.target_roles.length === 0) {
      setError('Debe seleccionar al menos un rol destinatario');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let response;
      if (announcement) {
        // Modo edición
        const updateData: UpdateAnnouncementRequest = {
          id: announcement.id,
          ...formData
        };
        response = await AnnouncementService.updateAnnouncement(updateData);
      } else {
        // Modo creación
        response = await AnnouncementService.createAnnouncement(formData);
      }

      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.error || 'Error al guardar el anuncio');
      }
    } catch (err) {
      setError('Error inesperado al guardar el anuncio');
      console.error('Error saving announcement:', err);
    } finally {
      setLoading(false);
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
            <h2 className={`text-xl font-semibold ${text}`}>
              {announcement ? 'Editar Anuncio' : 'Crear Nuevo Anuncio'}
            </h2>
            <button
              onClick={onClose}
              className={`p-2 ${textMuted} hover:${textSecondary} transition-colors`}
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(100vh-140px)]">
            <div className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Título */}
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-3 py-2 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-transparent`}
                  placeholder="Ingrese el título del anuncio"
                  required
                />
              </div>


              {/* Contenido con Rich Text Editor */}
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Contenido *
                </label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(value) => handleInputChange('content', value)}
                  placeholder="Escribe el contenido del anuncio..."
                />
                <p className={`text-sm ${textMuted} mt-2`}>
                  Usa la barra de herramientas para formatear el contenido con negrita, cursiva, listas, enlaces y más
                </p>
              </div>

              {/* Prioridad */}
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Prioridad
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className={`w-full px-3 py-2 ${inputBg} ${inputText} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-transparent`}
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                </select>
              </div>

              {/* Estado y Programación */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                    Estado
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className={`w-full px-3 py-2 ${inputBg} ${inputText} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-transparent`}
                  >
                    <option value="draft">Borrador</option>
                    <option value="published">Publicado</option>
                    <option value="archived">Archivado</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                    Programar Publicación (opcional)
                  </label>
                  <input
                    type="datetime-local"
                    onChange={(e) => handleInputChange('scheduled_at', e.target.value || undefined)}
                    className={`w-full px-3 py-2 ${inputBg} ${inputText} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-transparent`}
                  />
                </div>
              </div>

              {/* Roles Destinatarios */}
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Roles Destinatarios *
                </label>
                
                {/* Checkbox "Seleccionar todos" */}
                <div className="mb-3 pb-3 border-b border-gray-200">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(input) => {
                        if (input) {
                          input.indeterminate = isIndeterminate;
                        }
                      }}
                      onChange={handleSelectAllRoles}
                      className="rounded border-gray-300 text-[#fd8412] focus:ring-[#fd8412]"
                    />
                    <span className={`ml-2 text-sm font-medium ${textSecondary}`}>
                      Seleccionar todos los roles
                    </span>
                  </label>
                </div>
                
                {/* Lista de roles individuales */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {allRoles.map((role) => (
                    <label key={role} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.target_roles.includes(role)}
                        onChange={() => handleRoleToggle(role)}
                        className="rounded border-gray-300 text-[#fd8412] focus:ring-[#fd8412]"
                      />
                      <span className={`ml-2 text-sm ${textSecondary}`}>
                        {role === 'admin' ? 'Administrador' :
                         role === 'admin_comercial' ? 'Admin Comercial' :
                         role === 'admin_operaciones' ? 'Admin Operaciones' :
                         role === 'broker' ? 'Corredor' :
                         role}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className={`flex items-center justify-end gap-3 p-6 border-t ${border}`}>
              <Button
                type="button"
                onClick={onClose}
                variant="outlined"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                loading={loading}
              >
                {announcement ? 'Actualizar Anuncio' : 'Crear Anuncio'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AnnouncementForm;
