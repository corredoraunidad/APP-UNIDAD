import { supabase } from '../config/supabase';
import type { FilePermission, FilePermissionUpdate, FilePermissionByRole } from '../types/files';

interface FilePermissionServiceResponse<T> {
  success: boolean;
  data?: T | null;
  error?: string | null;
}

export class FilePermissionService {
  /**
   * Obtener todos los permisos de un archivo
   */
  static async getFilePermissions(fileId: string): Promise<FilePermissionServiceResponse<FilePermission[]>> {
    try {
      const { data, error } = await supabase
        .from('file_permissions')
        .select('*')
        .eq('file_id', fileId)
        .order('role');

      if (error) {
        return { success: false, error: `Error al obtener permisos: ${error.message}` };
      }

      return { success: true, data: data || [], error: null };
    } catch (error) {
      return { 
        success: false, 
        error: `Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}` 
      };
    }
  }

  /**
   * Obtener permisos de un archivo organizados por rol
   */
  static async getFilePermissionsByRole(fileId: string): Promise<FilePermissionServiceResponse<FilePermissionByRole>> {
    try {
      const { data, error } = await supabase
        .from('file_permissions')
        .select('*')
        .eq('file_id', fileId);

      if (error) {
        return { success: false, error: `Error al obtener permisos: ${error.message}` };
      }

      // Organizar por rol
      const permissionsByRole: FilePermissionByRole = {
        admin: { can_view: true, can_download: false },
        admin_comercial: { can_view: true, can_download: false },
        admin_operaciones: { can_view: true, can_download: false },
        broker: { can_view: true, can_download: false }
      };

      data?.forEach(permission => {
        const role = permission.role as keyof FilePermissionByRole;
        if (permissionsByRole[role]) {
          permissionsByRole[role] = {
            can_view: permission.can_view,
            can_download: permission.can_download
          };
        }
      });

      return { success: true, data: permissionsByRole, error: null };
    } catch (error) {
      return { 
        success: false, 
        error: `Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}` 
      };
    }
  }

  /**
   * Verificar si un rol puede ver un archivo
   */
  static async canRoleViewFile(fileId: string, role: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('file_permissions')
        .select('can_view')
        .eq('file_id', fileId)
        .eq('role', role)
        .single();

      if (error || !data) {
        // Si no hay permisos específicos, usar por defecto (todos pueden ver)
        return true;
      }

      return data.can_view;
    } catch (error) {
      // En caso de error, permitir ver por defecto
      return true;
    }
  }

  /**
   * Verificar si un rol puede descargar un archivo
   */
  static async canRoleDownloadFile(fileId: string, role: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('file_permissions')
        .select('can_download')
        .eq('file_id', fileId)
        .eq('role', role)
        .single();

      if (error || !data) {
        // Si no hay permisos específicos, usar por defecto (TODOS pueden descargar)
        return true;
      }

      return data.can_download;
    } catch (error) {
      // En caso de error, usar por defecto (TODOS pueden descargar)
      return true;
    }
  }

  /**
   * Actualizar permisos de descarga para un rol específico
   */
  static async updateDownloadPermission(
    fileId: string, 
    role: string, 
    canDownload: boolean,
    grantedBy: string
  ): Promise<FilePermissionServiceResponse<FilePermission>> {
    try {
      const { data, error } = await supabase
        .from('file_permissions')
        .upsert({
          file_id: fileId,
          role: role,
          can_view: true, // Siempre true
          can_download: canDownload,
          granted_by: grantedBy,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: `Error al actualizar permisos: ${error.message}` };
      }

      return { success: true, data, error: null };
    } catch (error) {
      return { 
        success: false, 
        error: `Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}` 
      };
    }
  }

  /**
   * Actualizar múltiples permisos de un archivo
   */
  static async updateFilePermissions(
    fileId: string, 
    permissions: FilePermissionUpdate[],
    grantedBy: string
  ): Promise<FilePermissionServiceResponse<FilePermission[]>> {
    try {
      // Primero eliminar todos los permisos existentes para este archivo
      const { error: deleteError } = await supabase
        .from('file_permissions')
        .delete()
        .eq('file_id', fileId);

      if (deleteError) {
        return { success: false, error: `Error al eliminar permisos existentes: ${deleteError.message}` };
      }

      // Luego insertar los nuevos permisos
      const newPermissions = permissions.map(permission => ({
        file_id: fileId,
        role: permission.role,
        can_view: true, // Siempre true
        can_download: permission.can_download,
        granted_by: grantedBy,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from('file_permissions')
        .insert(newPermissions)
        .select();

      if (error) {
        return { success: false, error: `Error al insertar permisos: ${error.message}` };
      }

      return { success: true, data: data || [], error: null };
    } catch (error) {
      return { 
        success: false, 
        error: `Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}` 
      };
    }
  }

  /**
   * Resetear permisos a valores por defecto
   */
  static async resetToDefaultPermissions(fileId: string, grantedBy: string): Promise<FilePermissionServiceResponse<FilePermission[]>> {
    try {
      const defaultPermissions: FilePermissionUpdate[] = [
        { role: 'admin', can_download: true },
        { role: 'admin_comercial', can_download: true },
        { role: 'admin_operaciones', can_download: true },
        { role: 'broker', can_download: true }
      ];

      return await this.updateFilePermissions(fileId, defaultPermissions, grantedBy);
    } catch (error) {
      return { 
        success: false, 
        error: `Error al resetear permisos: ${error instanceof Error ? error.message : 'Error desconocido'}` 
      };
    }
  }

  /**
   * Eliminar todos los permisos de un archivo
   */
  static async deleteFilePermissions(fileId: string): Promise<FilePermissionServiceResponse<null>> {
    try {
      const { error } = await supabase
        .from('file_permissions')
        .delete()
        .eq('file_id', fileId);

      if (error) {
        return { success: false, error: `Error al eliminar permisos: ${error.message}` };
      }

      return { success: true, data: null, error: null };
    } catch (error) {
      return { 
        success: false, 
        error: `Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}` 
      };
    }
  }
}
