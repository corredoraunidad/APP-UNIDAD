import React from 'react';
import TopNav from '../../components/navigation/TopNav';
import Sidebar from '../../components/navigation/Sidebar';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import UserProfileDrawer from '../../components/profile/UserProfileDrawer';
import FilesHeader from '../../components/files/FilesHeader';
import FilesBreadcrumb from '../../components/files/FilesBreadcrumb';
import FilesList from '../../components/files/FilesList';
import CreateFolderModal from '../../components/files/CreateFolderModal';
import UploadFileModal from '../../components/files/UploadFileModal';
import RenameItemModal from '../../components/files/RenameItemModal';
import DeleteItemModal from '../../components/files/DeleteItemModal';
import FilePreviewModal from '../../components/files/FilePreviewModal';
import FilePermissionModal from '../../components/files/FilePermissionModal';
import { useUserProfileDrawer } from '../../hooks/useUserProfileDrawer';
import { usePermissions } from '../../hooks/usePermissions';
import { FileService } from '../../services/fileService';
import type { FolderItem, FileItem } from '../../types/files';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';



const Archivos: React.FC = () => {
  const navigate = useNavigate();
  const { bg } = useThemeClasses();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { isProfileDrawerOpen, openProfileDrawer, closeProfileDrawer, handleOpenChangePasswordModal } = useUserProfileDrawer();
  const { can } = usePermissions();
  
  // Estados para navegación de archivos
  const [currentPath, setCurrentPath] = useState('/');
  const [loading, setLoading] = useState(false);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [_error, setError] = useState<string | null>(null);


  // Estados para modales
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isUploadFileModalOpen, setIsUploadFileModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Estados para modales de acciones
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    name: string;
    type: 'file' | 'folder';
  } | null>(null);

  // Estado para archivo seleccionado para permisos
  const [selectedFileForPermissions, setSelectedFileForPermissions] = useState<FileItem | null>(null);

  // Estados para vista previa
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<{
    id: string;
    name: string;
    mimeType: string;
    size: number;
  } | null>(null);

  // Función para cargar archivos desde la BD
  const loadFolderContents = async (path: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await FileService.getFolderContents(path);
      
      if (result.error) {
        setError(result.error);
        setFolders([]);
        setFiles([]);
      } else if (result.data) {
        setFolders(result.data.folders);
        setFiles(result.data.files);
      }
    } catch (err: any) {
      setError('Error de conexión al cargar archivos');
      setFolders([]);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar contenido cuando cambie el path
  useEffect(() => {
    loadFolderContents(currentPath);
  }, [currentPath]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleLogout = () => {
    navigate('/login');
  };

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handlers para FilesHeader
  const handleCreateFolder = () => {
    setIsCreateFolderModalOpen(true);
  };

  const handleUploadFile = () => {
    setIsUploadFileModalOpen(true);
  };

  // Handlers para modales
  const handleCreateFolderSubmit = async (folderName: string) => {
    setModalLoading(true);
    try {
      const result = await FileService.createFolder(folderName, currentPath);
      
      if (result.error) {
        // Aquí podrías mostrar un toast de error
      } else {
        // Recargar contenido de la carpeta actual
        await loadFolderContents(currentPath);
        setIsCreateFolderModalOpen(false);
      }
    } catch (err: any) {
      // Manejar error
    } finally {
      setModalLoading(false);
    }
  };

  const handleUploadFileSubmit = async (file: File, permissions?: { [role: string]: boolean }) => {
    setModalLoading(true);
    try {
      const result = await FileService.uploadFile(
        file.name,
        file,
        file.type,
        file.size,
        currentPath
      );
      
      if (result.error) {
        // Aquí podrías mostrar un toast de error
      } else {
        // Si se configuraron permisos personalizados, aplicarlos
        if (permissions && result.data) {
          try {
            const { FilePermissionService } = await import('../../services/filePermissionService');
            const { supabase } = await import('../../config/supabase');
            
            // Obtener el usuario actual
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              // Convertir permisos al formato esperado
              const permissionsToUpdate = Object.entries(permissions).map(([role, canDownload]) => ({
                role,
                can_download: canDownload
              }));

              await FilePermissionService.updateFilePermissions(
                result.data.id,
                permissionsToUpdate,
                user.id
              );
            }
          } catch (permError) {
            console.error('Error configurando permisos:', permError);
            // Continuar aunque falle la configuración de permisos
          }
        }
        
        // Recargar contenido de la carpeta actual
        await loadFolderContents(currentPath);
        setIsUploadFileModalOpen(false);
      }
    } catch (err: any) {
      // Manejar error
    } finally {
      setModalLoading(false);
    }
  };

  // Handlers para navegación
  const handleNavigateToPath = (path: string) => {
    setCurrentPath(path);
  };

  // Handlers para FilesList
  const handleItemOpen = (id: string, type: 'file' | 'folder') => {
    if (type === 'folder') {
      // Navegar a la carpeta usando su path
      const folder = folders.find(f => f.id === id);
      if (folder) {
        setCurrentPath(folder.path);
      }
    } else {
      // Abrir vista previa del archivo
      const file = files.find(f => f.id === id);
      if (file) {
        setPreviewFile({
          id: file.id,
          name: file.name,
          mimeType: file.mime_type || '',
          size: file.size
        });
        setIsPreviewModalOpen(true);
      }
    }
  };

  const handleItemDownload = async (id: string) => {
    try {
      // Obtener URL de descarga
      const result = await FileService.getFileDownloadUrl(id);
      
      if (result.error) {
        // Aquí podrías mostrar un toast de error
        return;
      }

      if (result.data) {
        // Encontrar el archivo para obtener el nombre
        const file = files.find(f => f.id === id);
        if (file) {
          // Crear un enlace temporal y hacer clic para descargar
          const link = document.createElement('a');
          link.href = result.data;
          link.download = file.name;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    } catch (err: any) {
      // Manejar error
    }
  };

  const handleItemRename = (id: string) => {
    // Encontrar el item (archivo o carpeta)
    const file = files.find(f => f.id === id);
    const folder = folders.find(f => f.id === id);
    
    if (file) {
      setSelectedItem({
        id: file.id,
        name: file.name,
        type: 'file'
      });
      setIsRenameModalOpen(true);
    } else if (folder) {
      setSelectedItem({
        id: folder.id,
        name: folder.name,
        type: 'folder'
      });
      setIsRenameModalOpen(true);
    }
  };

  const handleItemDelete = (id: string) => {
    // Encontrar el item (archivo o carpeta)
    const file = files.find(f => f.id === id);
    const folder = folders.find(f => f.id === id);
    
    if (file) {
      setSelectedItem({
        id: file.id,
        name: file.name,
        type: 'file'
      });
      setIsDeleteModalOpen(true);
    } else if (folder) {
      setSelectedItem({
        id: folder.id,
        name: folder.name,
        type: 'folder'
      });
      setIsDeleteModalOpen(true);
    }
  };

  const handleItemPreview = (id: string, name: string, mimeType: string, size: number) => {
    setPreviewFile({
      id,
      name,
      mimeType,
      size
    });
    setIsPreviewModalOpen(true);
  };

  const handleItemManagePermissions = (id: string) => {
    // Encontrar el archivo
    const file = files.find(f => f.id === id);
    if (file) {
      setSelectedFileForPermissions(file);
      setIsPermissionModalOpen(true);
    }
  };

  const handlePermissionsChange = () => {
    // Recargar contenido de la carpeta actual para actualizar indicadores
    loadFolderContents(currentPath);
  };

  // Handlers para modales de acciones
  const handleRenameSubmit = async (newName: string) => {
    if (!selectedItem) return;
    
    setModalLoading(true);
    try {
      const result = await FileService.renameItem(selectedItem.id, newName);
      
      if (result.error) {
        // Aquí podrías mostrar un toast de error
      } else {
        // Recargar contenido de la carpeta actual
        await loadFolderContents(currentPath);
        setIsRenameModalOpen(false);
        setSelectedItem(null);
      }
    } catch (err: any) {
      // Manejar error
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;
    
    setModalLoading(true);
    try {
      const result = await FileService.deleteItem(selectedItem.id);
      
      if (result.error) {
        // Aquí podrías mostrar un toast de error
      } else {
        // Recargar contenido de la carpeta actual
        await loadFolderContents(currentPath);
        setIsDeleteModalOpen(false);
        setSelectedItem(null);
      }
    } catch (err: any) {
      // Manejar error
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className={`h-screen overflow-hidden ${bg}`}>
      {/* TopNav */}
      <TopNav 
        onLogout={handleLogout} 
        onMenuToggle={handleMenuToggle}
        showMenuButton={isMobile}
        showUserIcon={true}
        showLogout={false}
        onUserIconClick={openProfileDrawer}
      />

      {/* Layout con Sidebar y contenido */}
      <div className="flex h-screen pt-16">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />

        {/* Contenido principal */}
        <div className="flex-1 overflow-hidden">
          <main className="h-full">
            <div className="max-w-7xl mx-auto h-full flex flex-col">
              {/* Header fijo */}
              <div className="p-6 pt-24 pb-0 flex-shrink-0">
                {/* Header con botones */}
                <FilesHeader
                  onCreateFolder={handleCreateFolder}
                  onUploadFile={handleUploadFile}
                  canCreate={can('archivos', 'create')}
                  canUpload={can('archivos', 'upload')}
                />

                {/* Breadcrumb de navegación */}
                <FilesBreadcrumb
                  currentPath={currentPath}
                  onNavigate={handleNavigateToPath}
                />
              </div>

              {/* Lista de archivos y carpetas - scrolleable */}
              <div className="flex-1 overflow-auto px-6 pb-6">
                <FilesList
                  files={files}
                  folders={folders}
                  onItemOpen={handleItemOpen}
                  onItemDownload={handleItemDownload}
                  onItemRename={handleItemRename}
                  onItemDelete={handleItemDelete}
                  onItemPreview={handleItemPreview}
                  onItemManagePermissions={handleItemManagePermissions}
                  loading={loading}
                  canEdit={can('archivos', 'edit')}
                  canDelete={can('archivos', 'delete')}
                  canDownload={can('archivos', 'download')}
                />
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* UserProfile Drawer */}
      <UserProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={closeProfileDrawer}
        onOpenChangePasswordModal={handleOpenChangePasswordModal}
      />

      {/* Modales */}
      <CreateFolderModal
        isOpen={isCreateFolderModalOpen}
        onClose={() => setIsCreateFolderModalOpen(false)}
        onSubmit={handleCreateFolderSubmit}
        currentPath={currentPath}
        loading={modalLoading}
      />

      <UploadFileModal
        isOpen={isUploadFileModalOpen}
        onClose={() => setIsUploadFileModalOpen(false)}
        onSubmit={handleUploadFileSubmit}
        currentPath={currentPath}
        loading={modalLoading}
      />

      <RenameItemModal
        isOpen={isRenameModalOpen}
        onClose={() => {
          setIsRenameModalOpen(false);
          setSelectedItem(null);
        }}
        onSubmit={handleRenameSubmit}
        currentName={selectedItem?.name || ''}
        itemType={selectedItem?.type || 'file'}
        loading={modalLoading}
      />

      <DeleteItemModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedItem(null);
        }}
        onConfirm={handleDeleteConfirm}
        itemName={selectedItem?.name || ''}
        itemType={selectedItem?.type || 'file'}
        loading={modalLoading}
      />

      <FilePreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setPreviewFile(null);
        }}
        fileId={previewFile?.id || ''}
        fileName={previewFile?.name || ''}
        fileType={previewFile?.mimeType || ''}
        fileSize={previewFile?.size || 0}
      />

      <FilePermissionModal
        isOpen={isPermissionModalOpen}
        onClose={() => {
          setIsPermissionModalOpen(false);
          setSelectedFileForPermissions(null);
        }}
        file={selectedFileForPermissions || {
          id: '',
          name: '',
          type: 'file',
          size: 0,
          path: '',
          created_at: '',
          updated_at: '',
          mime_type: ''
        }}
        onPermissionsChange={handlePermissionsChange}
      />
    </div>
  );
};

export default Archivos; 