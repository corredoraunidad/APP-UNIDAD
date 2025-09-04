import emailjs from '@emailjs/browser';


// Configuración de EmailJS desde variables de entorno
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// Validar que las variables de entorno estén configuradas
if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
  // Variables de entorno de EmailJS no configuradas correctamente
}

// Servicio de envío de emails
export class EmailService {
  
  /**
   * Inicializar EmailJS con la Public Key
   */
  private static initializeEmailJS() {
    try {
      emailjs.init(EMAILJS_PUBLIC_KEY);
    } catch (error) {
      throw new Error('Error en la inicialización de EmailJS');
    }
  }

  /**
   * Enviar credenciales de usuario por email
   */
  static async sendUserCredentials(
    userEmail: string,
    userData: {
      nombres: string;
      apellido_paterno: string;
      apellido_materno?: string | null;
    },
    credentials: {
      username: string;
      password: string;
    }
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      // Validar parámetros de entrada
      if (!userEmail || !userData.nombres || !userData.apellido_paterno || !credentials.username || !credentials.password) {
        return {
          success: false,
          error: 'Faltan datos requeridos para enviar el email'
        };
      }

      // Validar configuración de EmailJS
      if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
        return {
          success: false,
          error: 'Configuración de EmailJS incompleta'
        };
      }

      // Inicializar EmailJS
      this.initializeEmailJS();

      // Construir nombre completo
      const nombreCompleto = `${userData.nombres} ${userData.apellido_paterno}${
        userData.apellido_materno ? ` ${userData.apellido_materno}` : ''
      }`.trim();

      // Preparar parámetros del template
      const templateParams = {
        to_name: nombreCompleto,
        user_email: userEmail,
        username: credentials.username,
        password: credentials.password,
        current_year: new Date().getFullYear().toString(),
        to_email: userEmail // Para especificar destinatario
      };

      // Enviar email usando EmailJS
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      // Verificar respuesta exitosa
      if (response.status === 200) {
        return {
          success: true,
          error: null
        };
      } else {
        return {
          success: false,
          error: `Error del servidor de email: ${response.status}`
        };
      }

    } catch (error: any) {
      // Manejar errores específicos de EmailJS
      let errorMessage = 'Error enviando email';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.text) {
        errorMessage = error.text;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Función de prueba para verificar configuración de EmailJS
   */
  static async testEmailConfiguration(): Promise<{ success: boolean; error: string | null }> {
    try {

      // Verificar variables de entorno
      const config = {
        serviceId: EMAILJS_SERVICE_ID,
        templateId: EMAILJS_TEMPLATE_ID,
        publicKey: EMAILJS_PUBLIC_KEY
      };


      if (!config.serviceId || !config.templateId || !config.publicKey) {
        return {
          success: false,
          error: 'Faltan variables de entorno de EmailJS'
        };
      }

      // Intentar inicializar EmailJS
      this.initializeEmailJS();

      return {
        success: true,
        error: null
      };

    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Error en la configuración'
      };
    }
  }

  /**
   * Función para enviar email de prueba (desarrollo)
   */
  static async sendTestEmail(
    testEmail: string
  ): Promise<{ success: boolean; error: string | null }> {
    return this.sendUserCredentials(
      testEmail,
      {
        nombres: 'Usuario',
        apellido_paterno: 'Prueba',
        apellido_materno: 'Test'
      },
      {
        username: 'usuarioprueba',
        password: 'TempPassword123!'
      }
    );
  }
} 