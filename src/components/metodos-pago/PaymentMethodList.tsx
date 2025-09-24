import React from 'react';
import { CreditCard, ExternalLink, Trash2, DollarSign, Edit } from 'lucide-react';
import type { PaymentMethod } from '../../types/metodos-pago';
import { useThemeClasses } from '../../hooks/useThemeClasses';


interface PaymentMethodListProps {
  paymentMethods: PaymentMethod[];
  viewMode: 'grid' | 'list';
  onView: (paymentMethod: PaymentMethod) => void;
  onEdit?: (paymentMethod: PaymentMethod) => void;
  onDelete?: (paymentMethod: PaymentMethod) => void;
  canEdit?: boolean;
  loading?: boolean;
  error?: string | null;
}

const PaymentMethodList: React.FC<PaymentMethodListProps> = ({
  paymentMethods,
  viewMode,
  onView,
  onEdit,
  onDelete,
  canEdit = false,
  loading = false,
  error = null
}) => {
  const { bgCard, text, textSecondary, textMuted } = useThemeClasses();
  



  const getPaymentLinksPreview = (paymentMethod: PaymentMethod): string => {
    if (!paymentMethod.payment_links || paymentMethod.payment_links.length === 0) {
      return 'Sin enlaces configurados';
    }
    
    return `${paymentMethod.payment_links.length} enlace${paymentMethod.payment_links.length !== 1 ? 's' : ''} configurado${paymentMethod.payment_links.length !== 1 ? 's' : ''}`;
  };

  // Importar el componente de vista de lista
  const PaymentMethodListView = React.lazy(() => import('./PaymentMethodListView.tsx'));

  // Estado de carga
  if (loading) {
    return (
      <div className={`${bgCard} rounded-2xl shadow-sm overflow-hidden`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#fd8412] mr-3"></div>
          <span className={textSecondary}>Cargando métodos de pago...</span>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className={`${bgCard} rounded-2xl shadow-sm overflow-hidden`}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 font-medium">{error}</p>
            <p className={`${textMuted} text-sm mt-1`}>Error al cargar los métodos de pago</p>
          </div>
        </div>
      </div>
    );
  }

  // Estado sin métodos de pago
  if (paymentMethods.length === 0) {
    return (
      <div className={`${bgCard} rounded-2xl shadow-sm overflow-hidden`}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className={`${textSecondary} font-medium`}>No hay métodos de pago disponibles</p>
            <p className={`${textMuted} text-sm mt-1`}>Los métodos de pago aparecerán aquí cuando se agreguen</p>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <React.Suspense fallback={
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#fd8412]"></div>
        </div>
      }>
        <PaymentMethodListView
          paymentMethods={paymentMethods}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          canEdit={canEdit}
        />
      </React.Suspense>
    );
  }

  // Vista de cuadrícula
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {paymentMethods.map((paymentMethod) => (
        <div
          key={paymentMethod.id}
          onClick={() => onView(paymentMethod)}
          className={`${bgCard} rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 cursor-pointer group`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h3 className={`text-lg font-semibold ${text} truncate`}>
                {paymentMethod.company_name}
              </h3>
              <p className={`text-sm ${textSecondary} truncate`}>
                RUT: {paymentMethod.company_rut}
              </p>
            </div>
            
            <div className="flex items-center gap-1">
            {canEdit && onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(paymentMethod);
                }}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
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
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                title="Eliminar método de pago"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            </div>
          </div>

          {/* Información bancaria */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-gray-400" />
              <div className="flex-1 min-w-0">
                <p className={`font-medium ${text} truncate`}>
                  {paymentMethod.bank_name}
                </p>
                <p className={`text-sm ${textSecondary} capitalize`}>
                  Cuenta {paymentMethod.account_type}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-gray-400" />
              <span className={`text-sm ${textSecondary} truncate`}>
                {getPaymentLinksPreview(paymentMethod)}
              </span>
            </div>

            {paymentMethod.usd_account_number && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className={`text-sm ${text}`}>
                  Cuenta USD disponible
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className={`text-xs ${textMuted}`}>
                {paymentMethod.contact_email ? 'Con contacto' : 'Sin contacto'}
              </span>
              <span className="text-xs text-[#fd8412] font-medium">
                Ver detalles →
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PaymentMethodList;
