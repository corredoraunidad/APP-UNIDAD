import type { User } from '../types';

/**
 * Verifica si un usuario puede eliminar a otro usuario
 */
export const canDeleteUser = (currentUser: User, targetUser: User): boolean => {
  // No puede eliminarse a sí mismo
  if (currentUser.id === targetUser.id) return false;
  
  // Admin puede eliminar a todos
  if (currentUser.rol === 'admin') return true;
  
  // Admin_comercial solo puede eliminar brokers
  if (currentUser.rol === 'admin_comercial' && targetUser.rol === 'broker') return true;
  
  // Admin_operaciones no puede eliminar a nadie
  // Broker no puede eliminar a nadie
  return false;
};

/**
 * Verifica si un usuario puede actualizar a otro usuario
 */
export const canUpdateUser = (currentUser: User, targetUser: User): boolean => {
  // Puede actualizar su propio perfil
  if (currentUser.id === targetUser.id) return true;
  
  // Admin puede actualizar a todos
  if (currentUser.rol === 'admin') return true;
  
  // Admin_comercial solo puede actualizar brokers
  if (currentUser.rol === 'admin_comercial' && targetUser.rol === 'broker') return true;
  
  // Admin_operaciones no puede actualizar a nadie más
  // Broker no puede actualizar a nadie más
  return false;
};

/**
 * Verifica si un usuario puede crear un usuario con un rol específico
 */
export const canCreateUser = (currentUser: User, targetRole: string): boolean => {
  // Admin puede crear cualquier tipo de usuario
  if (currentUser.rol === 'admin') return true;
  
  // Admin_comercial solo puede crear brokers
  if (currentUser.rol === 'admin_comercial' && targetRole === 'broker') return true;
  
  // Admin_operaciones y broker no pueden crear usuarios
  return false;
};

/**
 * Verifica si un usuario puede cambiar el estado (activar/desactivar) de otro usuario
 */
export const canChangeUserStatus = (currentUser: User, targetUser: User): boolean => {
  // No puede cambiar su propio estado
  if (currentUser.id === targetUser.id) return false;
  
  // Admin puede cambiar el estado de todos
  if (currentUser.rol === 'admin') return true;
  
  // Admin_comercial solo puede cambiar el estado de brokers
  if (currentUser.rol === 'admin_comercial' && targetUser.rol === 'broker') return true;
  
  // Admin_operaciones no puede cambiar el estado de nadie
  // Broker no puede cambiar el estado de nadie
  return false;
};
