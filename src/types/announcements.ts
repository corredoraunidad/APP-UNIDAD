// Tipos para el módulo de anuncios

// Tipos de prioridad
export type AnnouncementPriority = 'low' | 'medium' | 'high';

// Tipos de estado
export type AnnouncementStatus = 'draft' | 'published' | 'archived';

// Tipos de roles destinatarios
export type AnnouncementRoleType = 'admin' | 'admin_comercial' | 'admin_operaciones' | 'broker' | 'broker_externo';

// Interfaz principal de anuncio
export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  scheduled_at?: string | null;
  published_at?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Interfaz para anuncio con información de lectura
export interface AnnouncementWithReadStatus extends Announcement {
  announcement_recipients?: {
    user_id: string;
    is_read: boolean;
    read_at?: string | null;
  }[];
  isRead?: boolean;
  readAt?: string | null;
}


// Interfaz para destinatarios
export interface AnnouncementRecipient {
  id: string;
  announcement_id: string;
  user_id: string;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
}

// Interfaz para roles destinatarios
export interface AnnouncementRole {
  id: string;
  announcement_id: string;
  role: AnnouncementRoleType;
  created_at: string;
}

// Interfaz para crear un anuncio
export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  scheduled_at?: string;
  published_at?: string;
  target_roles: AnnouncementRoleType[];
}

// Interfaz para actualizar un anuncio
export interface UpdateAnnouncementRequest {
  id: string;
  title?: string;
  content?: string;
  priority?: AnnouncementPriority;
  status?: AnnouncementStatus;
  scheduled_at?: string;
  published_at?: string;
  target_roles?: AnnouncementRoleType[];
}

// Interfaz para respuesta de lista de anuncios
export interface AnnouncementListResponse {
  announcements: AnnouncementWithReadStatus[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Interfaz para respuesta de un anuncio
export interface AnnouncementResponse {
  announcement: Announcement;
  recipients: AnnouncementRecipient[];
  roles: AnnouncementRole[];
}

// Interfaz para filtros de búsqueda
export interface AnnouncementFilters {
  priority?: AnnouncementPriority;
  status?: AnnouncementStatus;
  search?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

// Interfaz para estadísticas de anuncios
export interface AnnouncementStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
  unread: number;
  by_priority: Record<AnnouncementPriority, number>;
}

// Interfaz para notificaciones de anuncios
export interface AnnouncementNotification {
  id: string;
  announcement_id: string;
  user_id: string;
  type: 'new' | 'updated' | 'reminder';
  is_read: boolean;
  created_at: string;
}

// Interfaz para respuesta de API
export interface AnnouncementApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}


// Interfaz para estado de lectura
export interface ReadStatusUpdate {
  announcement_id: string;
  user_id: string;
  is_read: boolean;
  read_at?: string;
}
