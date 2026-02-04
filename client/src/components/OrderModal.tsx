import React, { useState } from 'react';
import { useUI } from '../contexts/UIContext';
import { motion } from 'framer-motion';
import { Package, Clock, Search, MapPin, Home, CheckCircle2, Loader2 } from 'lucide-react';

interface OrderDetails {
    _id: string;
    status: string;
    totalAmount: number;
    items: { name: string; price: number; qty: number }[];
    orderDate: string;
    estimatedDelivery?: string;
}

export const OrderModal: React.FC = () => {
    const { closeModal } = useUI();
    const [orderId, setOrderId] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
    const [error, setError] = useState('');

    // Demo order data
    const demoOrders: Record<string, OrderDetails> = {
        'DH-001': {
            _id: 'DH-001',
            status: 'preparing',
            totalAmount: 8500,
            items: [
                { name: 'Double Cheese Burger', price: 4500, qty: 1 },
                { name: 'Crispy Fries', price: 1500, qty: 2 },
                { name: 'Hub Monster Shake', price: 2500, qty: 1 }
            ],
            orderDate: new Date().toISOString(),
            estimatedDelivery: '25-35 mins'
        },
        'DH-002': {
            _id: 'DH-002',
            status: 'out-for-delivery',
            totalAmount: 5200,
            items: [
                { name: 'Jollof Rice Special', price: 5200, qty: 1 }
            ],
            orderDate: new Date(Date.now() - 30 * 60000).toISOString(),
            estimatedDelivery: '5-10 mins'
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderId.trim()) {
            setError('Please enter an order ID');
            return;
        }

        setIsSearching(true);
        setError('');

        // Simulate API call
        setTimeout(() => {
            const order = demoOrders[orderId.toUpperCase()];
            if (order) {
                setOrderDetails(order);
            } else {
                // Generate a mock order for any ID
                setOrderDetails({
                    _id: orderId.toUpperCase(),
                    status: 'preparing',
                    totalAmount: Math.floor(Math.random() * 10000) + 3000,
                    items: [
                        { name: 'Double Cheese Burger', price: 4500, qty: 1 }
                    ],
                    orderDate: new Date().toISOString(),
                    estimatedDelivery: '20-30 mins'
                });
            }
            setIsSearching(false);
        }, 1000);
    };

    const steps = [
        { id: 'confirmed', label: 'Order Confirmed', icon: CheckCircle2, desc: 'We received your order' },
        { id: 'preparing', label: 'Preparing', icon: Package, desc: 'Kitchen is cooking' },
        { id: 'out-for-delivery', label: 'On the Way', icon: MapPin, desc: 'Driver is nearby' },
        { id: 'delivered', label: 'Delivered', icon: Home, desc: 'Enjoy your meal!' },
    ];

    const getStatusIndex = (status: string) => {
        const statusMap: Record<string, number> = {
            'pending': 0,
            'confirmed': 1,
            'preparing': 2,
            'out-for-delivery': 3,
            'delivered': 4
        };
        return statusMap[status] || 0;
    };

    // Search Form View
    if (!orderDetails) {
        return (
            <>
                <motion.div 
                    initial={{ opacity: 0, y: -15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="modal-header"
                    style={{ 
                        background: 'linear-gradient(135deg, var(--card-order) 0%, #c0392b 100%)'
                    }}
                >
                    <div className="flex items-center justify-center gap-3 mb-2 relative z-10">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <Package size={28} />
                        </div>
                        <div>
                            <h2 className="modal-title m-0 uppercase tracking-tight">TRACK ORDER</h2>
                            <p className="modal-subtitle">Enter your order ID to track</p>
                        </div>
                    </div>
                </motion.div>

                <div className="modal-body-scrollable">
                    <form onSubmit={handleSearch} className="order-search-form">
                        <div className="search-bar-container group m-0">
                            <Search className="text-gray-400 group-focus-within:text-red-500" size={20} />
                            <input
                                type="text"
                                placeholder="Enter Order ID (e.g., DH-001)"
                                className="search-input font-mono"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                                maxLength={20}
                            />
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm font-bold mb-4">{error}</p>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isSearching}
                            className="hub-btn w-full bg-red-500 text-white border-none p-4 rounded-xl font-black flex items-center justify-center gap-2"
                        >
                            {isSearching ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    SEARCHING...
                                </>
                            ) : (
                                <>
                                    <Search size={20} />
                                    TRACK ORDER
                                </>
                            )}
                        </motion.button>
                    </form>

                    <div className="mt-8 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                        <h4 className="font-black text-sm mb-2 uppercase">Example Order IDs</h4>
                        <div className="flex gap-2">
                            {Object.keys(demoOrders).map(id => (
                                <button
                                    key={id}
                                    onClick={() => setOrderId(id)}
                                    className="px-3 py-2 bg-white border-2 border-gray-300 rounded-lg font-mono text-sm font-bold hover:border-red-500 transition-colors"
                                >
                                    {id}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Order Details View
    const currentStepIdx = getStatusIndex(orderDetails.status);

    return (
        <>
            <motion.div 
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                className="modal-header"
                style={{ 
                    background: 'linear-gradient(135deg, var(--card-order) 0%, #c0392b 100%)'
                }}
            >
                <div className="flex items-center justify-center gap-3 mb-2 relative z-10">
                    <div className="p-2 bg-white/20 rounded-xl">
                        <Package size={28} />
                    </div>
                    <div>
                        <h2 className="modal-title m-0 uppercase tracking-tight">TRACK ORDER</h2>
                        <p className="modal-subtitle font-black uppercase tracking-widest">#{orderDetails._id}</p>
                    </div>
                </div>
            </motion.div>

            <div className="modal-body-scrollable">
                <div className="order-body">
                    {/* Order Summary Card */}
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="order-status-container mb-6"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">STATUS</span>
                                <span className="text-lg font-black text-red-500 uppercase tracking-tight">
                                    {orderDetails.status.replace(/-/g, ' ')}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full border-2 border-gray-200">
                                <Clock size={16} className="text-gray-600" />
                                <span className="font-black text-sm">{orderDetails.estimatedDelivery}</span>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="border-t border-gray-200 pt-4 mt-4">
                            <h5 className="font-black text-xs uppercase text-gray-400 mb-3">Order Items</h5>
                            {orderDetails.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center py-2">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold">
                                            {item.qty}
                                        </span>
                                        <span className="font-bold text-sm">{item.name}</span>
                                    </div>
                                    <span className="font-black text-sm">₦{item.price.toLocaleString()}</span>
                                </div>
                            ))}
                            <div className="flex justify-between items-center border-t border-gray-200 pt-3 mt-3">
                                <span className="font-black uppercase">Total</span>
                                <span className="font-black text-lg text-red-500">₦{orderDetails.totalAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Progress Steps */}
                    <div className="progress-steps mb-6">
                        <div className="relative">
                            <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-200"></div>
                            {steps.map((step, idx) => {
                                const isActive = idx <= currentStepIdx;
                                const isCurrent = idx === currentStepIdx;
                                
                                return (
                                    <div key={step.id} className="flex gap-4 items-start mb-4 relative">
                                        <div className={`
                                            w-4 h-4 rounded-full border-3 flex-shrink-0 mt-0.5 z-10 transition-all
                                            ${isActive 
                                                ? 'bg-red-500 border-red-500' 
                                                : 'bg-white border-gray-300'}
                                            ${isCurrent ? 'scale-125' : ''}
                                        `}></div>
                                        <div>
                                            <h5 className={`font-black text-sm uppercase ${isActive ? 'text-black' : 'text-gray-300'}`}>
                                                {step.label}
                                            </h5>
                                            <p className={`text-xs font-bold ${isActive ? 'text-gray-500' : 'text-gray-300'}`}>
                                                {step.desc}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setOrderDetails(null)}
                            className="flex-1 bg-white border-2 border-gray-200 p-4 rounded-xl font-black flex items-center justify-center gap-2 transition-all"
                        >
                            <Search size={18} />
                            <span>NEW SEARCH</span>
                        </motion.button>
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={closeModal} 
                            className="flex-1 bg-black text-white p-4 rounded-xl font-black flex items-center justify-center gap-2 shadow-lg transition-all"
                        >
                            <span>CLOSE</span>
                        </motion.button>
                    </div>
                </div>
            </div>
        </>
    );
};
