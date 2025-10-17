import React from 'react';
import TopNav from '../../components/navigation/TopNav';
import Sidebar from '../../components/navigation/Sidebar';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import UserProfileDrawer from '../../components/profile/UserProfileDrawer';
import UserTable from '../../components/users/UserTable';
import UserCreationModal from '../../components/users/UserCreationModal';
import UserDetailModal from '../../components/users/UserDetailModal';
import DeleteUserModal from '../../components/users/DeleteUserModal';
import UserListHeader from '../../components/users/UserListHeader';
import { useUserProfileDrawer } from '../../hooks/useUserProfileDrawer';
import { useUserCreationModal } from '../../hooks/useUserCreationModal';
import { UserService } from '../../services/userService';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { User, CreateUserData, UserWithContract, UserFilters } from '../../types';

const Usuarios: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { bg} = useThemeClasses();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [refreshTable, setRefreshTable] = useState(0);
  const { isProfileDrawerOpen, openProfileDrawer, closeProfileDrawer, handleOpenChangePasswordModal } = useUserProfileDrawer();
  const { isModalOpen, openModal, closeModal } = useUserCreationModal();
  
  // Estados para el modal de eliminación
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Estados para el modal de detalles
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithContract | null>(null);
  
  // Estados para filtros y búsqueda
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 5,
    orden: 'alfabetico',
    direccion_orden: 'asc'
  });
  


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

  // Leer query param 'userId' al montar para navegación directa desde búsqueda
  useEffect(() => {
    const userIdParam = searchParams.get('userId');
    if (userIdParam) {
      // Cargar el usuario y abrir modal automáticamente
      const loadAndShowUser = async () => {
        try {
          const { user, error } = await UserService.getUserById(userIdParam);
          if (user && !error) {
            setSelectedUser(user);
            setIsDetailModalOpen(true);
          } else {
            console.error('Error cargando usuario:', error);
          }
        } catch (err) {
          console.error('Error al cargar usuario:', err);
        }
      };
      
      loadAndShowUser();
    }
  }, []); // Solo ejecutar al montar

  const handleLogout = () => {
    navigate('/login');
  };

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCreateUser = () => {
    openModal();
  };

  const handleFiltersChange = (newFilters: UserFilters) => {
    setFilters(newFilters);
    setRefreshTable(prev => prev + 1);
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    setRefreshTable(prev => prev + 1);
  };

  const handleUserCreation = async (userData: CreateUserData) => {
    try {
      // Crear usuario completo con email automático
      const { user, credentials, error } = await UserService.createUserComplete(userData);

      if (error) {
        throw new Error(error);
      }

      if (user && credentials) {
        // Cerrar modal
        closeModal();

        // Refrescar tabla para mostrar el nuevo usuario
        setRefreshTable(prev => prev + 1);

        // Mostrar mensaje de éxito
        alert(`Usuario creado exitosamente!\n\nUsername: ${credentials.username}\nSe ha enviado un email con las credenciales.`);
      }

    } catch (error: any) {
      throw error; // Re-lanzar el error para que el modal lo maneje
    }
  };

  const handleEditUser = (_user: any) => {
    // TODO: Implementar edición de usuario
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // Buscar el usuario en la tabla para mostrar sus datos en el modal
      const user = await UserService.getUserById(userId);
      
      if (user.user) {
        setUserToDelete(user.user);
        setIsDeleteModalOpen(true);
      } else {
        alert('Error: No se pudo encontrar el usuario');
      }
    } catch (error) {
      alert('Error al buscar el usuario');
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    setIsDeleting(true);
    try {
      const { success, error } = await UserService.deleteUser(userToDelete.id);
      
      if (success) {
        // Cerrar modal y refrescar tabla
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
        setRefreshTable(prev => prev + 1);
        alert('Usuario eliminado exitosamente');
      } else {
        alert(`Error al eliminar usuario: ${error}`);
      }
    } catch (error: any) {
      alert(`Error de conexión: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
    setIsDeleting(false);
  };

  const handleViewUser = (user: UserWithContract) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedUser(null);
    
    // Limpiar query params para evitar que se reabra el modal
    if (searchParams.has('userId')) {
      navigate('/usuarios', { replace: true });
    }
  };

  const handleUserUpdated = (updatedUser: UserWithContract) => {
    setSelectedUser(updatedUser);
    setRefreshTable(prev => prev + 1);
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
        <div className="flex-1 overflow-auto">
          <main className="p-6 pt-24 h-full">
            <div className="max-w-7xl mx-auto h-full flex flex-col">
              {/* Header con búsqueda y filtros */}
              <UserListHeader
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onCreateNew={handleCreateUser}
              />
              
              {/* Espacio entre header y tabla */}
              <div className="mb-6"></div>
              
              {/* Tabla de usuarios */}
              <div className="flex-1">
                <UserTable
                  key={refreshTable}
                  onEditUser={handleEditUser}
                  onDeleteUser={handleDeleteUser}
                  onViewUser={handleViewUser}
                  filters={filters}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Modales */}
      <UserCreationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleUserCreation}
      />

      <UserDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        user={selectedUser}
        onUserUpdated={handleUserUpdated}
      />

      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        user={userToDelete}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />

      <UserProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={closeProfileDrawer}
        onOpenChangePasswordModal={handleOpenChangePasswordModal}
      />
    </div>
  );
};

export default Usuarios; 