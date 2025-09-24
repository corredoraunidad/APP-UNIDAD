import React from 'react';
import { useChangePasswordModal } from '../contexts/ModalContext';
import ChangePasswordModal from './profile/ChangePasswordModal';
import FilePreviewModal from './files/FilePreviewModal';

const GlobalModals: React.FC = () => {
  const { isChangePasswordModalOpen, closeChangePasswordModal, isFilePreviewOpen, closeFilePreview, previewFile } = useChangePasswordModal();

  return (
    <>
      {/* Modal de cambio de contraseña global */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={closeChangePasswordModal}
      />

      {/* Modal global de previsualización de archivos */}
      {isFilePreviewOpen && previewFile && (
        <FilePreviewModal
          isOpen={isFilePreviewOpen}
          onClose={closeFilePreview}
          fileId={previewFile.id}
          fileName={previewFile.name}
          fileType={previewFile.type}
          fileSize={previewFile.size}
        />
      )}
    </>
  );
};

export default GlobalModals;
