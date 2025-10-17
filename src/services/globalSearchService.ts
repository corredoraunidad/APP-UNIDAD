/**
 * Servicio de Búsqueda Global
 * 
 * Centraliza todas las búsquedas de la aplicación.
 * Busca en múltiples módulos respetando permisos y retorna resultados agrupados.
 */

import { supabase } from '../config/supabase';
import { FilePermissionService } from './filePermissionService';
import type {
  SearchResultUser,
  SearchResultFile,
  SearchResultCompany,
  SearchResultContact,
  SearchResultPaymentMethod,
  SearchOptions,
  SearchServiceResponse,
} from '../types/search';
import { DEFAULT_SEARCH_CONFIG } from '../types/search';

export class GlobalSearchService {
  /**
   * Helper para extraer la carpeta padre de un path
   * Ejemplo: "/Documentos/Banco/archivo.pdf" -> "/Documentos/Banco"
   */
  private static getParentFolder(filePath: string): string {
    if (!filePath || filePath === '/') return '/';
    
    const lastSlash = filePath.lastIndexOf('/');
    if (lastSlash <= 0) return '/';
    
    return filePath.substring(0, lastSlash);
  }

  /**
   * Buscar usuarios
   * Busca en: nombres, apellidos, email, username, RUT
   * Respeta permisos: solo admins pueden ver usuarios
   */
  static async searchUsers(
    query: string,
    userRole: string,
    limit: number = 5
  ): Promise<SearchResultUser[]> {
    try {
      // Verificar permisos: solo admins pueden ver usuarios
      const canViewUsers = ['admin', 'admin_comercial', 'admin_operaciones'].includes(userRole);
      if (!canViewUsers) {
        return [];
      }

      // Buscar en múltiples campos
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nombres, apellido_paterno, apellido_materno, email, username, rut, rol, is_active')
        .eq('is_active', true)
        .or(`nombres.ilike.%${query}%,apellido_paterno.ilike.%${query}%,apellido_materno.ilike.%${query}%,email.ilike.%${query}%,username.ilike.%${query}%,rut.ilike.%${query}%`)
        .limit(limit);

      if (error) {
        console.error('Error buscando usuarios:', error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Mapear resultados
      return data.map((user): SearchResultUser => {
        const nombreCompleto = `${user.nombres} ${user.apellido_paterno}${user.apellido_materno ? ' ' + user.apellido_materno : ''}`;
        
        return {
          id: user.id,
          type: 'user',
          title: nombreCompleto,
          subtitle: user.email,
          badge: this.getRolLabel(user.rol),
          // Navegar a usuarios con el ID para abrir modal automáticamente
          navigationPath: `/usuarios?userId=${user.id}`,
          metadata: {
            email: user.email,
            rol: user.rol,
            rut: user.rut || undefined,
            isActive: user.is_active,
          },
        };
      });
    } catch (error) {
      console.error('Error en searchUsers:', error);
      return [];
    }
  }

  /**
   * Buscar archivos
   * Busca en: nombre de archivo/carpeta
   * Aplica permisos de archivos por rol
   */
  static async searchFiles(
    query: string,
    _userId: string,
    userRole: string,
    limit: number = 5
  ): Promise<SearchResultFile[]> {
    try {
      // Buscar archivos y carpetas
      const { data, error } = await supabase
        .from('files')
        .select('id, name, type, path, mime_type, size')
        .eq('is_deleted', false)
        .ilike('name', `%${query}%`)
        .limit(limit * 2); // Traer más para filtrar por permisos después

      if (error) {
        console.error('Error buscando archivos:', error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Filtrar por permisos de visualización
      const results: SearchResultFile[] = [];
      for (const file of data) {
        // Para carpetas, permitir siempre visualización
        if (file.type === 'folder') {
          results.push({
            id: file.id,
            type: 'file',
            title: file.name,
            subtitle: file.path || '/',
            badge: 'Carpeta',
            navigationPath: `/archivos?path=${encodeURIComponent(file.path || '/')}`,
            metadata: {
              fileType: 'folder',
              path: file.path || '/',
            },
          });
        } else {
          // Para archivos, verificar permisos
          const canView = await FilePermissionService.canRoleViewFile(file.id, userRole);
          if (canView) {
            const extension = file.name.split('.').pop()?.toUpperCase() || 'FILE';
            // Obtener carpeta padre para navegación directa
            const parentFolder = this.getParentFolder(file.path || '/');
            results.push({
              id: file.id,
              type: 'file',
              title: file.name,
              subtitle: file.path || '/',
              badge: extension,
              // Navegar a la carpeta que contiene el archivo + abrir el archivo
              navigationPath: `/archivos?path=${encodeURIComponent(parentFolder)}&fileId=${file.id}`,
              metadata: {
                fileType: 'file',
                mimeType: file.mime_type || undefined,
                size: file.size || undefined,
                path: file.path || '/',
                extension,
              },
            });
          }
        }

        // Limitar resultados
        if (results.length >= limit) {
          break;
        }
      }

      return results;
    } catch (error) {
      console.error('Error en searchFiles:', error);
      return [];
    }
  }

  /**
   * Buscar compañías
   * Busca en: nombre de compañía
   */
  static async searchCompanies(
    query: string,
    limit: number = 5
  ): Promise<SearchResultCompany[]> {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, type')
        .ilike('name', `%${query}%`)
        .limit(limit);

      if (error) {
        console.error('Error buscando compañías:', error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Mapear resultados
      return data.map((company): SearchResultCompany => ({
        id: company.id,
        type: 'company',
        title: company.name,
        subtitle: this.getCompanyTypeLabel(company.type),
        badge: company.type,
        navigationPath: `/asistencias-siniestros?companyId=${company.id}`,
        metadata: {
          companyType: company.type,
          hasContacts: false, // Se podría mejorar con un count
        },
      }));
    } catch (error) {
      console.error('Error en searchCompanies:', error);
      return [];
    }
  }

  /**
   * Buscar contactos
   * Busca en: nombre, email, teléfono, cargo
   */
  static async searchContacts(
    query: string,
    limit: number = 5
  ): Promise<SearchResultContact[]> {
    try {
      const { data, error } = await supabase
        .from('company_contacts')
        .select('id, company_id, name, position, email, phone, is_primary')
        .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%,position.ilike.%${query}%`)
        .limit(limit);

      if (error) {
        console.error('Error buscando contactos:', error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Obtener nombres de compañías
      const companyIds = [...new Set(data.map(c => c.company_id).filter(Boolean))];
      const { data: companies } = await supabase
        .from('companies')
        .select('id, name')
        .in('id', companyIds);

      const companyMap = new Map(companies?.map(c => [c.id, c.name]) || []);

      // Mapear resultados
      return data.map((contact): SearchResultContact => {
        const companyName = companyMap.get(contact.company_id) || 'Compañía desconocida';
        
        return {
          id: contact.id,
          type: 'contact',
          title: contact.name,
          subtitle: `${contact.position || 'Sin cargo'} • ${companyName}`,
          badge: contact.is_primary ? 'Principal' : undefined,
          navigationPath: `/asistencias-siniestros?companyId=${contact.company_id}`,
          metadata: {
            companyName,
            companyId: contact.company_id,
            position: contact.position || undefined,
            email: contact.email || undefined,
            phone: contact.phone || undefined,
            isPrimary: contact.is_primary || false,
          },
        };
      });
    } catch (error) {
      console.error('Error en searchContacts:', error);
      return [];
    }
  }

  /**
   * Buscar métodos de pago
   * Busca en: nombre de compañía, RUT, banco
   */
  static async searchPaymentMethods(
    query: string,
    limit: number = 5
  ): Promise<SearchResultPaymentMethod[]> {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('id, company_name, company_rut, bank_name, account_type, is_active')
        .eq('is_active', true)
        .or(`company_name.ilike.%${query}%,company_rut.ilike.%${query}%,bank_name.ilike.%${query}%`)
        .limit(limit);

      if (error) {
        console.error('Error buscando métodos de pago:', error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Mapear resultados
      return data.map((method): SearchResultPaymentMethod => ({
        id: method.id,
        type: 'payment_method',
        title: method.company_name,
        subtitle: `${method.bank_name} • ${method.account_type}`,
        badge: 'Activo',
        navigationPath: `/metodos-pago?methodId=${method.id}`,
        metadata: {
          companyRut: method.company_rut,
          bankName: method.bank_name,
          accountType: method.account_type,
          isActive: method.is_active,
        },
      }));
    } catch (error) {
      console.error('Error en searchPaymentMethods:', error);
      return [];
    }
  }

  /**
   * Búsqueda global - función principal
   * Ejecuta búsquedas en todos los módulos en paralelo
   */
  static async globalSearch(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchServiceResponse> {
    const startTime = Date.now();

    try {
      // Validar query
      const trimmedQuery = query.trim();
      if (trimmedQuery.length < (DEFAULT_SEARCH_CONFIG.minQueryLength || 3)) {
        return {
          success: true,
          data: {
            users: [],
            files: [],
            companies: [],
            contacts: [],
            paymentMethods: [],
            totalResults: 0,
            searchTime: 0,
          },
        };
      }

      const {
        userId,
        userRole,
        limit = DEFAULT_SEARCH_CONFIG.maxResultsPerModule,
      } = options;

      if (!userId || !userRole) {
        return {
          success: false,
          error: {
            message: 'Se requiere userId y userRole para realizar la búsqueda',
            code: 'MISSING_USER_INFO',
          },
        };
      }

      // Ejecutar búsquedas en paralelo
      const [users, files, companies, contacts, paymentMethods] = await Promise.all([
        this.searchUsers(trimmedQuery, userRole, limit),
        this.searchFiles(trimmedQuery, userId, userRole, limit),
        this.searchCompanies(trimmedQuery, limit),
        this.searchContacts(trimmedQuery, limit),
        this.searchPaymentMethods(trimmedQuery, limit),
      ]);

      const totalResults = 
        users.length + 
        files.length + 
        companies.length + 
        contacts.length + 
        paymentMethods.length;

      const searchTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          users,
          files,
          companies,
          contacts,
          paymentMethods,
          totalResults,
          searchTime,
        },
      };
    } catch (error) {
      console.error('Error en globalSearch:', error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Error desconocido en la búsqueda',
          code: 'SEARCH_ERROR',
        },
      };
    }
  }

  /**
   * Helpers para labels
   */
  private static getRolLabel(rol: string): string {
    const labels: Record<string, string> = {
      admin: 'Admin',
      admin_comercial: 'Admin Comercial',
      admin_operaciones: 'Admin Operaciones',
      broker: 'Broker',
    };
    return labels[rol] || rol;
  }

  private static getCompanyTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      asistencias: 'Asistencias',
      siniestros: 'Siniestros',
      ambos: 'Asistencias y Siniestros',
    };
    return labels[type] || type;
  }
}

