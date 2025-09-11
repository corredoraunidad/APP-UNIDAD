import React, { useState, useEffect } from 'react';
import { X, Loader, Upload, FileText } from 'lucide-react';
import Button from '../ui/Button';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { useAuth } from '../../contexts/AuthContext';
import { canCreateUser } from '../../utils/userPermissions';
import type { CreateUserData } from '../../types';

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

// Función simple para validar RUT (igual que en UserService)
const validarRutSimple = (rut: string): boolean => {
  if (!rut || rut.trim().length === 0) return true; // RUT es opcional
  
  // Limpiar RUT
  const rutLimpio = rut.replace(/[.-]/g, '');
  
  if (rutLimpio.length < 2) return false;
  
  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1).toUpperCase();
  
  if (!/^[0-9]+$/.test(cuerpo)) return false;
  
  let suma = 0;
  let multiplicador = 2;
  
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  
  const dvEsperado = 11 - (suma % 11);
  const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();
  
  return dvCalculado === dv;
};

// Función simple para formatear RUT
const formatearRut = (rut: string): string => {
  if (!rut) return '';
  
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

interface UserCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: CreateUserData) => Promise<void>;
}

const UserCreationModal: React.FC<UserCreationModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const { modalBg, text, textSecondary, border, inputBg, inputBorder, inputText, inputPlaceholder } = useThemeClasses();
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState<CreateUserData>({
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    email: '',
    username: '',
    rol: 'broker',
    
    // Nuevos campos
    rut: '',
    telefono: '',
    direccion: '',
    comuna: '',
    region: undefined,
    fecha_nacimiento: '',
    fecha_inicio_contrato: '',
    nuevas_ventas: 0,
    renovaciones: 0,
    comentarios: '',
    
    // Archivo de contrato
    contractFile: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  

  // Estados para validaciones
  const [rutError, setRutError] = useState<string | null>(null);
  const [contractError, setContractError] = useState<string | null>(null);
  const [contractFileName, setContractFileName] = useState<string>('');


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validación de RUT en tiempo real
    if (name === 'rut' && value) {
      const formattedRut = formatearRut(value);
      const isValid = validarRutSimple(value);
      
      if (!isValid) {
        setRutError('RUT inválido');
      } else {
        setRutError(null);
        // Actualizar con formato
        setFormData(prev => ({
          ...prev,
          rut: formattedRut
        }));
      }
    } else if (name === 'rut') {
      setRutError(null);
    }
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === '' ? 0 : parseInt(value) || 0;
    setFormData(prev => ({
      ...prev,
      [name]: numValue
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setContractError(null);
    
    if (file) {
      // Validar tipo de archivo
      if (file.type !== 'application/pdf') {
        setContractError('Solo se permiten archivos PDF');
        setContractFileName('');
        setFormData(prev => ({ ...prev, contractFile: null }));
        return;
      }
      
      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setContractError('El archivo no puede superar los 10MB');
        setContractFileName('');
        setFormData(prev => ({ ...prev, contractFile: null }));
        return;
      }
      
      setContractFileName(file.name);
      setFormData(prev => ({ ...prev, contractFile: file }));
    } else {
      setContractFileName('');
      setFormData(prev => ({ ...prev, contractFile: null }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar permisos de creación
    if (!currentUser || !canCreateUser(currentUser, formData.rol)) {
      setSubmitError('No tienes permisos para crear usuarios con este rol');
      return;
    }
    
    // Validaciones - Solo requerir contrato para corredores
    if (formData.rol === 'broker' && !formData.contractFile) {
      setContractError('El contrato firmado es obligatorio para corredores');
      return;
    }

    if (formData.rut && !validarRutSimple(formData.rut)) {
      setRutError('RUT inválido');
      return;
    }


    // Limpiar errores anteriores
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      // Solo cerrar si no hay errores
      handleClose();
    } catch (error: any) {
      setSubmitError(error?.message || 'Error creando usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      nombres: '',
      apellido_paterno: '',
      apellido_materno: '',
      email: '',
      username: '',
      rol: 'broker',
      rut: '',
      telefono: '',
      direccion: '',
      comuna: '',
      region: undefined,
      fecha_nacimiento: '',
      fecha_inicio_contrato: '',
      nuevas_ventas: 0,
      renovaciones: 0,
      comentarios: '',
      contractFile: null
    });
    setIsSubmitting(false);
    setSubmitError(null);
    setRutError(null);
    setContractError(null);
    setContractFileName('');
    onClose();
  };

  // Cerrar modal con ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
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
  }, [isOpen]);


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
      <div className={`relative ${modalBg} rounded-2xl shadow-2xl w-full max-w-2xl mx-4 transform transition-all max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${border} sticky top-0 bg-inherit z-10`}>
          <div className="flex items-center">
            <h2 className={`text-xl font-bold ${text}`}>
              Crear Nuevo Usuario
            </h2>
          </div>
          <button
            onClick={handleClose}
            className={`p-2 rounded-full hover:${inputBg} transition-colors`}
          >
            <X size={20} className={textSecondary} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Información Personal */}
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${text} border-b ${border} pb-2`}>
              Información Personal
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombres */}
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Nombres *
                </label>
                <input
                  type="text"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-xl focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412] transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed`}
                  placeholder="Ingresa los nombres"
                />
              </div>

              {/* Apellido Paterno */}
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Apellido Paterno *
                </label>
                <input
                  type="text"
                  name="apellido_paterno"
                  value={formData.apellido_paterno}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-xl focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412] transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed`}
                  placeholder="Ingresa el apellido paterno"
                />
              </div>

              {/* Apellido Materno */}
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Apellido Materno
                </label>
                <input
                  type="text"
                  name="apellido_materno"
                  value={formData.apellido_materno || ''}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-xl focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412] transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed`}
                  placeholder="Ingresa el apellido materno"
                />
              </div>

              {/* RUT */}
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  RUT
                </label>
                <input
                  type="text"
                  name="rut"
                  value={formData.rut || ''}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 ${inputBg} ${inputText} ${inputPlaceholder} border ${rutError ? 'border-red-500' : inputBorder} rounded-xl focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412] transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed`}
                  placeholder="12.345.678-9"
                />
                {rutError && (
                  <p className="text-red-500 text-sm mt-1">{rutError}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-xl focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412] transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed`}
                  placeholder="correo@unidad.com"
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono || ''}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-xl focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412] transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed`}
                  placeholder="+56 9 1234 5678"
                />
              </div>
            </div>

            {/* Dirección */}
            <div>
              <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                Dirección
              </label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion || ''}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={`w-full px-4 py-3 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-xl focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412] transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed`}
                placeholder="Calle 123, Depto 456"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Comuna */}
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Comuna
                </label>
                <input
                  type="text"
                  name="comuna"
                  value={formData.comuna || ''}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-xl focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412] transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed`}
                  placeholder="Santiago"
                />
              </div>

              {/* Región */}
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Región
                </label>
                <select
                  name="region"
                  value={formData.region?.toString() || ''}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 ${inputBg} ${inputText} border ${inputBorder} rounded-xl focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412] transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed`}
                >
                  <option value="">Selecciona una región</option>
                  {REGIONES_CHILE.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.id === 7 ? 'RM' : region.id} - {region.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fecha de Nacimiento */}
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  name="fecha_nacimiento"
                  value={formData.fecha_nacimiento || ''}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 ${inputBg} ${inputText} border ${inputBorder} rounded-xl focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412] transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed`}
                />
              </div>

              {/* Fecha de Inicio de Contrato */}
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Fecha de Inicio de Contrato
                </label>
                <input
                  type="date"
                  name="fecha_inicio_contrato"
                  value={formData.fecha_inicio_contrato || ''}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 ${inputBg} ${inputText} border ${inputBorder} rounded-xl focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412] transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed`}
                />
              </div>
            </div>
          </div>

          {/* Rol */}
          <div>
            <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
              Rol *
            </label>
            <select
              name="rol"
              value={formData.rol}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
              className={`w-full px-4 py-3 ${inputBg} ${inputText} border ${inputBorder} rounded-xl focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412] transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed`}
            >
              {currentUser && canCreateUser(currentUser, 'admin') && (
                <option value="admin">Administrador</option>
              )}
              {currentUser && canCreateUser(currentUser, 'admin_comercial') && (
                <option value="admin_comercial">Admin Comercial</option>
              )}
              {currentUser && canCreateUser(currentUser, 'admin_operaciones') && (
                <option value="admin_operaciones">Admin Operaciones</option>
              )}
              {currentUser && canCreateUser(currentUser, 'broker') && (
                <option value="broker">Corredor</option>
              )}
            </select>
          </div>

          {/* Información Laboral - Solo para Corredores */}
          {formData.rol === 'broker' && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className={`text-lg font-semibold ${text} border-b ${border} pb-2`}>
                Información Laboral
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nuevas Ventas */}
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                    Nuevas Ventas
                  </label>
                  <input
                    type="text"
                    name="nuevas_ventas"
                    value={formData.nuevas_ventas}
                    onChange={handleNumberInputChange}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 ${inputBg} ${inputText} border ${inputBorder} rounded-xl focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412] transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed`}
                    placeholder="0"
                  />
                </div>

                {/* Renovaciones */}
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                    Renovaciones
                  </label>
                  <input
                    type="text"
                    name="renovaciones"
                    value={formData.renovaciones}
                    onChange={handleNumberInputChange}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 ${inputBg} ${inputText} border ${inputBorder} rounded-xl focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412] transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed`}
                    placeholder="0"
                  />
                </div>
              </div>

            </div>
          )}

          {/* Contrato y Comentarios - Solo para Corredores */}
          {formData.rol === 'broker' && (
            <>
              {/* Contrato */}
              <div className="space-y-4 animate-fadeIn">
                <h3 className={`text-lg font-semibold ${text} border-b ${border} pb-2`}>
                  Contrato Firmado *
                </h3>
                
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                    Archivo PDF del Contrato
                  </label>
                  <div className={`border-2 border-dashed ${contractError ? 'border-red-500' : inputBorder} rounded-xl p-6 text-center transition-colors`}>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      disabled={isSubmitting}
                      className="hidden"
                      id="contract-file"
                    />
                    <label
                      htmlFor="contract-file"
                      className={`cursor-pointer flex flex-col items-center space-y-2 ${isSubmitting ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                      {contractFileName ? (
                        <>
                          <FileText className="w-8 h-8 text-green-500" />
                          <span className={`text-sm ${text}`}>{contractFileName}</span>
                          <span className="text-xs text-green-600">Archivo seleccionado</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400" />
                          <span className={`text-sm ${textSecondary}`}>
                            Haz clic para seleccionar un archivo PDF
                          </span>
                          <span className="text-xs text-gray-500">
                            Máximo 10MB
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                  {contractError && (
                    <p className="text-red-500 text-sm mt-1">{contractError}</p>
                  )}
                </div>
              </div>

              {/* Comentarios */}
              <div className="animate-fadeIn">
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Comentarios
                </label>
                <textarea
                  name="comentarios"
                  value={formData.comentarios || ''}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  rows={3}
                  className={`w-full px-4 py-3 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-xl focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412] transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed resize-none`}
                  placeholder="Comentarios adicionales sobre el usuario..."
                />
              </div>
            </>
          )}

          {/* Error message */}
          {submitError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{submitError}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4 mt-6">
            <Button
              type="button"
              variant="outlined"
              color="secondary"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Creando...
                </>
              ) : (
                'Crear Usuario'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserCreationModal; 