import { supabase } from '../config/supabase';
import type { 
  FileItem, 
  FolderItem, 
  FolderContents, 
  FileServiceResponse
} from '../types/files';
import { FilePermissionService } from './filePermissionService';

export class FileService {
  
  /**
   * Obtener contenido de una carpeta
   */
  static async getFolderContents(path: string = '/'): Promise<FileServiceResponse<FolderContents>> {
    try {
      // Obtener el rol del usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'Usuario no autenticado' };
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('rol')
        .eq('id', user.id)
        .single();

      if (!profile?.rol) {
        return { data: null, error: 'Rol de usuario no encontrado' };
      }

      // Para la raíz, buscamos elementos que tengan path = '/' o que estén directamente en la raíz
      let foldersQuery = supabase
        .from('files')
        .select('*')
        .eq('type', 'folder')
        .eq('is_deleted', false);

      let filesQuery = supabase
        .from('files')
        .select('*')
        .eq('type', 'file')
        .eq('is_deleted', false);

      if (path === '/') {
        // Para la raíz, buscamos elementos que estén en la raíz
        foldersQuery = foldersQuery.or('path.eq./,parent_id.is.null');
        filesQuery = filesQuery.or('path.eq./,parent_id.is.null');
      } else {
        // Para otras carpetas, necesitamos encontrar el ID de la carpeta padre
        const { data: currentFolder } = await supabase
          .from('files')
          .select('id')
          .eq('type', 'folder')
          .eq('path', path)
          .eq('is_deleted', false)
          .single();
        
        if (currentFolder) {
          // Buscar elementos que tengan esta carpeta como padre
          foldersQuery = foldersQuery.eq('parent_id', currentFolder.id);
          filesQuery = filesQuery.eq('parent_id', currentFolder.id);
        } else {
          // Si no encontramos la carpeta, devolver arrays vacíos
          return { 
            data: { folders: [], files: [] }, 
            error: null 
          };
        }
      }

      const { data: folders, error: foldersError } = await foldersQuery.order('name');
      const { data: files, error: filesError } = await filesQuery.order('name');

      if (foldersError) {
        return { data: null, error: foldersError.message };
      }

      if (filesError) {
        return { data: null, error: filesError.message };
      }

      // Mapear los resultados
      const currentFolders: FolderItem[] = folders?.map(folder => ({
        id: folder.id,
        name: folder.name,
        type: 'folder',
        created_at: folder.created_at,
        updated_at: folder.updated_at,
        path: folder.path,
      })) || [];

      // Filtrar archivos por permisos de visualización
      const filteredFiles: FileItem[] = [];
      if (files) {
        for (const file of files) {
          const canView = await FilePermissionService.canRoleViewFile(file.id, profile.rol);
          if (canView) {
            filteredFiles.push({
              id: file.id,
              name: file.name,
              type: 'file',
              size: file.size || 0,
              created_at: file.created_at,
              updated_at: file.updated_at,
              path: file.path,
              mime_type: file.mime_type,
              storage_path: file.storage_path,
            });
          }
        }
      }

      return {
        data: {
          folders: currentFolders,
          files: filteredFiles,
        },
        error: null
      };
    } catch (error: any) {
      return { 
        data: null, 
        error: error.message || 'Error al obtener contenido de la carpeta' 
      };
    }
  }

  /**
   * Crear nueva carpeta
   */
  static async createFolder(folderName: string, parentPath: string = '/'): Promise<FileServiceResponse<FolderItem>> {
    try {

      const newPath = parentPath === '/' ? `/${folderName}` : `${parentPath}/${folderName}`;
      
      // Verificar que no existe una carpeta con el mismo nombre en la misma ubicación
      const { data: existingFolder } = await supabase
        .from('files')
        .select('id')
        .eq('type', 'folder')
        .eq('path', newPath)
        .eq('is_deleted', false)
        .single();

      if (existingFolder) {
        return { 
          data: null, 
          error: 'Ya existe una carpeta con ese nombre en esta ubicación' 
        };
      }

      // Obtener el ID del usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { 
          data: null, 
          error: 'Usuario no autenticado' 
        };
      }

