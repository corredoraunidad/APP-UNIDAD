import React, { useState } from 'react';
import { FolderOpen } from 'lucide-react';
import FileItem from './FileItem';
import type { FileItem as FileItemType, FolderItem } from '../../types/files';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { useAuth } from '../../hooks/useAuth';

interface FilesListProps {
  files: FileItemType[];
  folders: FolderItem[];
  onItemOpen: (id: string, type: 'file' | 'folder') => void;
  onItemDownload?: (id: string) => void;
  onItemRename?: (id: string) => void;
  onItemDelete?: (id: string) => void;
  onItemPreview?: (id: string, name: string, mimeType: string, size: number) => void;
  onItemManagePermissions?: (id: string) => void;
  loading?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canDownload?: boolean;
}

const FilesList: React.FC<FilesListProps> = ({
  files,
  folders,
  onItemOpen,
  onItemDownload,
  onItemRename,
  onItemDelete,
  onItemPreview,
  onItemManagePermissions,
  loading = false,
  canEdit = true,
  canDelete = true,
  canDownload = true
}) => {
  const { text, textSecondary, textMuted } = useThemeClasses();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const { user } = useAuth();

  // Combinar carpetas y archivos, carpetas primero
  const allItems = [...folders, ...files];

  const handleItemOpen = (id: string) => {
    const item = allItems.find(item => item.id === id);
    if (item) {
      onItemOpen(id, item.type);
    }
  };

  // Verificar si el usuario es admin
  const isAdmin = user?.rol && ['admin', 'admin_comercial', 'admin_operaciones'].includes(user.rol);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#fd8412] mx-auto mb-4"></div>
          <p className={textSecondary}>Cargando archivos...</p>
        </div>
      </div>
    );
  }

  if (allItems.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center mb-4">
          <FolderOpen size={64} className={textMuted} />
        </div>
        <h3 className={`text-lg font-medium ${text} mb-2`}>
          Esta carpeta está vacía
        </h3>
        <p className={textSecondary}>
          Sube archivos o crea nuevas carpetas para comenzar
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {allItems.map((item) => (
        <FileItem
          key={item.id}
          id={item.id}
          name={item.name}
          type={item.type}
          size={item.type === 'file' ? item.size : undefined}
          extension={item.type === 'file' ? item.mime_type?.split('/').pop() : undefined}
          modified={new Date(item.type === 'file' ? item.updated_at : item.updated_at)}
          itemCount={item.type === 'folder' ? item.itemCount : undefined}
          mime_type={item.type === 'file' ? item.mime_type : undefined}
          onOpen={handleItemOpen}
          onDownload={canDownload && item.type === 'file' ? onItemDownload : undefined}
          onRename={canEdit ? onItemRename : undefined}
          onDelete={canDelete ? onItemDelete : undefined}
          onPreview={onItemPreview}
          onManagePermissions={onItemManagePermissions}
          openMenuId={openMenuId}
          setOpenMenuId={setOpenMenuId}
          userRole={user?.rol}
          isAdmin={isAdmin}
        />
      ))}
      

    </div>
  );
};

export default FilesList; 