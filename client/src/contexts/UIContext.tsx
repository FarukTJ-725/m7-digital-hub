import React, { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';

interface UIContextType {
  isModalOpen: boolean;
  modalContentId: string | null;
  openModal: (id: string) => void;
  closeModal: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  error: string | null;
  triggerError: (message: string) => void;
  clearError: () => void;
  // Additional service modals
  showGameHub: boolean;
  setShowGameHub: (show: boolean) => void;
  showEcommerce: boolean;
  setShowEcommerce: (show: boolean) => void;
  showStreaming: boolean;
  setShowStreaming: (show: boolean) => void;
  showDownloads: boolean;
  setShowDownloads: (show: boolean) => void;
  showLogistics: boolean;
  setShowLogistics: (show: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export { UIContext };

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContentId, setModalContentId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Additional service modals
  const [showGameHub, setShowGameHub] = useState(false);
  const [showEcommerce, setShowEcommerce] = useState(false);
  const [showStreaming, setShowStreaming] = useState(false);
  const [showDownloads, setShowDownloads] = useState(false);
  const [showLogistics, setShowLogistics] = useState(false);

  const openModal = (id: string) => {
    setModalContentId(id);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContentId(null);
    document.body.style.overflow = 'auto';
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const triggerError = (message: string) => {
    setError(message);
  };

  const clearError = () => setError(null);

  React.useEffect(() => {
    if (isSidebarOpen) {
      document.body.classList.add('sidebar-active');
    } else {
      document.body.classList.remove('sidebar-active');
    }
  }, [isSidebarOpen]);

  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);


  return (
    <UIContext.Provider
      value={{
        isModalOpen,
        modalContentId,
        openModal,
        closeModal,
        isSidebarOpen,
        toggleSidebar,
        error,
        triggerError,
        clearError,
        showGameHub,
        setShowGameHub,
        showEcommerce,
        setShowEcommerce,
        showStreaming,
        setShowStreaming,
        showDownloads,
        setShowDownloads,
        showLogistics,
        setShowLogistics,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
