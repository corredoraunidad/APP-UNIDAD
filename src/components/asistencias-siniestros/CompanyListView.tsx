import React from 'react';
import { Phone, Users, Trash2, Eye } from 'lucide-react';
import type { Company } from '../../types/asistencias-siniestros';
import { useThemeClasses } from '../../hooks/useThemeClasses';

interface CompanyListViewProps {
  companies: Company[];
  onCompanyClick: (company: Company) => void;
  onDeleteClick?: (company: Company) => void;
  canEdit?: boolean;
}

const CompanyListView: React.FC<CompanyListViewProps> = ({
  companies,
  onCompanyClick,
  onDeleteClick,
  canEdit = false
}) => {
  const { bgCard, text, textSecondary, textMuted, border, bgSurface, hoverBg } = useThemeClasses();

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

  const getTypeBadge = (type: string) => {
    const typeMap = {
      asistencias: { label: 'Asistencias', color: 'bg-blue-100 text-blue-800' },
      siniestros: { label: 'Siniestros', color: 'bg-red-100 text-red-800' },
      ambos: { label: 'Ambos', color: 'bg-blue-100 text-blue-800' }
    };
    
    const typeInfo = typeMap[type as keyof typeof typeMap] || typeMap.asistencias;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
        {typeInfo.label}
      </span>
    );
  };

  return (
    <div className={`${bgCard} rounded-xl shadow-sm border ${border} overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-600">
          <thead className={`${bgSurface}`}>
            <tr>
              <th className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider`}>
                Compañía
              </th>
              <th className={`hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider`}>
                Tipo
              </th>
              <th className={`hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider`}>
                Teléfono Principal
              </th>
              <th className={`hidden xl:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider`}>
                Servicios
              </th>
              <th className={`hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium ${textSecondary} uppercase tracking-wider`}>
                Contactos
              </th>
              <th className={`px-3 sm:px-6 py-3 text-right text-xs font-medium ${textSecondary} uppercase tracking-wider`}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className={`${bgCard} divide-y divide-gray-100 dark:divide-gray-600`}>
            {companies.map((company) => (
              <tr 
                key={company.id}
                className={`${hoverBg} transition-colors cursor-pointer`}
                onClick={() => onCompanyClick(company)}
              >
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className={`text-sm font-medium ${text}`}>
                      {company.name}
                    </div>
                  </div>
                </td>
                
                <td className="hidden md:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                  {getTypeBadge(company.type)}
                </td>
                
                <td className="hidden lg:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-500 mr-2" />
                    <span className={`text-sm ${text}`}>
                      {getFirstContactNumber(company)}
                    </span>
                  </div>
                </td>
                
                <td className="hidden xl:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm ${textSecondary}`}>
                    {getServicePreview(company)}
                  </span>
                </td>
                
                <td className="hidden lg:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 text-gray-500 mr-2" />
                    <span className={`text-sm ${text}`}>
                      {company.contacts.length} contacto{company.contacts.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </td>
                
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCompanyClick(company);
                      }}
                      className={`p-2 ${textMuted} hover:${text} rounded-lg hover:${bgSurface} transition-colors`}
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {canEdit && onDeleteClick && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteClick(company);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar compañía"
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

export default CompanyListView;
