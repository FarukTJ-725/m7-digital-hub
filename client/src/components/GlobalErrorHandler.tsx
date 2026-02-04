import React from 'react';
import { useUI } from '../contexts/UIContext';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

export const GlobalErrorHandler: React.FC = () => {
    const { error, clearError } = useUI();

    return (
        <AnimatePresence>
            {error && (
                <motion.div 
                    initial={{ opacity: 0, y: -50, x: '-50%', scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
                    exit={{ opacity: 0, y: -20, x: '-50%', scale: 0.9 }}
                    className="error-toast fixed top-6 left-1/2 z-[1000] w-[calc(100%-48px)] max-w-md"
                >
                    <div className="error-toast-content bg-red-500 text-white border-4 border-black p-4 rounded-2xl shadow-[6px_6px_0_0_rgba(0,0,0,1)] flex items-center gap-4">
                        <AlertCircle className="shrink-0" size={24} strokeWidth={3} />
                        <p className="error-toast-message flex-1 font-black text-sm uppercase tracking-tight">
                            {error}
                        </p>
                        <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="error-toast-close p-1 hover:bg-white/20 rounded-lg transition-colors" 
                            onClick={clearError}
                        >
                            <X size={20} strokeWidth={3} />
                        </motion.button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
