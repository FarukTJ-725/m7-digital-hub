import React, { useState, useContext } from 'react';
import { UIContext } from '../contexts/UIContext';
import { motion } from 'framer-motion';
import { 
    Download, Search, Film, Music, FileText, Folder, 
    Clock, HardDrive, Wifi, WifiOff, Play, Pause,
    ChevronRight, Filter, X, Star, Eye
} from 'lucide-react';

interface DownloadItem {
    _id: string;
    title: string;
    description: string;
    thumbnail: string;
    type: 'movie' | 'music' | 'pdf' | 'ebook';
    size: string;
    duration?: string;
    artist?: string;
    author?: string;
    rating: number;
    downloads: number;
    category: string;
}

const sampleDownloads: DownloadItem[] = [
    {
        _id: '1',
        title: 'The Matrix',
        description: 'Science fiction action film',
        thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400',
        type: 'movie',
        size: '2.4 GB',
        duration: '2h 16m',
        rating: 4.8,
        downloads: 125000,
        category: 'Sci-Fi'
    },
    {
        _id: '2',
        title: 'Afrobeats Mix 2024',
        description: 'Best of Nigerian music',
        thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
        type: 'music',
        size: '156 MB',
        duration: '1h 42m',
        artist: 'Various Artists',
        rating: 4.5,
        downloads: 89000,
        category: 'Afrobeats'
    },
    {
        _id: '3',
        title: 'JavaScript Guide',
        description: 'Complete beginner to advanced',
        thumbnail: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400',
        type: 'ebook',
        size: '12 MB',
        author: 'John Doe',
        rating: 4.7,
        downloads: 45000,
        category: 'Programming'
    },
    {
        _id: '4',
        title: 'Nigeria History PDF',
        description: 'Historical documents',
        thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
        type: 'pdf',
        size: '8.5 MB',
        author: 'Historical Society',
        rating: 4.3,
        downloads: 23000,
        category: 'History'
    },
    {
        _id: '5',
        title: 'Inception',
        description: 'Mind-bending thriller',
        thumbnail: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400',
        type: 'movie',
        size: '1.8 GB',
        duration: '2h 28m',
        rating: 4.9,
        downloads: 234000,
        category: 'Thriller'
    },
    {
        _id: '6',
        title: 'Lo-Fi Beats',
        description: 'Relaxing study music',
        thumbnail: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400',
        type: 'music',
        size: '89 MB',
        duration: '58m',
        artist: 'Chill Vibes',
        rating: 4.6,
        downloads: 67000,
        category: 'Lo-Fi'
    },
];

