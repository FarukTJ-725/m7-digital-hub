import './index.css'; // Import global styles

import { StatusBar } from './components/StatusBar';
import { HomeScreen } from './components/HomeScreen';
import { ModalContainer } from './components/ModalContainer';
import { Sidebar } from './components/Sidebar';
import { GlobalErrorHandler } from './components/GlobalErrorHandler';
import { ChatBot } from './components/ChatBot';
import { useUI } from './contexts/UIContext';
import { UnifiedCartProvider } from './contexts/UnifiedCartContext';

function App() {
  const { isSidebarOpen, toggleSidebar, openModal } = useUI();

  const handleOpenModal = (modalId: string, data?: any) => {
    openModal(modalId);
  };

  const handleStartCheckout = () => {
    openModal('checkout');
  };

  return (
    <UnifiedCartProvider>
      <div className="app-container">
        <StatusBar />
        <GlobalErrorHandler />
        <HomeScreen />
        <ModalContainer />
        <Sidebar />
        <ChatBot 
          onOpenModal={handleOpenModal}
          onStartCheckout={handleStartCheckout}
        />
        <div 
          id="sidebar-overlay" 
          className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`}
          onClick={toggleSidebar}
        ></div>
      </div>
    </UnifiedCartProvider>
  );
}

export default App;
