import React from 'react';
import { SidebarHeader } from './SidebarHeader';
import { SidebarNav } from './SidebarNav';
import { SidebarFooter } from './SidebarFooter';
import { useUI } from '../contexts/UIContext';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { isSidebarOpen, openModal } = useUI();
  const { user, isAuthenticated } = useAuth();

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <motion.div 
          id="sidebar" 
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="sidebar"
        >
          <SidebarHeader />
          
          <div className="sidebar-profile-section">
            <motion.div 
              whileHover={{ scale: 1.02, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`user-profile-card ${
                isAuthenticated ? 'bg-black text-white' : 'bg-gray-100 text-black cursor-pointer'
              }`}
              onClick={() => !isAuthenticated && openModal('auth')}
            >
              <div className="w-12 h-12 rounded-xl border-2 border-black overflow-hidden bg-white shrink-0">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'Guest'}`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="m-0 text-base font-black truncate uppercase tracking-tight">
                  {user?.username || 'GUEST USER'}
                </h4>
                <p className={`m-0 text-xs font-bold uppercase tracking-wider ${
                  isAuthenticated ? 'text-blue-400' : 'text-gray-500'
                }`}>
                  {isAuthenticated ? 'HUB MEMBER' : 'JOIN THE HUB'}
                </p>
              </div>
              {!isAuthenticated && <ChevronRight size={20} className="shrink-0" />}
            </motion.div>
          </div>

          <SidebarNav />
          <SidebarFooter />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
