import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables de entorno de Supabase no encontradas');
}

// Cliente principal de Supabase (para usuarios normales)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Cliente admin de Supabase (para operaciones administrativas)
export const supabaseAdmin = supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Validar configuración admin
if (!supabaseAdmin) {
  // VITE_SUPABASE_SERVICE_ROLE_KEY no configurada. Funciones admin no disponibles.
}

// Tipos de la base de datos
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          nombres: string;
          apellido_paterno: string;
          apellido_materno: string | null;
          rol: 'admin' | 'admin_comercial' | 'broker';
          username: string | null;
          jefe_comercial_id: string | null;
          uf_vendida: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          nombres: string;
          apellido_paterno: string;
          apellido_materno?: string | null;
          rol: 'admin' | 'admin_comercial' | 'broker';
          username?: string | null;
          jefe_comercial_id?: string | null;
          uf_vendida?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          nombres?: string;
          apellido_paterno?: string;
          apellido_materno?: string | null;
          rol?: 'admin' | 'admin_comercial' | 'broker';
          username?: string | null;
          jefe_comercial_id?: string | null;
          uf_vendida?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
    };
  };
}
