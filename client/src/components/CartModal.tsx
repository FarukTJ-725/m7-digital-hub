import React from 'react';
import { useUI } from '../contexts/UIContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';

export const CartModal: React.FC = () => {
    const { openModal } = useUI();
    const { cartItems, updateItemQuantity, removeFromCart, totalAmount } = useCart();
    const { isAuthenticated } = useAuth();

    const handleCheckout = () => {
        if (!isAuthenticated) {
            openModal('auth');
            return;
        }
        openModal('chat');
    };

    return (
        <>
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="modal-header bg-black text-white"
            >
                <div className="flex items-center justify-center gap-3 mb-2">
                    <ShoppingBag size={28} />
                    <h2 className="modal-title m-0">YOUR BASKET</h2>
                </div>
                <p className="modal-subtitle">Review your hub selection</p>
            </motion.div>

            <div className="modal-body-scrollable">
                <AnimatePresence mode="wait">
                    {cartItems.length === 0 ? (
                        <motion.div 
                            key="empty-cart"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center justify-center py-16 px-6 text-center"
                        >
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 border-4 border-dashed border-gray-300">
                                <ShoppingCart size={48} className="text-gray-400" />
                            </div>
                            <h3 className="font-black text-2xl mb-2">Your basket is empty</h3>
                            <p className="font-bold text-gray-500 mb-8 leading-relaxed">Looks like you haven't added anything to your basket yet.</p>
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => openModal('menu')}
                                className="hub-btn w-full bg-black text-white border-none p-5 rounded-2xl font-black shadow-xl"
                            >
                                BROWSE MENU
                            </motion.button>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="cart-content"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className="cart-items-list space-y-4 mb-8">
                                <AnimatePresence mode="popLayout">
                                    {cartItems.map((item) => (
                                        <motion.div 
                                            layout
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            exit={{ x: 20, opacity: 0 }}
                                            className="cart-item" 
                                            key={item.id}
                                        >
                                            <div className="w-20 h-20 rounded-xl border-2 border-black overflow-hidden shrink-0">
                                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-black text-base truncate uppercase">{item.name}</h4>
                                                <div className="font-black text-green-600">₦{item.price.toLocaleString()}</div>
                                            </div>
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="cart-item-controls flex items-center gap-3 bg-gray-100 p-1 rounded-xl border-2 border-black">
                                                    <motion.button 
                                                        whileTap={{ scale: 0.8 }}
                                                        className="p-1 hover:bg-gray-200 rounded-lg"
                                                        onClick={() => updateItemQuantity(item.id, item.qty - 1)}
                                                    >
                                                        <Minus size={16} strokeWidth={3} />
                                                    </motion.button>
                                                    <span className="font-black text-sm min-w-[20px] text-center">{item.qty}</span>
                                                    <motion.button 
                                                        whileTap={{ scale: 0.8 }}
                                                        className="p-1 hover:bg-gray-200 rounded-lg"
                                                        onClick={() => updateItemQuantity(item.id, item.qty + 1)}
                                                    >
                                                        <Plus size={16} strokeWidth={3} />
                                                    </motion.button>
                                                </div>
                                                <motion.button 
                                                    whileHover={{ color: '#ef4444', scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-gray-400 p-1"
                                                >
                                                    <Trash2 size={18} />
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            <motion.div 
                                layout
                                className="cart-summary bg-gray-50 border-4 border-black p-6 rounded-3xl mb-8"
                            >
                                <div className="space-y-3 font-bold">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span>₦{totalAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Delivery Fee</span>
                                        <span>₦500</span>
                                    </div>
                                    <div className="h-px bg-black/10 my-2"></div>
                                    <div className="flex justify-between text-2xl font-black pt-2">
                                        <span>TOTAL</span>
                                        <span className="text-blue-600">₦{(totalAmount + 500).toLocaleString()}</span>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.button 
                                layout
                                whileHover={{ scale: 1.02, translateY: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleCheckout}
                                className="hub-btn w-full bg-green-500 text-white border-3 border-black p-5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-[0_6px_0_0_rgba(0,0,0,1)] transition-all"
                            >
                                <span className="text-lg">CONFIRM & PAY</span>
                                <ArrowRight size={24} strokeWidth={3} />
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};
