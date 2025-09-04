import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import TopNav from '../../components/navigation/TopNav';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import Sidebar from '../../components/navigation/Sidebar';
import UserProfileDrawer from '../../components/profile/UserProfileDrawer';
import PaymentMethodList from '../../components/metodos-pago/PaymentMethodList';
import PaymentMethodDetailModal from '../../components/metodos-pago/PaymentMethodDetailModal';
import PaymentMethodFormModal from '../../components/metodos-pago/PaymentMethodFormModal';
import DeletePaymentMethodModal from '../../components/metodos-pago/DeletePaymentMethodModal';
import ViewToggle from '../../components/ui/ViewToggle';
import Button from '../../components/ui/Button';
import { usePermissions } from '../../hooks/usePermissions';
import { useUserProfileDrawer } from '../../hooks/useUserProfileDrawer';
import { useModuleTexts } from '../../hooks/useModuleTexts';
import { PaymentMethodsService } from '../../services/paymentMethodService';
import type { PaymentMethod, PaymentMethodFormData } from '../../types/metodos-pago';

const MetodosPago: React.FC = () => {
  const navigate = useNavigate();
  const { can } = usePermissions();
  const { bg, text, textSecondary } = useThemeClasses();
  const moduleTexts = useModuleTexts('metodos_pago');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { isProfileDrawerOpen, openProfileDrawer, closeProfileDrawer, handleOpenChangePasswordModal } = useUserProfileDrawer();

  // Estados de modales
  const [detailModal, setDetailModal] = useState<{
    isOpen: boolean;
    paymentMethod: PaymentMethod | null;
  }>({ isOpen: false, paymentMethod: null });

  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    paymentMethod: PaymentMethod | null;
  }>({ isOpen: false, paymentMethod: null });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    paymentMethod: PaymentMethod | null;
  }>({ isOpen: false, paymentMethod: null });

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

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { paymentMethods: data, error: serviceError } = 
        await PaymentMethodsService.getAll();
      
      if (serviceError) {
        setError(serviceError);
      } else {
        setPaymentMethods(data);
      }
    } catch (err) {
      setError('Error al cargar los métodos de pago');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handlers para modales
  const handleViewPaymentMethod = (paymentMethod: PaymentMethod) => {
    setDetailModal({ isOpen: true, paymentMethod });
  };

  const handleEditPaymentMethod = (paymentMethod: PaymentMethod) => {
    setFormModal({ isOpen: true, paymentMethod });
  };

  const handleDeletePaymentMethod = (paymentMethod: PaymentMethod) => {
    setDeleteModal({ isOpen: true, paymentMethod });
  };

  const handleCreateNew = () => {
    setFormModal({ isOpen: true, paymentMethod: null });
  };

  const handleFormSubmit = async (data: PaymentMethodFormData) => {
    try {
      const isEditing = !!formModal.paymentMethod;
      
      if (isEditing) {
        const { success, error: serviceError } = await PaymentMethodsService.update(
          formModal.paymentMethod!.id, 
          data
        );
        
        if (!success) {
          alert(`Error al actualizar: ${serviceError}`);
          return;
        }
      } else {
        const { paymentMethod, error: serviceError } = await PaymentMethodsService.create(data);
        
        if (!paymentMethod) {
          alert(`Error al crear: ${serviceError}`);
          return;
        }
      }
      
      // Cerrar modal y recargar lista
      setFormModal({ isOpen: false, paymentMethod: null });
      await loadPaymentMethods();
      
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.paymentMethod) return;
    
    try {
      const { success, error: serviceError } = await PaymentMethodsService.delete(
        deleteModal.paymentMethod.id
      );
      
      if (!success) {
        alert(`Error al eliminar: ${serviceError}`);
        return;
      }
      
      // Cerrar modal y recargar lista
      setDeleteModal({ isOpen: false, paymentMethod: null });
      await loadPaymentMethods();
      
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

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
        <div className="flex-1 flex flex-col">
          {/* Header fijo */}
          <div className="p-6 pt-24 pb-0">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <h1 className={`text-2xl font-bold ${text} mb-2`}>
                  {moduleTexts.title}
                </h1>
                <p className={textSecondary}>
                  {moduleTexts.description}
                </p>
              </div>

              {/* Acciones */}
              <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex items-center justify-between sm:justify-start space-x-4">
                  <ViewToggle
                    viewMode={viewMode}
                    onViewChange={setViewMode}
                  />
                  <div>
                    <p className={`${textSecondary} mt-1`}>
                      {paymentMethods.length} método{paymentMethods.length !== 1 ? 's' : ''} disponible{paymentMethods.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                {can('metodos_pago', 'create') && (
                  <Button
                    onClick={handleCreateNew}
                    variant="contained"
                    color="primary"
                    size="md"
                    className="flex items-center w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Método
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Contenido scrollable */}
          <div className="flex-1 overflow-auto px-6 pb-6">
            <div className="max-w-7xl mx-auto">
              <PaymentMethodList
                paymentMethods={paymentMethods}
                viewMode={viewMode}
                onView={handleViewPaymentMethod}
                onEdit={can('metodos_pago', 'edit') ? handleEditPaymentMethod : undefined}
                onDelete={can('metodos_pago', 'edit') ? handleDeletePaymentMethod : undefined}
                canEdit={can('metodos_pago', 'edit')}
                loading={loading}
                error={error}
              />
            </div>
          </div>
        </div>
      </div>

      {/* UserProfile Drawer */}
      <UserProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={closeProfileDrawer}
        onOpenChangePasswordModal={handleOpenChangePasswordModal}
      />

      {/* Modales - Renderizados a nivel de página completa */}
      <PaymentMethodDetailModal
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal({ isOpen: false, paymentMethod: null })}
        paymentMethod={detailModal.paymentMethod}
      />

      <PaymentMethodFormModal
        isOpen={formModal.isOpen}
        onClose={() => setFormModal({ isOpen: false, paymentMethod: null })}
        onSubmit={handleFormSubmit}
        paymentMethod={formModal.paymentMethod}
      />

      <DeletePaymentMethodModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, paymentMethod: null })}
        onConfirm={handleDeleteConfirm}
        paymentMethod={deleteModal.paymentMethod}
      />
    </div>
  );
};

export default MetodosPago;
