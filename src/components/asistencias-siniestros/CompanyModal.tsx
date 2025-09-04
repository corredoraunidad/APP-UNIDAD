import React, { useState, useEffect } from 'react';
import { X, Phone, Mail, Globe, AlertTriangle, Copy, ExternalLink, Shield, Users } from 'lucide-react';
import type { Company } from '../../types/asistencias-siniestros';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { usePermissions } from '../../hooks/usePermissions';
import WebsiteAttachments from './WebsiteAttachments';

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company;
  canEdit?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const CompanyModal: React.FC<CompanyModalProps> = ({
  isOpen,
  onClose,
  company,
  canEdit = false,
  onEdit,
  onDelete
}) => {
  const { modalBg, text, textSecondary, textMuted, border, bgSurface, bgCard } = useThemeClasses();
  const { isBroker } = usePermissions();
  
  // Estado para manejar archivos adjuntos
  const [websiteAttachments, setWebsiteAttachments] = useState<string[]>(
    company.websiteAttachments || []
  );

  // Sincronizar estado cuando cambia la compañía
  useEffect(() => {
    setWebsiteAttachments(company.websiteAttachments || []);
  }, [company.websiteAttachments]);

  const handleCopyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // TODO: Mostrar toast de éxito
      console.log(`${type} copiado al portapapeles`);
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
    }
  };

  const handleOpenWebsite = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenEmail = (email: string) => {
    window.open(`mailto:${email}`, '_blank');
  };

  const handleOpenPhone = (phone: string) => {
    window.open(`tel:${phone}`, '_blank');
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
        <div className={`relative ${modalBg} rounded-2xl shadow-xl w-full max-w-4xl mx-4 transform transition-all max-h-[calc(100vh-2rem)] overflow-hidden modal-content`}>
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${border}`}>
            <div>
              <h2 className={`text-2xl font-bold ${text}`}>
                {company.name}
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              {canEdit && onEdit && (
                <button
                  onClick={onEdit}
                  className="px-4 py-2 text-[#fd8412] border border-[#fd8412] rounded-lg hover:bg-[#fd8412] hover:text-white transition-colors"
                >
                  Editar
                </button>
              )}
              {canEdit && onDelete && (
                <button
                  onClick={onDelete}
                  className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                >
                  Eliminar
                </button>
              )}
              <button
                onClick={onClose}
                className={`p-2 ${textMuted} hover:${textSecondary} transition-colors`}
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
            <div className="space-y-8">
              
              {/* Sección: Call Center */}
              <div className={`${bgSurface} rounded-xl p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Phone className={`w-6 h-6 ${textSecondary} mr-3`} />
                    <h3 className={`text-xl font-semibold ${text}`}>Call Center</h3>
                  </div>
                  <span className={`text-sm ${textMuted}`}>
                    {company.callCenter.length} número{company.callCenter.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                {company.callCenter.length > 0 ? (
                  <div className="space-y-4">
                    {company.callCenter.map((contact, index) => (
                      <div key={index} className={`${bgCard} rounded-lg p-4 border ${border}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 text-gray-500 mr-2" />
                            <span className={`font-medium ${text}`}>{contact.number}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleOpenPhone(contact.number)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Llamar"
                            >
                              <Phone className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleCopyToClipboard(contact.number, 'número')}
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                              title="Copiar número"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {contact.description && (
                          <p className={`text-sm ${textSecondary} mb-2`}>{contact.description}</p>
                        )}
                        {contact.instructions && (
                          <p className={`text-sm ${textMuted}`}>
                            <strong>Instrucciones:</strong> {contact.instructions}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-8 ${textMuted}`}>
                    <Phone className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No hay números de call center registrados</p>
                  </div>
                )}
                
                {company.sectionComments?.callCenter && (
                  <div className={`mt-4 p-3 ${bgCard} rounded-lg border ${border}`}>
                    <p className={`text-sm ${textSecondary}`}>
                      <strong>Comentarios:</strong> {company.sectionComments.callCenter}
                    </p>
                  </div>
                )}
              </div>

              {/* Sección: Asistencia */}
              <div className={`${bgSurface} rounded-xl p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Shield className={`w-6 h-6 ${textSecondary} mr-3`} />
                    <h3 className={`text-xl font-semibold ${text}`}>Asistencia</h3>
                  </div>
                  <span className={`text-sm ${textMuted}`}>
                    {company.assistance.length} número{company.assistance.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                {company.assistance.length > 0 ? (
                  <div className="space-y-4">
                    {company.assistance.map((contact, index) => (
                      <div key={index} className={`${bgCard} rounded-lg p-4 border ${border}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 text-gray-500 mr-2" />
                            <span className={`font-medium ${text}`}>{contact.number}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleOpenPhone(contact.number)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Llamar"
                            >
                              <Phone className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleCopyToClipboard(contact.number, 'número')}
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                              title="Copiar número"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {contact.description && (
                          <p className={`text-sm ${textSecondary} mb-2`}>{contact.description}</p>
                        )}
                        {contact.instructions && (
                          <p className={`text-sm ${textMuted}`}>
                            <strong>Instrucciones:</strong> {contact.instructions}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-8 ${textMuted}`}>
                    <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No hay números de asistencia registrados</p>
                  </div>
                )}
                
                {company.sectionComments?.assistance && (
                  <div className={`mt-4 p-3 ${bgCard} rounded-lg border ${border}`}>
                    <p className={`text-sm ${textSecondary}`}>
                      <strong>Comentarios:</strong> {company.sectionComments.assistance}
                    </p>
                  </div>
                )}
              </div>

              {/* Sección: Auto Reemplazo */}
              <div className={`${bgSurface} rounded-xl p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <AlertTriangle className={`w-6 h-6 ${textSecondary} mr-3`} />
                    <h3 className={`text-xl font-semibold ${text}`}>Auto Reemplazo</h3>
                  </div>
                  <span className={`text-sm ${textMuted}`}>
                    {company.autoReplacement.length} número{company.autoReplacement.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                {company.autoReplacement.length > 0 ? (
                  <div className="space-y-4">
                    {company.autoReplacement.map((contact, index) => (
                      <div key={index} className={`${bgCard} rounded-lg p-4 border ${border}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 text-gray-500 mr-2" />
                            <span className={`font-medium ${text}`}>{contact.number}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleOpenPhone(contact.number)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Llamar"
                            >
                              <Phone className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleCopyToClipboard(contact.number, 'número')}
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                              title="Copiar número"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {contact.description && (
                          <p className={`text-sm ${textSecondary} mb-2`}>{contact.description}</p>
                        )}
                        {contact.instructions && (
                          <p className={`text-sm ${textMuted}`}>
                            <strong>Instrucciones:</strong> {contact.instructions}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-8 ${textMuted}`}>
                    <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No hay números de auto reemplazo registrados</p>
                  </div>
                )}
                
                {company.sectionComments?.autoReplacement && (
                  <div className={`mt-4 p-3 ${bgCard} rounded-lg border ${border}`}>
                    <p className={`text-sm ${textSecondary}`}>
                      <strong>Comentarios:</strong> {company.sectionComments.autoReplacement}
                    </p>
                  </div>
                )}
              </div>

              {/* Sección: Sitios Web */}
              {company.website.length > 0 && (
                <div className={`${bgSurface} rounded-xl p-6`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Globe className={`w-6 h-6 ${textSecondary} mr-3`} />
                      <h3 className={`text-xl font-semibold ${text}`}>Sitios Web</h3>
                    </div>
                    <span className={`text-sm ${textMuted}`}>
                      {company.website.length} sitio{company.website.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {company.website.map((url, index) => (
                      <div key={index} className={`${bgCard} rounded-lg p-4 border ${border}`}>
                        <div className="flex items-center justify-between">
                          <span className={`font-medium ${text} break-all`}>{url}</span>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => handleOpenWebsite(url)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Abrir sitio web"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleCopyToClipboard(url, 'URL')}
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                              title="Copiar URL"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {company.sectionComments?.website && (
                    <div className={`mt-4 p-3 ${bgCard} rounded-lg border ${border}`}>
                      <p className={`text-sm ${textSecondary}`}>
                        <strong>Comentarios:</strong> {company.sectionComments.website}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Sección: Archivos Adjuntos del Sitio Web */}
              <WebsiteAttachments
                companyId={company.id}
                attachmentIds={websiteAttachments}
                onAttachmentsChange={setWebsiteAttachments}
              />

              {/* Sección: Contactos Adicionales - Solo visible para administradores */}
              {company.contacts.length > 0 && !isBroker() && (
                <div className={`${bgSurface} rounded-xl p-6`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Users className={`w-6 h-6 ${textSecondary} mr-3`} />
                      <h3 className={`text-xl font-semibold ${text}`}>Contactos Adicionales</h3>
                    </div>
                    <span className={`text-sm ${textMuted}`}>
                      {company.contacts.length} contacto{company.contacts.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    {company.contacts.map((contact, index) => (
                      <div key={index} className={`${bgCard} rounded-lg p-4 border ${border}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className={`font-medium ${text}`}>{contact.name}</h4>
                            <p className={`text-sm ${textSecondary}`}>{contact.position}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {contact.phone && (
                              <button
                                onClick={() => handleOpenPhone(contact.phone!)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Llamar"
                              >
                                <Phone className="w-4 h-4" />
                              </button>
                            )}
                            {contact.email && (
                              <button
                                onClick={() => handleOpenEmail(contact.email!)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Enviar email"
                              >
                                <Mail className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {contact.phone && (
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 text-gray-500 mr-2" />
                              <span className={`text-sm ${textSecondary}`}>{contact.phone}</span>
                            </div>
                          )}
                          {contact.email && (
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 text-gray-500 mr-2" />
                              <span className={`text-sm ${textSecondary}`}>{contact.email}</span>
                            </div>
                          )}
                        </div>
                        
                                                 {contact.comments && (
                           <p className={`text-sm ${textMuted} mt-2`}>
                             <strong>Comentarios:</strong> {contact.comments}
                           </p>
                         )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompanyModal;
