import { useAuth } from './useAuth';

interface ModuleTexts {
  title: string;
  description: string;
  dashboardTitle: string;
  dashboardDescription: string;
}

export const useModuleTexts = (module: string): ModuleTexts => {
  const { user } = useAuth();
  const userRole = user?.rol || 'broker';
  const isBroker = userRole === 'broker';

  const moduleTexts: Record<string, ModuleTexts> = {
    usuarios: {
      title: 'Usuarios',
      description: isBroker ? 'Revisa información de usuarios del sistema' : 'Gestiona usuarios del sistema',
      dashboardTitle: 'Usuarios',
      dashboardDescription: isBroker ? 'Revisa información de usuarios' : 'Gestiona usuarios del sistema'
    },
    archivos: {
      title: 'Archivos',
      description: isBroker ? 'Revisa y visualiza documentos y archivos' : 'Administra y organiza todos los archivos del sistema',
      dashboardTitle: 'Archivos',
      dashboardDescription: isBroker ? 'Revisa documentos y archivos' : 'Administra documentos y archivos'
    },
    anuncios: {
      title: 'Anuncios',
      description: isBroker ? 'Revisa y visualiza anuncios del sistema' : 'Gestiona y publica anuncios para todos los usuarios',
      dashboardTitle: 'Anuncios',
      dashboardDescription: isBroker ? 'Revisa anuncios del sistema' : 'Crea y gestiona anuncios'
    },
    asistencias_siniestros: {
      title: 'Asistencias y Siniestros',
      description: isBroker ? 'Revisa información de asistencias y siniestros' : 'Gestiona asistencias y siniestros del sistema',
      dashboardTitle: 'Asistencias y Siniestros',
      dashboardDescription: isBroker ? 'Revisa asistencias y siniestros' : 'Gestiona asistencias y siniestros'
    },
    metodos_pago: {
      title: 'Métodos de Pago',
      description: isBroker ? 'Revisa información de métodos de pago' : 'Gestiona métodos de pago del sistema',
      dashboardTitle: 'Métodos de Pago',
      dashboardDescription: isBroker ? 'Revisa métodos de pago' : 'Gestiona métodos de pago'
    }
  };

  return moduleTexts[module] || {
    title: module,
    description: `Módulo de ${module}`,
    dashboardTitle: module,
    dashboardDescription: `Acceso a ${module}`
  };
};
