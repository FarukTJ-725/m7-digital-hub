import React, { useState, useContext } from 'react';
import { UIContext } from '../contexts/UIContext';
import { motion } from 'framer-motion';
import { 
    Play, Pause, Volume2, VolumeX, Maximize, SkipForward, SkipBack,
    Radio, Mic, Tv, Film, Clock, ThumbsUp, Plus, Heart, Share2,
    ChevronRight, Search, Filter, X
} from 'lucide-react';

interface Stream {
    _id: string;
    title: string;
    description: string;
    thumbnail: string;
    type: 'podcast' | 'live' | 'movie' | 'series';
    host?: string;
    duration?: string;
    viewers?: number;
    category: string;
    isLive?: boolean;
}

const sampleStreams: Stream[] = [
    {
        _id: '1',
        title: 'Tech Talk Nigeria',
        description: 'Weekly tech news and discussions about the African tech scene',
        thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400',
        type: 'podcast',
        host: 'John Doe',
        duration: '45 min',
        category: 'Technology'
    },
    {
        _id: '2',
        title: 'Premier League Highlights',
        description: 'Catch up on all the action from this weekend matches',
        thumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400',
        type: 'live',
        host: 'Sky Sports',
        viewers: 12500,
        category: 'Sports'
    },
    {
        _id: '3',
        title: 'Nollywood Classics',
        description: 'Best of Nigerian cinema streaming now',
        thumbnail: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400',
        type: 'movie',
        duration: '2h 15m',
        category: 'Entertainment'
    },
    {
        _id: '4',
        title: 'Morning Motivation',
        description: 'Start your day with positive energy and motivation',
        thumbnail: 'https://images.unsplash.com/photo-1552674605-5d226f5bf74c?w=400',
        type: 'podcast',
        host: 'Sarah Johnson',
        duration: '30 min',
        category: 'Self Help'
    },
    {
        _id: '5',
        title: 'Business Insights',
        description: 'Interview with top African entrepreneurs',
        thumbnail: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400',
        type: 'series',
        host: 'Bloomberg',
        duration: '1h',
        category: 'Business'
    },
    {
        _id: '6',
        title: 'Live Music Concert',
        description: 'Afrobeats stars performing live',
        thumbnail: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400',
        type: 'live',
        viewers: 8900,
        category: 'Music'
    },
];

export const StreamingModal: React.FC = () => {
    const context = useContext(UIContext);
    const showStreaming = context?.showStreaming ?? false;
    const setShowStreaming = context?.setShowStreaming ?? (() => {});
    const [activeTab, setActiveTab] = useState<'discover' | 'podcasts' | 'live' | 'library'>('discover');
    const [nowPlaying, setNowPlaying] = useState<Stream | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(80);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredStreams = sampleStreams.filter(stream => {
        const matchesType = 
            activeTab === 'discover' || 
            (activeTab === 'podcasts' && stream.type === 'podcast') ||
            (activeTab === 'live' && stream.type === 'live') ||
            (activeTab === 'library' && ['movie', 'series'].includes(stream.type));
        const matchesSearch = stream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            stream.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
    });

    if (!showStreaming) return null;

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
                        <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl">
                            <Tv className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">M7 Streaming</h2>
                            <p className="text-sm text-gray-400">Podcasts, Live TV & Movies</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowStreaming(false)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 p-4 border-b border-[#16213e]">
                    {[
                        { id: 'discover', label: 'Discover', icon: Search },
                        { id: 'podcasts', label: 'Podcasts', icon: Mic },
                        { id: 'live', label: 'Live Now', icon: Radio },
                        { id: 'library', label: 'Library', icon: Film },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                                activeTab === tab.id 
                                    ? 'bg-red-500 text-white' 
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
                            placeholder="Search podcasts, shows, movies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-[#16213e] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                        />
                    </div>

                    {/* Featured / Now Playing */}
                    {nowPlaying && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 bg-gradient-to-r from-red-900/50 to-orange-900/50 rounded-2xl p-6 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent" />
                            <div className="relative flex gap-6">
                                <img 
                                    src={nowPlaying.thumbnail} 
                                    alt={nowPlaying.title}
                                    className="w-32 h-32 object-cover rounded-xl"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        {nowPlaying.isLive && (
                                            <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                                                LIVE
                                            </span>
                                        )}
                                        <span className="text-gray-400 text-sm">{nowPlaying.type}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{nowPlaying.title}</h3>
                                    <p className="text-gray-400 text-sm mb-4">{nowPlaying.description}</p>
                                    
                                    {/* Player Controls */}
                                    <div className="flex items-center gap-4">
                                        <button 
                                            onClick={() => setIsPlaying(!isPlaying)}
                                            className="p-3 bg-white rounded-full text-black hover:scale-105 transition-transform"
                                        >
                                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                        </button>
                                        <button className="p-2 text-gray-400 hover:text-white">
                                            <SkipBack className="w-5 h-5" />
                                        </button>
                                        <button className="p-2 text-gray-400 hover:text-white">
                                            <SkipForward className="w-5 h-5" />
                                        </button>
                                        <div className="flex items-center gap-2 flex-1 max-w-xs">
                                            <Volume2 className="w-4 h-4 text-gray-400" />
                                            <input 
                                                type="range" 
                                                min="0" 
                                                max="100" 
                                                value={volume}
                                                onChange={(e) => setVolume(parseInt(e.target.value))}
                                                className="flex-1 accent-red-500"
                                            />
                                        </div>
                                        <button className="p-2 text-gray-400 hover:text-white">
                                            <Maximize className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Streams Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredStreams.map(stream => (
                            <motion.div
                                key={stream._id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-[#16213e] rounded-xl overflow-hidden group cursor-pointer"
                                onClick={() => {
                                    setNowPlaying(stream);
                                    setIsPlaying(true);
                                }}
                            >
                                <div className="aspect-video relative overflow-hidden">
                                    <img 
                                        src={stream.thumbnail} 
                                        alt={stream.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="p-3 bg-white rounded-full">
                                            <Play className="w-6 h-6 text-black" />
                                        </div>
                                    </div>
                                    {stream.isLive && (
                                        <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                                            LIVE
                                        </div>
                                    )}
                                    {stream.viewers && (
                                        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded-full flex items-center gap-1">
                                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                            {stream.viewers.toLocaleString()}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="p-4">
                                    <p className="text-xs text-red-400 font-medium mb-1">{stream.category}</p>
                                    <h3 className="text-white font-bold text-sm mb-1 line-clamp-1">{stream.title}</h3>
                                    <div className="flex items-center justify-between">
                                        {stream.host && (
                                            <span className="text-xs text-gray-400">{stream.host}</span>
                                        )}
                                        {stream.duration && (
                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {stream.duration}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className="flex gap-2 mt-3">
                                        <button className="flex-1 py-2 bg-[#1a1a2e] text-gray-400 text-xs rounded-lg hover:text-white transition-colors flex items-center justify-center gap-1">
                                            <Plus className="w-3 h-3" />
                                            Add
                                        </button>
                                        <button className="p-2 bg-[#1a1a2e] text-gray-400 rounded-lg hover:text-red-500 transition-colors">
                                            <Heart className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Categories */}
                    <div className="mt-8">
                        <h3 className="text-lg font-bold text-white mb-4">Browse Categories</h3>
                        <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                            {['Technology', 'Sports', 'Music', 'News', 'Comedy', 'Education'].map(cat => (
                                <button
                                    key={cat}
                                    className="p-4 bg-[#16213e] rounded-xl text-white font-medium hover:bg-red-500 transition-colors text-sm"
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
