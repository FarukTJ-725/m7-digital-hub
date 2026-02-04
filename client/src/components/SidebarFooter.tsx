import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';
import { Moon, Sun, Settings } from 'lucide-react';

export const SidebarFooter: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="sidebar-footer">
      {/* Theme Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleTheme}
        className="theme-toggle-sidebar"
        aria-label="Toggle theme"
      >
        <div className="theme-toggle-inner">
          {isDarkMode ? (
            <>
              <Moon size={18} />
              <span>Dark Mode</span>
            </>
          ) : (
            <>
              <Sun size={18} />
              <span>Light Mode</span>
            </>
          )}
        </div>
      </motion.button>

      {/* Version Info */}
      <div className="sidebar-version">
        <p style={{ fontSize: '11px', opacity: 0.6, margin: 0 }}>Digital Hub v1.0 • 2026</p>
        <p style={{ fontSize: 10, marginTop: 2, opacity: 0.4 }}>Crafted with Neobrutalism</p>
      </div>
    </div>
  );
};
