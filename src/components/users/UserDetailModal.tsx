import React, { useState } from 'react';
import { X, FileText, Download, Eye, Edit, Save, X as XIcon } from 'lucide-react';
import Button from '../ui/Button';
import Switch from '../ui/Switch';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { useAuth } from '../../contexts/AuthContext';
import { canUpdateUser, canChangeUserStatus } from '../../utils/userPermissions';
import { ContractService } from '../../services/contractService';
import { UserService } from '../../services/userService';
import FilePreviewModal from '../files/FilePreviewModal';
import UserDeactivationModal from './UserDeactivationModal';
import type { UserWithContract, UpdateUserData } from '../../types';

// Lista simple de regiones de Chile
const REGIONES_CHILE = [
  { id: 1, nombre: 'Arica y Parinacota' },
  { id: 2, nombre: 'Tarapacá' },
  { id: 3, nombre: 'Antofagasta' },
  { id: 4, nombre: 'Atacama' },
  { id: 5, nombre: 'Coquimbo' },
  { id: 6, nombre: 'Valparaíso' },
  { id: 7, nombre: 'Región Metropolitana de Santiago' },
  { id: 8, nombre: 'Libertador General Bernardo O\'Higgins' },
  { id: 9, nombre: 'Maule' },
  { id: 10, nombre: 'Ñuble' },
  { id: 11, nombre: 'Biobío' },
  { id: 12, nombre: 'La Araucanía' },
  { id: 13, nombre: 'Los Ríos' },
  { id: 14, nombre: 'Los Lagos' },
  { id: 15, nombre: 'Aysén del General Carlos Ibáñez del Campo' },
  { id: 16, nombre: 'Magallanes y de la Antártica Chilena' }
];

// Función para obtener nombre de región
const getRegionName = (regionId: number | null | undefined): string => {
  if (!regionId) return 'No especificada';
  const region = REGIONES_CHILE.find(r => r.id === regionId);
  return region ? `${regionId === 7 ? 'RM' : regionId} - ${region.nombre}` : 'No especificada';
};

// Función para formatear RUT
const formatearRut = (rut: string | null | undefined): string => {
  if (!rut) return 'No especificado';
  
  const rutLimpio = rut.replace(/[.-]/g, '');
  
  if (rutLimpio.length < 2) return rut;
  
  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1).toUpperCase();
  
  let formateado = '';
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    formateado = cuerpo[i] + formateado;
    if ((cuerpo.length - i) % 3 === 0 && i > 0) {
      formateado = '.' + formateado;
    }
  }
  
  return `${formateado}-${dv}`;
};