      // Obtener el parent_id si no es la raíz
      let parentId = null;
      if (parentPath !== '/') {
        const { data: parentFolder } = await supabase
          .from('files')
          .select('id')
          .eq('type', 'folder')
          .eq('path', parentPath)
          .eq('is_deleted', false)
          .single();
        
        parentId = parentFolder?.id || null;
      }

      // Crear la carpeta
      const { data: newFolder, error } = await supabase
        .from('files')
        .insert({
          name: folderName,
          type: 'folder',
          path: newPath,
          parent_id: parentId,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      const folderItem: FolderItem = {
        id: newFolder.id,
        name: newFolder.name,
        type: 'folder',
        created_at: newFolder.created_at,
        updated_at: newFolder.updated_at,
        path: newFolder.path,
      };

      return { data: folderItem, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: error.message || 'Error al crear la carpeta' 
      };
    }
  }

  /**
   * Asegurar que una carpeta existe, creándola si es necesario
   */
  private static async ensureFolderExists(folderPath: string): Promise<{ success: boolean; folderId: string | null; error: string | null }> {
    try {
      // Si es la raíz, no necesitamos crear nada
      if (folderPath === '/') {
        return { success: true, folderId: null, error: null };
      }

      // Verificar si la carpeta ya existe
      const { data: existingFolder } = await supabase
        .from('files')
        .select('id')
        .eq('type', 'folder')
        .eq('path', folderPath)
        .eq('is_deleted', false)
        .single();

      if (existingFolder) {
        return { success: true, folderId: existingFolder.id, error: null };
      }

      // Crear la carpeta paso a paso
      const pathParts = folderPath.split('/').filter(part => part !== '');
      let currentPath = '';
      let parentId = null;

      for (const part of pathParts) {
        currentPath = currentPath === '' ? `/${part}` : `${currentPath}/${part}`;
        
        // Verificar si esta parte del path ya existe
        const { data: existingPart } = await supabase
          .from('files')
          .select('id')
          .eq('type', 'folder')
          .eq('path', currentPath)
          .eq('is_deleted', false)
          .single();

        if (existingPart) {
          parentId = existingPart.id;
        } else {
          // Crear esta parte de la carpeta
          const { data: newFolder, error: createError } = await supabase
            .from('files')
            .insert({
              name: part,
              type: 'folder',
              path: currentPath,
              parent_id: parentId,
              created_by: (await supabase.auth.getUser()).data.user?.id
            })
            .select('id')
            .single() as { data: { id: string } | null; error: any };

          if (createError || !newFolder) {
            return { 
              success: false, 
              folderId: null, 
              error: `Error creando carpeta ${currentPath}: ${createError?.message || 'Error desconocido'}` 
            };
          }

          parentId = newFolder.id;
        }
      }

      return { success: true, folderId: parentId, error: null };

    } catch (error) {
      return { 
        success: false, 
        folderId: null, 
        error: `Error asegurando carpeta: ${error instanceof Error ? error.message : 'Error desconocido'}` 
      };
    }
  }

  /**
   * Subir archivo
   */
  static async uploadFile(
    fileName: string, 
    file: File, 
    mimeType: string, 
    fileSize: number, 
    parentPath: string = '/'
  ): Promise<FileServiceResponse<FileItem>> {
    try {

      const newPath = parentPath === '/' ? `/${fileName}` : `${parentPath}/${fileName}`;
      
      // Verificar que no existe un archivo con el mismo nombre en la misma ubicación
      const { data: existingFile } = await supabase
        .from('files')
        .select('id')
        .eq('type', 'file')
        .eq('path', newPath)
        .eq('is_deleted', false)
        .single();

      if (existingFile) {
        return { 
          data: null, 
          error: 'Ya existe un archivo con ese nombre en esta ubicación' 
        };
      }

      // Obtener el ID del usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { 
          data: null, 
          error: 'Usuario no autenticado' 
        };
      }

      // Asegurar que la carpeta padre existe y obtener su ID
      let parentId = null;
      if (parentPath !== '/') {
        const { success, folderId, error: folderError } = await this.ensureFolderExists(parentPath);
        
        if (!success) {
          return { 
            data: null, 
            error: folderError || 'Error creando carpeta padre' 
          };
        }
        
        parentId = folderId;
      }

