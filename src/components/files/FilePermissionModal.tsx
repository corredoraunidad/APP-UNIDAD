import React, { useState, useEffect } from 'react';
import { X, Shield, Download, Eye, RotateCcw, Save } from 'lucide-react';
import Button from '../ui/Button';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { FilePermissionService } from '../../services/filePermissionService';
import type { FileItem, FilePermissionByRole, FilePermissionUpdate } from '../../types/files';

interface FilePermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileItem;
  onPermissionsChange: () => void;
}

const FilePermissionModal: React.FC<FilePermissionModalProps> = ({
  isOpen,
  onClose,
  file,
  onPermissionsChange
}) => {
  const [permissions, setPermissions] = useState<FilePermissionByRole>({
    admin: { can_view: true, can_download: false },
    admin_comercial: { can_view: true, can_download: false },
    admin_operaciones: { can_view: true, can_download: false },
    broker: { can_view: true, can_download: false }
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { modalBg, text, textSecondary, textMuted, border, bgSurface } = useThemeClasses();

  // Mapeo de roles para mostrar
  const roleLabels = {
    admin: 'Administrador',
    admin_comercial: 'Admin Comercial',
    admin_operaciones: 'Admin Operaciones',
    broker: 'Corredor'
  };

  // Cargar permisos existentes
  useEffect(() => {
    if (isOpen && file) {
      loadPermissions();
    }
  }, [isOpen, file]);

  const loadPermissions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { success, data, error } = await FilePermissionService.getFilePermissionsByRole(file.id);
      
      if (success && data) {
        setPermissions(data);
      } else {
        setError(error || 'Error al cargar permisos');
      }
    } catch (err) {
      setError('Error de conexión al cargar permisos');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (role: keyof FilePermissionByRole, canDownload: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        can_download: canDownload
      }
    }));
    setSuccess(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Obtener el usuario actual
      const { data: { user } } = await (await import('../../config/supabase')).supabase.auth.getUser();
      if (!user) {
        setError('Usuario no autenticado');
        return;
      }

      // Preparar permisos para actualizar
      const permissionsToUpdate: FilePermissionUpdate[] = Object.entries(permissions).map(([role, perms]) => ({
        role,
        can_download: perms.can_download
      }));

      const { success, error } = await FilePermissionService.updateFilePermissions(
        file.id,
        permissionsToUpdate,
        user.id
      );

      if (success) {
        setSuccess('Permisos actualizados correctamente');
        onPermissionsChange();
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(error || 'Error al actualizar permisos');
      }
    } catch (err) {
      setError('Error de conexión al actualizar permisos');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Obtener el usuario actual
      const { data: { user } } = await (await import('../../config/supabase')).supabase.auth.getUser();
      if (!user) {
        setError('Usuario no autenticado');
        return;
      }

      const { success, error } = await FilePermissionService.resetToDefaultPermissions(file.id, user.id);

      if (success) {
        setSuccess('Permisos restablecidos a valores por defecto');
        loadPermissions();
        onPermissionsChange();
      } else {
        setError(error || 'Error al restablecer permisos');
      }
    } catch (err) {
      setError('Error de conexión al restablecer permisos');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSuccess(null);
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
      <div className={`relative ${modalBg} rounded-2xl shadow-xl w-full max-w-2xl mx-4 transform transition-all`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${border}`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 ${bgSurface} rounded-lg`}>
              <Shield size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${text}`}>
                Gestionar Permisos
              </h3>
              <p className={`text-sm ${textSecondary}`}>
                {file.name}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className={`p-2 ${textMuted} hover:${textSecondary} transition-colors`}
            disabled={saving}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Info del archivo */}
            <div className={`${bgSurface} rounded-lg p-4`}>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Download size={20} className="text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${text} truncate`}>
                    {file.name}
                  </p>
                  <p className={`text-xs ${textSecondary}`}>
                    {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Tamaño desconocido'} • 
                    {file.mime_type ? ` ${file.mime_type}` : ' Tipo desconocido'}
                  </p>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className={`ml-3 ${textSecondary}`}>Cargando permisos...</span>
              </div>
            )}

            {/* Permisos por rol */}
            {!loading && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Eye size={16} className="text-green-600" />
                  <span className={`text-sm font-medium ${text}`}>
                    Todos los roles pueden ver este archivo
                  </span>
                </div>

                <div className="space-y-3">
                  {Object.entries(permissions).map(([role, perms]) => (
                    <div key={role} className={`${bgSurface} rounded-lg p-4`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">
                              {roleLabels[role as keyof typeof roleLabels].charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${text}`}>
                              {roleLabels[role as keyof typeof roleLabels]}
                            </p>
                            <p className={`text-xs ${textSecondary}`}>
                              {perms.can_view ? 'Puede ver' : 'No puede ver'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`text-sm ${textSecondary}`}>
                            Descargar
                          </span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={perms.can_download}
                              onChange={(e) => handlePermissionChange(role as keyof FilePermissionByRole, e.target.checked)}
                              className="sr-only peer"
                              disabled={saving}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <X size={16} className="text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3 mt-6">
            <Button
              type="button"
              variant="outlined"
              color="secondary"
              onClick={handleReset}
              disabled={saving || loading}
              className="flex-1"
            >
              <RotateCcw size={16} className="mr-2" />
              Restablecer
            </Button>
            <Button
              type="button"
              variant="outlined"
              color="secondary"
              onClick={handleClose}
              disabled={saving}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={saving || loading}
              className="flex-1"
            >
              {saving ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </div>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Guardar
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilePermissionModal;
