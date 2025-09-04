import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import TopNav from '../../components/navigation/TopNav';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import Sidebar from '../../components/navigation/Sidebar';
import UserProfileDrawer from '../../components/profile/UserProfileDrawer';
import DashboardCard from '../../components/dashboard/DashboardCard';
import { useUserProfileDrawer } from '../../hooks/useUserProfileDrawer';
import { usePermissions } from '../../hooks/usePermissions';
import { useModuleTexts } from '../../hooks/useModuleTexts';
import { DashboardService } from '../../services/dashboardService';
import { Users, FolderOpen, Megaphone, Shield, CreditCard } from 'lucide-react';


const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canAccess } = usePermissions();
  const { bg, text, textSecondary, skeletonBg } = useThemeClasses();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { isProfileDrawerOpen, openProfileDrawer, closeProfileDrawer, handleOpenChangePasswordModal } = useUserProfileDrawer();
  
  // Estados para estadísticas del dashboard
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalFiles: 0,
    activeAnnouncements: 0,
    totalCompanies: 0,
    totalPaymentMethods: 0,
    newUsers: 0,
    newFiles: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar estadísticas del dashboard
  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { stats, error: statsError } = await DashboardService.getDashboardStats();
        
        if (statsError) {
          setError(statsError);
        } else if (stats) {
          setDashboardStats({
            totalUsers: stats.totalUsers,
            totalFiles: stats.totalFiles,
            activeAnnouncements: stats.activeAnnouncements,
            totalCompanies: stats.totalCompanies,
            totalPaymentMethods: stats.totalPaymentMethods,
            newUsers: stats.recentActivity.newUsers,
            newFiles: stats.recentActivity.newFiles
          });
        }
      } catch (err) {
        setError('Error de conexión al cargar estadísticas');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardStats();
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleLogout = () => {
    navigate('/login');
  };

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Obtener el nombre del usuario para el saludo
  const getUserName = () => {
    if (user?.nombres) {
      return user.nombres.split(' ')[0]; // Solo el primer nombre
    }
    return 'Usuario';
  };

  // Datos reales para las cards del dashboard
  const dashboardModules = [
    {
      title: useModuleTexts('usuarios').dashboardTitle,
      description: useModuleTexts('usuarios').dashboardDescription,
      icon: Users,
      path: '/usuarios',
      mainStat: { label: 'Total Usuarios', value: dashboardStats.totalUsers },
      canAccess: canAccess('usuarios')
    },
    {
      title: useModuleTexts('archivos').dashboardTitle,
      description: useModuleTexts('archivos').dashboardDescription,
      icon: FolderOpen,
      path: '/archivos',
      mainStat: { label: 'Total Archivos', value: dashboardStats.totalFiles },
      canAccess: canAccess('archivos')
    },
    {
      title: useModuleTexts('anuncios').dashboardTitle,
      description: useModuleTexts('anuncios').dashboardDescription,
      icon: Megaphone,
      path: '/anuncios',
      mainStat: { label: 'Anuncios Activos', value: dashboardStats.activeAnnouncements },
      canAccess: canAccess('anuncios')
    },
    {
      title: useModuleTexts('asistencias_siniestros').dashboardTitle,
      description: useModuleTexts('asistencias_siniestros').dashboardDescription,
      icon: Shield,
      path: '/asistencias-siniestros',
      mainStat: { label: 'Total Compañías', value: dashboardStats.totalCompanies },
      canAccess: canAccess('asistencias_siniestros')
    },
    {
      title: useModuleTexts('metodos_pago').dashboardTitle,
      description: useModuleTexts('metodos_pago').dashboardDescription,
      icon: CreditCard,
      path: '/metodos-pago',
      mainStat: { label: 'Métodos Activos', value: dashboardStats.totalPaymentMethods },
      canAccess: canAccess('metodos_pago')
    }
  ];

  // Filtrar módulos según permisos
  const accessibleModules = dashboardModules.filter(module => module.canAccess);

  return (
    <div className={`h-screen overflow-hidden ${bg}`}>
      {/* TopNav */}
      <TopNav 
        onLogout={handleLogout} 
        onMenuToggle={handleMenuToggle}
        showMenuButton={isMobile}
        showUserIcon={true}
        showLogout={false}
        onUserIconClick={openProfileDrawer}
        isSidebarOpen={sidebarOpen}
      />

      {/* Layout con Sidebar y contenido */}
      <div className="flex h-screen pt-16">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />

        {/* Contenido principal */}
        <div className="flex-1 overflow-auto main-content">
          <main className="p-6 pt-24">
            <div className="max-w-7xl mx-auto">
              {/* Header de bienvenida */}
              <div className="mb-8">
                <h1 className={`text-2xl font-bold ${text} mb-2`}>
                  ¡Bienvenido, {getUserName()}!
                </h1>
                <p className={textSecondary}>
                  Aquí tienes un resumen de tu sistema y acceso rápido a los módulos principales.
                </p>
              </div>

              {/* Cards de módulos */}
              {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((index) => (
                    <div key={index} className={`bg-white rounded-xl shadow-md p-8 animate-pulse`}>
                      <div className={`h-4 ${skeletonBg} rounded w-3/4 mb-4`}></div>
                      <div className={`h-3 ${skeletonBg} rounded w-1/2 mb-6`}></div>
                      <div className={`h-8 ${skeletonBg} rounded w-1/3`}></div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">Error al cargar estadísticas: {error}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {accessibleModules.map((module, index) => (
                    <DashboardCard
                      key={index}
                      title={module.title}
                      description={module.description}
                      icon={module.icon}
                      mainStat={module.mainStat}
                      onClick={() => navigate(module.path)}
                    />
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* UserProfile Drawer */}
      <UserProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={closeProfileDrawer}
        onOpenChangePasswordModal={handleOpenChangePasswordModal}
      />

    </div>
  );
};

export default Dashboard; 