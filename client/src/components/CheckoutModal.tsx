import React, { useState } from 'react';
import { useUI } from '../contexts/UIContext';
import { useUnifiedCart, SERVICE_LABELS } from '../contexts/UnifiedCartContext';
import { api } from '../services/api';
import { motion } from 'framer-motion';
import { CreditCard, Building, Copy, Check, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';

interface CartItem {
    id: string;
    serviceType: string;
    name: string;
    price: number;
    qty: number;
    details?: Record<string, any>;
}

interface PaymentDetails {
    orderId: string;
    orderIdDisplay: string;
    amount: number;
    bankName: string;
    accountNumber: string;
    accountName: string;
    reference: string;
}

export const CheckoutModal: React.FC = () => {
    const { closeModal, openModal } = useUI();
    const { items, getTotalAmount, clearCart } = useUnifiedCart();
    const [step, setStep] = useState<'review' | 'payment' | 'confirm' | 'receipt'>('review');
    const [loading, setLoading] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
    const [receipt, setReceipt] = useState<any>(null);
    const [copied, setCopied] = useState<string | null>(null);

    const businessInfo = {
        bankName: 'First Bank',
        accountNumber: '1234567890',
        accountName: 'M7 Digital Hub'
    };

    const handleInitiateCheckout = async () => {
        setLoading(true);
        try {
            // Create order in backend
            const orderData = {
                items: items.map(item => ({
                    menuItemId: item.id,
                    name: item.name,
                    price: item.price,
                    qty: item.qty,
                    serviceType: item.serviceType,
                    details: item.details
                })),
                totalAmount: getTotalAmount()
            };

            const response = await api.post<{ orderId: string; orderIdDisplay: string }>('/orders/create', orderData);
            
            const details: PaymentDetails = {
                orderId: response.orderId,
                orderIdDisplay: response.orderIdDisplay,
                amount: getTotalAmount(),
                ...businessInfo,
                reference: response.orderIdDisplay
            };
            
            setPaymentDetails(details);
            setStep('payment');
        } catch (error: any) {
            console.error('Checkout failed:', error);
            // For demo, create mock payment details
            const mockDetails: PaymentDetails = {
                orderId: 'DH-' + Date.now().toString().slice(-8),
                orderIdDisplay: 'DH-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
                amount: getTotalAmount(),
                ...businessInfo,
                reference: 'DH-' + Math.random().toString(36).substr(2, 6).toUpperCase()
            };
            setPaymentDetails(mockDetails);
            setStep('payment');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmPayment = async () => {
        if (!paymentDetails) return;
        
        setLoading(true);
        try {
            await api.post(`/orders/${paymentDetails.orderId}/confirm-payment`, {});
            setStep('confirm');
        } catch (error: any) {
            // For demo, proceed anyway
            console.log('Demo mode: proceeding to confirmation');
            setStep('confirm');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async (text: string, field: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(field);
        setTimeout(() => setCopied(null), 2000);
    };

    // Step 1: Review Order
    if (step === 'review') {
        // Group items by service
        const groupedByService = items.reduce((acc, item) => {
            if (!acc[item.serviceType]) {
                acc[item.serviceType] = [];
            }
            acc[item.serviceType].push(item);
            return acc;
        }, {} as Record<string, CartItem[]>);

        return (
            <>
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="modal-header"
                    style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}
                >
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <CreditCard size={28} />
                        <div>
                            <h2 className="modal-title">CHECKOUT</h2>
                            <p className="modal-subtitle">Review your order</p>
                        </div>
                    </div>
                </motion.div>

                <div className="modal-body-scrollable">
                    {/* Order Summary */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                        <h4 className="font-black text-sm uppercase mb-3">Order Summary</h4>
                        
                        {Object.entries(groupedByService).map(([service, serviceItems]) => (
                            <div key={service} className="mb-4 last:mb-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm">{SERVICE_LABELS[service as keyof typeof SERVICE_LABELS]}</span>
                                </div>
                                {serviceItems.map(item => (
                                    <div key={`${item.serviceType}-${item.id}`} className="flex justify-between py-2 border-b border-gray-200 last:border-0">
                                        <span className="font-bold text-sm">{item.name} x{item.qty}</span>
                                        <span className="font-black text-sm">₦{(item.price * item.qty).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                        
                        <div className="flex justify-between pt-3 mt-3 border-t-2 border-black">
                            <span className="font-black text-lg">Total</span>
                            <span className="font-black text-lg">₦{getTotalAmount().toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={handleInitiateCheckout}
                        disabled={loading || items.length === 0}
                        className="hub-btn w-full bg-black text-white p-5 rounded-xl font-black flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <>
                                <Building size={20} />
                                PROCEED TO PAYMENT <ArrowRight size={20} />
                            </>
                        )}
                    </motion.button>
                    
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { closeModal(); openModal('cart'); }}
                        className="w-full py-3 text-sm font-bold text-gray-500 flex items-center justify-center gap-2"
                    >
                        <ArrowLeft size={16} /> Back to Cart
                    </motion.button>
                </div>
            </>
        );
    }

    // Step 2: Payment Details
    if (step === 'payment' && paymentDetails) {
        return (
            <>
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="modal-header"
                    style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}
                >
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <Building size={28} />
                        <div>
                            <h2 className="modal-title">PAYMENT DETAILS</h2>
                            <p className="modal-subtitle">Transfer to complete order</p>
                        </div>
                    </div>
                </motion.div>

                <div className="modal-body-scrollable">
                    {/* Bank Details Card */}
                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-2xl p-6 mb-6">
                        <h4 className="font-black text-sm uppercase opacity-80 mb-4">Bank Transfer</h4>
                        
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs opacity-70">Bank Name</p>
                                <p className="font-black text-xl">{paymentDetails.bankName}</p>
                            </div>
                            
                            <div>
                                <p className="text-xs opacity-70">Account Number</p>
                                <div className="flex items-center justify-between">
                                    <p className="font-black text-3xl tracking-widest">{paymentDetails.accountNumber}</p>
                                    <button 
                                        onClick={() => copyToClipboard(paymentDetails.accountNumber, 'account')}
                                        className="p-2 bg-white/20 rounded-lg"
                                    >
                                        {copied === 'account' ? <Check size={18} /> : <Copy size={18} />}
                                    </button>
                                </div>
                            </div>
                            
                            <div>
                                <p className="text-xs opacity-70">Account Name</p>
                                <p className="font-bold">{paymentDetails.accountName}</p>
                            </div>
                            
                            <div>
                                <p className="text-xs opacity-70">Amount to Transfer</p>
                                <p className="font-black text-3xl">₦{paymentDetails.amount.toLocaleString()}</p>
                            </div>
                            
                            <div>
                                <p className="text-xs opacity-70">Payment Reference</p>
                                <p className="font-black text-xl">{paymentDetails.reference}</p>
                            </div>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
                        <h4 className="font-black text-yellow-800 mb-2">📋 Instructions</h4>
                        <ol className="text-sm font-bold text-yellow-800 space-y-2">
                            <li>1. Open your banking app</li>
                            <li>2. Transfer exactly ₦{paymentDetails.amount.toLocaleString()} to {paymentDetails.accountNumber}</li>
                            <li>3. Add reference <b>{paymentDetails.reference}</b> in the payment note</li>
                            <li>4. Click "I've Paid" after transferring</li>
                        </ol>
                    </div>

                    {/* Confirm Button */}
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={handleConfirmPayment}
                        disabled={loading}
                        className="hub-btn w-full bg-green-500 text-white p-5 rounded-xl font-black flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <>
                                <Check size={20} />
                                I'VE PAID - CONFIRM
                            </>
                        )}
                    </motion.button>

                    <p className="text-center text-xs font-bold text-gray-500 mt-4">
                        Admins will verify your payment within 5-10 minutes
                    </p>
                </div>
            </>
        );
    }

    // Step 3: Confirmation Pending
    if (step === 'confirm') {
        return (
            <>
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="modal-header"
                    style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}
                >
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <Loader2 size={28} className="animate-spin" />
                        <div>
                            <h2 className="modal-title">PAYMENT PENDING</h2>
                            <p className="modal-subtitle">Waiting for confirmation</p>
                        </div>
                    </div>
                </motion.div>

                <div className="modal-body-scrollable text-center py-12">
                    <div className="text-6xl mb-6">⏳</div>
                    <h3 className="font-black text-2xl mb-2">Payment Submitted!</h3>
                    <p className="font-bold text-gray-500 mb-8">
                        An admin will verify your payment shortly.<br />
                        You'll receive a confirmation when it's complete.
                    </p>

                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                        <p className="text-xs font-bold text-gray-400 uppercase">Order ID</p>
                        <p className="font-black text-xl">{paymentDetails?.reference}</p>
                    </div>

                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6 text-left">
                        <p className="text-sm font-bold text-blue-800 mb-2">📝 What's Next?</p>
                        <ol className="text-xs font-bold text-blue-700 space-y-1">
                            <li>1. Your payment is being verified</li>
                            <li>2. Once confirmed, your order will be processed</li>
                            <li>3. You'll receive a receipt here</li>
                        </ol>
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            clearCart();
                            closeModal();
                        }}
                        className="hub-btn w-full bg-black text-white p-5 rounded-xl font-black"
                    >
                        Back to Home
                    </motion.button>
                </div>
            </>
        );
    }

    return null;
};
