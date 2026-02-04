import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useUI } from '../contexts/UIContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Utensils, Package, Gamepad2, Printer, ShoppingCart, HelpCircle, X } from 'lucide-react';

interface ChatMessage {
    id: number;
    text: string | React.ReactNode;
    sender: 'user' | 'bot';
    isHtml?: boolean;
}

interface QuickAction {
    label: string;
    icon: React.ReactNode;
    command: string;
    color: string;
}

export const ChatModal: React.FC = () => {
    const { closeModal, openModal, triggerError } = useUI();
    const { token, isAuthenticated, user, logout } = useAuth();
    const { cartItems, totalAmount, clearCart } = useCart();
    
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isBotTyping, setIsBotTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Quick action chips
    const quickActions: QuickAction[] = [
        { label: 'Menu', icon: <Utensils size={16} />, command: 'show menu', color: 'bg-green-500' },
        { label: 'Orders', icon: <Package size={16} />, command: 'track order', color: 'bg-red-500' },
        { label: 'Games', icon: <Gamepad2 size={16} />, command: 'play games', color: 'bg-blue-500' },
        { label: 'Print', icon: <Printer size={16} />, command: 'print document', color: 'bg-yellow-500' },
        { label: 'Cart', icon: <ShoppingCart size={16} />, command: 'view cart', color: 'bg-purple-500' },
        { label: 'Help', icon: <HelpCircle size={16} />, command: 'help', color: 'bg-gray-500' },
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const addBotMessage = useCallback(async (text: string | React.ReactNode, isHtml = false) => {
        setIsBotTyping(true);
        await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
        setIsBotTyping(false);

        setMessages(prevMessages => [
            ...prevMessages,
            { id: Date.now(), text, sender: 'bot', isHtml }
        ]);
    }, []);

    const addUserMessage = useCallback((text: string) => {
        setMessages(prevMessages => [
            ...prevMessages,
            { id: Date.now(), text, sender: 'user' }
        ]);
    }, []);

    const validatePayment = useCallback(async (orderId: string, amount: number) => {
        if (!token && !isAuthenticated) {
            // Demo mode payment validation
            await new Promise(r => setTimeout(r, 1500));
            setMessages(prev => [...prev, { 
                id: Date.now(), 
                text: "✅ Payment verified (Demo Mode)! Your order is being prepared.", 
                sender: 'bot' 
            }]);
            clearCart();
            return;
        }

        const statusId = Date.now();
        setMessages(prev => [...prev, { id: statusId, text: "VERIFYING 🔄", sender: 'bot' }]);
        scrollToBottom();

        try {
            const response = await fetch('/api/payment/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token || ''
                },
                body: JSON.stringify({
                    orderId,
                    amount,
                    paymentMethod: 'bank_transfer',
                    transactionId: `TRX-${Date.now()}`
                })
            });

            if (!response.ok) throw new Error('Payment verification failed');

            await new Promise(r => setTimeout(r, 1000));
            setMessages(prev => prev.map(msg => msg.id === statusId ? { ...msg, text: "CONTACTING BANK... 🏦" } : msg));
            
            await new Promise(r => setTimeout(r, 1000));
            setMessages(prev => prev.map(msg => msg.id === statusId ? { ...msg, text: "PAYMENT APPROVED! 🎉" } : msg));

            await new Promise(r => setTimeout(r, 800));
            setMessages(prev => prev.filter(msg => msg.id !== statusId));

            clearCart();

            const successMsg = (
                <div className="success-message-card">
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                        <div style={{ fontSize: '40px', marginBottom: '8px' }}>✅</div>
                        <h4 style={{ color: '#28A745', fontWeight: 950, fontSize: '18px' }}>ORDER CONFIRMED!</h4>
                        <p style={{ fontSize: '12px', marginTop: '6px', color: '#444' }}>
                            Your order <b>#{orderId.slice(-6).toUpperCase()}</b> is being prepared.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px' }}>
                        <button 
                            onClick={() => {
                                closeModal();
                                setTimeout(() => openModal('order'), 300);
                            }}
                            style={{ 
                                background: '#000', color: '#fff', border: '2px solid #000', 
                                padding: '10px 16px', borderRadius: '10px', fontWeight: 900, fontSize: '12px', cursor: 'pointer'
                            }}
                        >
                            TRACK ORDER
                        </button>
                        <button 
                            onClick={closeModal}
                            style={{ 
                                background: '#fff', color: '#000', border: '2px solid #000', 
                                padding: '10px 16px', borderRadius: '10px', fontWeight: 900, fontSize: '12px', cursor: 'pointer'
                            }}
                        >
                            CLOSE
                        </button>
                    </div>
                </div>
            );
            setMessages(prev => [...prev, { id: Date.now(), text: successMsg, sender: 'bot', isHtml: true }]);
        } catch (err: any) {
            setMessages(prev => prev.map(msg => msg.id === statusId ? { ...msg, text: `❌ Error: ${err.message}` } : msg));
        }
    }, [token, isAuthenticated, clearCart, closeModal, openModal]);

    const processOrderPlacement = useCallback(async () => {
        if (!isAuthenticated && !user) {
            await addBotMessage("Please login first to place your order. Click 'Quick Demo Login' in the auth modal!");
            return;
        }

        if (cartItems.length === 0) {
            await addBotMessage("Your cart is empty. Tap 'Menu' to browse our delicious options!");
            return;
        }

        const orderId = 'ORD-' + Date.now().toString(36).toUpperCase();
        
        await addBotMessage(`📝 Placing your order for ${cartItems.length} item(s)...`);
        
        // Demo mode order confirmation
        await new Promise(r => setTimeout(r, 1000));
        
        const paymentInfoMsg = (
            <div className="payment-info-card" style={{ padding: '8px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ color: '#F39C12', fontWeight: 950, fontSize: '15px' }}>💳 ORDER SUMMARY</h4>
                    <span style={{ fontSize: '18px' }}>🧾</span>
                </div>
                <div style={{ background: '#F8F9FA', border: '2px solid #000', borderRadius: '12px', padding: '12px', marginBottom: '12px' }}>
                    {cartItems.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                            <span>• {item.name} × {item.qty}</span>
                            <span className="font-bold">₦{(item.price * item.qty).toLocaleString()}</span>
                        </div>
                    ))}
                    <div style={{ borderTop: '2px dashed #000', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 950, fontSize: '15px' }}>
                        <span>TOTAL</span>
                        <span>₦{totalAmount.toLocaleString()}</span>
                    </div>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => validatePayment(orderId, totalAmount)}
                    style={{ width: '100%', background: '#2ECC71', color: '#fff', border: '3px solid #000', padding: '14px', borderRadius: '12px', fontWeight: 950, cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 0 #000' }}
                >
                    ✅ CONFIRM ORDER (₦{totalAmount.toLocaleString()})
                </motion.button>
            </div>
        );
        addBotMessage(paymentInfoMsg, true);
    }, [isAuthenticated, user, cartItems, totalAmount, addBotMessage, validatePayment]);

    const processUserInput = useCallback(async (text: string) => {
        if (!text.trim()) return;
        addUserMessage(text.trim());
        setInputMessage('');

        const lowerText = text.toLowerCase().trim();

        // Context-aware greeting
        if (lowerText === 'hi' || lowerText === 'hello' || lowerText === 'hey') {
            const hour = new Date().getHours();
            let greeting = 'Hello';
            if (hour < 12) greeting = 'Good morning';
            else if (hour < 17) greeting = 'Good afternoon';
            else greeting = 'Good evening';
            
            await addBotMessage(`${greeting}! 👋 I'm your Digital Hub Assistant. I can help you with:`);
            await addBotMessage(`<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px;">
                <div style="background: #f0f0f0; padding: 10px; border-radius: 8px; font-size: 12px;">🍔 View Menu</div>
                <div style="background: #f0f0f0; padding: 10px; border-radius: 8px; font-size: 12px;">📦 Track Orders</div>
                <div style="background: #f0f0f0; padding: 10px; border-radius: 8px; font-size: 12px;">🎮 Play Games</div>
                <div style="background: #f0f0f0; padding: 10px; border-radius: 8px; font-size: 12px;">🖨️ Print Docs</div>
                <div style="background: #f0f0f0; padding: 10px; border-radius: 8px; font-size: 12px;">🛒 View Cart</div>
                <div style="background: #f0f0f0; padding: 10px; border-radius: 8px; font-size: 12px;">💰 Balance</div>
            </div>`, true);
            return;
        }

        // Help command
        if (lowerText === 'help' || lowerText === 'what can you do' || lowerText === '?') {
            await addBotMessage(`<b>Here's what I can help you with:</b>`, true);
            await addBotMessage(`
                <div style="margin-top: 8px; line-height: 1.8;">
                    🍔 <b>"Show menu"</b> - Browse our food selection<br/>
                    📦 <b>"Track order"</b> - Check your active orders<br/>
                    🎮 <b>"Play games"</b> - Open the game hub<br/>
                    🖨️ <b>"Print"</b> - Print document service<br/>
                    🛒 <b>"Cart" / "Checkout"</b> - Manage your cart<br/>
                    💰 <b>"Balance"</b> - Check your wallet<br/>
                    👤 <b>"Who am I"</b> - View your profile<br/>
                    ❌ <b>"Logout"</b> - Sign out of your account
                </div>
            `, true);
            return;
        }

        // Menu commands
        if (lowerText.includes('menu') || lowerText.includes('food') || lowerText.includes('hungry') || lowerText.includes('eat')) {
            await addBotMessage("Opening the Hub Kitchen for you... 👨‍🍳");
            setTimeout(() => {
                closeModal();
                openModal('menu');
            }, 800);
            return;
        }

        // Order tracking
        if (lowerText.includes('track') || lowerText.includes('status') || lowerText.includes('order') || lowerText.includes('where')) {
            await addBotMessage("Checking your active orders... 🚚");
            setTimeout(() => {
                closeModal();
                openModal('order');
            }, 800);
            return;
        }

        // Games
        if (lowerText.includes('game') || lowerText.includes('play') || lowerText.includes('gaming')) {
            await addBotMessage("Loading the Game Hub... 🎮");
            setTimeout(() => {
                closeModal();
                openModal('game');
            }, 800);
            return;
        }

        // Print
        if (lowerText.includes('print') || lowerText.includes('document') || lowerText.includes('printer')) {
            await addBotMessage("Opening Print Service... 🖨️");
            setTimeout(() => {
                closeModal();
                openModal('print');
            }, 800);
            return;
        }

        // Cart
        if (lowerText.includes('cart') || lowerText.includes('basket') || lowerText.includes('shopping')) {
            if (cartItems.length > 0) {
                await addBotMessage(`You have <b>${cartItems.length} item(s)</b> in your cart totaling <b>₦${totalAmount.toLocaleString()}</b>`);
                await addBotMessage("Opening your cart... 🛒");
                setTimeout(() => {
                    closeModal();
                    openModal('cart');
                }, 800);
            } else {
                await addBotMessage("Your cart is empty! Browse the menu to add some delicious items.");
            }
            return;
        }

        // Checkout/Pay
        if (lowerText.includes('checkout') || lowerText.includes('pay') || lowerText.includes('order now') || lowerText.includes('complete order')) {
            if (cartItems.length === 0) {
                await addBotMessage("Your cart is empty. Say <b>'Show menu'</b> to browse items!", true);
            } else {
                await addBotMessage(`Processing checkout for ${cartItems.length} item(s)...`);
                processOrderPlacement();
            }
            return;
        }

        // Balance
        if (lowerText.includes('balance') || lowerText.includes('wallet') || lowerText.includes('money')) {
            if (user?.balance !== undefined) {
                await addBotMessage(`💰 Your current balance: <b style="font-size: 20px;">₦${user.balance.toLocaleString()}</b>`);
            } else {
                await addBotMessage("You're not logged in. Login to see your balance!");
            }
            return;
        }

        // Who am I / Profile
        if (lowerText.includes('who am i') || lowerText.includes('profile') || lowerText.includes('account')) {
            if (user) {
                await addBotMessage(`
                    <div style="background: #f5f5f5; padding: 16px; border-radius: 12px; margin-top: 8px;">
                        <div style="font-weight: 950; font-size: 16px;">👤 ${user.username}</div>
                        <div style="font-size: 12px; color: #666; margin-top: 4px;">${user.email}</div>
                        ${user.balance !== undefined ? `<div style="font-weight: 950; color: #2ECC71; margin-top: 8px;">💰 ₦${user.balance.toLocaleString()}</div>` : ''}
                    </div>
                `, true);
            } else {
                await addBotMessage("You're not logged in. Tap 'Quick Demo Login' to explore!");
            }
            return;
        }

        // Logout
        if (lowerText.includes('logout') || lowerText.includes('sign out') || lowerText.includes('exit')) {
            if (user) {
                logout();
                await addBotMessage("You've been logged out. Thanks for visiting! 👋");
            } else {
                await addBotMessage("You're not logged in!");
            }
            return;
        }

        // Cart reminder if has items
        if (cartItems.length > 0) {
            await addBotMessage(`I didn't understand that, but you have <b>${cartItems.length} item(s)</b> in your cart (₦${totalAmount.toLocaleString()}). Say <b>'Checkout'</b> to order!`, true);
        } else {
            await addBotMessage(`I didn't understand "${text}". Say <b>'Help'</b> to see what I can do!`, true);
        }
    }, [addUserMessage, addBotMessage, cartItems, totalAmount, user, processOrderPlacement, closeModal, openModal, logout]);

    const handleQuickAction = (action: QuickAction) => {
        processUserInput(action.command);
    };

    useEffect(() => {
        const hour = new Date().getHours();
        let greeting = 'Hello';
        if (hour < 12) greeting = 'Good morning';
        else if (hour < 17) greeting = 'Good afternoon';
        else greeting = 'Good evening';

        addBotMessage(`
            <div style="text-align: center; margin-bottom: 12px;">
                <div style="font-size: 32px; margin-bottom: 8px;">✨</div>
                <div style="font-weight: 950; font-size: 18px;">${greeting}!</div>
                <div style="font-size: 13px; color: #666; margin-top: 4px;">I'm your Digital Hub Assistant</div>
            </div>
        `, true);
        
        setTimeout(() => {
            addBotMessage("I can help you navigate the app, place orders, track deliveries, and more!");
        }, 500);
    }, [addBotMessage]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isBotTyping]);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            processUserInput(inputMessage);
        }
    };

    const handleSendMessage = () => {
        processUserInput(inputMessage);
    };

    return (
        <>
            <motion.div 
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                className="modal-header"
                style={{ 
                    background: 'linear-gradient(135deg, var(--card-game) 0%, #2980b9 100%)',
                    borderTopLeftRadius: '28px',
                    borderTopRightRadius: '28px'
                }}
            >
                <div className="flex items-center justify-center gap-3 mb-2 relative z-10">
                    <div className="p-2 bg-white/20 rounded-xl">
                        <Sparkles size={28} />
                    </div>
                    <div>
                        <h2 className="modal-title m-0 uppercase tracking-tight">HUB ASSISTANT</h2>
                        <p className="modal-subtitle">Your digital concierge • Online</p>
                    </div>
                </div>
            </motion.div>

            <div className="modal-body-scrollable">
                {/* Quick Actions */}
                <div className="quick-actions mb-4">
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {quickActions.map((action, idx) => (
                            <motion.button
                                key={action.command}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleQuickAction(action)}
                                className={`${action.color} text-white`}
                                style={{ 
                                    border: '2px solid #000',
                                    borderRadius: '20px',
                                    padding: '8px 14px',
                                    fontSize: '12px',
                                    fontWeight: 900,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    boxShadow: '0 3px 0 #000'
                                }}
                            >
                                {action.icon}
                                {action.label}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Chat Messages */}
                <div className="chat-body">
                    <div 
                        id="chat-messages" 
                        className="messages" 
                        style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '12px',
                            minHeight: '200px',
                            maxHeight: '300px',
                            overflowY: 'auto',
                            paddingBottom: '16px'
                        }}
                    >
                        {messages.map(msg => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`chat-message-base ${msg.sender === 'bot' ? 'chat-message-bot' : 'chat-message-user'}`}
                                style={{
                                    maxWidth: msg.sender === 'user' ? '85%' : '100%',
                                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                                }}
                            >
                                {msg.isHtml ? <div dangerouslySetInnerHTML={{ __html: msg.text as string }} /> : msg.text}
                            </motion.div>
                        ))}
                        {isBotTyping && (
                            <div className="typing-indicator" style={{ alignSelf: 'flex-start' }}>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <div style={{ width: '8px', height: '8px', background: '#999', borderRadius: '50%', animation: 'typing 1.4s infinite' }}></div>
                                    <div style={{ width: '8px', height: '8px', background: '#999', borderRadius: '50%', animation: 'typing 1.4s infinite 0.2s' }}></div>
                                    <div style={{ width: '8px', height: '8px', background: '#999', borderRadius: '50%', animation: 'typing 1.4s infinite 0.4s' }}></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div 
                        className="chat-input-area" 
                        style={{ 
                            background: '#F0F4F8', 
                            border: '3px solid #000', 
                            borderRadius: '24px', 
                            padding: '6px 10px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            boxShadow: '0 4px 0 #000'
                        }}
                    >
                        <input
                            type="text"
                            placeholder="Ask me anything..."
                            style={{ 
                                flex: 1, 
                                border: 'none', 
                                background: 'transparent', 
                                padding: '12px 8px',
                                fontSize: '14px',
                                fontWeight: 600,
                                outline: 'none'
                            }}
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleSendMessage}
                            style={{ 
                                background: '#000', 
                                color: '#fff', 
                                border: 'none', 
                                width: '40px', 
                                height: '40px', 
                                borderRadius: '16px', 
                                fontWeight: 950, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            <Send size={18} />
                        </motion.button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes typing {
                    0%, 60%, 100% { transform: translateY(0); opacity: 0.6; }
                    30% { transform: translateY(-8px); opacity: 1; }
                }
                .chat-message-bot {
                    background: #F0F4F8;
                    color: #000;
                    padding: 12px 16px;
                    border-radius: 16px 16px 16px 4px;
                    font-size: 14px;
                    line-height: 1.5;
                    border: 2px solid #000;
                    box-shadow: 2px 2px 0 rgba(0,0,0,0.1);
                }
                .chat-message-user {
                    background: #000;
                    color: #fff;
                    padding: 12px 16px;
                    border-radius: 16px 16px 4px 16px;
                    font-size: 14px;
                    line-height: 1.5;
                    border: 2px solid #000;
                    box-shadow: 3px 3px 0 rgba(52, 152, 219, 0.3);
                }
            `}</style>
        </>
    );
};
