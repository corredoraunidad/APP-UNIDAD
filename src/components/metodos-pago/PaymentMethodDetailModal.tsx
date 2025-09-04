import React, { useState} from 'react';
import { 
  X, 
  Copy, 
  ExternalLink, 
  CreditCard, 
  DollarSign
} from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import type { PaymentMethod } from '../../types/metodos-pago';

interface PaymentMethodDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentMethod: PaymentMethod | null;
}

const PaymentMethodDetailModal: React.FC<PaymentMethodDetailModalProps> = ({
  isOpen,
  onClose,
  paymentMethod,
}) => {
  const { modalBg, text, textSecondary, textMuted, border, bgSurface, bgCard } = useThemeClasses();
  const [bankDataCopied, setBankDataCopied] = useState(false);

  if (!isOpen || !paymentMethod) return null;

  const handleCopyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // TODO: Mostrar toast de éxito
      console.log(`${type} copiado al portapapeles`);
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
    }
  };

  const handleOpenLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

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
                {paymentMethod.company_name}
              </h2>
            </div>
            <button
              onClick={onClose}
              className={`p-2 ${textMuted} hover:${textSecondary} transition-colors`}
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
            <div className="space-y-8">
              
              {/* Sección: Enlaces de Pago */}
              {paymentMethod.payment_links && paymentMethod.payment_links.length > 0 && (
                <div className={`${bgSurface} rounded-xl p-6`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <ExternalLink className={`w-6 h-6 ${textSecondary} mr-3`} />
                      <h3 className={`text-xl font-semibold ${text}`}>Enlaces de Pago</h3>
                    </div>
                    <span className={`text-sm ${textMuted}`}>
                      {paymentMethod.payment_links.length} enlace{paymentMethod.payment_links.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    {paymentMethod.payment_links.map((link, index) => (
                      <div key={`${link.id || index}`} className={`${bgCard} rounded-lg p-4 border ${border}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <ExternalLink className="w-4 h-4 text-gray-500 mr-2" />
                            <span className={`font-medium ${text}`}>{link.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleOpenLink(link.url)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Abrir enlace"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleCopyToClipboard(link.url, 'URL')}
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                              title="Copiar URL"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className={`text-sm ${textSecondary} break-all`}>
                          {link.url}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sección: Datos Bancarios */}
              <div className={`${bgSurface} rounded-xl p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <CreditCard className={`w-6 h-6 ${textSecondary} mr-3`} />
                    <h3 className={`text-xl font-semibold ${text}`}>Datos Bancarios</h3>
                  </div>
                </div>
                
                <div className={`${bgCard} rounded-lg p-4 border ${border}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className={`text-sm font-medium ${textSecondary} block mb-1`}>
                        RUT
                      </label>
                      <div className="flex items-center gap-2">
                        <p className={`font-medium ${text}`}>
                          {paymentMethod.company_rut}
                        </p>
                        <button
                          onClick={() => handleCopyToClipboard(paymentMethod.company_rut, 'RUT')}
                          className="p-1 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                          title="Copiar RUT"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className={`text-sm font-medium ${textSecondary} block mb-1`}>
                        Banco
                      </label>
                      <div className="flex items-center gap-2">
                        <p className={`font-medium ${text}`}>
                          {paymentMethod.bank_name}
                        </p>
                        <button
                          onClick={() => handleCopyToClipboard(paymentMethod.bank_name || '', 'nombre del banco')}
                          className="p-1 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                          title="Copiar nombre del banco"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className={`text-sm font-medium ${textSecondary} block mb-1`}>
                        Tipo de Cuenta
                      </label>
                      <div className="flex items-center gap-2">
                        <p className={`font-medium ${text} capitalize`}>
                          Cuenta {paymentMethod.account_type}
                        </p>
                        <button
                          onClick={() => handleCopyToClipboard(`Cuenta ${paymentMethod.account_type}`, 'tipo de cuenta')}
                          className="p-1 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                          title="Copiar tipo de cuenta"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    {paymentMethod.contact_email && (
                      <div>
                        <label className={`text-sm font-medium ${textSecondary} block mb-1`}>
                          Email de Contacto
                        </label>
                        <div className="flex items-center gap-2">
                          <p className={`font-medium ${text}`}>
                            {paymentMethod.contact_email}
                          </p>
                          <button
                            onClick={() => handleCopyToClipboard(paymentMethod.contact_email || '', 'email de contacto')}
                            className="p-1 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                            title="Copiar email"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className={`text-sm font-medium ${textSecondary} block mb-1`}>
                      Número de Cuenta
                    </label>
                    <div className="flex items-center gap-2">
                      <p className={`font-mono text-lg font-bold ${text}`}>
                        {paymentMethod.account_number}
                      </p>
                      <button
                        onClick={() => handleCopyToClipboard(paymentMethod.account_number, 'número de cuenta')}
                        className="p-1 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                        title="Copiar número de cuenta"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Botón para copiar toda la sección */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <button
                      onClick={async () => {
                        const bankData = `RUT: ${paymentMethod.company_rut}
Banco: ${paymentMethod.bank_name}
Tipo de Cuenta: ${paymentMethod.account_type}
Número de Cuenta: ${paymentMethod.account_number}${paymentMethod.contact_email ? `\nEmail: ${paymentMethod.contact_email}` : ''}`;
                        
                        await handleCopyToClipboard(bankData, 'datos bancarios');
                        setBankDataCopied(true);
                        setTimeout(() => setBankDataCopied(false), 2000);
                      }}
                      className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                        bankDataCopied
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-[#fd8412] text-white hover:bg-[#e6760f]'
                      }`}
                    >
                      {bankDataCopied ? 'Datos copiados' : 'Copiar todos los datos bancarios'}
                    </button>
                  </div>
                </div>
              </div>

              

              {/* Sección: Cuenta en Dólares */}
              {(paymentMethod.usd_account_number || paymentMethod.usd_bank_name) && (
                <div className={`${bgSurface} rounded-xl p-6`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <DollarSign className={`w-6 h-6 ${textSecondary} mr-3`} />
                      <h3 className={`text-xl font-semibold ${text}`}>Cuenta en Dólares</h3>
                    </div>
                  </div>
                  
                  <div className={`${bgCard} rounded-lg p-4 border ${border} space-y-3`}>
                    {paymentMethod.usd_bank_name && (
                      <div>
                        <label className={`text-sm font-medium ${textSecondary} block mb-1`}>
                          Banco USD
                        </label>
                        <div className="flex items-center justify-between">
                          <p className={`font-medium ${text}`}>
                            {paymentMethod.usd_bank_name}
                          </p>
                          <button
                            onClick={() => handleCopyToClipboard(paymentMethod.usd_bank_name || '', 'banco USD')}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Copiar banco USD"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {paymentMethod.usd_account_number && (
                      <div>
                        <label className={`text-sm font-medium ${textSecondary} block mb-1`}>
                          Número de Cuenta USD
                        </label>
                        <div className="flex items-center justify-between">
                          <p className={`font-mono text-lg font-bold ${text}`}>
                            {paymentMethod.usd_account_number}
                          </p>
                          <button
                            onClick={() => handleCopyToClipboard(paymentMethod.usd_account_number || '', 'número de cuenta USD')}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Copiar número de cuenta USD"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
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

export default PaymentMethodDetailModal;
