import { supabase } from '../config/supabase';
import type {
  Announcement,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
  AnnouncementListResponse,
  AnnouncementResponse,
  AnnouncementFilters,
  AnnouncementStats,
  AnnouncementApiResponse,
  AnnouncementPriority,
} from '../types/announcements';

export class AnnouncementService {
  /**
   * Obtener lista de anuncios con filtros y paginación
   */
  static async getAnnouncements(filters: AnnouncementFilters = {}): Promise<AnnouncementApiResponse<AnnouncementListResponse>> {
    try {
      const {
        priority,
        status,
        search,
        date_from,
        date_to,
        page = 1,
        limit = 10
      } = filters;

      // Obtener el usuario actual para verificar estado de lectura
      const { data: { user } } = await supabase.auth.getUser();
      
      let query = supabase
        .from('announcements')
        .select(
          `
          *,
          announcement_recipients!left(user_id, is_read, read_at)
        `,
          { count: 'exact' }
        )
        .eq('announcement_recipients.user_id', user?.id)
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (priority) {
        query = query.eq('priority', priority);
      }
      if (status) {
        query = query.eq('status', status);
      }
      if (search) {
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
      }
      if (date_from) {
        query = query.gte('created_at', date_from);
      }
      if (date_to) {
        query = query.lte('created_at', date_to);
      }

      // Paginación
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      const announcements = data || [];
      const total = typeof count === 'number' ? count : announcements.length;
      const hasMore = from + limit < total;

      // Procesar información de lectura para el usuario actual
      const processedAnnouncements = announcements.map(announcement => {
        const recipients = announcement.announcement_recipients || [];
        const userRecipient = recipients.find((r: any) => r.user_id === user?.id);
        
        return {
          ...announcement,
          isRead: userRecipient ? userRecipient.is_read : false,
          readAt: userRecipient?.read_at || null
        };
      });

      return {
        success: true,
        data: {
          announcements: processedAnnouncements,
          total,
          page,
          limit,
          hasMore
        }
      };
    } catch (error) {
      console.error('Error fetching announcements:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtener un anuncio específico por ID
   */
  static async getAnnouncementById(id: string): Promise<AnnouncementApiResponse<AnnouncementResponse>> {
    try {
      const { data: announcement, error: announcementError } = await supabase
        .from('announcements')
        .select('*')
        .eq('id', id)
        .single();

      if (announcementError) {
        throw announcementError;
      }


      // Obtener destinatarios
      const { data: recipients, error: recipientsError } = await supabase
        .from('announcement_recipients')
        .select('*')
        .eq('announcement_id', id);

      if (recipientsError) {
        throw recipientsError;
      }

      // Obtener roles
      const { data: roles, error: rolesError } = await supabase
        .from('announcement_roles')
        .select('*')
        .eq('announcement_id', id);

      if (rolesError) {
        throw rolesError;
      }

      return {
        success: true,
        data: {
          announcement,
          recipients: recipients || [],
          roles: roles || []
        }
      };
    } catch (error) {
      console.error('Error fetching announcement:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Crear un nuevo anuncio
   */
  static async createAnnouncement(request: CreateAnnouncementRequest): Promise<AnnouncementApiResponse<Announcement>> {
    try {
      const {
        title,
        content,
        priority,
        status,
        scheduled_at,
        published_at,
        target_roles
      } = request;

      // Crear el anuncio
      const { data: announcement, error: announcementError } = await supabase
        .from('announcements')
        .insert({
          title,
          content,
          priority,
          status,
          scheduled_at,
          published_at,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (announcementError) {
        throw announcementError;
      }

      // Crear roles destinatarios
      if (target_roles && target_roles.length > 0) {
        const rolesData = target_roles.map(role => ({
          announcement_id: announcement.id,
          role
        }));

        const { error: rolesError } = await supabase
          .from('announcement_roles')
          .insert(rolesData);

        if (rolesError) {
          throw rolesError;
        }

        // Crear destinatarios automáticamente si el anuncio está publicado
        if (status === 'published') {
          const { error: recipientsError } = await supabase
            .rpc('create_announcement_recipients', { 
              announcement_uuid: announcement.id 
            });

          if (recipientsError) {
            console.warn('Error creating announcement recipients:', recipientsError);
            // No lanzar error aquí para no romper la creación del anuncio
          }
        }
      }


      return {
        success: true,
        data: announcement,
        message: 'Anuncio creado exitosamente'
      };
    } catch (error) {
      console.error('Error creating announcement:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Actualizar un anuncio existente
   */
  static async updateAnnouncement(request: UpdateAnnouncementRequest): Promise<AnnouncementApiResponse<Announcement>> {
    try {
      const {
        id,
        title,
        content,
        priority,
        status,
        scheduled_at,
        published_at,
        target_roles
      } = request;

      // Actualizar el anuncio
      const updateData: Partial<Announcement> = {};
      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;
      if (priority !== undefined) updateData.priority = priority;
      if (status !== undefined) updateData.status = status;
      if (scheduled_at !== undefined) updateData.scheduled_at = scheduled_at;
      if (published_at !== undefined) updateData.published_at = published_at;

      const { data: announcement, error: announcementError } = await supabase
        .from('announcements')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (announcementError) {
        throw announcementError;
      }

      // Actualizar roles destinatarios si se proporcionan
      if (target_roles !== undefined) {
        // Eliminar roles existentes
        await supabase
          .from('announcement_roles')
          .delete()
          .eq('announcement_id', id);

        // Insertar nuevos roles
        if (target_roles.length > 0) {
          const rolesData = target_roles.map(role => ({
            announcement_id: id,
            role
          }));

          const { error: rolesError } = await supabase
            .from('announcement_roles')
            .insert(rolesData);

          if (rolesError) {
            throw rolesError;
          }
        }

        // Crear destinatarios automáticamente si el anuncio está publicado
        if (status === 'published') {
          const { error: recipientsError } = await supabase
            .rpc('create_announcement_recipients', { 
              announcement_uuid: id 
            });

          if (recipientsError) {
            console.warn('Error creating announcement recipients:', recipientsError);
            // No lanzar error aquí para no romper la actualización del anuncio
          }
        }
      }


      return {
        success: true,
        data: announcement,
        message: 'Anuncio actualizado exitosamente'
      };
    } catch (error) {
      console.error('Error updating announcement:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Eliminar un anuncio
   */
  static async deleteAnnouncement(id: string): Promise<AnnouncementApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: 'Anuncio eliminado exitosamente'
      };
    } catch (error) {
      console.error('Error deleting announcement:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtener estadísticas de anuncios
   */
  static async getAnnouncementStats(): Promise<AnnouncementApiResponse<AnnouncementStats>> {
    try {
      // Obtener conteos por estado
      const { data: statusCounts, error: statusError } = await supabase
        .from('announcements')
        .select('status');

      if (statusError) {
        throw statusError;
      }


      // Obtener conteos por prioridad
      const { data: priorityCounts, error: priorityError } = await supabase
        .from('announcements')
        .select('priority');

      if (priorityError) {
        throw priorityError;
      }

      // Calcular estadísticas
      const total = statusCounts?.length || 0;
      const published = statusCounts?.filter(a => a.status === 'published').length || 0;
      const draft = statusCounts?.filter(a => a.status === 'draft').length || 0;
      const archived = statusCounts?.filter(a => a.status === 'archived').length || 0;


      const by_priority: Record<AnnouncementPriority, number> = {
        low: 0,
        medium: 0,
        high: 0
      };

      priorityCounts?.forEach(announcement => {
        by_priority[announcement.priority as AnnouncementPriority]++;
      });

      // Obtener anuncios no leídos del usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      let unread = 0;

      if (user) {
        const { data: unreadData } = await supabase
          .rpc('get_unread_announcements_count', { user_uuid: user.id });
        unread = unreadData || 0;
      }

      return {
        success: true,
        data: {
          total,
          published,
          draft,
          archived,
          unread,
          by_priority
        }
      };
    } catch (error) {
      console.error('Error fetching announcement stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Marcar anuncio como leído
   */
  static async markAsRead(announcementId: string): Promise<AnnouncementApiResponse<void>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { error } = await supabase
        .rpc('mark_announcement_as_read', {
          announcement_uuid: announcementId,
          user_uuid: user.id
        });

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: 'Anuncio marcado como leído'
      };
    } catch (error) {
      console.error('Error marking announcement as read:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }



}
