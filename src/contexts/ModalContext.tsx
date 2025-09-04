import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface ChangePasswordModalContextType {
  isChangePasswordModalOpen: boolean;
  openChangePasswordModal: () => void;
  closeChangePasswordModal: () => void;
}

const ChangePasswordModalContext = createContext<ChangePasswordModalContextType | undefined>(undefined);

interface ChangePasswordModalProviderProps {
  children: ReactNode;
}

export const ChangePasswordModalProvider: React.FC<ChangePasswordModalProviderProps> = ({ children }) => {
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  const openChangePasswordModal = () => {
    setIsChangePasswordModalOpen(true);
  };

  const closeChangePasswordModal = () => {
    setIsChangePasswordModalOpen(false);
  };

  const value: ChangePasswordModalContextType = {
    isChangePasswordModalOpen,
    openChangePasswordModal,
    closeChangePasswordModal,
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
