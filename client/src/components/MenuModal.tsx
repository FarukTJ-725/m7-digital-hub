import React, { useState, useEffect } from 'react';
import { useUI } from '../contexts/UIContext';
import { useCart } from '../contexts/CartContext';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, ShoppingBasket, ChefHat, Loader2, AlertCircle } from 'lucide-react';

interface MenuItem {
    id: string;
    _id: string;
    name: string;
    category: string;
    price: number;
    imageUrl: string;
}

export const MenuModal: React.FC = () => {
    const { openModal, triggerError } = useUI();
    const { addToCart, totalItems } = useCart();
    const [activeCategory, setActiveCategory] = useState('All Items');
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const data = await api.get<MenuItem[]>('/menu');
                setMenuItems(data);
            } catch (err: any) {
                console.error('API fetch failed, using fallback mock data:', err.message);
                const mockMenu: MenuItem[] = [
                    { id: 'm1', _id: 'm1', name: 'Double Cheese Burger', price: 4500, category: 'Burgers', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500' },
                    { id: 'm2', _id: 'm2', name: 'Spicy Chicken Wings', price: 3800, category: 'Sides', imageUrl: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500' },
                    { id: 'm3', _id: 'm3', name: 'Jollof Rice Special', price: 5200, category: 'Main', imageUrl: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=500' }
                ];
                setMenuItems(mockMenu);
                triggerError('Could not fetch latest menu. Using offline version.');
            } finally {
                setLoading(false);
            }
        };

        fetchMenu();
    }, [triggerError]);

    const categories = ['All Items', ...Array.from(new Set(menuItems.map(item => item.category)))];
    
    const filteredItems = menuItems.filter(item => {
        const matchesCategory = activeCategory === 'All Items' || item.category === activeCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleAddToCart = (item: MenuItem) => {
        addToCart({
            id: item._id || item.id,
            name: item.name,
            price: item.price,
            imageUrl: item.imageUrl
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                <p className="font-bold text-lg">Waking up the chefs...</p>
            </div>
        );
    }

    return (
        <>
            {/* Professional Modal Header */}
            <motion.div 
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="modal-header"
                style={{ 
                    background: 'linear-gradient(135deg, var(--card-menu) 0%, #27ae60 100%)'
                }}
            >
                <div className="flex items-center justify-center gap-3 mb-2 relative z-10">
                    <div className="p-2 bg-white/20 rounded-xl">
                        <ChefHat size={28} />
                    </div>
                    <div>
                        <h2 className="modal-title m-0">THE HUB KITCHEN</h2>
                        <p className="modal-subtitle">Fastest delivery in the Hub</p>
                    </div>
                </div>
            </motion.div>

            <div className="modal-body-scrollable">
                <div className="menu-body px-1">
                    <div className="category-tabs py-2">
                        {categories.map(category => (
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                key={category}
                                className={`category-tab ${activeCategory === category ? 'active' : ''}`}
                                onClick={() => setActiveCategory(category)}
                            >
                                {category}
                            </motion.button>
                        ))}
                    </div>

                    <div className="search-bar mb-6">
                        <div className="search-bar-container group focus-within:border-blue-500 transition-colors">
                            <Search className="text-gray-400 group-focus-within:text-blue-500" size={20} />
                            <input
                                type="text"
                                placeholder="Search deliciousness..."
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <motion.div 
                        layout
                        className="menu-grid"
                    >
                        <AnimatePresence mode='popLayout'>
                            {filteredItems.map(item => (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2 }}
                                    className="food-card group" 
                                    key={item._id || item.id}
                                >
                                    <div className="overflow-hidden rounded-xl mb-3 border-2 border-black">
                                        <motion.img 
                                            whileHover={{ scale: 1.1 }}
                                            src={item.imageUrl} 
                                            className="food-card-img m-0 w-full h-32 object-cover" 
                                            alt={item.name} 
                                        />
                                    </div>
                                    <h4 className="food-card-title truncate">{item.name}</h4>
                                    <div className="food-card-info">
                                        <span className="food-card-price font-black">₦{item.price.toLocaleString()}</span>
                                        <motion.button 
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="add-to-cart-btn flex items-center justify-center"
                                            onClick={() => handleAddToCart(item)}
                                        >
                                            <Plus size={18} />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {filteredItems.length === 0 && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12"
                        >
                            <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
                            <p className="font-bold text-gray-500">No delicious items found!</p>
                        </motion.div>
                    )}

                    <motion.button
                        layout
                        whileHover={{ scale: 1.02, translateY: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => openModal('cart')}
                        className="hub-btn w-full bg-black text-white border-none p-5 rounded-2xl font-black mt-8 flex items-center justify-center gap-3 shadow-xl"
                    >
                        <ShoppingBasket size={24} />
                        ORDER BASKET ({totalItems})
                    </motion.button>
                </div>
            </div>
        </>
    );
};
