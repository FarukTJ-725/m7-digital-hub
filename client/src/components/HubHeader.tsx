import React, { useEffect, useState } from 'react';
import { ChatBar } from './ChatBar';
import { useUI } from '../contexts/UIContext';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';

export const HubHeader: React.FC = () => {
  const { toggleSidebar } = useUI();

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const placeholders = [
    "Ask for 2 burgers and 1 coke...",
    "Track order #DH-90127...",
    "Order 5 tickets for FC26...",
    "What's for lunch today?",
    "Need a large fries?"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [placeholders.length]);

  return (
    <header className="hub-header">
      <div className="header-top">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="icon-btn menu-toggle" 
          onClick={toggleSidebar}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </motion.button>
        
        <div className="logo-container">
          <motion.div 
            animate={{ 
              scale: [1, 1.03, 1],
              boxShadow: [
                "0px 0px 0px rgba(0,0,0,0)", 
                "0px 0px 15px rgba(52, 152, 219, 0.3)", 
                "0px 0px 0px rgba(0,0,0,0)"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="logo-circle"
          >
            <img src="/digital_hub.png" alt="Digital Hub Logo" />
          </motion.div>
        </div>

        <div className="header-right-placeholder" />
      </div>
      
      <motion.h1 
        initial={{ y: -5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="hub-title"
      >
        DIGITAL HUB
      </motion.h1>

      <ChatBar currentPlaceholder={placeholders[placeholderIndex]} />
    </header>
  );
};
