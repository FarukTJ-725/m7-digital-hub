import React, { useState, useEffect } from 'react';
import { useUI } from '../contexts/UIContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Gamepad2, Trophy, Target, Zap, Rocket, Loader2, 
    ArrowLeft, Crown, Flame, Star, Users, Calendar,
    TrendingUp, Award, ChevronRight, X, Check, AlertCircle
} from 'lucide-react';

interface GamerProfile {
    _id: string;
    gamerUsername: string;
    favoriteTeam: string;
    stats: {
        wins: number;
        losses: number;
        draws: number;
        matchesPlayed: number;
        goalsScored: number;
        goalsConceded: number;
        currentStreak: number;
        longestStreak: number;
        winRate: number;
    };
    gamingStyle: string;
    preferredPosition: string;
}

interface MatchResult {
    _id: string;
    player1Username: string;
    player2Username: string;
    player1Team: string;
    player2Team: string;
    player1Score: number;
    player2Score: number;
    gameVersion: string;
    matchDate: string;
}

const teams = [
    'Real Madrid', 'Barcelona', 'Man City', 'Liverpool', 'Bayern',
    'PSG', 'Juventus', 'Inter', 'Chelsea', 'Man Utd', 'Arsenal', 'Tottenham'
];

export const GameModal: React.FC = () => {
    const { closeModal } = useUI();
    const { user, isAuthenticated, updateUser } = useAuth();
    
    const [activeTab, setActiveTab] = useState<'dashboard' | 'rankings' | 'matches' | 'profile'>('dashboard');
    const [isCreating, setIsCreating] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [gamerTag, setGamerTag] = useState('');
    const [favoriteTeam, setFavoriteTeam] = useState('');
    const [myProfile, setMyProfile] = useState<GamerProfile | null>(null);
    const [recentMatches, setRecentMatches] = useState<MatchResult[]>([]);
    const [topGamers, setTopGamers] = useState<GamerProfile[]>([]);
    const [showRecordMatch, setShowRecordMatch] = useState(false);
    const [showRankings, setShowRankings] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadGamerData();
    }, [isAuthenticated]);

    const loadGamerData = async () => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        try {
            const profileRes = await api.get<GamerProfile>('/gamer/profile');
            setMyProfile(profileRes);
        } catch (err: any) {
            if (err.response?.status === 404) {
                setIsCreating(true);
            }
        }

        try {
            const matchesRes = await api.get<MatchResult[]>('/matches/recent?limit=5');
            setRecentMatches(matchesRes);
        } catch (err) {
            console.error('Failed to load matches');
        }

        try {
            const rankingsRes = await api.get<GamerProfile[]>('/gamer/rankings');
            setTopGamers(rankingsRes.slice(0, 5));
        } catch (err) {
            console.error('Failed to load rankings');
        }

        setLoading(false);
    };

    const handleCreateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!gamerTag.trim() || !favoriteTeam) return;

        setSubmitting(true);
        try {
            await api.post('/gamer/profile', {
                gamerUsername: gamerTag,
                favoriteTeam,
                gamingStyle: 'Balanced',
                preferredPosition: 'Any'
            });
            setIsCreating(false);
            loadGamerData();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to create profile');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRecordMatch = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        try {
            await api.post('/matches/record', {
                player1Username: formData.get('player1Username'),
                player2Username: formData.get('player2Username'),
                player1Team: formData.get('player1Team'),
                player2Team: formData.get('player2Team'),
                player1Score: parseInt(formData.get('player1Score') as string),
                player2Score: parseInt(formData.get('player2Score') as string),
                gameVersion: formData.get('gameVersion') || 'FC26',
                matchType: 'casual'
            });
            setShowRecordMatch(false);
            loadGamerData();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to record match');
        }
    };

    // Not authenticated
    if (!isAuthenticated || !user) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 border-3 border-gray-200">
                    <Gamepad2 size={40} className="text-gray-400" />
                </div>
                <h2 className="font-black text-2xl mb-2 uppercase tracking-tight">GAME HUB</h2>
                <p className="font-bold text-gray-500 mb-8">Login to access the gaming arena and compete with other players!</p>
                <button 
                    onClick={closeModal}
                    className="hub-btn w-full bg-black text-white p-4 rounded-xl font-black"
                >
                    CLOSE
                </button>
            </div>
        );
    }

    // Loading state
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                <p className="font-bold text-gray-500">Loading GameHub...</p>
            </div>
        );
    }

    // Creating profile
    if (isCreating) {
        return (
            <>
                <motion.div 
                    initial={{ opacity: 0, y: -15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="modal-header"
                    style={{ 
                        background: 'linear-gradient(135deg, var(--card-game) 0%, #2980b9 100%)'
                    }}
                >
                    <div className="flex items-center justify-center gap-3 mb-2 relative z-10">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <Crown size={28} />
                        </div>
                        <div>
                            <h2 className="modal-title m-0 uppercase tracking-tight">NEW GAMER</h2>
                            <p className="modal-subtitle">Create your profile</p>
                        </div>
                    </div>
                </motion.div>
                <div className="modal-body-scrollable">
                    <form onSubmit={handleCreateProfile} className="flex flex-col gap-6 pt-4">
                        <div className="search-bar-container m-0 group">
                            <Target className="text-blue-500" size={24} strokeWidth={3} />
                            <input
                                type="text"
                                placeholder="GAMERTAG"
                                className="search-input font-black uppercase tracking-wider"
                                value={gamerTag}
                                onChange={(e) => setGamerTag(e.target.value.toUpperCase())}
                                maxLength={20}
                                minLength={3}
                                autoFocus
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Favorite Team</label>
                            <select
                                value={favoriteTeam}
                                onChange={(e) => setFavoriteTeam(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl font-bold focus:outline-none focus:border-blue-500"
                            >
                                <option value="">Select your team</option>
                                {teams.map(team => (
                                    <option key={team} value={team}>{team}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={submitting || !gamerTag.trim() || !favoriteTeam}
                                className="hub-btn w-full bg-black text-white p-4 rounded-xl font-black text-base flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {submitting ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <Crown size={20} />
                                        START GAMING
                                    </>
                                )}
                            </motion.button>
                            <button 
                                type="button"
                                onClick={closeModal}
                                className="font-bold text-gray-400 uppercase tracking-widest text-xs py-2 hover:text-black transition-colors"
                            >
                                CANCEL
                            </button>
                        </div>
                    </form>
                </div>
            </>
        );
    }

    const profile = myProfile;

    return (
        <>
            <motion.div 
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                className="modal-header"
                style={{ 
                    background: 'linear-gradient(135deg, var(--card-game) 0%, #2980b9 100%)'
                }}
            >
                <div className="flex items-center justify-center gap-3 mb-2 relative z-10">
                    <div className="p-2 bg-white/20 rounded-xl">
                        <Crown size={28} />
                    </div>
                    <div>
                        <h2 className="modal-title m-0 uppercase tracking-tight">GAME HUB</h2>
                        <p className="modal-subtitle">FC26 Gaming Arena</p>
                    </div>
                </div>
            </motion.div>

            <div className="modal-body-scrollable">
                {/* Tabs */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: Trophy },
                        { id: 'rankings', label: 'Rankings', icon: TrendingUp },
                        { id: 'matches', label: 'Matches', icon: Calendar },
                        { id: 'profile', label: 'Profile', icon: Users }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                                activeTab === tab.id 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="game-body">
                    {activeTab === 'dashboard' && profile && (
                        <>
                            {/* Quick Stats */}
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="profile-card mb-6"
                                style={{ 
                                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', 
                                    borderRadius: '24px', 
                                    padding: '20px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '16px', 
                                    border: '3px solid var(--card-game)'
                                }}
                            >
                                <div style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, #f39c12, #e74c3c)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 900, color: '#fff' }}>
                                    {profile.gamerUsername.charAt(0)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 className="text-white font-black text-lg uppercase">{profile.gamerUsername}</h3>
                                    <p className="text-gray-400 text-xs">{profile.favoriteTeam}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-orange-500">{profile.stats.winRate}%</p>
                                    <p className="text-xs text-gray-400 uppercase">Win Rate</p>
                                </div>
                            </motion.div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-4 gap-2 mb-6">
                                <div className="bg-blue-50 p-3 rounded-xl text-center">
                                    <p className="text-xl font-black text-blue-600">{profile.stats.wins}</p>
                                    <p className="text-[10px] uppercase text-gray-500">Wins</p>
                                </div>
                                <div className="bg-red-50 p-3 rounded-xl text-center">
                                    <p className="text-xl font-black text-red-600">{profile.stats.losses}</p>
                                    <p className="text-[10px] uppercase text-gray-500">Losses</p>
                                </div>
                                <div className="bg-orange-50 p-3 rounded-xl text-center">
                                    <p className="text-xl font-black text-orange-600">{profile.stats.goalsScored}</p>
                                    <p className="text-[10px] uppercase text-gray-500">Goals</p>
                                </div>
                                <div className="bg-purple-50 p-3 rounded-xl text-center">
                                    <p className="text-xl font-black text-purple-600">🔥 {profile.stats.currentStreak}</p>
                                    <p className="text-[10px] uppercase text-gray-500">Streak</p>
                                </div>
                            </div>

                            {/* Top Gamers */}
                            <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-100 mb-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-black text-sm uppercase text-gray-700">TOP GAMERS</h4>
                                    <button 
                                        onClick={() => setActiveTab('rankings')}
                                        className="text-xs font-bold text-blue-500"
                                    >
                                        VIEW ALL →
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {topGamers.map((gamer, idx) => (
                                        <div key={gamer._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                            <div className="flex items-center gap-3">
                                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                                                    idx === 0 ? 'bg-yellow-400 text-yellow-900' : 
                                                    idx === 1 ? 'bg-gray-300 text-gray-700' : 
                                                    idx === 2 ? 'bg-orange-300 text-orange-900' :
                                                    'bg-gray-200 text-gray-600'
                                                }`}>
                                                    {idx + 1}
                                                </span>
                                                <span className="font-bold text-sm">{gamer.gamerUsername}</span>
                                            </div>
                                            <span className="font-black text-sm text-orange-500">{gamer.stats.winRate}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Matches */}
                            <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-100 mb-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-black text-sm uppercase text-gray-700">RECENT MATCHES</h4>
                                    <button 
                                        onClick={() => setActiveTab('matches')}
                                        className="text-xs font-bold text-blue-500"
                                    >
                                        VIEW ALL →
                                    </button>
                                </div>
                                {recentMatches.length === 0 ? (
                                    <p className="text-sm text-gray-400 text-center py-4">No matches yet</p>
                                ) : (
                                    <div className="space-y-2">
                                        {recentMatches.slice(0, 3).map(match => (
                                            <div key={match._id} className="flex items-center justify-between py-2 px-3 bg-white rounded-lg">
                                                <div className="flex-1 text-right">
                                                    <span className="text-sm font-bold">{match.player1Username}</span>
                                                </div>
                                                <div className="px-3 py-1 bg-gray-100 rounded mx-2">
                                                    <span className="font-black text-sm">{match.player1Score}-{match.player2Score}</span>
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <span className="text-sm font-bold">{match.player2Username}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Quick Actions */}
                            <div className="grid grid-cols-2 gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowRecordMatch(true)}
                                    className="bg-gradient-to-br from-orange-500 to-red-600 text-white p-4 rounded-xl border-2 border-orange-600"
                                >
                                    <Target size={24} className="mb-2" />
                                    <div className="font-black text-sm">RECORD MATCH</div>
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setActiveTab('profile')}
                                    className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl border-2 border-blue-600"
                                >
                                    <Users size={24} className="mb-2" />
                                    <div className="font-black text-sm">MY PROFILE</div>
                                </motion.button>
                            </div>
                        </>
                    )}

                    {activeTab === 'rankings' && (
                        <div className="space-y-3">
                            <h4 className="font-black text-lg uppercase text-gray-700 mb-4">🏆 Gamer Rankings</h4>
                            {topGamers.map((gamer, idx) => (
                                <motion.div 
                                    key={gamer._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-gray-100"
                                >
                                    <span className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-black ${
                                        idx === 0 ? 'bg-yellow-400 text-yellow-900' : 
                                        idx === 1 ? 'bg-gray-300 text-gray-700' : 
                                        idx === 2 ? 'bg-orange-400 text-orange-900' :
                                        'bg-gray-200 text-gray-600'
                                    }`}>
                                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                                    </span>
                                    <div style={{ flex: 1 }}>
                                        <p className="font-black text-lg uppercase">{gamer.gamerUsername}</p>
                                        <p className="text-xs text-gray-400">{gamer.favoriteTeam}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-black text-orange-500">{gamer.stats.winRate}%</p>
                                        <p className="text-[10px] uppercase text-gray-400">{gamer.stats.wins}W {gamer.stats.losses}L</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'matches' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="font-black text-lg uppercase text-gray-700">📅 Recent Matches</h4>
                                <button
                                    onClick={() => setShowRecordMatch(true)}
                                    className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors"
                                >
                                    + Record Match
                                </button>
                            </div>
                            {recentMatches.length === 0 ? (
                                <div className="text-center py-8">
                                    <Target size={48} className="mx-auto text-gray-300 mb-4" />
                                    <p className="font-bold text-gray-400">No matches recorded yet</p>
                                    <p className="text-sm text-gray-400">Record your first match to see it here!</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recentMatches.map(match => (
                                        <div key={match._id} className="bg-[#1a1a2e] rounded-xl p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 text-right">
                                                    <p className="text-white font-bold">{match.player1Username}</p>
                                                    <p className="text-xs text-gray-400">{match.player1Team}</p>
                                                </div>
                                                <div className="px-4 py-2 bg-gray-800 rounded-lg mx-4">
                                                    <p className="text-xl font-black text-white">
                                                        {match.player1Score} - {match.player2Score}
                                                    </p>
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <p className="text-white font-bold">{match.player2Username}</p>
                                                    <p className="text-xs text-gray-400">{match.player2Team}</p>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2 text-center">
                                                {new Date(match.matchDate).toLocaleDateString()} • {match.gameVersion}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'profile' && profile && (
                        <div className="space-y-6">
                            <div className="bg-[#1a1a2e] rounded-2xl p-6 text-center" style={{ border: '3px solid var(--card-game)' }}>
                                <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #f39c12, #e74c3c)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 900, color: '#fff', margin: '0 auto 16px' }}>
                                    {profile.gamerUsername.charAt(0)}
                                </div>
                                <h3 className="text-2xl font-black text-white uppercase">{profile.gamerUsername}</h3>
                                <p className="text-gray-400">{profile.favoriteTeam}</p>
                                
                                <div className="grid grid-cols-4 gap-4 mt-6">
                                    <div className="text-center">
                                        <p className="text-2xl font-black text-white">{profile.stats.matchesPlayed}</p>
                                        <p className="text-[10px] uppercase text-gray-400">Matches</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-black text-green-500">{profile.stats.wins}</p>
                                        <p className="text-[10px] uppercase text-gray-400">Wins</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-black text-red-500">{profile.stats.losses}</p>
                                        <p className="text-[10px] uppercase text-gray-400">Losses</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-black text-orange-500">{profile.stats.winRate}%</p>
                                        <p className="text-[10px] uppercase text-gray-400">Win Rate</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4">
                                <h4 className="font-black text-sm uppercase text-gray-700 mb-3">Performance</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">Goals Scored</span>
                                        <span className="font-bold">{profile.stats.goalsScored}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">Goals Conceded</span>
                                        <span className="font-bold">{profile.stats.goalsConceded}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">Longest Streak</span>
                                        <span className="font-bold">🔥 {profile.stats.longestStreak}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">Current Streak</span>
                                        <span className="font-bold">{profile.stats.currentStreak > 0 ? `🔥 ${profile.stats.currentStreak}` : '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Record Match Modal */}
            <AnimatePresence>
                {showRecordMatch && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowRecordMatch(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#1a1a2e] rounded-2xl w-full max-w-md overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-4 border-b border-gray-700">
                                <h3 className="text-lg font-bold text-white">Record Match Result</h3>
                                <button onClick={() => setShowRecordMatch(false)} className="text-gray-400 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleRecordMatch} className="p-4 space-y-4">
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-gray-400">Player 1</label>
                                    <div className="flex gap-2">
                                        <input
                                            name="player1Username"
                                            placeholder="Username"
                                            required
                                            className="flex-1 px-3 py-2 bg-[#16213e] border border-gray-700 rounded-lg text-white text-sm"
                                        />
                                        <select
                                            name="player1Team"
                                            required
                                            className="w-32 px-2 py-2 bg-[#16213e] border border-gray-700 rounded-lg text-white text-sm"
                                        >
                                            <option value="">Team</option>
                                            {teams.map(team => (
                                                <option key={team} value={team}>{team}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center gap-4 py-2">
                                    <input
                                        name="player1Score"
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        required
                                        className="w-16 px-3 py-2 bg-[#16213e] border border-gray-700 rounded-lg text-center text-xl font-bold text-white"
                                    />
                                    <span className="text-gray-500">-</span>
                                    <input
                                        name="player2Score"
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        required
                                        className="w-16 px-3 py-2 bg-[#16213e] border border-gray-700 rounded-lg text-center text-xl font-bold text-white"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-gray-400">Player 2</label>
                                    <div className="flex gap-2">
                                        <input
                                            name="player2Username"
                                            placeholder="Username"
                                            required
                                            className="flex-1 px-3 py-2 bg-[#16213e] border border-gray-700 rounded-lg text-white text-sm"
                                        />
                                        <select
                                            name="player2Team"
                                            required
                                            className="w-32 px-2 py-2 bg-[#16213e] border border-gray-700 rounded-lg text-white text-sm"
                                        >
                                            <option value="">Team</option>
                                            {teams.map(team => (
                                                <option key={team} value={team}>{team}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowRecordMatch(false)}
                                        className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg font-bold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-bold"
                                    >
                                        Record
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
