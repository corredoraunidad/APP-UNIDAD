// Tipos para usuarios del sistema

export interface User {
  id: string;
  email: string;
  username: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string;
  telefono?: string;
  rut?: string;
  direccion?: string;
  comuna?: string;
  region?: number;
  fecha_nacimiento?: string;
  fecha_inicio_contrato?: string;
  fecha_registro: string;
  rol: 'admin' | 'admin_comercial' | 'admin_operaciones' | 'broker' | 'broker_externo';
  nuevas_ventas?: number;
  renovaciones?: number;
  uf_vendida?: number;
  comentarios?: string;
  jefe_comercial_id?: string | null;
  is_active: boolean;
}

export interface UserContract {
  id: string;
  file_id: string;
  created_at: string;
  updated_at: string;
}

export interface UserWithContract extends User {
  contract?: UserContract;
}

export interface CreateUserData {
  email: string;
  username: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string;
  telefono?: string;
  rut?: string;
  direccion?: string;
  comuna?: string;
  region?: number;
  fecha_nacimiento?: string;
  fecha_inicio_contrato?: string;
  nuevas_ventas?: number;
  renovaciones?: number;
  comentarios?: string;
  jefe_comercial_id?: string | null;
  is_active?: boolean;
  rol: 'admin' | 'admin_comercial' | 'admin_operaciones' | 'broker' | 'broker_externo';
  contractFile?: File | null;
}

export interface UpdateUserData {
  id: string;
  email: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string;
  telefono?: string;
  rut?: string;
  direccion?: string;
  comuna?: string;
  region?: number;
  fecha_nacimiento?: string;
  fecha_inicio_contrato?: string;
  nuevas_ventas?: number;
  renovaciones?: number;
  comentarios?: string;
  is_active?: boolean;
  username?: string;
  rol?: 'admin' | 'admin_comercial' | 'admin_operaciones' | 'broker' | 'broker_externo';
  uf_vendida?: number;
  jefe_comercial_id?: string | null;
}

export interface UserFilters {
  rol?: string;
  region?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  search?: string;
  page?: number;
  limit?: number;
}
