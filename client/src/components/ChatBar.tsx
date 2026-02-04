import React, { useState } from 'react';
import { useUI } from '../contexts/UIContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot } from 'lucide-react';

interface ChatBarProps {
  currentPlaceholder: string;
}

export const ChatBar: React.FC<ChatBarProps> = ({ currentPlaceholder }) => {
  const { openModal } = useUI();
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (inputValue.trim()) {
      openModal('chat');
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <motion.div 
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="chat-bar"
    >
      <div className="chat-input-wrapper flex-1">
        <Bot size={20} className="bot-icon" />
        <div className="relative flex-1 h-9 flex items-center overflow-hidden">
          <AnimatePresence mode="wait">
            {!inputValue && (
              <motion.span
                key={currentPlaceholder}
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -15, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute left-0 text-gray-400 font-bold text-xs pointer-events-none whitespace-nowrap"
              >
                {currentPlaceholder}
              </motion.span>
            )}
          </AnimatePresence>
          <input 
            type="text" 
            placeholder="" 
            autoComplete="off"
            aria-label="Type your message"
            className="chat-input-base w-full bg-transparent border-none outline-none font-bold text-sm text-black relative z-10"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
      <motion.button 
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="send-btn" 
        onClick={handleSend}
        aria-label="Send message"
      >
        <Send size={16} strokeWidth={2.5} />
      </motion.button>
    </motion.div>
  );
};
