import React from 'react';
import { Phone, Users } from 'lucide-react';
import type { Company } from '../../types/asistencias-siniestros';
import { useThemeClasses } from '../../hooks/useThemeClasses';

interface CompanyListProps {
  companies: Company[];
  viewMode: 'grid' | 'list';
  onCompanyClick: (company: Company) => void;
  onDeleteClick?: (company: Company) => void;
  canEdit?: boolean;
  loading?: boolean;
  error?: string | null;
}

const CompanyList: React.FC<CompanyListProps> = ({
  companies,
  viewMode,
  onCompanyClick,
  onDeleteClick,
  canEdit = false,
  loading = false,
  error = null
}) => {
  const { bgCard, text, textSecondary, textMuted } = useThemeClasses();

  const getServicePreview = (company: Company): string => {
    const services = [];
    
    if (company.callCenter.length > 0) {
      services.push(`Call Center: ${company.callCenter.length}`);
    }
    if (company.assistance.length > 0) {
      services.push(`Asistencia: ${company.assistance.length}`);
    }
    if (company.autoReplacement.length > 0) {
      services.push(`Auto Reemplazo: ${company.autoReplacement.length}`);
    }
    
    return services.join(', ') || 'Sin servicios';
  };

  const getFirstContactNumber = (company: Company): string => {
    if (company.callCenter.length > 0) {
      return company.callCenter[0].number;
    }
    if (company.assistance.length > 0) {
      return company.assistance[0].number;
    }
    if (company.autoReplacement.length > 0) {
      return company.autoReplacement[0].number;
    }
    return 'Sin números';
  };

  // Importar el componente de vista de lista
  const CompanyListView = React.lazy(() => import('./CompanyListView'));

  // Estado de carga
  if (loading) {
    return (
      <div className={`${bgCard} rounded-2xl shadow-sm overflow-hidden`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#fd8412] mr-3"></div>
          <span className={textSecondary}>Cargando compañías...</span>
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
            <p className={`${textMuted} text-sm mt-1`}>Error al cargar las compañías</p>
          </div>
        </div>
      </div>
    );
  }

  // Estado sin compañías
  if (companies.length === 0) {
    return (
      <div className={`${bgCard} rounded-2xl shadow-sm overflow-hidden`}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className={`${textSecondary} font-medium`}>No hay compañías disponibles</p>
            <p className={`${textMuted} text-sm mt-1`}>Las compañías aparecerán aquí cuando se agreguen</p>
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
        <CompanyListView
          companies={companies}
          onCompanyClick={onCompanyClick}
          onDeleteClick={onDeleteClick}
          canEdit={canEdit}
        />
      </React.Suspense>
    );
  }

  // Vista de cuadrícula
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {companies.map((company) => (
        <div
          key={company.id}
          onClick={() => onCompanyClick(company)}
          className={`${bgCard} rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 cursor-pointer group`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
                             <h3 className={`text-lg font-semibold ${text} truncate mb-1`}>
                 {company.name}
               </h3>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  company.type === 'asistencias' ? 'bg-blue-100 text-blue-800' :
                  company.type === 'siniestros' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {company.type === 'asistencias' ? 'Asistencias' :
                   company.type === 'siniestros' ? 'Siniestros' : 'Ambos'}
                </span>
              </div>
            </div>
            
            {canEdit && onDeleteClick && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteClick(company);
                }}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                title="Eliminar compañía"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>

          {/* Información de contacto */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className={`text-sm ${textSecondary} truncate`}>
                {getFirstContactNumber(company)}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className={`text-sm ${textSecondary} truncate`}>
                {getServicePreview(company)}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className={`text-xs ${textMuted}`}>
                {company.callCenter.length + company.assistance.length + company.autoReplacement.length} servicios
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

export default CompanyList;
