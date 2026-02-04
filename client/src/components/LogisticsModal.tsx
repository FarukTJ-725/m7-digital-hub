import React, { useState, useContext } from 'react';
import { UIContext } from '../contexts/UIContext';
import { motion } from 'framer-motion';
import { 
    MapPin, Navigation, Package, Truck, Clock, Phone, 
    User, Search, ChevronRight, Star, X,
    CheckCircle, AlertCircle, MapPinHouse
} from 'lucide-react';

interface Delivery {
    _id: string;
    trackingNumber: string;
    status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered';
    pickup: { address: string; time: string };
    dropoff: { address: string; time: string };
    driver?: { name: string; phone: string; rating: number; vehicle: string };
    customer: { name: string; phone: string };
    items: string[];
    distance: string;
    estimatedTime: string;
    price: number;
}

const activeDeliveries: Delivery[] = [
    {
        _id: '1',
        trackingNumber: 'M7-2024-001234',
        status: 'in_transit',
        pickup: { address: 'M7 Digital Hub, Ahmadu Bello Way, Kano', time: '10:30 AM' },
        dropoff: { address: 'Sabon Gari, Kano', time: '2:30 PM' },
        driver: { name: 'Ahmed Ibrahim', phone: '+234 803 123 4567', rating: 4.8, vehicle: 'Toyota Hiace' },
        customer: { name: 'Umar Faruk', phone: '+234 807 890 1234' },
        items: ['Laptop', 'Phone Charger'],
        distance: '12.5 km',
        estimatedTime: '45 mins',
        price: 2500
    },
    {
        _id: '2',
        trackingNumber: 'M7-2024-001235',
        status: 'out_for_delivery',
        pickup: { address: 'City Mall, Lagos', time: '8:00 AM' },
        dropoff: { address: 'Victoria Island, Lagos', time: '12:00 PM' },
        driver: { name: 'Chinedu Okeke', phone: '+234 809 234 5678', rating: 4.9, vehicle: 'Honda Bike' },
        customer: { name: 'Sarah Johnson', phone: '+234 801 345 6789' },
        items: ['Documents Package'],
        distance: '8.2 km',
        estimatedTime: '15 mins',
        price: 1500
    },
];

