import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { safeJsonParse } from '../services/api';

// Service Types
export type ServiceType = 'restaurant' | 'game' | 'print' | 'ecommerce' | 'logistics' | 'streaming' | 'download';

// Cart Item Interface
export interface CartItem {
    id: string;
    serviceType: ServiceType;
    name: string;
    price: number;
    imageUrl?: string;
    qty: number;
    details?: Record<string, any>; // Service-specific details
}

// Restaurant Item Details
export interface RestaurantItemDetails {
    category: string;
    preparationTime?: number;
    specialInstructions?: string;
}

// Game Session Details
export interface GameSessionDetails {
    sessionType: 'casual' | 'tournament' | 'practice';
    duration: number; // in minutes
    opponentType: 'random' | 'friend' | 'ai';
    gameVersion: string;
}

// Print Job Details
export interface PrintJobDetails {
    fileName: string;
    fileSize: number;
    numPages: number;
    printOptions: {
        color: boolean;
        duplex: boolean;
        binding: 'none' | 'staple' | 'spiral';
    };
}

// E-commerce Product Details
export interface ProductDetails {
    category: string;
    brand: string;
    size?: string;
    color?: string;
    stock: number;
}

// Logistics Delivery Details
export interface DeliveryDetails {
    pickupAddress: string;
    deliveryAddress: string;
    packageSize: 'small' | 'medium' | 'large';
    vehicleType: 'bike' | 'car' | 'van';
    estimatedDistance: number;
}

// Streaming Subscription Details
export interface StreamingDetails {
    type: 'podcast' | 'live_tv' | 'live_stream';
    title: string;
    duration: number;
    accessType: 'single' | 'subscription';
    contentId?: string;
}

// Download Details
export interface DownloadDetails {
    fileType: 'movie' | 'music' | 'pdf' | 'image' | 'software';
    fileSize: number;
    downloadLinks: string[];
    expiresAt?: Date;
}

// Cart Context Interface
interface UnifiedCartContextType {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    addRestaurantItem: (item: Omit<CartItem, 'serviceType' | 'qty'>, quantity?: number, details?: RestaurantItemDetails) => void;
    addGameSession: (item: Omit<CartItem, 'serviceType' | 'qty'>, duration: number, sessionType: GameSessionDetails['sessionType']) => void;
    addPrintJob: (item: Omit<CartItem, 'serviceType' | 'qty'>, fileDetails: PrintJobDetails) => void;
    addProduct: (item: Omit<CartItem, 'serviceType' | 'qty'>, productDetails: ProductDetails) => void;
    addDelivery: (item: Omit<CartItem, 'serviceType' | 'qty'>, deliveryDetails: DeliveryDetails) => void;
    addStreamingContent: (item: Omit<CartItem, 'serviceType' | 'qty'>, streamingDetails: StreamingDetails) => void;
    addDownload: (item: Omit<CartItem, 'serviceType' | 'qty'>, downloadDetails: DownloadDetails) => void;
    removeItem: (itemId: string, serviceType: ServiceType) => void;
    updateQuantity: (itemId: string, serviceType: ServiceType, quantity: number) => void;
    clearCart: () => void;
    getServiceTotal: (serviceType: ServiceType) => number;
    getTotalAmount: () => number;
    getTotalItems: () => number;
    getItemCount: (serviceType: ServiceType) => number;
    getServiceItems: (serviceType: ServiceType) => CartItem[];
    hasItems: () => boolean;
    isEmpty: () => boolean;
}

const UnifiedCartContext = createContext<UnifiedCartContextType | undefined>(undefined);

