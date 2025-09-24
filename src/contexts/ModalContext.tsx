import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface ChangePasswordModalContextType {
  isChangePasswordModalOpen: boolean;
  openChangePasswordModal: () => void;
  closeChangePasswordModal: () => void;

  // Global File Preview Modal
  isFilePreviewOpen: boolean;
  previewFile: { id: string; name: string; type: string; size: number } | null;
  openFilePreview: (file: { id: string; name: string; type: string; size: number }) => void;
  closeFilePreview: () => void;
}

const ChangePasswordModalContext = createContext<ChangePasswordModalContextType | undefined>(undefined);

interface ChangePasswordModalProviderProps {
  children: ReactNode;
}

export const ChangePasswordModalProvider: React.FC<ChangePasswordModalProviderProps> = ({ children }) => {
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isFilePreviewOpen, setIsFilePreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ id: string; name: string; type: string; size: number } | null>(null);

  const openChangePasswordModal = () => {
    setIsChangePasswordModalOpen(true);
  };

  const closeChangePasswordModal = () => {
    setIsChangePasswordModalOpen(false);
  };

  const openFilePreview = (file: { id: string; name: string; type: string; size: number }) => {
    setPreviewFile(file);
    setIsFilePreviewOpen(true);
  };

  const closeFilePreview = () => {
    setIsFilePreviewOpen(false);
    setPreviewFile(null);
  };

  const value: ChangePasswordModalContextType = {
    isChangePasswordModalOpen,
    openChangePasswordModal,
    closeChangePasswordModal,
    isFilePreviewOpen,
    previewFile,
    openFilePreview,
    closeFilePreview,
  };

  return (
    <ChangePasswordModalContext.Provider value={value}>
      {children}
    </ChangePasswordModalContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useChangePasswordModal = () => {
  const context = useContext(ChangePasswordModalContext);
  if (context === undefined) {
    throw new Error('useChangePasswordModal debe ser usado dentro de un ChangePasswordModalProvider');
  }
  return context;
};
