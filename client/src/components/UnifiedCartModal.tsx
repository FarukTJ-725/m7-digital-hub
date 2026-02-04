import React, { useState } from 'react';
import { useUI } from '../contexts/UIContext';
import { useUnifiedCart, SERVICE_LABELS, SERVICE_COLORS } from '../contexts/UnifiedCartContext';
import type { ServiceType, CartItem } from '../contexts/UnifiedCartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShoppingCart, 
    Trash2, 
    Plus, 
    Minus, 
    CreditCard, 
    ArrowRight,
    UtensilsCrossed,
    Gamepad2,
    Printer,
    ShoppingBag,
    Truck,
    Tv,
    Download,
    X
} from 'lucide-react';

export const UnifiedCartModal: React.FC = () => {
    const { closeModal, openModal } = useUI();
    const { 
        items, 
        removeItem, 
        updateQuantity, 
        getTotalAmount, 
        clearCart,
        getServiceTotal,
        getItemCount
    } = useUnifiedCart();
    
    const [activeTab, setActiveTab] = useState<ServiceType | 'all'>('all');

    // Get emoji for service type
    const getServiceEmoji = (type: ServiceType): string => {
        switch (type) {
            case 'restaurant': return '🍔';
            case 'game': return '🎮';
            case 'print': return '🖨️';
            case 'ecommerce': return '🛍️';
            case 'logistics': return '🚗';
            case 'streaming': return '📺';
            case 'download': return '📥';
            default: return '📦';
        }
    };

    const filteredItems = activeTab === 'all' 
        ? items 
        : items.filter(item => item.serviceType === activeTab);

    const groupedByService = items.reduce((acc, item) => {
        if (!acc[item.serviceType]) {
            acc[item.serviceType] = [];
        }
        acc[item.serviceType].push(item);
        return acc;
    }, {} as Record<ServiceType, CartItem[]>);

    const handleCheckout = () => {
        closeModal();
        openModal('checkout');
    };

    const formatDetails = (details?: Record<string, any>): string => {
        if (!details) return '';
        
        const parts: string[] = [];
        
        if (details.category) parts.push(details.category);
        if (details.sessionType) parts.push(details.sessionType);
        if (details.duration) parts.push(`${details.duration}min`);
        if (details.fileName) parts.push(details.fileName);
        if (details.packageSize) parts.push(details.packageSize);
        if (details.accessType) parts.push(details.accessType);
        if (details.fileType) parts.push(details.fileType);
        
        return parts.join(' • ');
    };

    if (items.length === 0) {
        return (
            <>
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="modal-header"
                    style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                >
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <ShoppingCart size={28} />
                        <div>
                            <h2 className="modal-title">YOUR CART</h2>
                            <p className="modal-subtitle">Your cart is empty</p>
                        </div>
                    </div>
                </motion.div>

                <div className="modal-body-scrollable flex flex-col items-center justify-center py-16 px-6 text-center">
                    <motion.div 
                        animate={{ rotate: [0, -10, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-8xl mb-6"
                    >
                        🛒
                    </motion.div>
                    <h3 className="font-black text-2xl mb-3 uppercase">Your Cart is Empty</h3>
                    <p className="font-bold text-gray-500 mb-8 max-w-sm">
                        Add items from any of our services to get started!
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { closeModal(); openModal('menu'); }}
                            className="hub-btn bg-green-500 text-white border-3 border-black p-4 rounded-xl font-black text-sm"
                        >
                            🍔 Order Food
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { closeModal(); openModal('game'); }}
                            className="hub-btn bg-blue-500 text-white border-3 border-black p-4 rounded-xl font-black text-sm"
                        >
                            🎮 Game Session
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { closeModal(); openModal('print'); }}
                            className="hub-btn bg-orange-500 text-white border-3 border-black p-4 rounded-xl font-black text-sm"
                        >
                            🖨️ Print Job
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { closeModal(); }}
                            className="hub-btn bg-gray-500 text-white border-3 border-black p-4 rounded-xl font-black text-sm"
                        >
                            🏠 Browse Services
                        </motion.button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="modal-header"
                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
                <div className="flex items-center justify-center gap-3 mb-2">
                    <ShoppingCart size={28} />
                    <div>
                        <h2 className="modal-title">YOUR CART</h2>
                        <p className="modal-subtitle">{items.length} items • ₦{getTotalAmount().toLocaleString()}</p>
                    </div>
                </div>
            </motion.div>

            <div className="modal-body-scrollable">
                {/* Service Tabs */}
                <div className="service-tabs flex gap-2 overflow-x-auto pb-4 mb-4">
                    <button
                        className={`tab flex items-center gap-2 ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        All ({items.length})
                    </button>
                    {Object.entries(groupedByService).map(([service, serviceItems]) => (
                        <button
                            key={service}
                            className={`tab flex items-center gap-2 ${activeTab === service ? 'active' : ''}`}
                            onClick={() => setActiveTab(service as ServiceType)}
                            style={activeTab === service ? { background: SERVICE_COLORS[service as ServiceType] } : {}}
                        >
                            {getServiceEmoji(service as ServiceType)}
                            <span>{serviceItems.length}</span>
                        </button>
                    ))}
                </div>

                {/* Cart Items */}
                <div className="cart-items space-y-4">
                    <AnimatePresence mode='popLayout'>
                        {filteredItems.map(item => (
                            <motion.div
                                layout
                                key={`${item.serviceType}-${item.id}-${JSON.stringify(item.details)}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="cart-item-card bg-white border-2 border-gray-100 rounded-2xl p-4"
                                style={{ borderLeft: `4px solid ${SERVICE_COLORS[item.serviceType]}` }}
                            >
                                <div className="flex gap-4">
                                    {item.imageUrl ? (
                                        <img 
                                            src={item.imageUrl} 
                                            alt={item.name} 
                                            className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                                        />
                                    ) : (
                                        <div 
                                            className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0"
                                            style={{ background: `${SERVICE_COLORS[item.serviceType]}20` }}
                                        >
                                            {getServiceEmoji(item.serviceType)}
                                        </div>
                                    )}
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="min-w-0">
                                                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: SERVICE_COLORS[item.serviceType] }}>
                                                    {SERVICE_LABELS[item.serviceType]}
                                                </span>
                                                <h4 className="font-black text-base truncate">{item.name}</h4>
                                            </div>
                                            <button 
                                                onClick={() => removeItem(item.id, item.serviceType)}
                                                className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0"
                                            >
                                                <Trash2 size={14} className="text-red-500" />
                                            </button>
                                        </div>
                                        
                                        {item.details && (
                                            <p className="text-xs text-gray-500 mt-1 font-medium">
                                                {formatDetails(item.details)}
                                            </p>
                                        )}

                                        <div className="flex justify-between items-center mt-3">
                                            <div className="quantity-controls flex items-center gap-2">
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.serviceType, item.qty - 1)}
                                                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="font-black w-8 text-center">{item.qty}</span>
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.serviceType, item.qty + 1)}
                                                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                            <span className="font-black text-lg">
                                                ₦{(item.price * item.qty).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Service Breakdown */}
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-black text-sm uppercase mb-3">Order Summary</h4>
                    {Object.entries(groupedByService).map(([service, serviceItems]) => (
                        <div key={service} className="flex justify-between py-2 border-b border-gray-200 last:border-0">
                            <div className="flex items-center gap-2">
                                {getServiceEmoji(service as ServiceType)}
                                <span className="font-bold">{SERVICE_LABELS[service as ServiceType]}</span>
                            </div>
                            <span className="font-black">
                                ₦{serviceItems.reduce((sum, item) => sum + item.price * item.qty, 0).toLocaleString()}
                            </span>
                        </div>
                    ))}
                    <div className="flex justify-between pt-3 mt-3 border-t-2 border-black">
                        <span className="font-black text-lg">Total</span>
                        <span className="font-black text-lg">₦{getTotalAmount().toLocaleString()}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={clearCart}
                        className="flex-1 bg-gray-100 text-gray-700 p-4 rounded-xl font-black flex items-center justify-center gap-2"
                    >
                        <Trash2 size={18} />
                        Clear Cart
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCheckout}
                        className="flex-1 bg-black text-white p-4 rounded-xl font-black flex items-center justify-center gap-2"
                    >
                        <CreditCard size={20} />
                        Checkout <ArrowRight size={20} />
                    </motion.button>
                </div>

                {/* Add More Button */}
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={closeModal}
                    className="w-full mt-3 py-3 text-sm font-bold text-gray-500"
                >
                    + Add More Items
                </motion.button>
            </div>
        </>
    );
}

