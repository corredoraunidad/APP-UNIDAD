import React from 'react';
import { useChangePasswordModal } from '../contexts/ModalContext';
import ChangePasswordModal from './profile/ChangePasswordModal';

const GlobalModals: React.FC = () => {
  const { isChangePasswordModalOpen, closeChangePasswordModal } = useChangePasswordModal();

  return (
    <>
      {/* Modal de cambio de contraseña global */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={closeChangePasswordModal}
      />
    </>
  );
};

export default GlobalModals;
