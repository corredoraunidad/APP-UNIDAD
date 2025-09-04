import { supabase } from '../config/supabase';
import type { User } from '../types';

// Servicio de autenticación
export class AuthService {
  
  /**
   * Login con email y password usando Supabase Auth
   */
  static async login(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    try {
      // Usar Supabase Auth para autenticación
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: password
      });

      if (authError || !authData.user) {
        return {
          user: null,
          error: 'Credenciales inválidas'
        };
      }

      // Obtener el perfil del usuario usando el email
      const userProfile = await this.getUserProfile(authData.user.email || '');

      if (!userProfile) {
        // Si no existe perfil, cerrar sesión y retornar error
        await supabase.auth.signOut();
        return {
          user: null,
          error: 'Usuario no encontrado en el sistema'
        };
      }

      return {
        user: userProfile,
        error: null
      };

    } catch (error) {
      return {
        user: null,
        error: 'Error de conexión. Intenta nuevamente.'
      };
    }
  }

  /**
   * Obtener perfil de usuario por email (más confiable para este caso)
   */
  static async getUserProfile(userEmail: string): Promise<User | null> {
    try {
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', userEmail.toLowerCase().trim())
        .single();

      if (error || !profile) {
        return null;
      }

      // Verificar que el usuario esté activo
      if (profile.is_active === false) {
        return null; // Usuario inactivo
      }

      return {
        id: profile.id,
        email: profile.email,
        nombres: profile.nombres,
        apellido_paterno: profile.apellido_paterno,
        apellido_materno: profile.apellido_materno,
        username: profile.username || 'admin',
        rol: profile.rol,
        uf_vendida: Number(profile.uf_vendida) || 0,
        fecha_registro: profile.created_at || new Date().toISOString(),
        jefe_comercial_id: profile.jefe_comercial_id,
        is_active: profile.is_active ?? true
      };

    } catch (error) {
      return null;
    }
  }

  /**
   * Logout (cerrar sesión de Supabase y limpiar sesión local)
   */
  static async logout(): Promise<void> {
    try {
      // Cerrar sesión en Supabase Auth
      await supabase.auth.signOut();
    } catch (error) {
      // Manejar error silenciosamente
    }
    
    // Limpiar localStorage
    localStorage.removeItem('unidad_user');
    localStorage.removeItem('unidad_session');
  }

  /**
   * Verificar si hay una sesión activa (con timeout)
   */
  static getStoredUser(): User | null {
    try {
      const storedUser = localStorage.getItem('unidad_user');
      const sessionTime = localStorage.getItem('unidad_session');
      
      if (!storedUser || !sessionTime) {
        return null;
      }

      // Verificar timeout de sesión (24 horas)
      const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 horas en millisegundos
      const sessionDate = new Date(sessionTime);
      const now = new Date();
      
      if (now.getTime() - sessionDate.getTime() > SESSION_TIMEOUT) {
        // Sesión expirada, limpiar localStorage
        this.logout();
        return null;
      }

      return JSON.parse(storedUser);
    } catch (error) {
      // Si hay error, limpiar localStorage por seguridad
      this.logout();
      return null;
    }
  }

  /**
   * Guardar usuario en localStorage (actualiza timestamp de sesión)
   */
  static storeUser(user: User): void {
    localStorage.setItem('unidad_user', JSON.stringify(user));
    localStorage.setItem('unidad_session', new Date().toISOString());
  }

  /**
   * Cambiar contraseña del usuario actual
   */
  static async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error: string | null }> {
    try {

      // Obtener usuario actual
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !currentUser) {
        return {
          success: false,
          error: 'No se pudo obtener la información del usuario actual'
        };
      }

      // Verificar contraseña actual
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: currentUser.email || '',
        password: currentPassword
      });

      if (verifyError) {
        return {
          success: false,
          error: 'La contraseña actual es incorrecta'
        };
      }

      // Cambiar contraseña
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        return {
          success: false,
          error: updateError.message || 'Error al cambiar la contraseña'
        };
      }

      return {
        success: true,
        error: null
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Error de conexión al cambiar contraseña'
      };
    }
  }
} 