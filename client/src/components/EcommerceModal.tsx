import React, { useState, useContext } from 'react';
import { UIContext } from '../contexts/UIContext';
import { motion } from 'framer-motion';
import { 
    ShoppingBag, Search, Filter, Star, Plus, Minus, 
    ShoppingCart, Heart, Share2, X, ChevronRight,
    Smartphone, Headphones, Watch, Laptop, Shirt
} from 'lucide-react';

interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    rating: number;
    reviews: number;
    inStock: boolean;
    brand: string;
}

const categories = [
    { id: 'all', name: 'All', icon: ShoppingBag },
    { id: 'electronics', name: 'Electronics', icon: Smartphone },
    { id: 'audio', name: 'Audio', icon: Headphones },
    { id: 'wearables', name: 'Wearables', icon: Watch },
    { id: 'computers', name: 'Computers', icon: Laptop },
    { id: 'fashion', name: 'Fashion', icon: Shirt },
];

const sampleProducts: Product[] = [
    {
        _id: '1',
        name: 'iPhone 15 Pro Max',
        description: 'Latest Apple flagship with A17 Pro chip',
        price: 1250000,
        category: 'electronics',
        imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400',
        rating: 4.8,
        reviews: 234,
        inStock: true,
        brand: 'Apple'
    },
    {
        _id: '2',
        name: 'AirPods Pro 2nd Gen',
        description: 'Active noise cancellation',
        price: 185000,
        category: 'audio',
        imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
        rating: 4.7,
        reviews: 567,
        inStock: true,
        brand: 'Apple'
    },
    {
        _id: '3',
        name: 'Samsung Galaxy Watch 6',
        description: 'Advanced health tracking',
        price: 295000,
        category: 'wearables',
        imageUrl: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400',
        rating: 4.5,
        reviews: 189,
        inStock: true,
        brand: 'Samsung'
    },
    {
        _id: '4',
        name: 'MacBook Air M3',
        description: '13-inch, 8GB RAM',
        price: 1450000,
        category: 'computers',
        imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=400',
        rating: 4.9,
        reviews: 412,
        inStock: true,
        brand: 'Apple'
    },
    {
        _id: '5',
        name: 'Nike Air Max 90',
        description: 'Classic running shoes',
        price: 85000,
        category: 'fashion',
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
        rating: 4.6,
        reviews: 892,
        inStock: true,
        brand: 'Nike'
    },
    {
        _id: '6',
        name: 'Premium Cotton T-Shirt',
        description: '100% organic cotton',
        price: 8500,
        category: 'fashion',
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
        rating: 4.3,
        reviews: 234,
        inStock: true,
        brand: 'Generic'
    },
];

export const EcommerceModal: React.FC = () => {
    const context = useContext(UIContext);
    const showEcommerce = context?.showEcommerce ?? false;
    const setShowEcommerce = context?.setShowEcommerce ?? (() => {});
    
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [products] = useState<Product[]>(sampleProducts);
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

    const filteredProducts = products.filter(product => {
        const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const updateQuantity = (productId: string, delta: number) => {
        setQuantities(prev => ({
            ...prev,
            [productId]: Math.max(1, (prev[productId] || 1) + delta)
        }));
    };

    if (!showEcommerce) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#1a1a2e] rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
            >
                <div className="flex items-center justify-between p-6 border-b border-[#16213e]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                            <ShoppingBag className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">M7 Shop</h2>
                            <p className="text-sm text-gray-400">Electronics & Fashion</p>
                        </div>
                    </div>
                    <button onClick={() => setShowEcommerce(false)} className="p-2 hover:bg-white/10 rounded-lg">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <div className="p-4 border-b border-[#16213e]">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-[#16213e] border border-gray-700 rounded-xl text-white"
                        />
                    </div>
                    
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                                    activeCategory === cat.id 
                                        ? 'bg-purple-500 text-white' 
                                        : 'bg-[#16213e] text-gray-400'
                                }`}
                            >
                                <cat.icon className="w-4 h-4" />
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {filteredProducts.map(product => (
                            <motion.div
                                key={product._id}
                                className="bg-[#16213e] rounded-xl overflow-hidden"
                            >
                                <div className="aspect-square relative">
                                    <img 
                                        src={product.imageUrl} 
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                
                                <div className="p-4">
                                    <p className="text-xs text-purple-400">{product.brand}</p>
                                    <h3 className="text-white font-bold text-sm">{product.name}</h3>
                                    
                                    <div className="flex items-center gap-1 mb-2">
                                        <Star className="w-4 h-4 text-yellow-400" />
                                        <span className="text-sm text-gray-300">{product.rating}</span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between mt-3">
                                        <span className="text-lg font-bold text-white">₦{product.price.toLocaleString()}</span>
                                        
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center bg-[#1a1a2e] rounded-lg">
                                                <button 
                                                    onClick={() => updateQuantity(product._id, -1)}
                                                    className="p-1 text-gray-400"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="px-2 text-white text-sm">{quantities[product._id] || 1}</span>
                                                <button 
                                                    onClick={() => updateQuantity(product._id, 1)}
                                                    className="p-1 text-gray-400"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <button className="p-2 bg-purple-500 rounded-lg text-white">
                                                <ShoppingCart className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
