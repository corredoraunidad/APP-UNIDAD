import { useState } from 'react';

interface UseUserCreationModalReturn {
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const useUserCreationModal = (): UseUserCreationModalReturn => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return {
    isModalOpen,
    openModal,
    closeModal,
  };
}; 