import { supabase, supabaseAdmin } from '../config/supabase';
import { ContractService } from './contractService';
import { EmailService } from './emailService';
import type { UserContract, CreateUserData, UpdateUserData, UserWithContract, UserFilters } from '../types';

// Función simple para validar RUT
const validarRutSimple = (rut: string): boolean => {
  if (!rut || rut.trim().length === 0) return true; // RUT es opcional
  
  // Limpiar RUT
  const rutLimpio = rut.replace(/[.-]/g, '');
  
  if (rutLimpio.length < 2) return false;
  
  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1).toUpperCase();
  
  if (!/^[0-9]+$/.test(cuerpo)) return false;
  
  let suma = 0;
  let multiplicador = 2;
  
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  
  const dvEsperado = 11 - (suma % 11);
  const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();
  
  return dvCalculado === dv;
};

// Servicio para gestión de usuarios
export class UserService {
  
  
  /**
   * Obtener todos los usuarios de la tabla profiles con contratos
   */
  static async getAllUsers(): Promise<{ users: UserWithContract[] | null; error: string | null }> {
    // Método legacy - usar getUsersWithFilters en su lugar
    return this.getUsersWithFilters({ page: 1, limit: 100 });
  }

  /**
   * Obtener usuarios con filtros y paginación
   */
  static async getUsersWithFilters(filters: UserFilters = {}): Promise<{ users: UserWithContract[] | null; total: number; page: number; limit: number; hasMore: boolean; error: string | null }> {
    try {
      const {
        rol,
        region,
        fecha_desde,
        fecha_hasta,
        search,
        estado,
        orden = 'alfabetico',
        direccion_orden = 'asc',
        page = 1,
        limit = 10
      } = filters;

      let query = supabase
        .from('profiles')
        .select('*');

      // Aplicar ordenamiento
      if (orden === 'alfabetico') {
        query = query.order('nombres', { ascending: direccion_orden === 'asc' });
        query = query.order('apellido_paterno', { ascending: direccion_orden === 'asc' });
      } else {
        query = query.order('created_at', { ascending: direccion_orden === 'asc' });
      }

      // Aplicar filtros
      if (rol) {
        query = query.eq('rol', rol);
      }
      if (region) {
        query = query.eq('region', region);
      }
      if (estado) {
        query = query.eq('is_active', estado === 'activo');
      }
      if (fecha_desde) {
        query = query.gte('fecha_registro', fecha_desde);
      }
      if (fecha_hasta) {
        query = query.lte('fecha_registro', fecha_hasta);
      }
      if (search) {
        query = query.or(`nombres.ilike.%${search}%,apellido_paterno.ilike.%${search}%,apellido_materno.ilike.%${search}%,email.ilike.%${search}%,username.ilike.%${search}%,rut.ilike.%${search}%`);
      }

      // Primero obtener el total de registros para la paginación (aplicando los mismos filtros)
      let countQuery = supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Aplicar los mismos filtros al conteo
      if (rol) {
        countQuery = countQuery.eq('rol', rol);
      }
      if (region) {
        countQuery = countQuery.eq('region', region);
      }
      if (estado) {
        countQuery = countQuery.eq('is_active', estado === 'activo');
      }
      if (fecha_desde) {
        countQuery = countQuery.gte('fecha_registro', fecha_desde);
      }
      if (fecha_hasta) {
        countQuery = countQuery.lte('fecha_registro', fecha_hasta);
      }
      if (search) {
        countQuery = countQuery.or(`nombres.ilike.%${search}%,apellido_paterno.ilike.%${search}%,apellido_materno.ilike.%${search}%,email.ilike.%${search}%,username.ilike.%${search}%,rut.ilike.%${search}%`);
      }

      const { count: totalCount } = await countQuery;

      // Paginación
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data: profiles, error } = await query;

      if (error) {
        console.error('Error en getUsersWithFilters:', error);
        return {
          users: null,
          total: 0,
          page,
          limit,
          hasMore: false,
          error: 'Error al cargar los usuarios'
        };
      }

      if (!profiles) {
        return {
          users: [],
          total: 0,
          page,
          limit,
          hasMore: false,
          error: null
        };
      }

      // Luego obtener los contratos activos para cada usuario
      const { data: contracts, error: contractsError } = await supabase
        .from('user_contracts')
        .select('*')
        .eq('is_active', true);

      if (contractsError) {
        console.error('Error al cargar contratos:', contractsError);
      }

      // Crear un mapa de contratos por usuario
      const contractsMap = new Map();
      if (contracts) {
        contracts.forEach(contract => {
          contractsMap.set(contract.user_id, contract);
        });
      }

      // Convertir profiles de BD a UserWithContract del frontend
      const users: UserWithContract[] = profiles.map(profile => ({
        id: profile.id,
        email: profile.email,
        nombres: profile.nombres,
        apellido_paterno: profile.apellido_paterno,
        apellido_materno: profile.apellido_materno,
        username: profile.username || `${profile.nombres.toLowerCase()}.${profile.apellido_paterno.toLowerCase()}`,
        rol: profile.rol,
        uf_vendida: Number(profile.uf_vendida) || 0,
        fecha_registro: profile.created_at || new Date().toISOString(),
        jefe_comercial_id: profile.jefe_comercial_id,
        
        // Nuevos campos
        rut: profile.rut,
        telefono: profile.telefono,
        direccion: profile.direccion,
        comuna: profile.comuna,
        region: profile.region,
        fecha_nacimiento: profile.fecha_nacimiento,
        fecha_inicio_contrato: profile.fecha_inicio_contrato,
        nuevas_ventas: Number(profile.nuevas_ventas) || 0,
        renovaciones: Number(profile.renovaciones) || 0,
        comentarios: profile.comentarios,
        is_active: profile.is_active ?? true, // Campo de estado activo
        
        // Contrato
        contract: contractsMap.get(profile.id) || null
      }));

      const total = totalCount || 0;
      const hasMore = (page * limit) < total;

      return {
        users,
        total,
        page,
        limit,
        hasMore,
        error: null
      };

    } catch (error) {
      console.error('Error en getAllUsers catch:', error);
              return {
          users: null,
          total: 0,
          page: 1,
          limit: 5,
          hasMore: false,
          error: 'Error de conexión al cargar usuarios'
        };
    }
  }

  /**
   * Obtener un usuario por ID con su contrato
   */
  static async getUserById(userId: string): Promise<{ user: UserWithContract | null; error: string | null }> {
    try {
      // Obtener el usuario
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !profile) {
        console.error('Error en getUserById:', error);
        return {
          user: null,
          error: 'Usuario no encontrado'
        };
      }

      // Obtener el contrato activo del usuario
      const { data: contract, error: contractError } = await supabase
        .from('user_contracts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (contractError && contractError.code !== 'PGRST116') {
        console.error('Error al cargar contrato:', contractError);
      }

      const user: UserWithContract = {
        id: profile.id,
        email: profile.email,
        nombres: profile.nombres,
        apellido_paterno: profile.apellido_paterno,
        apellido_materno: profile.apellido_materno,
        username: profile.username || `${profile.nombres.toLowerCase()}.${profile.apellido_paterno.toLowerCase()}`,
        rol: profile.rol,
        uf_vendida: Number(profile.uf_vendida) || 0,
        fecha_registro: profile.created_at || new Date().toISOString(),
        jefe_comercial_id: profile.jefe_comercial_id,
        
        // Nuevos campos
        rut: profile.rut,
        telefono: profile.telefono,
        direccion: profile.direccion,
        comuna: profile.comuna,
        region: profile.region,
        fecha_nacimiento: profile.fecha_nacimiento,
        fecha_inicio_contrato: profile.fecha_inicio_contrato,
        nuevas_ventas: Number(profile.nuevas_ventas) || 0,
        renovaciones: Number(profile.renovaciones) || 0,
        comentarios: profile.comentarios,
        is_active: profile.is_active ?? true, // Campo de estado activo
        
        // Contrato
        contract: contract || null
      };

      return {
        user,
        error: null
      };

    } catch (error) {
      console.error('Error en getUserById catch:', error);
      return {
        user: null,
        error: 'Error al cargar el usuario'
      };
    }
  }

  /**
   * Crear registro de contrato en la base de datos
   */
  static async createContractRecord(
    userId: string, 
    contractPath: string
  ): Promise<{ contract: UserContract | null; error: string | null }> {
    try {
      const { data: contract, error } = await supabase
        .from('user_contracts')
        .insert([{
          user_id: userId,
          file_path: contractPath, // Ruta del contrato en el bucket 'contracts'
          is_active: true,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error || !contract) {
        return {
          contract: null,
          error: error?.message || 'Error al crear registro de contrato'
        };
      }

      return {
        contract,
        error: null
      };

    } catch (error) {
      return {
        contract: null,
        error: 'Error de conexión al crear contrato'
      };
    }
  }

  /**
   * Crear un nuevo usuario completo (con contrato opcional para corredores)
   */
  static async createUserComplete(userData: CreateUserData): Promise<{ 
    user: UserWithContract | null; 
    credentials: { username: string; password: string } | null;
    error: string | null 
  }> {
    try {
      // Verificar que se proporcione un contrato solo para corredores
      if (userData.rol === 'broker' && !userData.contractFile) {
        return {
          user: null,
          credentials: null,
          error: 'El contrato firmado es obligatorio para corredores'
        };
      }

      // Verificar que el archivo sea PDF (solo si se proporciona un contrato)
      if (userData.contractFile && userData.contractFile.type !== 'application/pdf') {
        return {
          user: null,
          credentials: null,
          error: 'El contrato debe ser un archivo PDF'
        };
      }

      // Paso 0: Verificar que el email no existe
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', userData.email)
        .single();

      if (existingUser) {
        return {
          user: null,
          credentials: null,
          error: 'Ya existe un usuario con este correo electrónico'
        };
      }

      // Paso 1: Generar username único
      const { username, error: usernameError } = await this.generateUsername(
        userData.nombres,
        userData.apellido_paterno,
        userData.apellido_materno
      );

      if (usernameError || !username) {
        return {
          user: null,
          credentials: null,
          error: usernameError || 'Error generando username'
        };
      }

      // Paso 2: Generar contraseña temporal
      const { password, error: passwordError } = this.generateTemporaryPassword(
        userData.nombres,
        userData.apellido_paterno,
        userData.apellido_materno
      );

      if (passwordError || !password) {
        return {
          user: null,
          credentials: null,
          error: passwordError || 'Error generando contraseña'
        };
      }

      // Paso 3: Crear usuario en Supabase Auth
      if (!supabaseAdmin) {
        return {
          user: null,
          credentials: null,
          error: 'Configuración admin de Supabase no disponible'
        };
      }

      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: password,
        email_confirm: true,
        user_metadata: {
          nombres: userData.nombres,
          apellido_paterno: userData.apellido_paterno,
          apellido_materno: userData.apellido_materno,
          username: username,
          rol: userData.rol,
          temp_password: password,
          first_login: true
        }
      });

      if (authError || !authData.user) {
        return {
          user: null,
          credentials: null,
          error: authError?.message || 'Error creando usuario en sistema de autenticación'
        };
      }

      // Paso 4: Crear perfil en la tabla profiles
      const profileData = {
        id: authData.user.id,
        email: userData.email,
        nombres: userData.nombres,
        apellido_paterno: userData.apellido_paterno,
        apellido_materno: userData.apellido_materno,
        username: username,
        rol: userData.rol,
        uf_vendida: 0,
        jefe_comercial_id: userData.jefe_comercial_id || null,
        
        // Nuevos campos
        rut: userData.rut && validarRutSimple(userData.rut) ? userData.rut.replace(/[.-]/g, '') : null,
        telefono: userData.telefono || null,
        direccion: userData.direccion || null,
        comuna: userData.comuna || null,
        region: userData.region || null,
        fecha_nacimiento: userData.fecha_nacimiento || null,
        fecha_inicio_contrato: userData.fecha_inicio_contrato || null,
        nuevas_ventas: userData.nuevas_ventas || 0,
        renovaciones: userData.renovaciones || 0,
        comentarios: userData.comentarios || null,
        is_active: userData.is_active ?? true // Campo de estado activo
      };



      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (profileError || !profile) {
        // Rollback: Eliminar usuario de auth si falla profiles
        try {
          await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        } catch (rollbackError) {
          // Manejar error de rollback silenciosamente
        }
        
        return {
          user: null,
          credentials: null,
          error: profileError?.message || 'Error creando perfil de usuario'
        };
      }

      // Paso 5: Subir contrato usando ContractService (solo si hay archivo de contrato)
      let contractPath = null;
      let contract = null;

      if (userData.contractFile) {
        const { success: uploadSuccess, data: uploadData, error: uploadError } = await ContractService.uploadContract(
          authData.user.id,
          userData.contractFile
        );

        if (!uploadSuccess || !uploadData) {
          // Rollback: Eliminar usuario si falla la subida del contrato
          try {
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
            await supabase.from('profiles').delete().eq('id', authData.user.id);
          } catch (rollbackError) {
            // Manejar error de rollback silenciosamente
          }
          
          return {
            user: null,
            credentials: null,
            error: uploadError || 'Error al subir contrato'
          };
        }

        contractPath = uploadData.path;

        // Paso 6: Crear registro de contrato en BD
        const { contract: contractData, error: contractError } = await this.createContractRecord(
          authData.user.id,
          contractPath
        );

        if (contractError || !contractData) {
          // Rollback: Eliminar usuario y contrato si falla el registro del contrato
          try {
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
            await supabase.from('profiles').delete().eq('id', authData.user.id);
            await ContractService.deleteContract(contractPath);
          } catch (rollbackError) {
            // Manejar error de rollback silenciosamente
          }
          
          return {
            user: null,
            credentials: null,
            error: contractError || 'Error al registrar contrato'
          };
        }

        contract = contractData;
      }

      // Paso 7: Enviar credenciales por email
      const { success: emailSuccess, error: emailError } = await EmailService.sendUserCredentials(
        userData.email,
        {
          nombres: userData.nombres,
          apellido_paterno: userData.apellido_paterno,
          apellido_materno: userData.apellido_materno
        },
        {
          username,
          password
        }
      );

      // Convertir profile a UserWithContract
      const user: UserWithContract = {
        id: profile.id,
        email: profile.email,
        nombres: profile.nombres,
        apellido_paterno: profile.apellido_paterno,
        apellido_materno: profile.apellido_materno,
        username: profile.username,
        rol: profile.rol,
        uf_vendida: Number(profile.uf_vendida) || 0,
        fecha_registro: profile.created_at || new Date().toISOString(),
        jefe_comercial_id: profile.jefe_comercial_id,
        
        // Nuevos campos
        rut: profile.rut,
        telefono: profile.telefono,
        direccion: profile.direccion,
        comuna: profile.comuna,
        region: profile.region,
        fecha_nacimiento: profile.fecha_nacimiento,
        fecha_inicio_contrato: profile.fecha_inicio_contrato,
        nuevas_ventas: Number(profile.nuevas_ventas) || 0,
        renovaciones: Number(profile.renovaciones) || 0,
        comentarios: profile.comentarios,
        is_active: profile.is_active ?? true, // Campo de estado activo
        
        // Contrato
        contract: contract || undefined
      };

      return {
        user,
        credentials: {
          username,
          password
        },
        error: emailSuccess ? null : `Usuario creado exitosamente, pero falló el envío de email: ${emailError}`
      };

    } catch (error) {
      return {
        user: null,
        credentials: null,
        error: 'Error general en la creación del usuario'
      };
    }
  }

  /**
   * Actualizar un usuario existente
   */
  static async updateUser(userId: string, userData: UpdateUserData): Promise<{ user: UserWithContract | null; error: string | null }> {
    try {
      const updateData: any = {};
      
      // Campos básicos
      if (userData.email) updateData.email = userData.email;
      if (userData.nombres) updateData.nombres = userData.nombres;
      if (userData.apellido_paterno) updateData.apellido_paterno = userData.apellido_paterno;
      if (userData.apellido_materno !== undefined) updateData.apellido_materno = userData.apellido_materno;
      if (userData.username) updateData.username = userData.username;
      if (userData.rol) updateData.rol = userData.rol;
      if (userData.uf_vendida !== undefined) updateData.uf_vendida = userData.uf_vendida;
      if (userData.jefe_comercial_id !== undefined) updateData.jefe_comercial_id = userData.jefe_comercial_id;
      
      // Nuevos campos
      if (userData.rut !== undefined) updateData.rut = userData.rut;
      if (userData.telefono !== undefined) updateData.telefono = userData.telefono;
      if (userData.direccion !== undefined) updateData.direccion = userData.direccion;
      if (userData.comuna !== undefined) updateData.comuna = userData.comuna;
      if (userData.region !== undefined) updateData.region = userData.region;
      if (userData.fecha_nacimiento !== undefined) updateData.fecha_nacimiento = userData.fecha_nacimiento;
      if (userData.fecha_inicio_contrato !== undefined) updateData.fecha_inicio_contrato = userData.fecha_inicio_contrato;
      if (userData.nuevas_ventas !== undefined) updateData.nuevas_ventas = userData.nuevas_ventas;
      if (userData.renovaciones !== undefined) updateData.renovaciones = userData.renovaciones;
      if (userData.comentarios !== undefined) updateData.comentarios = userData.comentarios;
      if (userData.is_active !== undefined) updateData.is_active = userData.is_active;

      // Primero actualizar el perfil
      const { data: profile, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select('*')
        .single();

      if (error || !profile) {
        return {
          user: null,
          error: error?.message || 'Error al actualizar el usuario'
        };
      }

      // Luego obtener el contrato activo del usuario
      const { data: contract, error: contractError } = await supabase
        .from('user_contracts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (contractError && contractError.code !== 'PGRST116') {
        console.error('Error al cargar contrato:', contractError);
      }

      const user: UserWithContract = {
        id: profile.id,
        email: profile.email,
        nombres: profile.nombres,
        apellido_paterno: profile.apellido_paterno,
        apellido_materno: profile.apellido_materno,
        username: profile.username || `${profile.nombres.toLowerCase()}.${profile.apellido_paterno.toLowerCase()}`,
        rol: profile.rol,
        uf_vendida: Number(profile.uf_vendida) || 0,
        fecha_registro: profile.created_at || new Date().toISOString(),
        jefe_comercial_id: profile.jefe_comercial_id,
        
        // Nuevos campos
        rut: profile.rut,
        telefono: profile.telefono,
        direccion: profile.direccion,
        comuna: profile.comuna,
        region: profile.region,
        fecha_nacimiento: profile.fecha_nacimiento,
        fecha_inicio_contrato: profile.fecha_inicio_contrato,
        nuevas_ventas: Number(profile.nuevas_ventas) || 0,
        renovaciones: Number(profile.renovaciones) || 0,
        comentarios: profile.comentarios,
        is_active: profile.is_active ?? true, // Campo de estado activo
        
        // Contrato
        contract: contract || null
      };

      return {
        user,
        error: null
      };

    } catch (error) {
      return {
        user: null,
        error: 'Error de conexión al actualizar usuario'
      };
    }
  }

  /**
   * Eliminar un usuario
   */
  static async deleteUser(userId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      // Primero, obtener el email del usuario para eliminarlo de Supabase Auth
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();

      if (fetchError || !profile) {
        return {
          success: false,
          error: 'Usuario no encontrado'
        };
      }

      // Eliminar de Supabase Auth usando el cliente admin
      if (supabaseAdmin) {
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (authError) {
          return {
            success: false,
            error: `Error al eliminar usuario de Auth: ${authError.message}`
          };
        }
      }

      // Eliminar de la tabla profiles
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        return {
          success: false,
          error: error.message || 'Error al eliminar el usuario'
        };
      }

      return {
        success: true,
        error: null
      };

    } catch (error) {
      return {
        success: false,
        error: 'Error de conexión al eliminar usuario'
      };
    }
  }


  // ========================================
  // FUNCIONES PARA CREACIÓN AUTOMÁTICA DE USUARIOS
  // ========================================

  /**
   * Helper: Verificar si un username ya existe en la BD
   */
  private static async checkUsernameExists(username: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();

      // Si no hay error y hay data, significa que existe
      return !error && !!data;
    } catch (error) {
      // Si hay error, asumimos que no existe para evitar bloqueos
      return false;
    }
  }

  /**
   * Generar username único basado en nombres y apellidos
   * Formato: [primera_letra_nombres][apellido_paterno][primera_letra_apellido_materno]
   * Si existe, agrega números secuenciales: username1, username2, etc.
   */
  static async generateUsername(
    nombres: string, 
    apellidoPaterno: string, 
    apellidoMaterno?: string | null
  ): Promise<{ username: string | null; error: string | null }> {
    try {
      // Limpiar y normalizar los datos de entrada
      const nombresClean = nombres.trim().toLowerCase();
      const apellidoPaternoClean = apellidoPaterno.trim().toLowerCase();
      const apellidoMaternoClean = apellidoMaterno?.trim().toLowerCase() || '';

      // Validar que tenemos datos mínimos
      if (!nombresClean || !apellidoPaternoClean) {
        return {
          username: null,
          error: 'Nombres y apellido paterno son requeridos para generar username'
        };
      }

      // Generar username base
      // Primera letra de nombres + apellido paterno completo + primera letra apellido materno
      const primeraLetraNombres = nombresClean.charAt(0);
      const primeraLetraMaterno = apellidoMaternoClean ? apellidoMaternoClean.charAt(0) : '';
      
      let usernameBase = primeraLetraNombres + apellidoPaternoClean + primeraLetraMaterno;
      
      // Limpiar caracteres especiales y espacios
      usernameBase = usernameBase.replace(/[^a-z0-9]/g, '');

      // Validar longitud mínima
      if (usernameBase.length < 3) {
        return {
          username: null,
          error: 'No se puede generar un username válido con los datos proporcionados'
        };
      }

      // Verificar disponibilidad del username base
      let usernameCandidate = usernameBase;
      let counter = 0;
      const maxAttempts = 100; // Límite de seguridad

      while (counter < maxAttempts) {
        const exists = await this.checkUsernameExists(usernameCandidate);
        
        if (!exists) {
          // Username disponible!
          return {
            username: usernameCandidate,
            error: null
          };
        }

        // Username ocupado, intentar con número
        counter++;
        usernameCandidate = usernameBase + counter;
      }

      // Si llegamos aquí, no pudimos generar un username único
      return {
        username: null,
        error: 'No se pudo generar un username único después de múltiples intentos'
      };

    } catch (error) {
      return {
        username: null,
        error: 'Error al generar username'
      };
    }
  }

  /**
   * Generar contraseña temporal segura
   * Formato: [Mayúscula][base_personalizada][3_números][carácter_especial]
   */
  static generateTemporaryPassword(
    nombres: string, 
    apellidoPaterno: string, 
    apellidoMaterno?: string | null
  ): { password: string | null; error: string | null } {
    try {
      // Limpiar y normalizar datos
      const nombresClean = nombres.trim();
      const apellidoPaternoClean = apellidoPaterno.trim();
      const apellidoMaternoClean = apellidoMaterno?.trim() || '';

      if (!nombresClean || !apellidoPaternoClean) {
        return {
          password: null,
          error: 'Nombres y apellido paterno son requeridos para generar contraseña'
        };
      }

      // Crear base similar al username pero con mayúscula inicial
      const primeraLetraNombres = nombresClean.charAt(0).toUpperCase();
      const apellidoPaternoLower = apellidoPaternoClean.toLowerCase();
      const primeraLetraMaterno = apellidoMaternoClean ? apellidoMaternoClean.charAt(0).toLowerCase() : '';
      
      // Base de la contraseña: Primera letra mayúscula + resto
      const passwordBase = primeraLetraNombres + apellidoPaternoLower + primeraLetraMaterno;
      
      // Generar 3 números aleatorios
      const numeros = Math.floor(Math.random() * 900) + 100; // Entre 100-999
      
      // Array de caracteres especiales seguros
      const caracteresEspeciales = ['!', '@', '#', '$', '%', '&', '*', '+', '=', '?'];
      const caracterEspecial = caracteresEspeciales[Math.floor(Math.random() * caracteresEspeciales.length)];
      
      // Ensamblar contraseña final
      const password = passwordBase + numeros + caracterEspecial;
      
      // Validar longitud mínima de seguridad
      if (password.length < 8) {
        return {
          password: null,
          error: 'No se puede generar una contraseña segura con los datos proporcionados'
        };
      }

      return {
        password,
        error: null
      };

    } catch (error) {
      return {
        password: null,
        error: 'Error al generar contraseña temporal'
      };
    }
  }

  /**
   * Cambiar el estado activo/inactivo de un usuario
   */
  static async toggleUserStatus(userId: string, isActive: boolean): Promise<{ success: boolean; error: string | null }> {
    try {
      // Verificar que el usuario existe
      const { data: existingUser, error: fetchError } = await supabase
        .from('profiles')
        .select('id, is_active')
        .eq('id', userId)
        .single();

      if (fetchError || !existingUser) {
        return {
          success: false,
          error: 'Usuario no encontrado'
        };
      }

      // Actualizar el estado del usuario
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_active: isActive })
        .eq('id', userId);

      if (updateError) {
        console.error('Error al actualizar estado del usuario:', updateError);
        return {
          success: false,
          error: 'Error al actualizar el estado del usuario'
        };
      }

      return {
        success: true,
        error: null
      };

    } catch (error) {
      console.error('Error en toggleUserStatus:', error);
      return {
        success: false,
        error: 'Error de conexión al cambiar estado del usuario'
      };
    }
  }
} 