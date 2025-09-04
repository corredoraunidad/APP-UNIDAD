import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';

interface FilesBreadcrumbProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const FilesBreadcrumb: React.FC<FilesBreadcrumbProps> = ({
  currentPath,
  onNavigate
}) => {
  const { bgCard, textSecondary, textMuted } = useThemeClasses();

  // Generar breadcrumbs desde el path
  const generateBreadcrumbs = () => {
    if (currentPath === '/') {
      return [{ name: 'Inicio', path: '/' }];
    }

    const parts = currentPath.split('/').filter(part => part !== '');
    const breadcrumbs = [{ name: 'Inicio', path: '/' }];
    
    let currentFullPath = '';
    parts.forEach(part => {
      currentFullPath += `/${part}`;
      breadcrumbs.push({
        name: part,
        path: currentFullPath
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <div className={`${bgCard} rounded-2xl shadow-sm p-4 mb-6`}>
      <div className="flex items-center gap-3">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {breadcrumbs.map((breadcrumb, index) => (
            <React.Fragment key={breadcrumb.path}>
              {/* Icono Home para inicio */}
              {index === 0 && (
                <Home size={16} className={`${textMuted} mr-1`} />
              )}
              
              {/* Link del breadcrumb */}
              <button
                onClick={() => onNavigate(breadcrumb.path)}
                className={`
                  text-sm font-medium truncate transition-colors
                  ${index === breadcrumbs.length - 1
                    ? 'text-[#fd8412] cursor-default'
                    : `${textSecondary} hover:text-[#fd8412] hover:underline`
                  }
                `}
                disabled={index === breadcrumbs.length - 1}
              >
                {breadcrumb.name}
              </button>

              {/* Separador */}
              {index < breadcrumbs.length - 1 && (
                <ChevronRight size={16} className={`${textMuted} flex-shrink-0`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilesBreadcrumb; 