import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import TopNav from '../../components/navigation/TopNav';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import Sidebar from '../../components/navigation/Sidebar';
import UserProfileDrawer from '../../components/profile/UserProfileDrawer';
import CompanyList from '../../components/asistencias-siniestros/CompanyList';
import CompanyModal from '../../components/asistencias-siniestros/CompanyModal';
import AddCompanyModal from '../../components/asistencias-siniestros/AddCompanyModal';
import EditCompanyModal from '../../components/asistencias-siniestros/EditCompanyModal';
import DeleteCompanyModal from '../../components/asistencias-siniestros/DeleteCompanyModal';
import ViewToggle from '../../components/ui/ViewToggle';
import Button from '../../components/ui/Button';
import { usePermissions } from '../../hooks/usePermissions';
import { useUserProfileDrawer } from '../../hooks/useUserProfileDrawer';
import { useModuleTexts } from '../../hooks/useModuleTexts';
import { AsistenciasSiniestrosService } from '../../services/asistenciasSiniestrosService';
import type { Company, CreateCompanyRequest, UpdateCompanyRequest } from '../../types/asistencias-siniestros';

const AsistenciasSiniestros: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { can } = usePermissions();
  const { bg, text, textSecondary } = useThemeClasses();
  const moduleTexts = useModuleTexts('asistencias_siniestros');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { isProfileDrawerOpen, openProfileDrawer, closeProfileDrawer, handleOpenChangePasswordModal } = useUserProfileDrawer();

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
    loadCompanies();
  }, []);

  // Abrir modal de compañía automáticamente si viene companyId en query param
  useEffect(() => {
    const companyIdParam = searchParams.get('companyId');
    if (companyIdParam && companies.length > 0) {
      // Buscar la compañía en la lista cargada
      const company = companies.find(c => c.id === companyIdParam);
      if (company) {
        setSelectedCompany(company);
        setIsModalOpen(true);
      } else {
        // Si no está en la lista, cargarla directamente del servicio
        const loadCompany = async () => {
          try {
            const { company: fetchedCompany, error } = await AsistenciasSiniestrosService.getCompanyById(companyIdParam);
            if (fetchedCompany && !error) {
              setSelectedCompany(fetchedCompany);
              setIsModalOpen(true);
            }
          } catch (err) {
            console.error('Error al cargar compañía:', err);
          }
        };
        loadCompany();
      }
    }
  }, [companies, searchParams]); // Ejecutar cuando cambien las compañías cargadas

  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { companies: companiesData, error: companiesError } = 
        await AsistenciasSiniestrosService.getAllCompanies();
      
      if (companiesError) {
        setError(companiesError);
      } else if (companiesData) {
        setCompanies(companiesData);
      }
    } catch (err) {
      setError('Error al cargar las compañías');
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

  const handleAddCompany = () => {
    setIsAddModalOpen(true);
  };

  const handleSaveCompany = async (data: CreateCompanyRequest) => {
    try {
      setIsSaving(true);
      const { company, error } = await AsistenciasSiniestrosService.createCompany(data);
      
      if (error) {
        console.error('Error creating company:', error);
        // TODO: Mostrar toast de error
        return;
      }
      
      if (company) {
        // Recargar la lista de compañías
        await loadCompanies();
        // TODO: Mostrar toast de éxito
      }
    } catch (error) {
      console.error('Error saving company:', error);
      // TODO: Mostrar toast de error
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateCompany = async (id: string, data: UpdateCompanyRequest) => {
    try {
      setIsUpdating(true);
      const { company, error } = await AsistenciasSiniestrosService.updateCompany(id, data);
      
      if (error) {
        console.error('Error updating company:', error);
        // TODO: Mostrar toast de error
        return;
      }
      
      if (company) {
        // Recargar la lista de compañías
        await loadCompanies();
        // Cerrar el modal de edición
        setIsEditModalOpen(false);
        // TODO: Mostrar toast de éxito
      }
    } catch (error) {
      console.error('Error updating company:', error);
      // TODO: Mostrar toast de error
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const handleCloseModal = async () => {
    setIsModalOpen(false);
    
    // Limpiar query params PRIMERO para evitar flash al actualizar companies
    if (searchParams.has('companyId')) {
      navigate('/asistencias-siniestros', { replace: true });
    }
    
    // Luego refrescar datos (ya sin query param)
    if (selectedCompany) {
      const { company: refreshed, error } = await AsistenciasSiniestrosService.getCompanyById(selectedCompany.id);
      if (!error && refreshed) {
        setCompanies(prev => prev.map(c => c.id === refreshed.id ? refreshed : c));
      }
    }
    setSelectedCompany(null);
  };

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company);
    setIsEditModalOpen(true);
  };

  const handleDeleteCompany = (company: Company) => {
    setCompanyToDelete(company);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!companyToDelete) return;

    try {
      setIsDeleting(true);
      const { error } = await AsistenciasSiniestrosService.deleteCompany(companyToDelete.id);
      
      if (error) {
        console.error('Error deleting company:', error);
        // TODO: Mostrar toast de error
        return;
      }
      
      // Recargar la lista de compañías
      await loadCompanies();
      
      // Cerrar el modal de la compañía si estaba abierto
      if (selectedCompany?.id === companyToDelete.id) {
        setIsModalOpen(false);
        setSelectedCompany(null);
      }
      
      // TODO: Mostrar toast de éxito
    } catch (error) {
      console.error('Error deleting company:', error);
      // TODO: Mostrar toast de error
    } finally {
      setIsDeleting(false);
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
                      {companies.length} compañía{companies.length !== 1 ? 's' : ''} disponible{companies.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                {can('asistencias_siniestros', 'create') && (
                  <Button
                    onClick={handleAddCompany}
                    variant="contained"
                    color="primary"
                    size="md"
                    className="flex items-center w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Compañía
                  </Button>
                )}
              </div>

              {/* Lista de Compañías */}
              <div className="mt-8">
                <CompanyList
                  companies={companies}
                  viewMode={viewMode}
                  onCompanyClick={handleCompanySelect}
                  onDeleteClick={can('asistencias_siniestros', 'edit') ? handleDeleteCompany : undefined}
                  canEdit={can('asistencias_siniestros', 'edit')}
                  loading={loading}
                  error={error}
                />
              </div>

            </div>
          </main>
        </div>
      </div>

      {/* Modal de compañía */}
      {selectedCompany && (
        <CompanyModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          company={selectedCompany}
          canEdit={can('asistencias_siniestros', 'edit')}
          onEdit={() => handleEditCompany(selectedCompany)}
          onDelete={() => handleDeleteCompany(selectedCompany)}
        />
      )}

      {/* Modal para agregar compañía */}
      <AddCompanyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveCompany}
        isLoading={isSaving}
      />
      
      {/* Modal para editar compañía */}
      <EditCompanyModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCompany(null);
        }}
        onSave={handleUpdateCompany}
        company={selectedCompany}
        isLoading={isUpdating}
      />
      
      {/* Modal para eliminar compañía */}
      <DeleteCompanyModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCompanyToDelete(null);
        }}
        company={companyToDelete}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
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

export default AsistenciasSiniestros;
