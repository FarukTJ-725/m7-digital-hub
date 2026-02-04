import React, { useState } from 'react';
import { useUI } from '../contexts/UIContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, LogIn, UserPlus, Loader2 } from 'lucide-react';

export const AuthModal: React.FC = () => {
    const { closeModal, triggerError } = useUI();
    const { login } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const endpoint = isLogin ? '/auth/login' : '/auth/register';
        const body = isLogin 
            ? { email: formData.email, password: formData.password }
            : formData;

        try {
            const data = await api.post<{token: string, user: any}>(endpoint, body);
            login(data.token, data.user);
            closeModal();
        } catch (err: any) {
            triggerError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="modal-header bg-black text-white"
            >
                <div className="flex items-center justify-center gap-3 mb-2">
                    {isLogin ? <LogIn size={28} /> : <UserPlus size={28} />}
                    <h2 className="modal-title m-0 tracking-tight uppercase">
                        {isLogin ? 'WELCOME BACK' : 'JOIN THE HUB'}
                    </h2>
                </div>
                <p className="modal-subtitle">
                    {isLogin ? 'Login to your account' : 'Create a new account'}
                </p>
            </motion.div>

            <div className="modal-body-scrollable">
                <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-4">
                    <AnimatePresence mode="wait">
                        {!isLogin && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="search-bar-container m-0"
                            >
                                <User className="text-gray-400" size={20} />
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="Username"
                                    className="search-input"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    required
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    <div className="search-bar-container m-0">
                        <Mail className="text-gray-400" size={20} />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            className="search-input"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="search-bar-container m-0">
                        <Lock className="text-gray-400" size={20} />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            className="search-input"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="hub-btn w-full bg-black text-white border-none p-5 rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={24} />
                        ) : (
                            isLogin ? 'LOGIN' : 'REGISTER'
                        )}
                    </motion.button>

                    <div className="text-center">
                        <p className="font-bold text-sm text-gray-500">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                            <button 
                                type="button"
                                onClick={() => setIsLogin(!isLogin)} 
                                className="text-blue-500 font-black hover:underline underline-offset-4"
                            >
                                {isLogin ? 'Register' : 'Login'}
                            </button>
                        </p>
                    </div>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t-2 border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500 font-bold uppercase tracking-widest">Or</span>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => {
                            // Demo login - creates a mock user session
                            const demoUser = {
                                _id: 'demo-' + Date.now(),
                                username: 'DemoUser',
                                email: 'demo@digitalhub.com',
                                balance: 15000,
                                createdAt: new Date().toISOString(),
                                gamerProfile: {
                                    username: 'DemoGamer',
                                    level: 5,
                                    xp: 1250,
                                    winRate: 72,
                                    goals: 270,
                                    streak: 27,
                                    gamesPlayed: 45,
                                    rank: 'Gold',
                                    achievements: ['First Win', 'High Scorer'],
                                    createdAt: new Date().toISOString()
                                }
                            };
                            login('demo-token-' + Date.now(), demoUser);
                            closeModal();
                        }}
                        className="hub-btn w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white border-3 border-black p-4 rounded-2xl font-black text-base shadow-[0_6px_0_0_rgba(0,0,0,1)] flex items-center justify-center gap-3"
                    >
                        <span className="text-2xl">🎮</span>
                        <span>QUICK DEMO LOGIN</span>
                    </motion.button>

                    <p className="text-center text-xs text-gray-400 mt-4 font-medium">
                        Try the app with full access - no password needed!
                    </p>
                </form>
            </div>
        </>
    );
};
