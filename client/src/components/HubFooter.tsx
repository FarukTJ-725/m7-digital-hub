import React from 'react';
import { useUI } from '../contexts/UIContext';
import { motion } from 'framer-motion';
import { Trophy, ShoppingBag, Truck, Tv, Download, UtensilsCrossed, Printer, Gamepad2 } from 'lucide-react';

export const HubFooter: React.FC = () => {
  const { openModal } = useUI();

  const services = [
    { label: 'Menu', icon: UtensilsCrossed, color: 'bg-orange-500', modalId: 'menu', service: 'Restaurant' },
    { label: 'Games', icon: Gamepad2, color: 'bg-blue-500', modalId: 'game', service: 'GameHub' },
    { label: 'Print', icon: Printer, color: 'bg-cyan-500', modalId: 'print', service: 'PrintHub' },
    { label: 'Shop', icon: ShoppingBag, color: 'bg-purple-500', modalId: 'ecommerce', service: 'Ecommerce' },
    { label: 'Stream', icon: Tv, color: 'bg-red-500', modalId: 'streaming', service: 'Streaming' },
    { label: 'Downloads', icon: Download, color: 'bg-green-500', modalId: 'downloads', service: 'Downloads' },
    { label: 'Delivery', icon: Truck, color: 'bg-yellow-500', modalId: 'logistics', service: 'Logistics' },
    { label: 'Trophy', icon: Trophy, color: 'bg-yellow-600', modalId: 'game', service: 'GameHub' },
  ];

  return (
    <footer className="hub-footer">
      <h2 className="footer-title">M7 Services</h2>
      <div className="service-tags">
        {services.map((service) => (
          <motion.div 
            key={service.label}
            whileHover={{ scale: 1.05, translateY: -3 }}
            whileTap={{ scale: 0.95 }}
            className={`service-tag ${service.color}`}
            onClick={() => openModal(service.modalId)}
          >
            <service.icon size={14} strokeWidth={2.5} />
            <span>{service.label}</span>
          </motion.div>
        ))}
      </div>
    </footer>
  );
};