export const LogisticsModal: React.FC = () => {
    const context = useContext(UIContext);
    const showLogistics = context?.showLogistics ?? false;
    const setShowLogistics = context?.setShowLogistics ?? (() => {});
    const [activeTab, setActiveTab] = useState<'track' | 'delivery' | 'history'>('track');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const statusColors = {
        pending: 'bg-yellow-500',
        picked_up: 'bg-blue-500',
        in_transit: 'bg-purple-500',
        out_for_delivery: 'bg-orange-500',
        delivered: 'bg-green-500'
    };

    const statusSteps = [
        { key: 'pending', label: 'Order Placed', icon: CheckCircle },
        { key: 'picked_up', label: 'Picked Up', icon: Package },
        { key: 'in_transit', label: 'In Transit', icon: Truck },
        { key: 'out_for_delivery', label: 'Out for Delivery', icon: Navigation },
        { key: 'delivered', label: 'Delivered', icon: CheckCircle },
    ];

    if (!showLogistics) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#1a1a2e] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#16213e]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
                            <Truck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">M7 Logistics</h2>
                            <p className="text-sm text-gray-400">Fast & Reliable Delivery</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowLogistics(false)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 p-4 border-b border-[#16213e]">
                    {[
                        { id: 'track', label: 'Track', icon: Navigation },
                        { id: 'delivery', label: 'Active', icon: Package },
                        { id: 'history', label: 'History', icon: Clock },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                                activeTab === tab.id 
                                    ? 'bg-blue-500 text-white' 
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {activeTab === 'track' && (
                        <div className="space-y-6">
                            {/* Track Input */}
                            <div className="bg-[#16213e] rounded-xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Track Your Package</h3>
                                <div className="flex gap-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Enter tracking number..."
                                            value={trackingNumber}
                                            onChange={(e) => setTrackingNumber(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-[#1a1a2e] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <button className="px-6 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors">
                                        Track
                                    </button>
                                </div>
                            </div>

                            {/* Sample Tracking Result */}
                            {trackingNumber && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-[#16213e] rounded-xl p-6"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <p className="text-sm text-gray-400">Tracking Number</p>
                                            <p className="text-xl font-bold text-white">{trackingNumber || 'M7-2024-001234'}</p>
                                        </div>
                                        <span className={`px-3 py-1 ${statusColors.in_transit} text-white text-sm font-bold rounded-full`}>
                                            In Transit
                                        </span>
                                    </div>

                                    {/* Progress Steps */}
                                    <div className="relative mb-6">
                                        <div className="absolute top-5 left-0 right-0 h-1 bg-[#1a1a2e]" />
                                        <div className="absolute top-5 left-0 h-1 bg-blue-500 w-3/4" />
                                        
                                        <div className="relative flex justify-between">
                                            {statusSteps.slice(0, 4).map((step, idx) => (
                                                <div key={step.key} className="flex flex-col items-center">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                        idx <= 2 ? 'bg-blue-500 text-white' : 'bg-[#1a1a2e] text-gray-500'
                                                    }`}>
                                                        <step.icon className="w-5 h-5" />
                                                    </div>
                                                    <p className={`text-xs mt-2 ${idx <= 2 ? 'text-white' : 'text-gray-500'}`}>
                                                        {step.label}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Route Info */}
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="bg-[#1a1a2e] rounded-xl p-4">
                                            <div className="flex items-center gap-2 text-blue-400 mb-2">
                                                <MapPin className="w-4 h-4" />
                                                <span className="text-sm font-medium">Pickup</span>
                                            </div>
                                            <p className="text-white font-medium">M7 Digital Hub, Kano</p>
                                            <p className="text-sm text-gray-400">10:30 AM</p>
                                        </div>
                                        <div className="bg-[#1a1a2e] rounded-xl p-4">
                                            <div className="flex items-center gap-2 text-green-400 mb-2">
                                                <MapPinHouse className="w-4 h-4" />
                                                <span className="text-sm font-medium">Drop-off</span>
                                            </div>
                                            <p className="text-white font-medium">Sabon Gari, Kano</p>
                                            <p className="text-sm text-gray-400">Est. 2:30 PM</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    )}

                    {activeTab === 'delivery' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-white">Active Deliveries</h3>
                                <span className="text-sm text-gray-400">{activeDeliveries.length} active</span>
                            </div>
                            
                            {activeDeliveries.map(delivery => (
                                <motion.div
                                    key={delivery._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-[#16213e] rounded-xl p-4"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="text-white font-bold">{delivery.trackingNumber}</p>
                                            <p className="text-sm text-gray-400">{delivery.items.join(', ')}</p>
                                        </div>
                                        <span className={`px-3 py-1 ${statusColors[delivery.status]} text-white text-xs font-bold rounded-full`}>
                                            {delivery.status.replace(/_/g, ' ').toUpperCase()}
                                        </span>
                                    </div>

                                    {/* Route */}
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full" />
                                            <div className="w-0.5 h-8 bg-gray-700" />
                                            <div className="w-3 h-3 bg-green-500 rounded-full" />
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <div>
                                                <p className="text-xs text-gray-400">From</p>
                                                <p className="text-white text-sm">{delivery.pickup.address}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400">To</p>
                                                <p className="text-white text-sm">{delivery.dropoff.address}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Driver Info */}
                                    {delivery.driver && (
                                        <div className="flex items-center gap-4 p-3 bg-[#1a1a2e] rounded-lg">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                                                {delivery.driver.name.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-white font-medium">{delivery.driver.name}</p>
                                                <p className="text-xs text-gray-400">{delivery.driver.vehicle}</p>
                                            </div>
                                            <div className="flex items-center gap-1 text-yellow-400">
                                                <Star className="w-4 h-4 fill-yellow-400" />
                                                <span className="text-sm">{delivery.driver.rating}</span>
                                            </div>
                                            <button className="p-2 bg-blue-500 rounded-lg text-white hover:bg-blue-600 transition-colors">
                                                <Phone className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                                        <div className="flex items-center gap-4 text-sm text-gray-400">
                                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{delivery.distance}</span>
                                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{delivery.estimatedTime}</span>
                                        </div>
                                        <p className="text-lg font-bold text-white">₦{delivery.price.toLocaleString()}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="space-y-4">
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search history..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-[#16213e] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            
                            {[
                                { id: '3', number: 'M7-2024-001230', status: 'delivered', date: 'Yesterday', amount: 3500 },
                                { id: '4', number: 'M7-2024-001229', status: 'delivered', date: '2 days ago', amount: 2000 },
                                { id: '5', number: 'M7-2024-001228', status: 'delivered', date: 'Last week', amount: 4500 },
                            ].map(item => (
                                <div key={item.id} className="flex items-center justify-between p-4 bg-[#16213e] rounded-xl">
                                    <div>
                                        <p className="text-white font-medium">{item.number}</p>
                                        <p className="text-sm text-gray-400">{item.date}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1 text-green-500">
                                            <CheckCircle className="w-4 h-4" />
                                            Delivered
                                        </span>
                                        <span className="text-white font-bold">₦{item.amount.toLocaleString()}</span>
                                        <ChevronRight className="w-5 h-5 text-gray-400" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                <div className="p-4 border-t border-[#16213e]">
                    <button className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:from-blue-600 hover:to-cyan-700 transition-all">
                        <Package className="w-5 h-5" />
                        Create New Delivery
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
