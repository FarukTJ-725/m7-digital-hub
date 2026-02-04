import React from 'react';
import { HubCard } from './HubCard';
import { UtensilsCrossed, ClipboardList, Gamepad2, Printer, ShoppingBag, Tv, Download, Truck } from 'lucide-react';

export const HubGrid: React.FC = () => {
  return (
    <>
      <HubCard 
        cardType="menu" 
        modalId="menu" 
        icon={<UtensilsCrossed size={32} color="white" />} 
        title="MENU" 
        description="Browse our Menu" 
      />
      <HubCard 
        cardType="order" 
        modalId="order" 
        icon={<ClipboardList size={32} color="white" />} 
        title="ORDER" 
        description="Track your order" 
      />
      <HubCard 
        cardType="game" 
        modalId="game" 
        icon={<Gamepad2 size={32} color="white" />} 
        title="GAME HUB" 
        description="Play games & Connect" 
      />
      <HubCard 
        cardType="print" 
        modalId="print" 
        icon={<Printer size={32} color="white" />} 
        title="PRINT HUB" 
        description="Print Seamlessly" 
      />
      {/* Additional Services */}
      <HubCard 
        cardType="ecommerce" 
        modalId="ecommerce" 
        icon={<ShoppingBag size={32} color="white" />} 
        title="M7 SHOP" 
        description="Electronics & Fashion" 
      />
      <HubCard 
        cardType="streaming" 
        modalId="streaming" 
        icon={<Tv size={32} color="white" />} 
        title="STREAMING" 
        description="Podcasts & Live TV" 
      />
      <HubCard 
        cardType="downloads" 
        modalId="downloads" 
        icon={<Download size={32} color="white" />} 
        title="DOWNLOADS" 
        description="Movies & Music" 
      />
      <HubCard 
        cardType="logistics" 
        modalId="logistics" 
        icon={<Truck size={32} color="white" />} 
        title="LOGISTICS" 
        description="Delivery Service" 
      />
    </>
  );
};
