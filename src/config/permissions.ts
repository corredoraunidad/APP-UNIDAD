// Tipos de roles disponibles
export type UserRole = 'admin' | 'admin_comercial' | 'admin_operaciones' | 'broker';

// Tipos de acciones disponibles
export type Action = 'view' | 'create' | 'edit' | 'delete' | 'upload' | 'download';

// Tipos de módulos disponibles
export type Module = 'dashboard' | 'usuarios' | 'archivos' | 'anuncios' | 'asistencias_siniestros' | 'metodos_pago';

// Interfaz para definir permisos de un módulo
export interface ModulePermissions {
  [action: string]: boolean;
}

// Interfaz para definir permisos de un rol
export interface RolePermissions {
  [module: string]: ModulePermissions;
}

// Configuración de permisos por rol
export const PERMISSIONS: Record<UserRole, RolePermissions> = {
  // Administrador - Acceso completo a todo
  admin: {
    dashboard: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      upload: true,
      download: true
    },
    usuarios: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      upload: false,
      download: false
    },
    archivos: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      upload: true,
      download: true
    },
    anuncios: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      upload: true,
      download: true
    },
    asistencias_siniestros: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      upload: false,
      download: false
    },
    metodos_pago: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      upload: false,
      download: false
    }
  },

  // Admin Comercial - Acceso completo excepto eliminación de usuarios
  admin_comercial: {
    dashboard: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      upload: true,
      download: true
    },
    usuarios: {
      view: true,
      create: true,
      edit: true,
      delete: false, // No puede eliminar usuarios
      upload: false,
      download: false
    },
    archivos: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      upload: true,
      download: true
    },
    anuncios: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      upload: true,
      download: true
    },
    asistencias_siniestros: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      upload: false,
      download: false
    },
    metodos_pago: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      upload: false,
      download: false
    }
  },

  // Admin Operaciones - Acceso completo a todos los módulos
  admin_operaciones: {
    dashboard: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      upload: true,
      download: true
    },
    usuarios: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      upload: false,
      download: false
    },
    archivos: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      upload: true,
      download: true
    },
    anuncios: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      upload: true,
      download: true
    },
    asistencias_siniestros: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      upload: false,
      download: false
    },
    metodos_pago: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      upload: false,
      download: false
    }
  },

  // Broker - Solo lectura en archivos, acceso limitado
  broker: {
    dashboard: {
      view: true,
      create: false,
      edit: false,
      delete: false,
      upload: false,
      download: true
    },
    usuarios: {
      view: false,
      create: false,
      edit: false,
      delete: false,
      upload: false,
      download: false
    },
    archivos: {
      view: true,
      create: false,
      edit: false,
      delete: false,
      upload: false,
      download: true
    },
    anuncios: {
      view: true,
      create: false,
      edit: false,
      delete: false,
      upload: false,
      download: true
    },
    asistencias_siniestros: {
      view: true,
      create: false,
      edit: false,
      delete: false,
      upload: false,
      download: false
    },
    metodos_pago: {
      view: true,
      create: false,
      edit: false,
      delete: false,
      upload: false,
      download: false
    }
  },

};

// Función helper para verificar permisos
export const hasPermission = (
  userRole: UserRole,
  module: Module,
  action: Action
): boolean => {
  const rolePermissions = PERMISSIONS[userRole];
  if (!rolePermissions) return false;

  const modulePermissions = rolePermissions[module];
  if (!modulePermissions) return false;

  return modulePermissions[action] || false;
};

// Función helper para verificar acceso a módulo
export const hasModuleAccess = (userRole: UserRole, module: Module): boolean => {
  return hasPermission(userRole, module, 'view');
};

// Función helper para obtener permisos de un módulo
export const getModulePermissions = (
  userRole: UserRole,
  module: Module
): ModulePermissions => {
  const rolePermissions = PERMISSIONS[userRole];
  if (!rolePermissions) return {};

  return rolePermissions[module] || {};
};

// Función helper para verificar si un rol puede realizar acciones de escritura
export const canWrite = (userRole: UserRole, module: Module): boolean => {
  return hasPermission(userRole, module, 'create') || 
         hasPermission(userRole, module, 'edit') || 
         hasPermission(userRole, module, 'upload');
}; 