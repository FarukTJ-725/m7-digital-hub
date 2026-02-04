import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { safeJsonParse } from '../services/api';

// Define the shape of a cart item
interface CartItem {
  id: string; // MenuItem ID
  name: string;
  price: number;
  imageUrl: string;
  qty: number;
}

// Define the shape of the CartContext
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'qty'>, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalAmount: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    // Initialize cart from localStorage with safe parsing
    const storedCart = localStorage.getItem('cartItems');
    return safeJsonParse<CartItem[]>(storedCart) ?? [];
  });

  // Save cart items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Calculate total amount and total number of items
  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.qty, 0);

  const addToCart = useCallback((item: Omit<CartItem, 'qty'>, quantity: number = 1) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(i => i.id === item.id);

      if (existingItemIndex > -1) {
        // Update quantity if item already exists
        const newItems = [...prevItems];
        newItems[existingItemIndex].qty += quantity;
        return newItems;
      } else {
        // Add new item
        return [...prevItems, { ...item, qty: quantity }];
      }
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  }, []);

  const updateItemQuantity = useCallback((itemId: string, quantity: number) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(i => i.id === itemId);

      if (existingItemIndex > -1) {
        const newItems = [...prevItems];
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          return newItems.filter(item => item.id !== itemId);
        }
        newItems[existingItemIndex].qty = quantity;
        return newItems;
      }
      return prevItems; // Item not found
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateItemQuantity,
      clearCart,
      totalAmount,
      totalItems
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
