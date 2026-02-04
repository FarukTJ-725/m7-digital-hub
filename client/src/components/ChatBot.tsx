import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, X, Sparkles, ShoppingCart, CreditCard, ChefHat, Gamepad2, Printer, ShoppingBag, Truck, Tv, Download, Newspaper } from 'lucide-react';

interface ChatMessage {
    id: string;
    role: 'user' | 'bot';
    content: string;
    timestamp: Date;
    quickReplies?: QuickReply[];
    onAction?: () => void;
}

interface QuickReply {
    label: string;
    value: string;
}

interface ChatBotProps {
    onOpenModal: (modalId: string, data?: any) => void;
    onStartCheckout: () => void;
}

export const ChatBot: React.FC<ChatBotProps> = ({ onOpenModal, onStartCheckout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Initialize chat
    useEffect(() => {
        if (messages.length === 0) {
            addBotMessage(`👋 <b>Welcome to M7 Digital Hub!</b>

I'm your personal assistant. How can I help you today?

<b>Services available:</b>
🍔 Food & Drinks - Order delicious meals
🎮 Game Sessions - FC26 1v1 matches
🖨️ Print Jobs - Upload & print documents
🛍️ E-commerce - Gadgets & fashion
🚗 Logistics - Delivery services
📺 Streaming - Watch & listen
📥 Downloads - Movies, music & more
📰 News - Personalized news

Or just <b>describe what you need</b> and I'll help you!`, [
                { label: '🍔 Order Food', value: 'food' },
                { label: '🎮 Game Session', value: 'game' },
                { label: '🖨️ Print', value: 'print' },
                { label: '🛒 View Cart', value: 'cart' }
            ]);
        }
    }, []);

    const addBotMessage = (content: string, quickReplies?: QuickReply[]) => {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'bot',
            content,
            timestamp: new Date(),
            quickReplies
        }]);
    };

    const addUserMessage = (content: string) => {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date()
        }]);
    };

    const processMessage = async (message: string) => {
        const lowerMessage = message.toLowerCase();
        
        // Food keywords
        if (lowerMessage.match(/(food|eat|hungry|burger|pizza|rice|chicken|order.*meal|want.*eat)/i)) {
            addBotMessage(`🍔 <b>Order Food</b>

Great! Let me help you order some delicious food. 

<b>Quick options:</b>
• Browse our full menu
• Add items directly
• Check what's in your cart

What would you like to do?`, [
                { label: '📋 View Menu', value: 'menu' },
                { label: '🛒 My Cart', value: 'cart' },
                { label: '💳 Checkout', value: 'checkout' }
            ]);
            return;
        }
        
        // Game keywords
        if (lowerMessage.match(/(game|play|match|score|fc26|gaming|session)/i)) {
            addBotMessage(`🎮 <b>Game Hub - FC26 1v1</b>

Ready to challenge other players? 

<b>Session Options:</b>
• 1 Hour Session - ₦2,000
• 2 Hour Session - ₦3,500
• Tournament Entry - ₦500

<b>Your stats:</b>
Win Rate, Goals, Streaks - all tracked!

What would you like to do?`, [
                { label: '🎮 Book Session', value: 'book_game' },
                { label: '🏆 Tournaments', value: 'tournaments' },
                { label: '📊 My Stats', value: 'my_stats' }
            ]);
            return;
        }
        
        // Print keywords
        if (lowerMessage.match(/(print|document|pdf|file|upload)/i)) {
            addBotMessage(`🖨️ <b>Print Service</b>

Upload your documents and we'll print them for you!

<b>Supported formats:</b> PDF, DOCX, JPG
<b>Options:</b> Color, Double-sided, Binding

Upload a file or check your print jobs!`, [
                { label: '📤 Upload File', value: 'upload_print' },
                { label: '📋 My Print Jobs', value: 'print_jobs' }
            ]);
            return;
        }
        
        // Cart keywords
        if (lowerMessage.match(/(cart|basket|my.*order|what.*have|show.*cart)/i)) {
            addBotMessage(`🛒 <b>Your Cart</b>\n\nLet me show you what's in your cart!`);
            onOpenModal('cart');
            return;
        }
        
        // Checkout keywords
        if (lowerMessage.match(/(checkout|pay|buy|purchase|order.*now)/i)) {
            addBotMessage(`💳 <b>Checkout</b>\n\nReady to complete your order?\n\nYour cart will be reviewed and you can proceed to payment via bank transfer.`);
            onStartCheckout();
            return;
        }
        
        // Track keywords
        if (lowerMessage.match(/(track|status|where.*order|delivery)/i)) {
            addBotMessage(`📦 <b>Track Your Order</b>

Enter your order ID to see its current status and location!`, [
                { label: '📋 My Orders', value: 'my_orders' }
            ]);
            return;
        }
        
        // Help
        if (lowerMessage.match(/(help|what.*can.*do|assist|support|options|services)/i)) {
            addBotMessage(`❓ <b>How Can I Help You?</b>

<b>Quick Commands:</b>
• "I want to order food" - Browse menu
• "Print my document" - Upload files
• "Book a game session" - FC26 matches
• "What's in my cart?" - View cart
• "Track my order" - Check status
• "Checkout" - Complete purchase

<b>Services:</b>
🍔 Restaurant - Fast food delivery
🎮 Game Hub - FC26 1v1 sessions
🖨️ Print Hub - Document printing
🛍️ E-commerce - Shop products
🚗 Logistics - Delivery service
📺 Streaming - Watch & listen
📥 Downloads - Media library
📰 News - Personalized feed`, [
                { label: '🍔 Order Food', value: 'food' },
                { label: '🎮 Play Games', value: 'game' },
                { label: '🖨️ Print', value: 'print' },
                { label: '🛒 View Cart', value: 'cart' }
            ]);
            return;
        }
        
        // General query
        addBotMessage(`🤔 <b>I understand you're interested in "${message}"</b>

I'm your M7 Digital Hub assistant! I can help you with:
• Ordering food and drinks
• Booking game sessions
• Printing documents
• Shopping products
• Delivery services
• Streaming content
• Downloading media
• Getting personalized news

What would you like to do?`, [
            { label: '🍔 Food', value: 'food' },
            { label: '🎮 Games', value: 'game' },
            { label: '🖨️ Print', value: 'print' },
            { label: '❓ Help', value: 'help' }
        ]);
    };

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        addUserMessage(inputValue);
        setInputValue('');
        setIsTyping(true);

        await new Promise(resolve => setTimeout(resolve, 800));
        
        setIsTyping(false);
        await processMessage(inputValue);
    };

    const handleQuickReply = async (value: string) => {
        setInputValue(value);
        await handleSend();
    };

    return (
        <>
            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="chatbot-window"
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        style={{
                            position: 'fixed',
                            bottom: '80px',
                            right: '20px',
                            width: '380px',
                            maxHeight: '600px',
                            background: 'white',
                            borderRadius: '20px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                            zIndex: 1000,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '16px 20px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    background: 'rgba(255,255,255,0.2)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <h3 style={{ fontWeight: 900, margin: 0 }}>M7 Assistant</h3>
                                    <span style={{ fontSize: '12px', opacity: 0.8 }}>● Online</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'white',
                                    cursor: 'pointer',
                                    padding: '8px'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div style={{
                            flex: 1,
                            overflow: 'auto',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }}>
                            {messages.map(msg => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                        maxWidth: '85%'
                                    }}
                                >
                                    <div style={{
                                        padding: '12px 16px',
                                        borderRadius: msg.role === 'user' 
                                            ? '20px 20px 4px 20px' 
                                            : '20px 20px 20px 4px',
                                        background: msg.role === 'user' 
                                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                            : '#f5f5f5',
                                        color: msg.role === 'user' ? 'white' : '#333',
                                        fontSize: '14px',
                                        lineHeight: 1.5
                                    }}
                                    dangerouslySetInnerHTML={{ 
                                        __html: msg.content.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') 
                                    }}
                                    />
                                    
                                    {msg.quickReplies && msg.quickReplies.length > 0 && (
                                        <div style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '8px',
                                            marginTop: '8px'
                                        }}>
                                            {msg.quickReplies.map((reply, idx) => (
                                                <motion.button
                                                    key={idx}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleQuickReply(reply.value)}
                                                    style={{
                                                        padding: '8px 16px',
                                                        borderRadius: '20px',
                                                        border: '2px solid #667eea',
                                                        background: 'white',
                                                        color: '#667eea',
                                                        fontSize: '13px',
                                                        fontWeight: 700,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {reply.label}
                                                </motion.button>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                            
                            {isTyping && (
                                <div style={{
                                    alignSelf: 'flex-start',
                                    padding: '12px 16px',
                                    background: '#f5f5f5',
                                    borderRadius: '20px 20px 20px 4px',
                                    display: 'flex',
                                    gap: '4px'
                                }}>
                                    <motion.span
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                        style={{ width: '8px', height: '8px', background: '#667eea', borderRadius: '50%' }}
                                    />
                                    <motion.span
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                                        style={{ width: '8px', height: '8px', background: '#667eea', borderRadius: '50%' }}
                                    />
                                    <motion.span
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                                        style={{ width: '8px', height: '8px', background: '#667eea', borderRadius: '50%' }}
                                    />
                                </div>
                            )}
                            
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div style={{
                            padding: '16px',
                            borderTop: '1px solid #eee',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'center'
                        }}>
                            <input
                                type="text"
                                placeholder="Describe what you need..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                style={{
                                    flex: 1,
                                    padding: '12px 16px',
                                    borderRadius: '25px',
                                    border: '2px solid #eee',
                                    fontSize: '14px',
                                    outline: 'none'
                                }}
                            />
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={handleSend}
                                style={{
                                    width: '45px',
                                    height: '45px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: 'none',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Send size={18} />
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                    zIndex: 999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {isOpen ? <X size={24} /> : <Bot size={28} />}
            </motion.button>
        </>
    );
};