// Función para formatear fecha
const formatearFecha = (fecha: string | null | undefined): string => {
  if (!fecha) return 'No especificada';
  return new Date(fecha).toLocaleDateString('es-CL');
};

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserWithContract | null;
  onUserUpdated?: (updatedUser: UserWithContract) => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({
  isOpen,
  onClose,
  user,
  onUserUpdated
}) => {
  const { modalBg, text, textSecondary, border, inputBg, inputText, inputBorder, bgCard, bgSurface } = useThemeClasses();
  const { user: currentUser } = useAuth();
  
  // Estados para previsualización del contrato
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<{
    id: string;
    name: string;
    mimeType: string;
    size: number;
    contractPath?: string;
  } | null>(null);
  const [loadingContract, setLoadingContract] = useState(false);

  // Estados para edición
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<UserWithContract | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Estados para cambio de estado activo/inactivo
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Estados para modal de confirmación de desactivación
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState<UserWithContract | null>(null);

  const handlePreviewContract = async () => {
    if (!user?.contract?.file_path) return;
    
    setLoadingContract(true);
    try {
      // Obtener URL de descarga del contrato
      const { success, data: downloadData, error } = await ContractService.getContractDownloadUrl(user.contract.file_path);
      
      if (!success || !downloadData) {
        console.error('Error al obtener URL del contrato:', error);
        return;
      }
      
      // Configurar datos para previsualización
      setPreviewFile({
        id: user.contract.id,
        name: downloadData.name,
        mimeType: 'application/pdf',
        size: downloadData.size,
        contractPath: user.contract.file_path // Pasar la ruta del contrato
      });
      
      setIsPreviewModalOpen(true);
    } catch (error) {
      console.error('Error al cargar contrato:', error);
    } finally {
      setLoadingContract(false);
    }
  };

  const handleDownloadContract = async () => {
    if (!user?.contract?.file_path) return;
    
    try {
      // Obtener URL de descarga del contrato
      const { success, data: downloadData, error } = await ContractService.getContractDownloadUrl(user.contract.file_path);
      if (!success || !downloadData) {
        console.error('Error al obtener URL de descarga:', error);
        return;
      }
      
      // Crear enlace de descarga
      const link = document.createElement('a');
      link.href = downloadData.url;
      link.download = downloadData.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al descargar contrato:', error);
    }
  };

  // Funciones de edición
  const handleStartEdit = () => {
    if (!user) return;
    setEditedUser({ ...user });
    setIsEditing(true);
    setEditError(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedUser(null);
    setEditError(null);
  };

  const handleSaveEdit = async () => {
    if (!editedUser || !user) return;
    
    setIsSaving(true);
    setEditError(null);
    
    try {
      const updateData: UpdateUserData = {
        id: user.id,
        email: editedUser.email,
        nombres: editedUser.nombres,
        apellido_paterno: editedUser.apellido_paterno,
        apellido_materno: editedUser.apellido_materno,
        telefono: editedUser.telefono,
        rut: editedUser.rut,
        direccion: editedUser.direccion,
        comuna: editedUser.comuna,
        region: editedUser.region,
        fecha_nacimiento: editedUser.fecha_nacimiento,
        fecha_inicio_contrato: editedUser.fecha_inicio_contrato,
        nuevas_ventas: editedUser.nuevas_ventas,
        renovaciones: editedUser.renovaciones,
        comentarios: editedUser.comentarios
      };

      const { user: updatedUser, error } = await UserService.updateUser(user.id, updateData);
      
      if (error) {
        setEditError(error);
        return;
      }

      if (updatedUser) {
        setIsEditing(false);
        setEditedUser(null);
        onUserUpdated?.(updatedUser);
        alert('Usuario actualizado exitosamente');
      }
    } catch (error: any) {
      setEditError(error.message || 'Error al actualizar usuario');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (field: keyof UserWithContract, value: any) => {
    if (!editedUser) return;
    setEditedUser({ ...editedUser, [field]: value });
  };

  // Función para cambiar el estado activo/inactivo del usuario
  const handleStatusChange = async (isActive: boolean) => {
    if (!user) return;
    
    // Validar que el usuario no se desactive a sí mismo
    if (currentUser && user.id === currentUser.id && !isActive) {
      setStatusError('No puedes desactivar tu propia cuenta');
      return;
    }
    
    // Si se va a desactivar, mostrar modal de confirmación
    if (!isActive) {
      setUserToDeactivate(user);
      setIsConfirmModalOpen(true);
      return;
    }
    
    // Si se va a activar, proceder directamente
    await changeUserStatus(isActive);
  };

  // Función para el cambio real de estado
  const changeUserStatus = async (isActive: boolean) => {
    if (!user) return;
    
    setIsChangingStatus(true);
    setStatusError(null);
    
    try {
      const { success, error } = await UserService.toggleUserStatus(user.id, isActive);
      
      if (success) {
        // Actualizar el usuario localmente
        const updatedUser = { ...user, is_active: isActive };
        onUserUpdated?.(updatedUser);
        
        // Mostrar mensaje de éxito
        alert(`Usuario ${isActive ? 'activado' : 'desactivado'} exitosamente`);
      } else {
        setStatusError(error || 'Error al cambiar estado del usuario');
      }
    } catch (error: any) {
      setStatusError('Error de conexión al cambiar estado');
    } finally {
      setIsChangingStatus(false);
    }
  };

  // Cerrar modal con ESC
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEditing) {
          handleCancelEdit();
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, isEditing]);

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 transition-opacity"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative ${modalBg} rounded-2xl shadow-2xl w-full max-w-6xl mx-4 transform transition-all max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${border} sticky top-0 bg-inherit z-10`}>
          <div className="flex items-center">
            <h2 className={`text-xl font-bold ${text}`}>
              Detalles del Usuario
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Botón de edición - solo para usuarios con permisos específicos */}
            {currentUser && user && canUpdateUser(currentUser, user) && !isEditing && (
              <button
                onClick={handleStartEdit}
                className={`p-2 rounded-full hover:${inputBg} transition-colors`}
                title="Editar usuario"
              >
                <Edit size={20} className={textSecondary} />
              </button>
            )}
            
            {/* Botones de guardar/cancelar - solo en modo edición */}
            {isEditing && (
              <>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className={`p-2 rounded-full hover:${inputBg} transition-colors ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="Guardar cambios"
                >
                  <Save size={20} className="text-green-600" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className={`p-2 rounded-full hover:${inputBg} transition-colors ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="Cancelar edición"
                >
                  <XIcon size={20} className="text-red-600" />
                </button>
              </>
            )}
            
            {/* Botón de cerrar - solo cuando no está editando */}
            {!isEditing && (
              <button
                onClick={onClose}
                className={`p-2 rounded-full hover:${inputBg} transition-colors`}
              >
                <X size={20} className={textSecondary} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Mensajes de error */}
          {editError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{editError}</p>
            </div>
          )}
          
          {statusError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{statusError}</p>
            </div>
          )}
          
          {/* Header del Perfil */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gradient-to-br from-[#fd8412] to-orange-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {user.nombres.charAt(0)}{user.apellido_paterno.charAt(0)}
                  </span>
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${text} mb-2`}>
                    {user.nombres} {user.apellido_paterno} {user.apellido_materno || ''}
                  </h2>
                  
                  {/* Badge del Rol */}
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {user.rol === 'broker' ? 'Corredor' : 
                     user.rol === 'admin' ? 'Administrador' :
                     user.rol === 'admin_comercial' ? 'Admin Comercial' :
                     user.rol === 'admin_operaciones' ? 'Admin Operaciones' : user.rol}
                  </div>
                </div>
              </div>
              
              {/* Switch del Estado - Solo para usuarios con permisos específicos */}
              {currentUser && user && canChangeUserStatus(currentUser, user) && (
                <div className="flex flex-col items-center space-y-2">
                  <Switch
                    checked={user.is_active}
                    onChange={handleStatusChange}
                    disabled={isChangingStatus || (currentUser && user.id === currentUser.id)}
                    className="scale-100"
                  />
                  <div className="flex flex-col items-center">
                    <span className={`text-sm font-medium ${textSecondary}`}>
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                    {currentUser && user.id === currentUser.id && (
                      <span className="text-xs text-orange-600 font-medium">(Tu cuenta)</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Información Personal */}
          <div className="space-y-6">
            <div>
              <h3 className={`text-lg font-semibold ${text} mb-4 flex items-center`}>
                <div className="w-1 h-6 bg-[#fd8412] rounded-full mr-3"></div>
                Información Personal
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div className={`flex items-center space-x-3 ${bgSurface} rounded-xl p-4`}>
                  <div className={`w-10 h-10 ${bgCard} rounded-lg flex items-center justify-center`}>
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${textSecondary}`}>Email</p>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editedUser?.email || ''}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        className={`w-full px-3 py-1 ${inputBg} ${inputText} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-transparent text-sm`}
                      />
                    ) : (
                      <p className={`font-medium ${text}`}>{user.email}</p>
                    )}
                  </div>
                </div>

                {/* Teléfono */}
                <div className={`flex items-center space-x-3 ${bgSurface} rounded-xl p-4`}>
                  <div className={`w-10 h-10 ${bgCard} rounded-lg flex items-center justify-center`}>
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${textSecondary}`}>Teléfono</p>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editedUser?.telefono || ''}
                        onChange={(e) => handleFieldChange('telefono', e.target.value)}
                        className={`w-full px-3 py-1 ${inputBg} ${inputText} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-transparent text-sm`}
                        placeholder="+56 9 1234 5678"
                      />
                    ) : (
                      <p className={`font-medium ${text}`}>{user.telefono || 'No especificado'}</p>
                    )}
                  </div>
                </div>

                {/* RUT */}
                <div className={`flex items-center space-x-3 ${bgSurface} rounded-xl p-4`}>
                  <div className={`w-10 h-10 ${bgCard} rounded-lg flex items-center justify-center`}>
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${textSecondary}`}>RUT</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedUser?.rut || ''}
                        onChange={(e) => handleFieldChange('rut', e.target.value)}
                        className={`w-full px-3 py-1 ${inputBg} ${inputText} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-transparent text-sm`}
                        placeholder="12.345.678-9"
                      />
                    ) : (
                      <p className={`font-medium ${text}`}>{formatearRut(user.rut)}</p>
                    )}
                  </div>
                </div>

                {/* Username */}
                <div className={`flex items-center space-x-3 ${bgSurface} rounded-xl p-4`}>
                  <div className={`w-10 h-10 ${bgCard} rounded-lg flex items-center justify-center`}>
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className={`text-sm ${textSecondary}`}>Username</p>
                    <p className={`font-medium ${text}`}>@{user.username}</p>
                  </div>
                </div>
              </div>

              {/* Dirección */}
              <div className="mt-6">
                <div className={`flex items-start space-x-3 ${bgSurface} rounded-xl p-4`}>
                  <div className={`w-10 h-10 ${bgCard} rounded-lg flex items-center justify-center mt-1`}>
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${textSecondary} mb-1`}>Dirección</p>
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editedUser?.direccion || ''}
                          onChange={(e) => handleFieldChange('direccion', e.target.value)}
                          className={`w-full px-3 py-1 ${inputBg} ${inputText} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-transparent text-sm`}
                          placeholder="Av. Providencia 1234"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={editedUser?.comuna || ''}
                            onChange={(e) => handleFieldChange('comuna', e.target.value)}
                            className={`px-3 py-1 ${inputBg} ${inputText} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-transparent text-sm`}
                            placeholder="Comuna"
                          />
                          <select
                            value={editedUser?.region?.toString() || ''}
                            onChange={(e) => handleFieldChange('region', e.target.value ? parseInt(e.target.value) : null)}
                            className={`px-3 py-1 ${inputBg} ${inputText} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-transparent text-sm`}
                          >
                            <option value="">Seleccionar región</option>
                            {REGIONES_CHILE.map(region => (
                              <option key={region.id} value={region.id}>
                                {region.id === 7 ? 'RM' : region.id} - {region.nombre}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className={`font-medium ${text} mb-2`}>{user.direccion || 'No especificada'}</p>
                        <div className="flex space-x-4 text-sm">
                          <span className={`${textSecondary}`}>
                            <span className="font-medium">Comuna:</span> {user.comuna || 'No especificada'}
                          </span>
                          <span className={`${textSecondary}`}>
                            <span className="font-medium">Región:</span> {getRegionName(user.region)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Fechas */}
              <div className="mt-6 flex items-center space-x-6">
                <div className={`flex items-center space-x-3 ${bgSurface} rounded-xl p-4`}>
                  <div className={`w-10 h-10 ${bgCard} rounded-lg flex items-center justify-center`}>
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className={`text-sm ${textSecondary}`}>Fecha de Nacimiento</p>
                    <p className={`font-medium ${text}`}>{formatearFecha(user.fecha_nacimiento)}</p>
                  </div>
                </div>

                <div className={`flex items-center space-x-3 ${bgSurface} rounded-xl p-4`}>
                  <div className={`w-10 h-10 ${bgCard} rounded-lg flex items-center justify-center`}>
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className={`text-sm ${textSecondary}`}>Inicio de Contrato</p>
                    <p className={`font-medium ${text}`}>{formatearFecha(user.fecha_inicio_contrato)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Información Laboral - Solo para Corredores */}
            {user.rol === 'broker' && (
              <div className="mt-8">
                <h3 className={`text-lg font-semibold ${text} mb-4 flex items-center`}>
                  <div className="w-1 h-6 bg-[#fd8412] rounded-full mr-3"></div>
                  Información Laboral
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Nuevas Ventas */}
                  <div className={`${bgCard} rounded-xl p-4 shadow-lg border ${border}`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${bgSurface} rounded-lg flex items-center justify-center`}>
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div>
                        <p className={`text-sm ${textSecondary}`}>Nuevas Ventas</p>
                        <p className="text-2xl font-bold text-[#fd8412]">{user.nuevas_ventas || 0}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Renovaciones */}
                  <div className={`${bgCard} rounded-xl p-4 shadow-lg border ${border}`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${bgSurface} rounded-lg flex items-center justify-center`}>
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </div>
                      <div>
                        <p className={`text-sm ${textSecondary}`}>Renovaciones</p>
                        <p className="text-2xl font-bold text-[#fd8412]">{user.renovaciones || 0}%</p>
                      </div>
                    </div>
                  </div>

                  {/* UF Vendida */}
                  <div className={`${bgSurface} rounded-xl p-4`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${bgCard} rounded-lg flex items-center justify-center`}>
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <div>
                        <p className={`text-sm ${textSecondary}`}>UF Vendida</p>
                        <p className={`text-2xl font-bold ${text}`}>{user.uf_vendida || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Contrato - Solo para Corredores */}
            {user.rol === 'broker' && user.contract && (
              <div className="mt-8">
                <h3 className={`text-lg font-semibold ${text} mb-4 flex items-center`}>
                  <div className="w-1 h-6 bg-[#fd8412] rounded-full mr-3"></div>
                  Contrato Firmado
                </h3>
                
                <div className={`${bgSurface} rounded-xl p-6`}>
                  <div className="flex flex-col items-center space-y-3">
                    <div className={`w-16 h-16 ${bgCard} rounded-full flex items-center justify-center`}>
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="text-center">
                      <p className={`font-medium ${text} mb-1`}>Contrato disponible</p>
                      <p className={`text-sm ${textSecondary}`}>
                        Subido el {formatearFecha(user.contract.created_at)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outlined"
                        color="primary"
                        onClick={handlePreviewContract}
                        disabled={loadingContract}
                        className="flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {loadingContract ? 'Cargando...' : 'Ver Contrato'}
                      </Button>
                      <Button
                        type="button"
                        variant="outlined"
                        color="primary"
                        onClick={handleDownloadContract}
                        className="flex items-center"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Descargar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Comentarios - Solo para Corredores */}
            {user.rol === 'broker' && user.comentarios && (
              <div className="mt-8">
                <h3 className={`text-lg font-semibold ${text} mb-4 flex items-center`}>
                  <div className="w-1 h-6 bg-[#fd8412] rounded-full mr-3"></div>
                  Comentarios
                </h3>
                
                <div className={`${bgSurface} rounded-xl p-4`}>
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 ${bgCard} rounded-lg flex items-center justify-center mt-1`}>
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className={`${text} leading-relaxed`}>{user.comentarios}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Información del Sistema */}
            <div className="mt-8">
              <h3 className={`text-lg font-semibold ${text} mb-4 flex items-center`}>
                <div className="w-1 h-6 bg-[#fd8412] rounded-full mr-3"></div>
                Información del Sistema
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fecha de Registro */}
                <div className={`flex items-center space-x-3 ${bgSurface} rounded-xl p-4`}>
                  <div className={`w-10 h-10 ${bgCard} rounded-lg flex items-center justify-center`}>
                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className={`text-sm ${textSecondary}`}>Fecha de Registro</p>
                    <p className={`font-medium ${text}`}>{formatearFecha(user.fecha_registro)}</p>
                  </div>
                </div>

                {/* UF Vendida (solo si no es corredor) */}
                {user.rol !== 'broker' && (
                  <div className={`flex items-center space-x-3 ${bgSurface} rounded-xl p-4`}>
                    <div className={`w-10 h-10 ${bgCard} rounded-lg flex items-center justify-center`}>
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div>
                      <p className={`text-sm ${textSecondary}`}>UF Vendida</p>
                      <p className={`font-medium ${text}`}>{user.uf_vendida || 0}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>


          </div>
        </div>
      </div>

      {/* Modal de Confirmación de Desactivación */}
      <UserDeactivationModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setUserToDeactivate(null);
        }}
        user={userToDeactivate}
        onConfirm={async () => {
          if (userToDeactivate) {
            await changeUserStatus(false);
            // Limpiar estados después de la confirmación
            setIsConfirmModalOpen(false);
            setUserToDeactivate(null);
          }
        }}
        isDeactivating={isChangingStatus}
      />

      {/* Modal de Previsualización del Contrato */}
      <FilePreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setPreviewFile(null);
        }}
        fileId={previewFile?.id || ''}
        fileName={previewFile?.name || ''}
        fileType={previewFile?.mimeType || ''}
        fileSize={previewFile?.size || 0}
        contractPath={previewFile?.contractPath}
      />
    </div>
  );
};

export default UserDetailModal;
