import React from 'react';
import { useUI } from '../contexts/UIContext';
import { motion } from 'framer-motion';

interface HubCardProps {
  cardType: string;
  modalId: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const HubCard: React.FC<HubCardProps> = ({ cardType, modalId, icon, title, description }) => {
  const { openModal } = useUI();

  return (
    <motion.button 
      whileHover={{ scale: 1.03, translateY: -4 }}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`hub-card ${cardType}-card`} 
      onClick={() => openModal(modalId)}
      aria-label={`Open ${title}`}
    >
      <div className="card-icon-wrapper">
        {icon}
      </div>
      <div className="card-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </motion.button>
  );
};
