import { supabase } from '../config/supabase';
import type { Announcement } from '../types/announcements';

export interface DashboardStats {
  totalUsers: number;
  totalFiles: number;
  activeAnnouncements: number;
  totalCompanies: number;
  totalPaymentMethods: number;
  recentActivity: {
    newUsers: number;
    newFiles: number;
  };
}

export interface AnnouncementWidgetData {
  recentAnnouncements: Announcement[];
  unreadCount: number;
  urgentCount: number;
  totalPublished: number;
}

export class DashboardService {
  /**
   * Obtener estadísticas generales del dashboard
   */
  static async getDashboardStats(): Promise<{ stats: DashboardStats | null; error: string | null }> {
    try {
      // Obtener total de usuarios
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' });

      if (usersError) {
        return {
          stats: null,
          error: 'Error al obtener estadísticas de usuarios'
        };
      }

      // Obtener total de archivos
      const { data: files, error: filesError } = await supabase
        .from('files')
        .select('id', { count: 'exact' })
        .eq('type', 'file')
        .eq('is_deleted', false);

      if (filesError) {
        return {
          stats: null,
          error: 'Error al obtener estadísticas de archivos'
        };
      }

      // Obtener usuarios nuevos (últimos 7 días)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: newUsers, error: newUsersError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .gte('created_at', sevenDaysAgo.toISOString());

      if (newUsersError) {
        return {
          stats: null,
          error: 'Error al obtener estadísticas de usuarios nuevos'
        };
      }

      // Obtener archivos nuevos (últimos 7 días)
      const { data: newFiles, error: newFilesError } = await supabase
        .from('files')
        .select('id', { count: 'exact' })
        .eq('type', 'file')
        .eq('is_deleted', false)
        .gte('created_at', sevenDaysAgo.toISOString());

      if (newFilesError) {
        return {
          stats: null,
          error: 'Error al obtener estadísticas de archivos nuevos'
        };
      }

      // Obtener anuncios activos (publicados)
      const { data: activeAnnouncements, error: announcementsError } = await supabase
        .from('announcements')
        .select('id', { count: 'exact' })
        .eq('status', 'published');

      if (announcementsError) {
        return {
          stats: null,
          error: 'Error al obtener estadísticas de anuncios'
        };
      }

      // Obtener total de compañías
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id', { count: 'exact' });

      if (companiesError) {
        return {
          stats: null,
          error: 'Error al obtener estadísticas de compañías'
        };
      }

      // Obtener total de métodos de pago activos
      const { data: paymentMethods, error: paymentMethodsError } = await supabase
        .from('payment_methods')
        .select('id', { count: 'exact' })
        .eq('is_active', true);

      if (paymentMethodsError) {
        return {
          stats: null,
          error: 'Error al obtener estadísticas de métodos de pago'
        };
      }

      const stats: DashboardStats = {
        totalUsers: users?.length || 0,
        totalFiles: files?.length || 0,
        activeAnnouncements: activeAnnouncements?.length || 0,
        totalCompanies: companies?.length || 0,
        totalPaymentMethods: paymentMethods?.length || 0,
        recentActivity: {
          newUsers: newUsers?.length || 0,
          newFiles: newFiles?.length || 0
        }
      };

      return {
        stats,
        error: null
      };

    } catch (error) {
      return {
        stats: null,
        error: 'Error de conexión al obtener estadísticas'
      };
    }
  }

  /**
   * Obtener estadísticas específicas por módulo
   */
  static async getModuleStats(module: 'usuarios' | 'archivos' | 'anuncios'): Promise<{ count: number; error: string | null }> {
    try {
      switch (module) {
        case 'usuarios':
          const { data: users, error: usersError } = await supabase
            .from('profiles')
            .select('id', { count: 'exact' });

          if (usersError) {
            return { count: 0, error: 'Error al obtener usuarios' };
          }

          return { count: users?.length || 0, error: null };

        case 'archivos':
          const { data: files, error: filesError } = await supabase
            .from('files')
            .select('id', { count: 'exact' })
            .eq('type', 'file')
            .eq('is_deleted', false);

          if (filesError) {
            return { count: 0, error: 'Error al obtener archivos' };
          }

          return { count: files?.length || 0, error: null };

        case 'anuncios':
          const { data: announcements, error: announcementsError } = await supabase
            .from('announcements')
            .select('id', { count: 'exact' })
            .eq('status', 'published');

          if (announcementsError) {
            return { count: 0, error: 'Error al obtener anuncios' };
          }

          return { count: announcements?.length || 0, error: null };

        default:
          return { count: 0, error: 'Módulo no válido' };
      }
    } catch (error) {
      return { count: 0, error: 'Error de conexión' };
    }
  }

  /**
   * Obtener datos para el widget de anuncios del dashboard
   */
  static async getAnnouncementWidgetData(): Promise<{ data: AnnouncementWidgetData | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          data: null,
          error: 'Usuario no autenticado'
        };
      }

      // Obtener anuncios recientes (últimos 5 publicados)
      const { data: recentAnnouncements, error: recentError } = await supabase
        .from('announcements')
        .select(`
          *,
          announcement_roles(role)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentError) {
        return {
          data: null,
          error: 'Error al obtener anuncios recientes'
        };
      }

      // Obtener conteo de anuncios no leídos
      const { data: unreadCount, error: unreadError } = await supabase
        .rpc('get_unread_announcements_count', { user_uuid: user.id });

      if (unreadError) {
        return {
          data: null,
          error: 'Error al obtener conteo de no leídos'
        };
      }

      // Obtener conteo de anuncios urgentes no leídos
      const { data: urgentAnnouncements, error: urgentError } = await supabase
        .from('announcements')
        .select(`
          *,
          announcement_recipients!inner(user_id, is_read)
        `)
        .eq('status', 'published')
        .eq('priority', 'high')
        .eq('announcement_recipients.user_id', user.id)
        .eq('announcement_recipients.is_read', false);

      if (urgentError) {
        return {
          data: null,
          error: 'Error al obtener anuncios urgentes'
        };
      }

      // Obtener total de anuncios publicados
      const { data: totalPublished, error: totalError } = await supabase
        .from('announcements')
        .select('id', { count: 'exact' })
        .eq('status', 'published');

      if (totalError) {
        return {
          data: null,
          error: 'Error al obtener total de anuncios'
        };
      }

      const data: AnnouncementWidgetData = {
        recentAnnouncements: recentAnnouncements || [],
        unreadCount: unreadCount || 0,
        urgentCount: urgentAnnouncements?.length || 0,
        totalPublished: totalPublished?.length || 0
      };

      return {
        data,
        error: null
      };

    } catch (error) {
      return {
        data: null,
        error: 'Error de conexión al obtener datos de anuncios'
      };
    }
  }

  /**
   * Obtener conteo rápido de anuncios no leídos
   */
  static async getUnreadAnnouncementsCount(): Promise<{ count: number; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { count: 0, error: 'Usuario no autenticado' };
      }

      const { data: count, error } = await supabase
        .rpc('get_unread_announcements_count', { user_uuid: user.id });

      if (error) {
        return { count: 0, error: 'Error al obtener conteo' };
      }

      return { count: count || 0, error: null };

    } catch (error) {
      return { count: 0, error: 'Error de conexión' };
    }
  }
} 