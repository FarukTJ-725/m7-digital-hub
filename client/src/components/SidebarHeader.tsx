import React from 'react';
import { useUI } from '../contexts/UIContext';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

export const SidebarHeader: React.FC = () => {
  const { toggleSidebar } = useUI();

  return (
    <div className="sidebar-header">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 border-2 border-white rounded-lg overflow-hidden shrink-0">
          <img src="/digital_hub.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <span className="font-black text-xl tracking-tighter">DIGITAL HUB</span>
      </div>
      <motion.button 
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        className="sidebar-close-btn" 
        onClick={toggleSidebar}
        aria-label="Close sidebar"
      >
        <X size={24} />
      </motion.button>
    </div>
  );
};
