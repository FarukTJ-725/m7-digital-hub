import React from 'react';
import { useUI } from '../contexts/UIContext';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Home, History, Gamepad2, HelpCircle, LogOut, Key } from 'lucide-react';

export const SidebarNav: React.FC = () => {
  const { toggleSidebar, openModal } = useUI();
  const { isAuthenticated, logout } = useAuth();

  const handleNavItemClick = (modalId?: string) => {
    toggleSidebar();
    if (modalId) {
      openModal(modalId);
    }
  };

  const handleLogout = () => {
    toggleSidebar();
    logout();
  };

  const navItems = [
    { label: 'HUB HOME', icon: Home, modalId: 'home', color: 'border-blue-500' },
    { label: 'TRACK ORDERS', icon: History, modalId: 'order', color: 'border-red-500' },
    { label: 'GAME HUB', icon: Gamepad2, modalId: 'game', color: 'border-green-500' },
    { label: 'HELP CENTER', icon: HelpCircle, modalId: 'chat', color: 'border-purple-500' },
  ];

  return (
    <nav className="sidebar-nav">
      {navItems.map((item) => (
        <motion.button
          key={item.label}
          whileHover={{ scale: 1.02, x: 3 }}
          whileTap={{ scale: 0.98 }}
          className={`nav-item ${item.color}`}
          onClick={() => handleNavItemClick(item.modalId)}
        >
          <item.icon size={18} className="shrink-0" />
          <span className="font-black text-xs uppercase tracking-wider">{item.label}</span>
        </motion.button>
      ))}

      <div className="mt-auto pt-4 flex flex-col gap-3">
        {isAuthenticated ? (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="nav-item" 
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span className="font-black text-xs uppercase">LOGOUT</span>
          </motion.button>
        ) : (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="nav-item bg-blue-500 text-white" 
            onClick={() => handleNavItemClick('auth')}
          >
            <Key size={18} />
            <span className="font-black text-xs uppercase">LOGIN / REGISTER</span>
          </motion.button>
        )}
      </div>
    </nav>
  );
};
