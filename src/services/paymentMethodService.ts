import { supabase } from '../config/supabase';
import type { PaymentMethod, PaymentMethodFormData } from '../types/metodos-pago';

export class PaymentMethodsService {
  
  /**
   * Obtener todos los métodos de pago activos
   */
  static async getAll(): Promise<{paymentMethods: PaymentMethod[], error?: string}> {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true)
        .order('company_name', { ascending: true });

      if (error) {
        console.error('Error fetching payment methods:', error);
        return { paymentMethods: [], error: error.message };
      }

      return { paymentMethods: data || [] };
    } catch (error: any) {
      console.error('Error in getAll:', error);
      return { paymentMethods: [], error: error.message };
    }
  }

  /**
   * Obtener un método de pago por ID
   */
  static async getById(id: string): Promise<{paymentMethod?: PaymentMethod, error?: string}> {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching payment method:', error);
        return { error: error.message };
      }

      return { paymentMethod: data };
    } catch (error: any) {
      console.error('Error in getById:', error);
      return { error: error.message };
    }
  }

  /**
   * Crear un nuevo método de pago
   */
  static async create(data: PaymentMethodFormData): Promise<{paymentMethod?: PaymentMethod, error?: string}> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { data: result, error } = await supabase
        .from('payment_methods')
        .insert([{
          ...data,
          is_active: true, // Establecer como activo por defecto
          created_by: user?.user?.id,
          updated_by: user?.user?.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating payment method:', error);
        return { error: error.message };
      }

      return { paymentMethod: result };
    } catch (error: any) {
      console.error('Error in create:', error);
      return { error: error.message };
    }
  }

  /**
   * Actualizar un método de pago
   */
  static async update(id: string, data: Partial<PaymentMethodFormData>): Promise<{success: boolean, error?: string}> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('payment_methods')
        .update({
          ...data,
          updated_by: user?.user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating payment method:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error in update:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Eliminar un método de pago (soft delete)
   */
  static async delete(id: string): Promise<{success: boolean, error?: string}> {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        console.error('Error deleting payment method:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error in delete:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Alternar estado activo/inactivo
   */
  static async toggleActive(id: string): Promise<{success: boolean, error?: string}> {
    try {
      // Primero obtenemos el estado actual
      const { data: current, error: fetchError } = await supabase
        .from('payment_methods')
        .select('is_active')
        .eq('id', id)
        .single();

      if (fetchError) {
        return { success: false, error: fetchError.message };
      }

      // Alternar el estado
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_active: !current.is_active })
        .eq('id', id);

      if (error) {
        console.error('Error toggling payment method status:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error in toggleActive:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener todos los métodos de pago (incluyendo inactivos) - Solo para admins
   */
  static async getAllWithInactive(): Promise<{paymentMethods: PaymentMethod[], error?: string}> {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('company_name', { ascending: true });

      if (error) {
        console.error('Error fetching all payment methods:', error);
        return { paymentMethods: [], error: error.message };
      }

      return { paymentMethods: data || [] };
    } catch (error: any) {
      console.error('Error in getAllWithInactive:', error);
      return { paymentMethods: [], error: error.message };
    }
  }
}