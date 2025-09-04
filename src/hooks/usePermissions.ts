
import { useAuth } from '../contexts/AuthContext';
import { 
  hasPermission, 
  hasModuleAccess, 
  getModulePermissions, 
  canWrite,
  type UserRole, 
  type Module, 
  type Action 
} from '../config/permissions';

export const usePermissions = () => {
  const { user } = useAuth();
  
  // Obtener el rol del usuario actual
  const userRole: UserRole = user?.rol || 'broker';
  
  // Función para verificar si el usuario tiene un permiso específico
  const can = (module: Module, action: Action): boolean => {
    return hasPermission(userRole, module, action);
  };
  
  // Función para verificar acceso a un módulo
  const canAccess = (module: Module): boolean => {
    return hasModuleAccess(userRole, module);
  };
  
  // Función para obtener todos los permisos de un módulo
  const getPermissions = (module: Module) => {
    return getModulePermissions(userRole, module);
  };
  
  // Función para verificar si puede escribir en un módulo
  const canWriteTo = (module: Module): boolean => {
    return canWrite(userRole, module);
  };
  
  // Función para verificar si es administrador
  const isAdmin = (): boolean => {
    return userRole === 'admin';
  };
  
  // Función para verificar si es admin comercial
  const isAdminComercial = (): boolean => {
    return userRole === 'admin_comercial';
  };
  
  // Función para verificar si es admin operaciones
  const isAdminOperaciones = (): boolean => {
    return userRole === 'admin_operaciones';
  };
  
  // Función para verificar si es broker
  const isBroker = (): boolean => {
    return userRole === 'broker' || userRole === 'broker_externo';
  };
  
  // Función para verificar si es broker externo específicamente
  const isBrokerExterno = (): boolean => {
    return userRole === 'broker_externo';
  };
  
  return {
    userRole,
    can,
    canAccess,
    getPermissions,
    canWriteTo,
    isAdmin,
    isAdminComercial,
    isAdminOperaciones,
    isBroker,
    isBrokerExterno
  };
}; 