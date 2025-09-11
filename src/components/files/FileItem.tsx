import React, { useEffect, useRef, useState } from 'react';
import { 
  Folder, 
  FileText, 
  Image, 
  FileSpreadsheet, 
  Archive, 
  File,
  MoreVertical,
  Eye,
  Download,
  Edit,
  Trash2,
  Shield,
  Lock,
  Unlock
} from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { FilePermissionService } from '../../services/filePermissionService';

interface FileItemProps {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  extension?: string;
  modified: Date;
  itemCount?: number; // Para carpetas
  mime_type?: string; // Para archivos
  onOpen: (id: string) => void;
  onDownload?: (id: string) => void;
  onRename?: (id: string) => void;
  onDelete?: (id: string) => void;
  onPreview?: (id: string, name: string, mimeType: string, size: number) => void;
  onManagePermissions?: (id: string) => void;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  userRole?: string;
  isAdmin?: boolean;
}

const FileItem: React.FC<FileItemProps> = ({
  id,
  name,
  type,
  size,
  extension,
  modified,
  itemCount,
  mime_type,
  onOpen,
  onDownload,
  onRename,
  onDelete,
  onPreview,
  onManagePermissions,
  openMenuId,
  setOpenMenuId,
  userRole,
  isAdmin = false
}) => {
  const { bgCard, text, textSecondary, textMuted, hoverBg, border } = useThemeClasses();
  const menuRef = useRef<HTMLDivElement>(null);
  const [canDownload, setCanDownload] = useState<boolean>(false);
  const [brokerCanDownload, setBrokerCanDownload] = useState<boolean>(false);
  const [brokerPermissionsLoaded, setBrokerPermissionsLoaded] = useState<boolean>(false);

  // Cargar permisos de descarga
  useEffect(() => {
    if (type === 'file' && userRole) {
      loadDownloadPermission();
      // Si es admin, también cargar permisos de brokers para el candado
      if (['admin', 'admin_comercial', 'admin_operaciones'].includes(userRole)) {
        loadBrokerPermissions();
      }
    }
  }, [id, userRole, type]);

  const loadDownloadPermission = async () => {
    try {
      const canDownloadFile = await FilePermissionService.canRoleDownloadFile(id, userRole!);
      setCanDownload(canDownloadFile);
    } catch (error) {
      // En caso de error, usar por defecto (solo admins pueden descargar)
      setCanDownload(['admin', 'admin_comercial', 'admin_operaciones'].includes(userRole!));
    }
  };

  const loadBrokerPermissions = async () => {
    try {
      const brokerCanDownloadFile = await FilePermissionService.canRoleDownloadFile(id, 'broker');
      setBrokerCanDownload(brokerCanDownloadFile);
      setBrokerPermissionsLoaded(true);
    } catch (error) {
      // En caso de error, por defecto los brokers no pueden descargar
      setBrokerCanDownload(false);
      setBrokerPermissionsLoaded(true);
    }
  };

  // Función para obtener el icono según el tipo
  const getIcon = () => {
    if (type === 'folder') {
      return <Folder size={32} className="text-[#1e3a8a]" />;
    }

    switch (extension?.toLowerCase()) {
      case 'pdf':
        return <FileText size={32} className="text-red-500" />;
      case 'xlsx':
      case 'xls':
        return <FileSpreadsheet size={32} className="text-green-600" />;
      case 'docx':
      case 'doc':
        return <FileText size={32} className="text-blue-600" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image size={32} className="text-purple-500" />;
      case 'zip':
      case 'rar':
        return <Archive size={32} className="text-yellow-600" />;
      default:
        return <File size={32} className="text-gray-500" />;
    }
  };

  // Formatear tamaño de archivo
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Formatear fecha
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Hoy';
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleMenuToggle = () => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleAction = (action: string) => {
    setOpenMenuId(null);
    
    switch (action) {
      case 'open':
        onOpen(id);
        break;
      case 'preview':
        if (type === 'file' && onPreview && mime_type && size) {
          onPreview(id, name, mime_type, size);
        }
        break;
      case 'download':
        if (canDownload) {
          onDownload?.(id);
        }
        break;
      case 'rename':
        onRename?.(id);
        break;
      case 'delete':
        onDelete?.(id);
        break;
      case 'permissions':
        onManagePermissions?.(id);
        break;
    }
  };

  // useEffect para cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId === id && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId, id, setOpenMenuId]);

  return (
    <div 
      className={`${bgCard} rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-4 group cursor-pointer ${
        openMenuId === id ? 'relative z-30' : ''
      }`}
      onClick={() => onOpen(id)}
    >
      <div className="flex items-center gap-4">
        {/* Icono */}
        <div className="flex-shrink-0">
          {getIcon()}
        </div>

        {/* Información principal */}
        <div className="flex-1 min-w-0">
          {/* Nombre con indicadores de permisos */}
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`text-sm font-medium ${text} truncate`}>
              {name}
            </h3>
            {type === 'file' && brokerPermissionsLoaded && ['admin', 'admin_comercial', 'admin_operaciones'].includes(userRole!) && (
              <div className="flex items-center gap-1">
                {brokerCanDownload ? (
                  <div title="Los brokers pueden descargar este archivo">
                    <Unlock size={12} className="text-green-500" />
                  </div>
                ) : (
                  <div title="Los brokers NO pueden descargar este archivo">
                    <Lock size={12} className="text-red-500" />
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Información adicional */}
          <div className={`flex items-center gap-4 text-xs ${textSecondary}`}>
            {type === 'folder' ? (
              <span>{itemCount} elementos</span>
            ) : (
              size && <span>{formatFileSize(size)}</span>
            )}
            <span>{formatDate(modified)}</span>
          </div>
        </div>

        {/* Menú de acciones */}
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation(); // Evitar que se active el onClick del contenedor
              handleMenuToggle();
            }}
            className={`p-2 rounded-full ${hoverBg} transition-colors opacity-0 group-hover:opacity-100`}
          >
            <MoreVertical size={16} className={textSecondary} />
          </button>

          {/* Dropdown Menu */}
          {openMenuId === id && (
            <div className={`absolute right-0 top-full mt-1 z-20 ${bgCard} rounded-xl shadow-lg border ${border} py-2 min-w-[140px]`}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAction('open');
                  }}
                  className={`w-full px-3 py-2 text-left text-sm ${text} ${hoverBg} flex items-center transition-colors`}
                >
                  <Eye size={14} className={`mr-2 ${textMuted}`} />
                  {type === 'folder' ? 'Abrir' : 'Ver'}
                </button>
                
                {type === 'file' && onDownload && canDownload && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction('download');
                    }}
                    className={`w-full px-3 py-2 text-left text-sm flex items-center transition-colors ${text} ${hoverBg}`}
                  >
                    <Download size={14} className={`mr-2 ${textMuted}`} />
                    Descargar
                  </button>
                )}
                
                {onRename && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction('rename');
                    }}
                    className={`w-full px-3 py-2 text-left text-sm ${text} ${hoverBg} flex items-center transition-colors`}
                  >
                    <Edit size={14} className={`mr-2 ${textMuted}`} />
                    Renombrar
                  </button>
                )}

                {isAdmin && onManagePermissions && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction('permissions');
                    }}
                    className={`w-full px-3 py-2 text-left text-sm ${text} ${hoverBg} flex items-center transition-colors`}
                  >
                    <Shield size={14} className={`mr-2 ${textMuted}`} />
                    Permisos
                  </button>
                )}
                
                {onDelete && (
                  <>
                    <div className={`h-px ${border} my-1 mx-2`}></div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction('delete');
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                    >
                      <Trash2 size={14} className="mr-2 text-red-400" />
                      Eliminar
                    </button>
                  </>
                )}
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileItem; 