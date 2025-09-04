import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Company, UpdateCompanyRequest, ContactInfo } from '../../types/asistencias-siniestros';
import { useThemeClasses } from '../../hooks/useThemeClasses';

interface EditCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: UpdateCompanyRequest) => Promise<void>;
  company: Company | null;
  isLoading?: boolean;
}

const EditCompanyModal: React.FC<EditCompanyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  company,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<UpdateCompanyRequest>({
    name: '',
    type: 'asistencias',
    callCenter: [],
    assistance: [],
    autoReplacement: [],
    website: [],
    contacts: [],
    sectionComments: {
      callCenter: '',
      assistance: '',
      autoReplacement: '',
      website: ''
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const { modalBg, text, textSecondary, textMuted, border, bgSurface, inputBg, inputText, inputPlaceholder, inputBorder } = useThemeClasses();

  // Cargar datos de la compañía cuando se abre el modal
  useEffect(() => {
    if (company && isOpen) {
      setFormData({
        name: company.name,
        type: company.type,
        callCenter: company.callCenter || [],
        assistance: company.assistance || [],
        autoReplacement: company.autoReplacement || [],
        website: company.website || [],
        contacts: company.contacts || [],
        sectionComments: company.sectionComments || {
          callCenter: '',
          assistance: '',
          autoReplacement: '',
          website: ''
        }
      });
      setErrors({});
    }
  }, [company, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleContactInfoChange = (field: string, index: number, property: keyof ContactInfo, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as ContactInfo[]).map((item, i) => 
        i === index ? { ...item, [property]: value } : item
      )
    }));
  };

  const addContactInfo = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field as keyof typeof prev] as ContactInfo[]), {
        number: '',
        instructions: '',
        description: ''
      }]
    }));
  };

  const removeContactInfo = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as ContactInfo[]).filter((_, i) => i !== index)
    }));
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).map((item: string, i: number) => 
        i === index ? value : item
      )
    }));
  };

  const addArrayItem = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field as keyof typeof prev] as string[]), '']
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).filter((_: string, i: number) => i !== index)
    }));
  };

  const handleContactChange = (index: number, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      contacts: (prev.contacts || []).map((contact, i) => 
        i === index ? { ...contact, [field]: value } : contact
      )
    }));
  };

  const addContact = () => {
    setFormData(prev => ({
      ...prev,
      contacts: [...(prev.contacts || []), {
        id: '',
        companyId: '',
        name: '',
        position: '',
        phone: '',
        email: '',
        isPrimary: false,
        comments: '',
        createdAt: new Date().toISOString()
      }]
    }));
  };

  const removeContact = (index: number) => {
    setFormData(prev => ({
      ...prev,
      contacts: (prev.contacts || []).filter((_, i) => i !== index)
    }));
  };

  const handleCommentChange = (section: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      sectionComments: {
        ...prev.sectionComments,
        [section]: value
      }
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'El nombre de la compañía es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !company) {
      return;
    }

    try {
      await onSave(company.id, formData);
      onClose();
    } catch (error) {
      console.error('Error updating company:', error);
    }
  };

  if (!isOpen || !company) return null;

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
            <h2 className={`text-2xl font-bold ${text}`}>
              Editar Compañía: {company.name}
            </h2>
            <button
              onClick={onClose}
              className={`p-2 ${textMuted} hover:${textSecondary} transition-colors`}
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
          <div className="space-y-6">
            
            {/* Información Básica */}
            <div className={`${bgSurface} rounded-xl p-6`}>
              <h3 className={`text-lg font-semibold ${text} mb-4`}>Información Básica</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                    Nombre de la Compañía *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 ${inputBg} ${inputText} ${inputPlaceholder} border rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412] ${
                      errors.name ? 'border-red-500' : inputBorder
                    }`}
                    placeholder="Ej: BCI Seguros"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                    Tipo de Servicio
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className={`w-full px-3 py-2 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412]`}
                  >
                    <option value="asistencias">Asistencias</option>
                    <option value="siniestros">Siniestros</option>
                    <option value="ambos">Ambos</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Call Center */}
            <div className={`${bgSurface} rounded-xl p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${text}`}>Call Center</h3>
                <button
                  type="button"
                  onClick={() => addContactInfo('callCenter')}
                  className="flex items-center px-3 py-1 text-sm bg-[#fd8412] text-white rounded-lg hover:bg-[#fd8412]/90 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar Contacto
                </button>
              </div>
              
              {(formData.callCenter || []).map((contact, index) => (
                <div key={index} className={`border ${border} rounded-lg p-4 mb-4`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`font-medium ${text}`}>Contacto {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeContactInfo('callCenter', index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Número *
                      </label>
                      <input
                        type="text"
                        value={contact.number}
                        onChange={(e) => handleContactInfoChange('callCenter', index, 'number', e.target.value)}
                        className={`w-full px-3 py-2 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412]`}
                        placeholder="Ej: 600 6000 292"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Instrucciones *
                      </label>
                      <input
                        type="text"
                        value={contact.instructions}
                        onChange={(e) => handleContactInfoChange('callCenter', index, 'instructions', e.target.value)}
                        className={`w-full px-3 py-2 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412]`}
                        placeholder="Ej: op2"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Descripción
                      </label>
                      <input
                        type="text"
                        value={contact.description}
                        onChange={(e) => handleContactInfoChange('callCenter', index, 'description', e.target.value)}
                        className={`w-full px-3 py-2 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412]`}
                        placeholder="Ej: desde cel"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="mt-4">
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Comentarios de Sección (opcional)
                </label>
                <textarea
                  value={formData.sectionComments?.callCenter || ''}
                  onChange={(e) => handleCommentChange('callCenter', e.target.value)}
                  className={`w-full px-3 py-2 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412]`}
                  rows={3}
                  placeholder="Ej: Horario de atención 24/7, llamar primero al número principal"
                />
              </div>
            </div>

            {/* Asistencia */}
            <div className={`${bgSurface} rounded-xl p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${text}`}>Servicios de Asistencia</h3>
                <button
                  type="button"
                  onClick={() => addContactInfo('assistance')}
                  className="flex items-center px-3 py-1 text-sm bg-[#fd8412] text-white rounded-lg hover:bg-[#fd8412]/90 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar Contacto
                </button>
              </div>
              
              {(formData.assistance || []).map((contact, index) => (
                <div key={index} className={`border ${border} rounded-lg p-4 mb-4`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`font-medium ${text}`}>Contacto {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeContactInfo('assistance', index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Número *
                      </label>
                      <input
                        type="text"
                        value={contact.number}
                        onChange={(e) => handleContactInfoChange('assistance', index, 'number', e.target.value)}
                        className={`w-full px-3 py-2 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412]`}
                        placeholder="Ej: 600 600 9090"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Instrucciones *
                      </label>
                      <input
                        type="text"
                        value={contact.instructions}
                        onChange={(e) => handleContactInfoChange('assistance', index, 'instructions', e.target.value)}
                        className={`w-full px-3 py-2 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412]`}
                        placeholder="Ej: Op. 4, Luego Op.2"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Descripción
                      </label>
                      <input
                        type="text"
                        value={contact.description}
                        onChange={(e) => handleContactInfoChange('assistance', index, 'description', e.target.value)}
                        className={`w-full px-3 py-2 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412]`}
                        placeholder="Ej: Asistencia livianos"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="mt-4">
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Comentarios de Sección (opcional)
                </label>
                <textarea
                  value={formData.sectionComments?.assistance || ''}
                  onChange={(e) => handleCommentChange('assistance', e.target.value)}
                  className={`w-full px-3 py-2 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412]`}
                  rows={3}
                  placeholder="Ej: Servicios disponibles solo en RM, cobertura nacional"
                />
              </div>
            </div>

            {/* Auto Reemplazo */}
            <div className={`${bgSurface} rounded-xl p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${text}`}>Opciones de Auto Reemplazo</h3>
                <button
                  type="button"
                  onClick={() => addContactInfo('autoReplacement')}
                  className="flex items-center px-3 py-1 text-sm bg-[#fd8412] text-white rounded-lg hover:bg-[#fd8412]/90 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar Contacto
                </button>
              </div>
              
              {(formData.autoReplacement || []).map((contact, index) => (
                <div key={index} className={`border ${border} rounded-lg p-4 mb-4`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`font-medium ${text}`}>Contacto {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeContactInfo('autoReplacement', index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Número *
                      </label>
                      <input
                        type="text"
                        value={contact.number}
                        onChange={(e) => handleContactInfoChange('autoReplacement', index, 'number', e.target.value)}
                        className={`w-full px-3 py-2 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412]`}
                        placeholder="Ej: 600 399 1000"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Instrucciones *
                      </label>
                      <input
                        type="text"
                        value={contact.instructions}
                        onChange={(e) => handleContactInfoChange('autoReplacement', index, 'instructions', e.target.value)}
                        className={`w-full px-3 py-2 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412]`}
                        placeholder="Ej: Opción 3"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Descripción
                      </label>
                      <input
                        type="text"
                        value={contact.description}
                        onChange={(e) => handleContactInfoChange('autoReplacement', index, 'description', e.target.value)}
                        className={`w-full px-3 py-2 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412]`}
                        placeholder="Ej: Vehículo ejecutivo"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="mt-4">
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Comentarios de Sección (opcional)
                </label>
                <textarea
                  value={formData.sectionComments?.autoReplacement || ''}
                  onChange={(e) => handleCommentChange('autoReplacement', e.target.value)}
                  className={`w-full px-3 py-2 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412]`}
                  rows={3}
                  placeholder="Ej: Vehículo solo horario comercial, máximo 5 días"
                />
              </div>
            </div>

            {/* Sitios Web */}
            <div className={`${bgSurface} rounded-xl p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${text}`}>Sitios Web</h3>
                <button
                  type="button"
                  onClick={() => addArrayItem('website')}
                  className="flex items-center px-3 py-1 text-sm bg-[#fd8412] text-white rounded-lg hover:bg-[#fd8412]/90 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar
                </button>
              </div>
              
              {(formData.website || []).map((url, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleArrayChange('website', index, e.target.value)}
                    className={`flex-1 px-3 py-2 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412]`}
                    placeholder="Ej: https://www.ejemplo.cl"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('website', index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              <div className="mt-4">
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Comentarios (opcional)
                </label>
                <textarea
                  value={formData.sectionComments?.website || ''}
                  onChange={(e) => handleCommentChange('website', e.target.value)}
                  className={`w-full px-3 py-2 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412]`}
                  rows={3}
                  placeholder="Ej: Portal principal, requiere registro previo"
                />
              </div>
            </div>

            {/* Contactos */}
            <div className={`${bgSurface} rounded-xl p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${text}`}>Contactos de la Compañía</h3>
                <button
                  type="button"
                  onClick={addContact}
                  className="flex items-center px-3 py-1 text-sm bg-[#fd8412] text-white rounded-lg hover:bg-[#fd8412]/90 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar Contacto
                </button>
              </div>
              
              {(formData.contacts || []).map((contact, index) => (
                <div key={index} className={`border ${border} rounded-lg p-4 mb-4`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`font-medium ${text}`}>Contacto {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeContact(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                        className={`w-full px-3 py-2 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412]`}
                        placeholder="Ej: María González"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Cargo
                      </label>
                      <input
                        type="text"
                        value={contact.position}
                        onChange={(e) => handleContactChange(index, 'position', e.target.value)}
                        className={`w-full px-3 py-2 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412]`}
                        placeholder="Ej: Ejecutiva de Atención"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={contact.phone}
                        onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                        className={`w-full px-3 py-2 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412]`}
                        placeholder="Ej: +56 9 8765 4321"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Email
                      </label>
                      <input
                        type="email"
                        value={contact.email}
                        onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                        className={`w-full px-3 py-2 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412]`}
                        placeholder="Ej: maria@ejemplo.cl"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`primary_${index}`}
                        checked={contact.isPrimary}
                        onChange={(e) => handleContactChange(index, 'isPrimary', e.target.checked)}
                        className="w-4 h-4 text-[#fd8412] border-gray-300 rounded focus:ring-[#fd8412]"
                      />
                      <label htmlFor={`primary_${index}`} className={`ml-2 text-sm ${textSecondary}`}>
                        Contacto Principal
                      </label>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Comentarios (opcional)
                      </label>
                      <textarea
                        value={contact.comments}
                        onChange={(e) => handleContactChange(index, 'comments', e.target.value)}
                        className={`w-full px-3 py-2 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412]`}
                        rows={2}
                        placeholder="Ej: Contacto principal para emergencias"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-[#fd8412] text-white rounded-lg hover:bg-[#fd8412]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                'Actualizar Compañía'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};

export default EditCompanyModal;
