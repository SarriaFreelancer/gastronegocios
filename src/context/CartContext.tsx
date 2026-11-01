'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '@/types';
import { restaurantInfo } from '@/data/restaurant-info';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, notes?: string) => void;
  removeFromCart: (productId: string | number) => void;
  updateQuantity: (productId: string | number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  deliveryFee: number;
  tip: number;
  tipPercentage: number;
  setTipPercentage: (pct: number) => void;
  setTipAmount: (amount: number) => void;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  deliveryType: 'domicilio' | 'recoger' | 'mesa';
  setDeliveryType: (type: 'domicilio' | 'recoger' | 'mesa') => void;
  tableNumber: string;
  setTableNumber: (table: string) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  customerAddress: string;
  setCustomerAddress: (address: string) => void;
  customerNotes: string;
  setCustomerNotes: (notes: string) => void;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  lastAddedProduct: Product | null;
  clearToast: () => void;
  isSubmittingOrder: boolean;
  lastCreatedOrder: any | null;
  setLastCreatedOrder: (order: any | null) => void;
  submitWebOrderOnly: () => Promise<any | null>;
  submitAndSendWhatsAppOrder: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'punto_g_cart_v2';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'domicilio' | 'recoger' | 'mesa'>('domicilio');
  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [tipPercentage, setTipPercentageState] = useState<number>(10); // 10% suggested tip
  const [customTip, setCustomTip] = useState<number | null>(null);
  const [lastAddedProduct, setLastAddedProduct] = useState<Product | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [lastCreatedOrder, setLastCreatedOrder] = useState<any | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Auto-detect ?mesa= in query string on client load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const mesaParam = urlParams.get('mesa');
      if (mesaParam) {
        setTableNumber(mesaParam);
        setDeliveryType('mesa');
      }
    }
  }, []);

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
      const existingIndex = prev.findIndex((item) => String(item.product.id) === String(product.id));
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
      setLastAddedProduct((curr) => (String(curr?.id) === String(product.id) ? null : curr));
    }, 3500);
  };

  const removeFromCart = (productId: string | number) => {
    setItems((prev) => prev.filter((item) => String(item.product.id) !== String(productId)));
  };

  const updateQuantity = (productId: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        String(item.product.id) === String(productId) ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const clearToast = () => {
    setLastAddedProduct(null);
  };

  const setTipPercentage = (pct: number) => {
    setTipPercentageState(pct);
    setCustomTip(null);
  };

  const setTipAmount = (amount: number) => {
    setCustomTip(amount);
    setTipPercentageState(-1);
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.product.precio * item.quantity, 0);
  const deliveryFee = deliveryType === 'domicilio' && subtotal > 0 ? 5000 : 0;

  // Calculate tip amount
  const tip = customTip !== null ? customTip : tipPercentage > 0 ? Math.round((subtotal * tipPercentage) / 100) : 0;
  const totalPrice = subtotal + deliveryFee + tip;

  const formatCurrency = (val: number) => {
    return '$' + val.toLocaleString('es-CO');
  };

  // Helper to persist order to MySQL
  const persistOrderToDatabase = async (): Promise<any | null> => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente: customerName.trim() || 'Cliente Punto G',
          telefono: customerPhone.trim() || '3229088736',
          tipo: deliveryType,
          numeroMesa: deliveryType === 'mesa' ? tableNumber : null,
          direccion: deliveryType === 'domicilio' ? customerAddress : null,
          subtotal,
          propina: tip,
          costoEnvio: deliveryFee,
          total: totalPrice,
          metodoPago: paymentMethod,
          notasCliente: customerNotes.trim(),
          items: items.map((i) => ({
            nombre: i.product.nombre,
            precio: i.product.precio,
            cantidad: i.quantity,
            notas: i.notes,
          })),
        }),
      });

      if (res.ok) {
        const orderData = await res.json();
        setLastCreatedOrder(orderData);
        return orderData;
      }
    } catch (e) {
      console.error('Error saving order to MySQL:', e);
    }
    return null;
  };

  // Botón 1: HACER PEDIDO DESDE LA WEB (Se guarda en BD y queda registrado)
  const submitWebOrderOnly = async () => {
    if (items.length === 0) return null;
    setIsSubmittingOrder(true);
    try {
      const savedOrder = await persistOrderToDatabase();
      if (savedOrder) {
        clearCart();
      }
      return savedOrder;
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Botón 2: HACER PEDIDO Y CONFIRMAR POR WHATSAPP (Se guarda en BD y abre WhatsApp con el mismo código)
  const submitAndSendWhatsAppOrder = async () => {
    if (items.length === 0) return;
    setIsSubmittingOrder(true);

    let orderCode = `PG-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const savedOrder = await persistOrderToDatabase();
      if (savedOrder && savedOrder.codigo) {
        orderCode = savedOrder.codigo;
      }
    } finally {
      setIsSubmittingOrder(false);
    }

    // Build WhatsApp message with the exact same order code
    let message = `🍔 *¡NUEVO PEDIDO #${orderCode} - ${restaurantInfo.name}!* 🍔\n`;
    message += `_${restaurantInfo.slogan}_\n\n`;

    if (customerName.trim()) {
      message += `👤 *Cliente:* ${customerName.trim()}\n`;
    }
    if (customerPhone.trim()) {
      message += `📱 *Teléfono:* ${customerPhone.trim()}\n`;
    }

    if (deliveryType === 'mesa') {
      message += `🍽️ *Modalidad:* PEDIDO EN MESA (${tableNumber || 'Mesa del Restaurante'})\n`;
    } else if (deliveryType === 'recoger') {
      message += `🏪 *Modalidad:* Para Recoger en Restaurante\n`;
    } else {
      message += `🛵 *Modalidad:* Domicilio\n`;
      if (customerAddress.trim()) {
        message += `🏠 *Dirección:* ${customerAddress.trim()}\n`;
      }
    }

    message += `💳 *Método de pago:* ${paymentMethod}\n`;

    message += `\n📋 *PRODUCTOS SELECCIONADOS:*\n`;
    items.forEach((item, index) => {
      message += `${index + 1}. *${item.quantity}x* ${item.product.nombre} - ${formatCurrency(item.product.precio * item.quantity)}\n`;
      if (item.notes) {
        message += `   _Nota: ${item.notes}_\n`;
      }
    });

    if (customerNotes.trim()) {
      message += `\n💬 *Observaciones del pedido:*\n${customerNotes.trim()}\n`;
    }

    message += `\n----------------------------\n`;
    message += `💵 *Subtotal:* ${formatCurrency(subtotal)} COP\n`;
    if (deliveryType === 'domicilio') {
      message += `🛵 *Costo Domicilio:* ${formatCurrency(deliveryFee)} COP\n`;
    }
    if (tip > 0) {
      message += `💛 *Propina voluntaria (${tipPercentage > 0 ? `${tipPercentage}%` : 'Personalizada'}):* ${formatCurrency(tip)} COP\n`;
    }
    message += `⭐ *TOTAL A PAGAR:* ${formatCurrency(totalPrice)} COP\n`;
    message += `----------------------------\n\n`;
    message += `¡Muchas gracias! Ya quedó registrado en el sistema con el código *#${orderCode}*.`;

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
        tip,
        tipPercentage,
        setTipPercentage,
        setTipAmount,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
        deliveryType,
        setDeliveryType,
        tableNumber,
        setTableNumber,
        customerName,
        setCustomerName,
        customerPhone,
        setCustomerPhone,
        customerAddress,
        setCustomerAddress,
        customerNotes,
        setCustomerNotes,
        paymentMethod,
        setPaymentMethod,
        lastAddedProduct,
        clearToast,
        isSubmittingOrder,
        lastCreatedOrder,
        setLastCreatedOrder,
        submitWebOrderOnly,
        submitAndSendWhatsAppOrder,
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