export const DownloadsModal: React.FC = () => {
    const context = useContext(UIContext);
    const showDownloads = context?.showDownloads ?? false;
    const setShowDownloads = context?.setShowDownloads ?? (() => {});
    const [activeTab, setActiveTab] = useState<'discover' | 'movies' | 'music' | 'ebooks'>('discover');
    const [searchQuery, setSearchQuery] = useState('');
    const [downloading, setDownloading] = useState<Record<string, number>>({});

    const filteredItems = sampleDownloads.filter(item => {
        const matchesType = 
            activeTab === 'discover' ||
            (activeTab === 'movies' && item.type === 'movie') ||
            (activeTab === 'music' && item.type === 'music') ||
            (activeTab === 'ebooks' && ['pdf', 'ebook'].includes(item.type));
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
    });

    const handleDownload = (item: DownloadItem) => {
        setDownloading({ ...downloading, [item._id]: 0 });
        
        // Simulate download progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 20;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => {
                    const { [item._id]: _, ...rest } = downloading;
                    setDownloading(rest);
                }, 2000);
            }
            setDownloading(prev => ({ ...prev, [item._id]: progress }));
        }, 500);
    };

    if (!showDownloads) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#1a1a2e] rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#16213e]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl">
                            <Download className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">M7 Downloads</h2>
                            <p className="text-sm text-gray-400">Movies, Music & E-Books</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-green-500">
                            <Wifi className="w-4 h-4" />
                            <span className="text-sm">Ready to download</span>
                        </div>
                        <button
                            onClick={() => setShowDownloads(false)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 p-4 border-b border-[#16213e]">
                    {[
                        { id: 'discover', label: 'Discover', icon: Search },
                        { id: 'movies', label: 'Movies', icon: Film },
                        { id: 'music', label: 'Music', icon: Music },
                        { id: 'ebooks', label: 'E-Books', icon: FileText },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                                activeTab === tab.id 
                                    ? 'bg-green-500 text-white' 
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
                    {/* Search */}
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search movies, music, books..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-[#16213e] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-green-500"
                        />
                    </div>

                    {/* Download Progress */}
                    {Object.keys(downloading).length > 0 && (
                        <div className="mb-6 p-4 bg-[#16213e] rounded-xl">
                            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                <Download className="w-4 h-4 text-green-500 animate-bounce" />
                                Downloading...
                            </h3>
                            {Object.entries(downloading).map(([id, progress]) => {
                                const item = sampleDownloads.find(i => i._id === id);
                                if (!item) return null;
                                return (
                                    <div key={id} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-300">{item.title}</span>
                                            <span className="text-green-500">{Math.round(progress)}%</span>
                                        </div>
                                        <div className="h-2 bg-[#1a1a2e] rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-gradient-to-r from-green-500 to-teal-500 transition-all duration-300"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Items Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredItems.map(item => (
                            <motion.div
                                key={item._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-[#16213e] rounded-xl overflow-hidden hover:ring-2 hover:ring-green-500/50 transition-all cursor-pointer group"
                            >
                                <div className="aspect-square relative overflow-hidden">
                                    <img 
                                        src={item.thumbnail} 
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="p-3 bg-white rounded-full">
                                            <Play className="w-6 h-6 text-black" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded flex items-center gap-1">
                                        <HardDrive className="w-3 h-3" />
                                        {item.size}
                                    </div>
                                </div>
                                
                                <div className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            item.type === 'movie' ? 'bg-purple-500/20 text-purple-400' :
                                            item.type === 'music' ? 'bg-pink-500/20 text-pink-400' :
                                            'bg-blue-500/20 text-blue-400'
                                        }`}>
                                            {item.type.toUpperCase()}
                                        </span>
                                        <span className="text-xs text-gray-500">{item.category}</span>
                                    </div>
                                    
                                    <h3 className="text-white font-bold text-sm mb-1 line-clamp-1">{item.title}</h3>
                                    <p className="text-xs text-gray-400 mb-2 line-clamp-1">{item.description}</p>
                                    
                                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                                        {item.artist && <span>{item.artist}</span>}
                                        {item.author && <span>{item.author}</span>}
                                        {item.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{item.duration}</span>}
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-xs text-gray-400">
                                            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />{item.rating}</span>
                                            <span className="flex items-center gap-1"><Download className="w-3 h-3" />{(item.downloads / 1000).toFixed(0)}k</span>
                                        </div>
                                        
                                        <button
                                            onClick={() => handleDownload(item)}
                                            disabled={downloading[item._id] !== undefined}
                                            className={`p-2 rounded-lg transition-all ${
                                                downloading[item._id] !== undefined
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-[#1a1a2e] text-green-500 hover:bg-green-500 hover:text-white'
                                            }`}
                                        >
                                            {downloading[item._id] !== undefined ? (
                                                <span className="text-xs font-bold">{Math.round(downloading[item._id])}%</span>
                                            ) : (
                                                <Download className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Categories */}
                    <div className="mt-8">
                        <h3 className="text-lg font-bold text-white mb-4">Browse by Category</h3>
                        <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                            {['Movies', 'Music', 'E-Books', 'Documents', 'Software', 'Games'].map(cat => (
                                <button
                                    key={cat}
                                    className="p-4 bg-[#16213e] rounded-xl text-white font-medium hover:bg-green-500 transition-colors text-sm"
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
