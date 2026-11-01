'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '@/types';
import { restaurantInfo } from '@/data/restaurant-info';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, notes?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  deliveryFee: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  deliveryType: 'domicilio' | 'recoger';
  setDeliveryType: (type: 'domicilio' | 'recoger') => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  customerAddress: string;
  setCustomerAddress: (address: string) => void;
  customerNotes: string;
  setCustomerNotes: (notes: string) => void;
  lastAddedProduct: Product | null;
  clearToast: () => void;
  sendWhatsAppOrder: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'punto_g_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'domicilio' | 'recoger'>('domicilio');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [lastAddedProduct, setLastAddedProduct] = useState<Product | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading cart from localStorage', e);
    }
    setIsHydrated(true);
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving cart to localStorage', e);
    }
  }, [items, isHydrated]);

  const addToCart = (product: Product, quantity = 1, notes = '') => {
    if (quantity <= 0) return;

    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
          notes: notes || next[existingIndex].notes,
        };
        return next;
      }
      return [...prev, { product, quantity, notes }];
    });

    setLastAddedProduct(product);
    setTimeout(() => {
      setLastAddedProduct((curr) => (curr?.id === product.id ? null : curr));
    }, 3500);
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const clearToast = () => {
    setLastAddedProduct(null);
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.product.precio * item.quantity, 0);
  const deliveryFee = deliveryType === 'domicilio' && subtotal > 0 ? 5000 : 0;
  const totalPrice = subtotal + deliveryFee;

  const formatCurrency = (val: number) => {
    return '$' + val.toLocaleString('es-CO');
  };

  const sendWhatsAppOrder = () => {
    if (items.length === 0) return;

    let message = `🍔 *¡NUEVO PEDIDO - ${restaurantInfo.name}!* 🍔\n`;
    message += `_${restaurantInfo.slogan}_\n\n`;

    if (customerName.trim()) {
      message += `👤 *Cliente:* ${customerName.trim()}\n`;
    }
    if (customerPhone.trim()) {
      message += `📱 *Teléfono:* ${customerPhone.trim()}\n`;
    }
    message += `📍 *Modalidad:* ${deliveryType === 'domicilio' ? '🛵 Domicilio' : '🏪 Para Recoger en Restaurante'}\n`;

    if (deliveryType === 'domicilio' && customerAddress.trim()) {
      message += `🏠 *Dirección:* ${customerAddress.trim()}\n`;
    }

    message += `\n📋 *PRODUCTOS SELECCIONADOS:*\n`;
    items.forEach((item, index) => {
      message += `${index + 1}. *${item.quantity}x* ${item.product.nombre} - ${formatCurrency(item.product.precio * item.quantity)}\n`;
      if (item.notes) {
        message += `   _Nota: ${item.notes}_\n`;
      }
    });

    if (customerNotes.trim()) {
      message += `\n💬 *Observaciones generales:*\n${customerNotes.trim()}\n`;
    }

    message += `\n----------------------------\n`;
    message += `💵 *Subtotal:* ${formatCurrency(subtotal)} COP\n`;
    if (deliveryType === 'domicilio') {
      message += `🛵 *Costo Domicilio:* ${formatCurrency(deliveryFee)} COP\n`;
    }
    message += `⭐ *TOTAL A PAGAR:* ${formatCurrency(totalPrice)} COP\n`;
    message += `----------------------------\n\n`;
    message += `¡Muchas gracias! Espero la confirmación de mi pedido.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${restaurantInfo.whatsappNumber}&text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        deliveryFee,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
        deliveryType,
        setDeliveryType,
        customerName,
        setCustomerName,
        customerPhone,
        setCustomerPhone,
        customerAddress,
        setCustomerAddress,
        customerNotes,
        setCustomerNotes,
        lastAddedProduct,
        clearToast,
        sendWhatsAppOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
