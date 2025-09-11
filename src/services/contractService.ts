import { supabase } from '../config/supabase';

export interface ContractUploadResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    path: string;
    size: number;
    mimeType: string;
  };
  error?: string;
}

export interface ContractDownloadResponse {
  success: boolean;
  data?: {
    url: string;
    name: string;
    size: number;
  };
  error?: string;
}

export class ContractService {
  private static readonly BUCKET_NAME = 'contracts';

  /**
   * Subir contrato de usuario
   */
  static async uploadContract(
    userId: string,
    file: File
  ): Promise<ContractUploadResponse> {
    try {
      // Verificar que el archivo sea PDF
      if (file.type !== 'application/pdf') {
        return {
          success: false,
          error: 'El contrato debe ser un archivo PDF'
        };
      }

      // Generar nombre único para el archivo
      const fileExtension = file.name.split('.').pop() || 'pdf';
      const uniqueFileName = `contrato_${Date.now()}.${fileExtension}`;
      const storagePath = `${userId}/${uniqueFileName}`;

      // Subir archivo al bucket de contratos
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(storagePath, file, {
          contentType: 'application/pdf',
          upsert: false
        });

      if (error) {
        return {
          success: false,
          error: `Error al subir contrato: ${error.message}`
        };
      }

      return {
        success: true,
        data: {
          id: data.path,
          name: file.name,
          path: data.path,
          size: file.size,
          mimeType: file.type
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtener URL de descarga del contrato
   */
  static async getContractDownloadUrl(contractPath: string): Promise<ContractDownloadResponse> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .createSignedUrl(contractPath, 3600); // URL válida por 1 hora

      if (error) {
        return {
          success: false,
          error: `Error al generar URL de descarga: ${error.message}`
        };
      }

      return {
        success: true,
        data: {
          url: data.signedUrl,
          name: contractPath.split('/').pop() || 'contrato.pdf',
          size: 0 // No tenemos el tamaño aquí, se puede obtener por separado si es necesario
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Eliminar contrato
   */
  static async deleteContract(contractPath: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([contractPath]);

      if (error) {
        return {
          success: false,
          error: `Error al eliminar contrato: ${error.message}`
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Verificar si un contrato existe
   */
  static async contractExists(contractPath: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(contractPath.split('/')[0], {
          search: contractPath.split('/')[1]
        });

      return !error && data && data.length > 0;
    } catch (error) {
      return false;
    }
  }
}
