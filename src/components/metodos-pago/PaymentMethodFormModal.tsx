import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2
} from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import type { PaymentMethod, PaymentMethodFormData, PaymentLink } from '../../types/metodos-pago';
import EntityAttachments from '../files/EntityAttachments';
import FilePreviewModal from '../files/FilePreviewModal';
import { PaymentMethodsService } from '../../services/paymentMethodService';
import { usePermissions } from '../../hooks/usePermissions';

interface PaymentMethodFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PaymentMethodFormData) => Promise<void>;
  paymentMethod?: PaymentMethod | null;
}

const PaymentMethodFormModal: React.FC<PaymentMethodFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  paymentMethod = null,
}) => {
  const { modalBg, text, textSecondary, textMuted, border, inputBg, inputBorder, inputText, inputPlaceholder, bgSurface } = useThemeClasses();
  const { can } = usePermissions();
  const isEditing = !!paymentMethod;
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ id: string; name: string; type: string; size: number } | null>(null);

  // Estado del formulario
  const [formData, setFormData] = useState<PaymentMethodFormData>({
    company_name: '',
    company_rut: '',
    payment_links: [],
    bank_name: '',
    account_type: 'corriente',
    account_number: '',
    contact_email: '',
    usd_account_number: '',
    usd_bank_name: '',
    payment_method_attachments: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manejar scroll del body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Inicializar formulario cuando se abre
  useEffect(() => {
    if (isOpen) {
      if (paymentMethod) {
        // Modo edición
        setFormData({
          company_name: paymentMethod.company_name,
          company_rut: paymentMethod.company_rut,
          payment_links: paymentMethod.payment_links || [],
          bank_name: paymentMethod.bank_name,
          account_type: paymentMethod.account_type,
          account_number: paymentMethod.account_number,
          contact_email: paymentMethod.contact_email || '',
          usd_account_number: paymentMethod.usd_account_number || '',
          usd_bank_name: paymentMethod.usd_bank_name || '',
          payment_method_attachments: paymentMethod.payment_method_attachments || []
        });
      } else {
        // Modo creación
        setFormData({
          company_name: '',
          company_rut: '',
          payment_links: [],
          bank_name: '',
          account_type: 'corriente',
          account_number: '',
          contact_email: '',
          usd_account_number: '',
          usd_bank_name: '',
          payment_method_attachments: []
        });
      }
      setError(null);
    }
  }, [isOpen, paymentMethod]);

  // Manejar cambios en el formulario
  const handleInputChange = (field: keyof PaymentMethodFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Gestión de enlaces de pago
  const addPaymentLink = () => {
    const newLink: PaymentLink = {
      id: `temp_${Date.now()}`,
      name: '',
      url: '',
    };
    setFormData(prev => ({
      ...prev,
      payment_links: [...prev.payment_links, newLink]
    }));
  };

  const updatePaymentLink = (index: number, field: keyof PaymentLink, value: string) => {
    setFormData(prev => ({
      ...prev,
      payment_links: prev.payment_links.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }));

  };

  const removePaymentLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      payment_links: prev.payment_links.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.company_name.trim()) {
      setError('El nombre de la empresa es obligatorio');
      return;
    }

    if (!formData.company_rut.trim()) {
      setError('El RUT es obligatorio');
      return;
    }

    if (!formData.bank_name.trim()) {
      setError('El nombre del banco es obligatorio');
      return;
    }

    if (!formData.account_number.trim()) {
      setError('El número de cuenta es obligatorio');
      return;
    }

    // Validar enlaces de pago
    for (const link of formData.payment_links) {
      if (!link.name.trim()) {
        setError('Todos los enlaces de pago deben tener un nombre');
        return;
      }
      if (!link.url.trim()) {
        setError('Todos los enlaces de pago deben tener una URL');
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error inesperado al guardar el método de pago');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[80] flex items-center justify-center">
        {/* Overlay */}
        <div
          className="absolute inset-0 transition-opacity"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={handleClose}
        />

        {/* Modal */}
        <div className={`relative ${modalBg} rounded-2xl shadow-xl w-full max-w-4xl mx-4 transform transition-all max-h-[calc(100vh-2rem)] overflow-hidden`}>
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${border}`}>
            <h2 className={`text-2xl font-bold ${text}`}>
              {isEditing ? 'Editar Método de Pago' : 'Crear Nuevo Método de Pago'}
            </h2>
            <button
              onClick={handleClose}
              disabled={loading}
              className={`p-2 ${textMuted} hover:${textSecondary} transition-colors`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
            <div className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              
              {/* Información de la Empresa */}
              <div className={`${bgSurface} rounded-xl p-6`}>
                <h3 className={`text-lg font-semibold ${text} mb-4`}>Información de la Empresa</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                      Nombre de la Empresa *
                    </label>
                    <input
                      type="text"
                      value={formData.company_name}
                      onChange={(e) => handleInputChange('company_name', e.target.value)}
                      className={`w-full px-3 py-2 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412]`}
                      placeholder="Ej: Empresa ABC S.A."
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                      RUT *
                    </label>
                    <input
                      type="text"
                      value={formData.company_rut}
                      onChange={(e) => handleInputChange('company_rut', e.target.value)}
                      className={`w-full px-3 py-2 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412]`}
                      placeholder="12.345.678-9"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Enlaces de Pago */}
              <div className={`${bgSurface} rounded-xl p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${text}`}>Enlaces de Pago</h3>
                  <button
                    type="button"
                    onClick={addPaymentLink}
                    className="flex items-center px-3 py-1 text-sm bg-[#fd8412] text-white rounded-lg hover:bg-[#fd8412]/90 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar Enlace
                  </button>
                </div>
              
                              {formData.payment_links.length === 0 ? (
                  <div className={`text-center py-8 ${bgSurface} rounded-lg border ${border}`}>
                    <p className={`${textSecondary} mb-2`}>No hay enlaces de pago configurados</p>
                    <button
                      type="button"
                      onClick={addPaymentLink}
                      className="text-[#fd8412] hover:text-[#fd8412]/80 text-sm font-medium"
                    >
                      + Agregar primer enlace
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.payment_links.map((link, index) => (
                      <div key={link.id} className={`border ${border} rounded-lg p-4 ${bgSurface}`}>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className={`font-medium ${text}`}>Enlace {index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removePaymentLink(index)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Eliminar enlace"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
                              Nombre del Enlace
                            </label>
                            <input
                              type="text"
                              value={link.name}
                              onChange={(e) => updatePaymentLink(index, 'name', e.target.value)}
                              className={`w-full px-3 py-2 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412]`}
                              placeholder="Ej: Pago en línea"
                            />
                          </div>
                          
                          <div>
                            <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
                              URL
                            </label>
                            <input
                              type="url"
                              value={link.url}
                              onChange={(e) => updatePaymentLink(index, 'url', e.target.value)}
                              className={`w-full px-3 py-2 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412]`}
                              placeholder="https://..."
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Datos Bancarios */}
              <div className={`${bgSurface} rounded-xl p-6`}>
                <h3 className={`text-lg font-semibold ${text} mb-4`}>Datos Bancarios</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                      Banco *
                    </label>
                    <input
                      type="text"
                      value={formData.bank_name}
                      onChange={(e) => handleInputChange('bank_name', e.target.value)}
                      className={`w-full px-3 py-2 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412]`}
                      placeholder="Ej: Banco Estado"
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                      Tipo de Cuenta *
                    </label>
                    <select
                      value={formData.account_type}
                      onChange={(e) => handleInputChange('account_type', e.target.value)}
                      className={`w-full px-3 py-2 ${inputBg} ${inputText} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412]`}
                    >
                      <option value="corriente">Cuenta Corriente</option>
                      <option value="vista">Cuenta Vista</option>
                      <option value="ahorro">Cuenta de Ahorro</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                      Número de Cuenta *
                    </label>
                    <input
                      type="text"
                      value={formData.account_number}
                      onChange={(e) => handleInputChange('account_number', e.target.value)}
                      className={`w-full px-3 py-2 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412]`}
                      placeholder="123456789"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Información Adicional */}
              <div className={`${bgSurface} rounded-xl p-6`}>
                <h3 className={`text-lg font-semibold ${text} mb-4`}>Información Adicional</h3>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                      Email de Contacto
                    </label>
                    <input
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => handleInputChange('contact_email', e.target.value)}
                      className={`w-full px-3 py-2 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412]`}
                      placeholder="contacto@empresa.com"
                    />
                  </div>
                </div>
              </div>

              {/* Cuenta en Dólares */}
              <div className={`${bgSurface} rounded-xl p-6`}>
                <h3 className={`text-lg font-semibold ${text} mb-4`}>Cuenta en Dólares (Opcional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                      Banco USD
                    </label>
                    <input
                      type="text"
                      value={formData.usd_bank_name}
                      onChange={(e) => handleInputChange('usd_bank_name', e.target.value)}
                      className={`w-full px-3 py-2 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412]`}
                      placeholder="Ej: Banco Internacional"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                      Número de Cuenta USD
                    </label>
                    <input
                      type="text"
                      value={formData.usd_account_number}
                      onChange={(e) => handleInputChange('usd_account_number', e.target.value)}
                      className={`w-full px-3 py-2 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412]`}
                      placeholder="USD123456789"
                    />
                  </div>
                </div>
              </div>

              {/* Adjuntos de Método de Pago */}
              {paymentMethod ? (
                <EntityAttachments
                  entityId={paymentMethod.id}
                  entityName={paymentMethod.company_name}
                  attachmentIds={paymentMethod.payment_method_attachments || []}
                  basePath="/instructivos-metodos-pago"
                  canEdit={can('metodos_pago', 'edit')}
                  onPersist={async (id, ids) => {
                    const res = await PaymentMethodsService.updateAttachments(id, ids);
                    return { error: res.error || null };
                  }}
                  onAttachmentsChange={(ids) => {
                    if (!paymentMethod) return;
                    // Refrescar el objeto en memoria para re-renderizar
                    (paymentMethod as any).payment_method_attachments = ids;
                  }}
                  onPreviewFile={(file) => {
                    setPreviewFile({ id: file.id, name: file.name, type: file.mime_type || 'application/pdf', size: file.size || 0 });
                    setIsPreviewOpen(true);
                  }}
                />
              ) : (
                <EntityAttachments
                  entityId={formData.company_name || 'nuevo'}
                  entityName={formData.company_name || 'nuevo'}
                  attachmentIds={formData.payment_method_attachments || []}
                  basePath="/instructivos-metodos-pago"
                  canEdit={can('metodos_pago', 'edit')}
                  onPersist={async (_id, ids) => {
                    // En creación: mantener los IDs en el formulario. Se guardan en create()
                    setFormData(prev => ({ ...prev, payment_method_attachments: ids }));
                    return { error: null };
                  }}
                  onAttachmentsChange={(ids) => {
                    setFormData(prev => ({ ...prev, payment_method_attachments: ids }));
                  }}
                  onPreviewFile={(file) => {
                    setPreviewFile({ id: file.id, name: file.name, type: file.mime_type || 'application/pdf', size: file.size || 0 });
                    setIsPreviewOpen(true);
                  }}
                />
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-[#fd8412] text-white rounded-lg hover:bg-[#fd8412]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  isEditing ? 'Actualizar Método de Pago' : 'Crear Método de Pago'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de vista previa */}
      {isPreviewOpen && previewFile && (
        <FilePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          fileId={previewFile.id}
          fileName={previewFile.name}
          fileType={previewFile.type}
          fileSize={previewFile.size}
        />
      )}
    </>
  );
};

export default PaymentMethodFormModal;
