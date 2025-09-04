import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthContextType } from '../types';
import { AuthService } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar si hay un usuario guardado al inicializar
  useEffect(() => {
    const checkStoredUser = () => {
      try {
        const storedUser = AuthService.getStoredUser();
        if (storedUser) {
          // Confiar en localStorage - no verificar en BD en cada mount
          setUser(storedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        // Solo limpiar si hay error en localStorage
        AuthService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkStoredUser();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { user: loggedUser, error: loginError } = await AuthService.login(email, password);
      
      if (loggedUser && !loginError) {
        setUser(loggedUser);
        setIsAuthenticated(true);
        AuthService.storeUser(loggedUser);
        return { success: true };
      } else {
        const errorMessage = loginError || 'Error desconocido';
        setError(errorMessage);
        return { 
          success: false, 
          error: errorMessage
        };
      }
    } catch (error) {
      const errorMessage = 'Error de conexión. Intenta nuevamente.';
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    await AuthService.logout();
  };

  const updateUser = (userData: Partial<User>): void => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      AuthService.storeUser(updatedUser);
    }
  };

  // Verificación lazy - solo cuando sea realmente necesario
  const verifyUserInDB = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const currentUser = await AuthService.getUserProfile(user.email);
      if (currentUser) {
        // Actualizar datos si han cambiado
        setUser(currentUser);
        AuthService.storeUser(currentUser);
        return true;
      } else {
        // Usuario ya no existe, limpiar sesión
        await logout();
        return false;
      }
    } catch (error) {
      // En caso de error, mantener sesión local pero avisar
      console.warn('Error verificando usuario en BD:', error);
      return true; // Asumir que es válido para no interrumpir UX
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    updateUser,
    verifyUserInDB,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext; 