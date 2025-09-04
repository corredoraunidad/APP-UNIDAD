import React from 'react';
import {Eye, Edit, Trash2, Mail } from 'lucide-react';
import type { PaymentMethod } from '../../types/metodos-pago';
import { useThemeClasses } from '../../hooks/useThemeClasses';

interface PaymentMethodListViewProps {
  paymentMethods: PaymentMethod[];
  onView: (paymentMethod: PaymentMethod) => void;
  onEdit?: (paymentMethod: PaymentMethod) => void;
  onDelete?: (paymentMethod: PaymentMethod) => void;
  canEdit?: boolean;
}

const PaymentMethodListView: React.FC<PaymentMethodListViewProps> = ({
  paymentMethods,
  onView,
  onEdit,
  onDelete,
  canEdit = false
}) => {
  const { bgCard, text, textSecondary, textMuted, border, bgSurface, hoverBg } = useThemeClasses();





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
                Banco
              </th>
              <th className={`hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider`}>
                Email
              </th>
              <th className={`px-3 sm:px-6 py-3 text-right text-xs font-medium ${textSecondary} uppercase tracking-wider`}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className={`${bgCard} divide-y divide-gray-100 dark:divide-gray-600`}>
            {paymentMethods.map((paymentMethod) => (
              <tr 
                key={paymentMethod.id}
                className={`${hoverBg} transition-colors cursor-pointer`}
                onClick={() => onView(paymentMethod)}
              >
                {/* Empresa */}
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                  <div className="min-w-0">
                    <div className={`text-sm font-medium ${text} truncate`}>
                      {paymentMethod.company_name}
                    </div>
                    <div className={`text-xs ${textSecondary} truncate`}>
                      RUT: {paymentMethod.company_rut}
                    </div>
                  </div>
                </td>
                
                {/* Banco */}
                <td className="hidden md:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium ${text}`}>
                    {paymentMethod.bank_name}
                  </span>
                </td>
                
                {/* Email */}
                <td className="hidden lg:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                  {paymentMethod.contact_email ? (
                    <div className="flex items-center">
                      <Mail className="w-3 h-3 text-gray-400 mr-1" />
                      <span className={`text-xs ${textSecondary} truncate max-w-32`}>
                        {paymentMethod.contact_email}
                      </span>
                    </div>
                  ) : (
                    <span className={`text-xs ${textMuted}`}>Sin email</span>
                  )}
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
                    
                    {canEdit && onEdit && (
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
                    
                    {canEdit && onDelete && (
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentMethodListView;
