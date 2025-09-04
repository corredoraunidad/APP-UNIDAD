import { useState } from 'react';
import { useChangePasswordModal } from '../contexts/ModalContext';

export const useUserProfileDrawer = () => {
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const { openChangePasswordModal } = useChangePasswordModal();

  const openProfileDrawer = () => {
    setIsProfileDrawerOpen(true);
  };

  const closeProfileDrawer = () => {
    setIsProfileDrawerOpen(false);
  };

  const toggleProfileDrawer = () => {
    setIsProfileDrawerOpen(prev => !prev);
  };

  const handleOpenChangePasswordModal = () => {
    closeProfileDrawer();
    // Pequeño delay para que se vea la transición del drawer
    setTimeout(() => {
      openChangePasswordModal();
    }, 150);
  };

  return {
    isProfileDrawerOpen,
    openProfileDrawer,
    closeProfileDrawer,
    toggleProfileDrawer,
    handleOpenChangePasswordModal,
  };
}; 