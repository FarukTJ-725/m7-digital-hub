import React from 'react';
import { useUI } from '../contexts/UIContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

import { MenuModal } from './MenuModal';
import { OrderModal } from './OrderModal';
import { GameModal } from './GameModal';
import { PrintModal } from './PrintModal';
import { ChatModal } from './ChatModal';
import { AuthModal } from './AuthModal';
import { CartModal } from './CartModal';
import { UnifiedCartModal } from './UnifiedCartModal';
import { CheckoutModal } from './CheckoutModal';
import { EcommerceModal } from './EcommerceModal';
import { StreamingModal } from './StreamingModal';
import { DownloadsModal } from './DownloadsModal';
import { LogisticsModal } from './LogisticsModal';

export const ModalContainer: React.FC = () => {
  const { isModalOpen, modalContentId, closeModal } = useUI();

  const renderModalContent = () => {
    switch (modalContentId) {
      case 'menu':
        return <MenuModal />;
      case 'order':
        return <OrderModal />;
      case 'game':
        return <GameModal />;
      case 'print':
        return <PrintModal />;
      case 'chat':
        return <ChatModal />;
      case 'auth':
        return <AuthModal />;
      case 'cart':
        return <UnifiedCartModal />;
      case 'checkout':
        return <CheckoutModal />;
      case 'ecommerce':
        return <EcommerceModal />;
      case 'streaming':
        return <StreamingModal />;
      case 'downloads':
        return <DownloadsModal />;
      case 'logistics':
        return <LogisticsModal />;
      default:
        return <div className="p-10 text-center font-bold">Unknown Modal Content</div>;
    }
  };

  return (
    <AnimatePresence>
      {isModalOpen && (
        <div 
          id="modal-container" 
          className={`modal-container ${isModalOpen ? 'active' : ''}`}
        >
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="modal-overlay" 
            onClick={closeModal}
          />
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ 
              type: 'spring', 
              damping: 30, 
              stiffness: 350,
              mass: 0.8
            }}
            className="modal-content"
          >
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="modal-close" 
              onClick={closeModal}
              aria-label="Close modal"
            >
              <X size={20} />
            </motion.button>
            <div id="modal-body" className="h-full overflow-hidden flex flex-col">
              {renderModalContent()}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