export const UnifiedCartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>(() => {
        const storedCart = localStorage.getItem('unifiedCart');
        return safeJsonParse<CartItem[]>(storedCart) ?? [];
    });

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem('unifiedCart', JSON.stringify(items));
    }, [items]);

    const addItem = useCallback((item: CartItem) => {
        setItems(prevItems => {
            // Check if same item exists with same details
            const existingIndex = prevItems.findIndex(i => 
                i.id === item.id && 
                i.serviceType === item.serviceType &&
                JSON.stringify(i.details) === JSON.stringify(item.details)
            );

            if (existingIndex > -1) {
                // Update quantity
                const newItems = [...prevItems];
                newItems[existingIndex].qty += item.qty;
                return newItems;
            }

            return [...prevItems, { ...item, qty: item.qty || 1 }];
        });
    }, []);

    const addRestaurantItem = useCallback((
        item: Omit<CartItem, 'serviceType' | 'qty'>, 
        quantity: number = 1, 
        details?: RestaurantItemDetails
    ) => {
        addItem({
            ...item,
            serviceType: 'restaurant',
            qty: quantity,
            details: details || { category: item.name }
        });
    }, [addItem]);

    const addGameSession = useCallback((
        item: Omit<CartItem, 'serviceType' | 'qty'>, 
        duration: number, 
        sessionType: GameSessionDetails['sessionType']
    ) => {
        // Pricing: Tournament = ₦500, 1 Hour = ₦2000, 2 Hours = ₦3500
        const priceMap: Record<string, number> = {
            tournament: 500,
            casual: duration >= 120 ? 3500 : duration >= 60 ? 2000 : 1000,
            practice: 500
        };
        const price = priceMap[sessionType] || 1000;
        addItem({
            ...item,
            serviceType: 'game',
            qty: 1,
            price: price,
            details: {
                sessionType,
                duration,
                opponentType: 'random',
                gameVersion: 'FC26'
            }
        });
    }, [addItem]);

    const addPrintJob = useCallback((
        item: Omit<CartItem, 'serviceType' | 'qty'>, 
        fileDetails: PrintJobDetails
    ) => {
        const price = fileDetails.printOptions.color 
            ? fileDetails.numPages * 100 * 1.5 
            : fileDetails.numPages * 100;
        
        addItem({
            ...item,
            serviceType: 'print',
            qty: 1,
            price: price,
            details: fileDetails
        });
    }, [addItem]);

    const addProduct = useCallback((
        item: Omit<CartItem, 'serviceType' | 'qty'>, 
        productDetails: ProductDetails
    ) => {
        addItem({
            ...item,
            serviceType: 'ecommerce',
            qty: 1,
            details: productDetails
        });
    }, [addItem]);

    const addDelivery = useCallback((
        item: Omit<CartItem, 'serviceType' | 'qty'>, 
        deliveryDetails: DeliveryDetails
    ) => {
        const baseFare = deliveryDetails.packageSize === 'small' ? 500 : 
                         deliveryDetails.packageSize === 'medium' ? 800 : 1200;
        const distanceFare = deliveryDetails.estimatedDistance * 50;
        const vehicleMultiplier = deliveryDetails.vehicleType === 'car' ? 1.5 : 
                                 deliveryDetails.vehicleType === 'van' ? 2 : 1;
        
        const totalFare = (baseFare + distanceFare) * vehicleMultiplier;
        
        addItem({
            ...item,
            serviceType: 'logistics',
            qty: 1,
            price: Math.round(totalFare),
            details: deliveryDetails
        });
    }, [addItem]);

    const addStreamingContent = useCallback((
        item: Omit<CartItem, 'serviceType' | 'qty'>, 
        streamingDetails: StreamingDetails
    ) => {
        const price = streamingDetails.accessType === 'subscription' ? 2000 : 500;
        
        addItem({
            ...item,
            serviceType: 'streaming',
            qty: 1,
            price: price,
            details: streamingDetails
        });
    }, [addItem]);

    const addDownload = useCallback((
        item: Omit<CartItem, 'serviceType' | 'qty'>, 
        downloadDetails: DownloadDetails
    ) => {
        const price = downloadDetails.fileType === 'software' ? 1500 : 
                     downloadDetails.fileType === 'movie' ? 500 : 200;
        
        addItem({
            ...item,
            serviceType: 'download',
            qty: 1,
            price: price,
            details: downloadDetails
        });
    }, [addItem]);

    const removeItem = useCallback((itemId: string, serviceType: ServiceType) => {
        setItems(prevItems => prevItems.filter(
            item => !(item.id === itemId && item.serviceType === serviceType)
        ));
    }, []);

    const updateQuantity = useCallback((itemId: string, serviceType: ServiceType, quantity: number) => {
        setItems(prevItems => {
            const existingIndex = prevItems.findIndex(i => 
                i.id === itemId && i.serviceType === serviceType
            );

            if (existingIndex > -1) {
                const newItems = [...prevItems];
                if (quantity <= 0) {
                    return newItems.filter((_, idx) => idx !== existingIndex);
                }
                newItems[existingIndex].qty = quantity;
                return newItems;
            }

            return prevItems;
        });
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const getServiceTotal = useCallback((serviceType: ServiceType): number => {
        return items
            .filter(item => item.serviceType === serviceType)
            .reduce((sum, item) => sum + item.price * item.qty, 0);
    }, [items]);

    const getTotalAmount = useCallback((): number => {
        return items.reduce((sum, item) => sum + item.price * item.qty, 0);
    }, [items]);

    const getTotalItems = useCallback((): number => {
        return items.reduce((sum, item) => sum + item.qty, 0);
    }, [items]);

    const getItemCount = useCallback((serviceType: ServiceType): number => {
        return items
            .filter(item => item.serviceType === serviceType)
            .reduce((sum, item) => sum + item.qty, 0);
    }, [items]);

    const getServiceItems = useCallback((serviceType: ServiceType): CartItem[] => {
        return items.filter(item => item.serviceType === serviceType);
    }, [items]);

    const hasItems = useCallback((): boolean => {
        return items.length > 0;
    }, [items]);

    const isEmpty = useCallback((): boolean => {
        return items.length === 0;
    }, [items]);

    return (
        <UnifiedCartContext.Provider value={{
            items,
            addItem,
            addRestaurantItem,
            addGameSession,
            addPrintJob,
            addProduct,
            addDelivery,
            addStreamingContent,
            addDownload,
            removeItem,
            updateQuantity,
            clearCart,
            getServiceTotal,
            getTotalAmount,
            getTotalItems,
            getItemCount,
            getServiceItems,
            hasItems,
            isEmpty
        }}>
            {children}
        </UnifiedCartContext.Provider>
    );
};

// Hook for using the unified cart
export const useUnifiedCart = () => {
    const context = useContext(UnifiedCartContext);
    if (context === undefined) {
        throw new Error('useUnifiedCart must be used within a UnifiedCartProvider');
    }
    return context;
};

// Service labels for display
export const SERVICE_LABELS: Record<ServiceType, string> = {
    restaurant: '🍔 Food & Drinks',
    game: '🎮 Gaming',
    print: '🖨️ Printing',
    ecommerce: '🛍️ Shopping',
    logistics: '🚗 Delivery',
    streaming: '📺 Streaming',
    download: '📥 Downloads'
};

// Service colors for styling
export const SERVICE_COLORS: Record<ServiceType, string> = {
    restaurant: '#27ae60',
    game: '#3498db',
    print: '#e67e22',
    ecommerce: '#9b59b6',
    logistics: '#1abc9c',
    streaming: '#e74c3c',
    download: '#f39c12'
};
