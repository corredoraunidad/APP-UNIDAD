import React from 'react';
import { Building2, CreditCard, ExternalLink, Eye, Edit, Trash2, DollarSign } from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { usePermissions } from '../../hooks/usePermissions';
import type { PaymentMethod } from '../../types/metodos-pago';

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod;
  onView: (paymentMethod: PaymentMethod) => void;
  onEdit?: (paymentMethod: PaymentMethod) => void;
  onDelete?: (paymentMethod: PaymentMethod) => void;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  paymentMethod,
  onView,
  onEdit,
  onDelete,
}) => {
  const { bgCard, text, textSecondary, textMuted, border, bgSurface, hoverBg } = useThemeClasses();
  const { isAdmin } = usePermissions();

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Activo
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Inactivo
      </span>
    );
  };

  const getPaymentLinksPreview = (): string => {
    if (!paymentMethod.payment_links || paymentMethod.payment_links.length === 0) {
      return 'Sin enlaces configurados';
    }
    
    return `${paymentMethod.payment_links.length} enlace${paymentMethod.payment_links.length !== 1 ? 's' : ''} configurado${paymentMethod.payment_links.length !== 1 ? 's' : ''}`;
  };

  return (
    <div className={`${bgCard} rounded-xl shadow-sm border ${border} overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-600">
          <thead className={`${bgSurface}`}>
            <tr>
              <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider`}>
                Empresa
              </th>
              <th className={`hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider`}>
                Estado
              </th>
              <th className={`hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider`}>
                Banco/Cuenta
              </th>
              <th className={`hidden xl:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider`}>
                Enlaces de Pago
              </th>
              <th className={`hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider`}>
                Extras
              </th>
              <th className={`px-3 sm:px-6 py-3 text-right text-xs font-medium ${textSecondary} uppercase tracking-wider`}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className={`${bgCard} divide-y divide-gray-100 dark:divide-gray-600`}>
            <tr 
              className={`${hoverBg} transition-colors cursor-pointer`}
              onClick={() => onView(paymentMethod)}
            >
              {/* Empresa */}
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <Building2 className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className={`text-sm font-medium ${text} truncate`}>
                      {paymentMethod.company_name}
                    </div>
                    <div className={`text-xs ${textSecondary} truncate`}>
                      RUT: {paymentMethod.company_rut}
                    </div>
                  </div>
                </div>
              </td>
              
              {/* Estado */}
              <td className="hidden md:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                {getStatusBadge(paymentMethod.is_active)}
              </td>
              
              {/* Banco/Cuenta */}
              <td className="hidden lg:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <CreditCard className="w-4 h-4 text-green-600 mr-2" />
                  <div>
                    <span className={`text-sm font-medium ${text} block`}>
                      {paymentMethod.bank_name}
                    </span>
                    <span className={`text-xs ${textSecondary} capitalize`}>
                      Cuenta {paymentMethod.account_type}
                    </span>
                  </div>
                </div>
              </td>
              
              {/* Enlaces de Pago */}
              <td className="hidden xl:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <ExternalLink className="w-4 h-4 text-purple-600 mr-2" />
                  <span className={`text-sm ${textSecondary}`}>
                    {getPaymentLinksPreview()}
                  </span>
                </div>
              </td>
              
              {/* Extras */}
              <td className="hidden lg:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                <div className="space-y-1">
                  {paymentMethod.usd_account_number && (
                    <div className="flex items-center">
                      <DollarSign className="w-3 h-3 text-emerald-600 mr-1" />
                      <span className={`text-xs ${text}`}>Cuenta USD</span>
                    </div>
                  )}
                  {paymentMethod.contact_email && (
                    <div className={`text-xs ${textSecondary} truncate max-w-32`}>
                      📧 {paymentMethod.contact_email}
                    </div>
                  )}
                </div>
              </td>
              
              {/* Acciones */}
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(paymentMethod);
                    }}
                    className={`p-2 ${textMuted} hover:${text} rounded-lg hover:${bgSurface} transition-colors`}
                    title="Ver detalles"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  
                  {isAdmin() && onEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(paymentMethod);
                      }}
                      className={`p-2 ${textMuted} hover:text-[#fd8412] rounded-lg hover:bg-orange-50 transition-colors`}
                      title="Editar método de pago"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  
                  {isAdmin() && onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(paymentMethod);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar método de pago"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentMethodCard;