      // Generar un nombre único para el archivo en storage
      const fileExtension = fileName.split('.').pop() || '';
      const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExtension}`;
      const storagePath = `files/${user.id}/${uniqueFileName}`;

      // Subir el archivo a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(storagePath, file, {
          contentType: mimeType,
          upsert: false,
        });

      if (uploadError) {
        return { 
          data: null, 
          error: `Error al subir archivo: ${uploadError.message}` 
        };
      }

      // Crear el registro del archivo en la base de datos
      const { data: newFile, error } = await supabase
        .from('files')
        .insert({
          name: fileName,
          type: 'file',
          size: fileSize,
          path: newPath,
          mime_type: mimeType,
          parent_id: parentId,
          created_by: user.id,
          storage_path: storagePath,
        })
        .select()
        .single();

      if (error) {
        // Si falla la inserción en la BD, eliminar el archivo de storage
        await supabase.storage.from('files').remove([storagePath]);
        return { data: null, error: error.message };
      }

      const fileItem: FileItem = {
        id: newFile.id,
        name: newFile.name,
        type: 'file',
        size: newFile.size || 0,
        created_at: newFile.created_at,
        updated_at: newFile.updated_at,
        path: newFile.path,
        mime_type: newFile.mime_type,
        storage_path: newFile.storage_path,
      };

      return { data: fileItem, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: error.message || 'Error al subir el archivo' 
      };
    }
  }

  /**
   * Eliminar archivo o carpeta (soft delete)
   */
  static async deleteItem(itemId: string): Promise<FileServiceResponse<void>> {
    try {
      // Obtener el rol del usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'Usuario no autenticado' };
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('rol')
        .eq('id', user.id)
        .single();

      if (!profile?.rol) {
        return { data: null, error: 'Rol de usuario no encontrado' };
      }

      // Solo admins pueden eliminar archivos
      if (!['admin', 'admin_comercial', 'admin_operaciones'].includes(profile.rol)) {
        return { data: null, error: 'No tienes permisos para eliminar archivos' };
      }

      // Obtener información del archivo antes de eliminarlo
      const { data: fileData, error: fetchError } = await supabase
        .from('files')
        .select('type, storage_path')
        .eq('id', itemId)
        .eq('is_deleted', false)
        .single();

      if (fetchError) {
        return { data: null, error: fetchError.message };
      }

      // Si es un archivo y tiene storage_path, eliminar el archivo físico
      if (fileData?.type === 'file' && fileData?.storage_path) {
        const { error: storageError } = await supabase.storage
          .from('files')
          .remove([fileData.storage_path]);

        if (storageError) {
          // Continuar con la eliminación lógica aunque falle el storage
        }
      }

      // Marcar como eliminado en la base de datos
      const { error } = await supabase
        .from('files')
        .update({ is_deleted: true })
        .eq('id', itemId);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: null, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: error.message || 'Error al eliminar el elemento' 
      };
    }
  }

  /**
   * Renombrar archivo o carpeta
   */
  static async renameItem(itemId: string, newName: string): Promise<FileServiceResponse<void>> {
    try {

      // Obtener el item actual
      const { data: currentItem, error: fetchError } = await supabase
        .from('files')
        .select('*')
        .eq('id', itemId)
        .eq('is_deleted', false)
        .single();

      if (fetchError || !currentItem) {
        return { data: null, error: 'Elemento no encontrado' };
      }

      // Construir la nueva ruta
      const currentPath = currentItem.path;
      const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
      const newPath = parentPath === '' ? `/${newName}` : `${parentPath}/${newName}`;

      // Verificar que no existe otro elemento con el mismo nombre
      const { data: existingItem } = await supabase
        .from('files')
        .select('id')
        .eq('type', currentItem.type)
        .eq('path', newPath)
        .eq('is_deleted', false)
        .neq('id', itemId)
        .single();

      if (existingItem) {
        return { 
          data: null, 
          error: 'Ya existe un elemento con ese nombre en esta ubicación' 
        };
      }

      // Actualizar el nombre y la ruta
      const { error: updateError } = await supabase
        .from('files')
        .update({ 
          name: newName,
          path: newPath,
        })
        .eq('id', itemId);

      if (updateError) {
        return { data: null, error: updateError.message };
      }

      return { data: null, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: error.message || 'Error al renombrar el elemento' 
      };
    }
  }

  /**
   * Obtener URL de previsualización de un archivo (solo verifica permisos de visualización)
   */
  static async getFilePreviewUrl(fileId: string): Promise<FileServiceResponse<string>> {
    try {
      // Obtener el rol del usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'Usuario no autenticado' };
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('rol')
        .eq('id', user.id)
        .single();

      if (!profile?.rol) {
        return { data: null, error: 'Rol de usuario no encontrado' };
      }

      // Verificar permisos de visualización
      const canView = await FilePermissionService.canRoleViewFile(fileId, profile.rol);
      if (!canView) {
        return { data: null, error: 'No tienes permisos para ver este archivo' };
      }

      // Obtener la ruta de storage desde la base de datos
      const { data: fileData, error } = await supabase
        .from('files')
        .select('storage_path')
        .eq('id', fileId)
        .eq('is_deleted', false)
        .single();

      if (error || !fileData?.storage_path) {
        return { data: null, error: 'Archivo no encontrado' };
      }

      // Obtener URL pública
      const { data } = supabase.storage
        .from('files')
        .getPublicUrl(fileData.storage_path);

      return { data: data.publicUrl, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: error.message || 'Error al obtener URL de previsualización' 
      };
    }
  }

  /**
   * Obtener URL de descarga de un archivo
   */
  static async getFileDownloadUrl(fileId: string): Promise<FileServiceResponse<string>> {
    try {
      // Obtener el rol del usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'Usuario no autenticado' };
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('rol')
        .eq('id', user.id)
        .single();

      if (!profile?.rol) {
        return { data: null, error: 'Rol de usuario no encontrado' };
      }

      // Verificar permisos de descarga
      const canDownload = await FilePermissionService.canRoleDownloadFile(fileId, profile.rol);
      if (!canDownload) {
        return { data: null, error: 'No tienes permisos para descargar este archivo' };
      }

      // Obtener la ruta de storage desde la base de datos
      const { data: fileData, error } = await supabase
        .from('files')
        .select('storage_path')
        .eq('id', fileId)
        .eq('is_deleted', false)
        .single();

      if (error || !fileData?.storage_path) {
        return { data: null, error: 'Archivo no encontrado' };
      }

      // Obtener URL pública
      const { data } = supabase.storage
        .from('files')
        .getPublicUrl(fileData.storage_path);

      return { data: data.publicUrl, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: error.message || 'Error al obtener URL de descarga' 
      };
    }
  }

  /**
   * Obtener conteo total de archivos
   */
  static async getTotalFileCount(): Promise<FileServiceResponse<number>> {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('id', { count: 'exact' })
        .eq('type', 'file')
        .eq('is_deleted', false);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data?.length || 0, error: null };
    } catch (error: any) {
      return { data: null, error: error.message || 'Error al obtener conteo' };
    }
  }

  /**
   * Obtener un archivo por ID
   */
  static async getFileById(fileId: string): Promise<FileServiceResponse<FileItem>> {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('id', fileId)
        .eq('is_deleted', false)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      if (!data) {
        return { data: null, error: 'Archivo no encontrado' };
      }

      const fileItem: FileItem = {
        id: data.id,
        name: data.name,
        type: 'file',
        size: data.size || 0,
        created_at: data.created_at,
        updated_at: data.updated_at,
        path: data.path,
        mime_type: data.mime_type,
        storage_path: data.storage_path,
      };

      return { data: fileItem, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: error.message || 'Error al obtener archivo' 
      };
    }
  }

  /**
   * Obtener múltiples archivos por IDs
   */
  static async getFilesByIds(fileIds: string[]): Promise<FileServiceResponse<FileItem[]>> {
    try {
      if (fileIds.length === 0) {
        return { data: [], error: null };
      }

      const { data, error } = await supabase
        .from('files')
        .select('*')
        .in('id', fileIds)
        .eq('is_deleted', false)
        .order('name');

      if (error) {
        return { data: null, error: error.message };
      }

      const fileItems: FileItem[] = (data || []).map(file => ({
        id: file.id,
        name: file.name,
        type: 'file',
        size: file.size || 0,
        created_at: file.created_at,
        updated_at: file.updated_at,
        path: file.path,
        mime_type: file.mime_type,
        storage_path: file.storage_path,
      }));

      return { data: fileItems, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: error.message || 'Error al obtener archivos' 
      };
    }
  }
} 