import React, { useState, useEffect } from 'react';
import TopNav from '../../components/navigation/TopNav';
import Sidebar from '../../components/navigation/Sidebar';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import UserProfileDrawer from '../../components/profile/UserProfileDrawer';
import { useUserProfileDrawer } from '../../hooks/useUserProfileDrawer';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { useModuleTexts } from '../../hooks/useModuleTexts';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

import AnnouncementList from '../../components/announcements/AnnouncementList';
import AnnouncementModal from '../../components/announcements/AnnouncementModal';
import AnnouncementForm from '../../components/announcements/AnnouncementForm';
import type { Announcement } from '../../types/announcements';
import { AnnouncementService } from '../../services/announcementService';
import Button from '../../components/ui/Button';

const Anuncios: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { bg, text, textSecondary } = useThemeClasses();
  const moduleTexts = useModuleTexts('anuncios');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { isProfileDrawerOpen, openProfileDrawer, closeProfileDrawer, handleOpenChangePasswordModal } = useUserProfileDrawer();
  const { refreshBadge } = useNotificationContext();

  // Estados para el módulo de anuncios
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Verificar si hay un ID en la URL para abrir automáticamente el modal
  useEffect(() => {
    const announcementId = searchParams.get('id');
    if (announcementId) {
      // Cargar el anuncio y abrir el modal
      const loadAnnouncementFromUrl = async () => {
        try {
          const response = await AnnouncementService.getAnnouncementById(announcementId);
          if (response.success && response.data) {
            setSelectedAnnouncement(response.data.announcement);
            setIsModalOpen(true);
            
            // Ya no se marca automáticamente como leído desde la URL
            
            // Limpiar la URL
            navigate('/anuncios', { replace: true });
          }
        } catch (error) {
          console.error('Error loading announcement from URL:', error);
        }
      };

      loadAnnouncementFromUrl();
    }
  }, [searchParams, navigate]);

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

  // Handlers para anuncios
  const handleAnnouncementSelect = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsModalOpen(true);
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setIsFormOpen(true);
  };

  const handleDeleteAnnouncement = async (announcement: Announcement) => {
    if (window.confirm(`¿Está seguro de que desea eliminar el anuncio "${announcement.title}"?`)) {
      try {
        const response = await AnnouncementService.deleteAnnouncement(announcement.id);
        if (response.success) {
          setNotification({ type: 'success', message: 'Anuncio eliminado exitosamente' });
          // Cerrar modal si está abierto
          if (isModalOpen && selectedAnnouncement?.id === announcement.id) {
            setIsModalOpen(false);
            setSelectedAnnouncement(null);
          }
          // Actualizar la lista de anuncios
          setRefreshKey(prev => prev + 1);
        } else {
          setNotification({ type: 'error', message: response.error || 'Error al eliminar el anuncio' });
        }
      } catch (error) {
        setNotification({ type: 'error', message: 'Error inesperado al eliminar el anuncio' });
      }
    }
  };

  const handleCreateNew = () => {
    setEditingAnnouncement(null);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setNotification({ type: 'success', message: 'Anuncio guardado exitosamente' });
    setIsFormOpen(false);
    setEditingAnnouncement(null);
    // Actualizar la lista de anuncios
    setRefreshKey(prev => prev + 1);
    
    // Refrescar badge después de crear/editar anuncio
    refreshBadge();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAnnouncement(null);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAnnouncement(null);
  };

  // Limpiar notificación después de 5 segundos
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

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
      />

      {/* Layout con Sidebar y contenido */}
      <div className="flex h-screen pt-16">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />

        {/* Contenido principal */}
        <div className="flex-1 overflow-auto">
          <main className="p-6 pt-24">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className={`text-2xl font-bold mb-2 ${text}`}>{moduleTexts.title}</h1>
                    <p className={textSecondary}>{moduleTexts.description}</p>
                  </div>
                </div>
              </div>

              {/* Notificaciones */}
              {notification && (
                <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
                  notification.type === 'success' 
                    ? 'bg-green-50 border border-green-200 text-green-800' 
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  <div className="flex items-center gap-2">
                    {notification.type === 'success' ? (
                      <CheckCircle size={20} className="text-green-600" />
                    ) : (
                      <AlertTriangle size={20} className="text-red-600" />
                    )}
                    <span>{notification.message}</span>
                  </div>
                  <Button
                    onClick={() => setNotification(null)}
                    variant="outlined"
                    className="flex items-center gap-1 px-2 py-1 text-sm"
                  >
                    <X size={14} />
                  </Button>
                </div>
              )}

              {/* Lista de anuncios */}
              <AnnouncementList
                key={refreshKey}
                onAnnouncementSelect={handleAnnouncementSelect}
                onEditAnnouncement={handleEditAnnouncement}
                onDeleteAnnouncement={handleDeleteAnnouncement}
                onCreateNew={handleCreateNew}
              />
            </div>
          </main>
        </div>
      </div>

      {/* Modal de detalle de anuncio */}
      <AnnouncementModal
        announcementId={selectedAnnouncement?.id || null}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onEdit={handleEditAnnouncement}
        onDelete={handleDeleteAnnouncement}
        onMarkAsRead={() => setRefreshKey(prev => prev + 1)}
      />

      {/* Formulario de creación/edición */}
      <AnnouncementForm
        announcement={editingAnnouncement}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSuccess={handleFormSuccess}
      />

      {/* UserProfile Drawer */}
      <UserProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={closeProfileDrawer}
        onOpenChangePasswordModal={handleOpenChangePasswordModal}
      />
    </div>
  );
};

export default Anuncios; 