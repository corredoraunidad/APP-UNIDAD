import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  unreadCount: number;
  refreshBadge: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

function NotificationProvider({ children }: NotificationProviderProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const { isAuthenticated, user } = useAuth();

  // Función simple para actualizar badge - SIN INTERVALOS
  const refreshBadge = async (): Promise<void> => {
    if (!isAuthenticated || !user) {
      setUnreadCount(0);
      return;
    }

    try {
      const { data, error } = await supabase
        .rpc('get_unread_announcements_count', { user_uuid: user.id });
      
      if (!error) {
        setUnreadCount(data || 0);
      }
    } catch (error) {
      // Silenciar errores para evitar spam
      console.warn('Error refreshing badge:', error);
    }
  };

  // Solo cargar al inicializar - NO INTERVALOS
  useEffect(() => {
    if (isAuthenticated) {
      refreshBadge();
    } else {
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  // Suscripción en tiempo real SOLO a nuevos anuncios
  useEffect(() => {
    if (!isAuthenticated) return;

    const channel = supabase
      .channel('announcement_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT', // Solo nuevos anuncios
          schema: 'public',
          table: 'announcements'
        },
        () => {
          // Refrescar badge cuando se crea un anuncio nuevo
          refreshBadge();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated]);

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshBadge }}>
      {children}
    </NotificationContext.Provider>
  );
}

function useNotificationContext(): NotificationContextType {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  
  return context;
}

export { NotificationProvider, useNotificationContext };