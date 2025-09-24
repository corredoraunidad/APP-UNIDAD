export interface PaymentLink {
  id: string;
  name: string;
  url: string;
}

export interface PaymentMethod {
  id: string;
  created_at: string;
  updated_at: string;
  
  // Información de la empresa
  company_name: string;
  company_rut: string;
  
  // Enlaces de pago
  payment_links: PaymentLink[];
  
  // Datos bancarios
  bank_name: string;
  account_type: 'corriente' | 'vista' | 'ahorro';
  account_number: string;
  
  // Contacto
  contact_email?: string;
  
  // Cuenta USD
  usd_account_number?: string;
  usd_bank_name?: string;
  
  // Metadatos
  is_active: boolean;
  created_by?: string;
  updated_by?: string;

  // Adjuntos (IDs de tabla files)
  paymetmethodaAttachments?: string[];
}

export interface PaymentMethodFormData {
  company_name: string;
  company_rut: string;
  payment_links: PaymentLink[];
  bank_name: string;
  account_type: 'corriente' | 'vista' | 'ahorro';
  account_number: string;
  contact_email?: string;
  usd_account_number?: string;
  usd_bank_name?: string;
  // Adjuntos a enviar al crear
  paymetmethodaAttachments?: string[];
}