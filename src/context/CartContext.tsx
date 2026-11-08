'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Product, CartItem, ProductAddon } from '@/types';
import { restaurantInfo } from '@/data/restaurant-info';

export interface CustomerProfile {
  id: number;
  nombre: string;
  telefono: string;
  email?: string | null;
  direccion?: string | null;
  barrio?: string | null;
  ciudad?: string | null;
  totalPedidos?: number;
  totalComprado?: number;
}

export interface BranchOption {
  id: number;
  nombre: string;
  slug?: string;
  direccion?: string | null;
  telefono?: string | null;
  ciudad?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, notes?: string, selectedAddons?: ProductAddon[]) => void;
  removeFromCart: (indexOrId: string | number) => void;
  updateQuantity: (indexOrId: string | number, quantity: number) => void;
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
  // Sedes / Branches support
  availableBranches: BranchOption[];
  selectedBranchId: number | null;
  selectedBranchName: string | null;
  setSelectedBranchId: (id: number | null) => void;
  setSelectedBranchName: (name: string | null) => void;
  // Customer Auth & Persistent Memory
  currentCustomer: CustomerProfile | null;
  setCurrentCustomer: (cust: CustomerProfile | null) => void;
  loginCustomer: (cust: CustomerProfile) => void;
  logoutCustomer: () => void;
  recentNames: string[];
  recentAddresses: string[];
  recentPhones: string[];
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
const LOCAL_STORAGE_BRANCH = 'punto_g_selected_branch';
const LOCAL_STORAGE_CUSTOMER_SESSION = 'punto_g_customer_session';
const LOCAL_STORAGE_CHECKOUT_MEMORY = 'punto_g_customer_checkout_memory';
const LOCAL_STORAGE_RECENT_ENTRIES = 'punto_g_customer_recent_entries';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
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

  // Sesión y memoria persistente del cliente en navegador
  const [currentCustomer, setCurrentCustomer] = useState<CustomerProfile | null>(null);
  const [recentNames, setRecentNames] = useState<string[]>([]);
  const [recentAddresses, setRecentAddresses] = useState<string[]>([]);
  const [recentPhones, setRecentPhones] = useState<string[]>([]);

  // Sedes state
  const [availableBranches, setAvailableBranches] = useState<BranchOption[]>([]);
  const [selectedBranchId, setSelectedBranchIdState] = useState<number | null>(null);
  const [selectedBranchName, setSelectedBranchName] = useState<string | null>(null);

  // Fetch branches based on current route/restaurant
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        let url = '/api/branches?activo=true';
        if (pathname?.startsWith('/r/')) {
          const slug = pathname.split('/')[2];
          if (slug) url += `&restaurantSlug=${slug}`;
        }
        const res = await fetch(url);
        if (res.ok) {
          const data: BranchOption[] = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setAvailableBranches(data);

            // Restore from localStorage or default to first branch
            const savedBranchId = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_BRANCH) : null;
            const match = savedBranchId ? data.find((b) => String(b.id) === savedBranchId) : null;
            if (match) {
              setSelectedBranchIdState(match.id);
              setSelectedBranchName(match.nombre);
            } else {
              setSelectedBranchIdState(data[0].id);
              setSelectedBranchName(data[0].nombre);
            }
          }
        }
      } catch (e) {
        console.error('Error fetching branches for CartContext:', e);
      }
    };

    fetchBranches();
  }, [pathname]);

  const setSelectedBranchId = (id: number | null) => {
    setSelectedBranchIdState(id);
    if (id !== null) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_BRANCH, String(id));
      }
      const found = availableBranches.find((b) => b.id === id);
      if (found) setSelectedBranchName(found.nombre);
    } else {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(LOCAL_STORAGE_BRANCH);
      }
      setSelectedBranchName(null);
    }
  };

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

  // Login y Logout de Cliente
  const loginCustomer = (cust: CustomerProfile) => {
    setCurrentCustomer(cust);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_CUSTOMER_SESSION, JSON.stringify(cust));
      } catch (e) {}
    }
    if (cust.nombre) setCustomerName(cust.nombre);
    if (cust.telefono) setCustomerPhone(cust.telefono);
    if (cust.direccion) setCustomerAddress(cust.direccion);
  };

  const logoutCustomer = () => {
    setCurrentCustomer(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(LOCAL_STORAGE_CUSTOMER_SESSION);
      } catch (e) {}
    }
  };

  // Helper para registrar entradas recientes en memoria
  const rememberCustomerInput = (name: string, phone: string, address: string) => {
    if (typeof window === 'undefined') return;
    try {
      const cleanN = name.trim();
      const cleanP = phone.trim();
      const cleanA = address.trim();

      if (cleanN) {
        setRecentNames((prev) => {
          const next = [cleanN, ...prev.filter((x) => x !== cleanN)].slice(0, 5);
          return next;
        });
      }
      if (cleanP) {
        setRecentPhones((prev) => {
          const next = [cleanP, ...prev.filter((x) => x !== cleanP)].slice(0, 5);
          return next;
        });
      }
      if (cleanA) {
        setRecentAddresses((prev) => {
          const next = [cleanA, ...prev.filter((x) => x !== cleanA)].slice(0, 5);
          return next;
        });
      }

      // Guardar lista general de recientes
      const existing = localStorage.getItem(LOCAL_STORAGE_RECENT_ENTRIES);
      const parsed = existing ? JSON.parse(existing) : { names: [], addresses: [], phones: [] };
      const updated = {
        names: cleanN ? [cleanN, ...(parsed.names || []).filter((x: string) => x !== cleanN)].slice(0, 5) : parsed.names || [],
        addresses: cleanA ? [cleanA, ...(parsed.addresses || []).filter((x: string) => x !== cleanA)].slice(0, 5) : parsed.addresses || [],
        phones: cleanP ? [cleanP, ...(parsed.phones || []).filter((x: string) => x !== cleanP)].slice(0, 5) : parsed.phones || [],
      };
      localStorage.setItem(LOCAL_STORAGE_RECENT_ENTRIES, JSON.stringify(updated));
    } catch (e) {}
  };

  // Load cart, session, and remembered form inputs from localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const storedCart = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedCart) {
          setItems(JSON.parse(storedCart));
        }

        // Cargar sesión de cliente
        const storedCust = localStorage.getItem(LOCAL_STORAGE_CUSTOMER_SESSION);
        let activeCust: CustomerProfile | null = null;
        if (storedCust) {
          activeCust = JSON.parse(storedCust);
          setCurrentCustomer(activeCust);
        }

        // Cargar memoria del formulario en este navegador
        const storedForm = localStorage.getItem(LOCAL_STORAGE_CHECKOUT_MEMORY);
        if (storedForm) {
          const form = JSON.parse(storedForm);
          if (form.customerName && !activeCust?.nombre) setCustomerName(form.customerName);
          if (form.customerPhone && !activeCust?.telefono) setCustomerPhone(form.customerPhone);
          if (form.customerAddress && !activeCust?.direccion) setCustomerAddress(form.customerAddress);
          if (form.customerNotes) setCustomerNotes(form.customerNotes);
          if (form.paymentMethod) setPaymentMethod(form.paymentMethod);
          if (form.deliveryType) setDeliveryType(form.deliveryType);
        }

        // Si hay cliente activo, sus datos tienen máxima prioridad
        if (activeCust) {
          if (activeCust.nombre) setCustomerName(activeCust.nombre);
          if (activeCust.telefono) setCustomerPhone(activeCust.telefono);
          if (activeCust.direccion) setCustomerAddress(activeCust.direccion);
        }

        // Cargar entradas recientes para autocompletado
        const storedRecent = localStorage.getItem(LOCAL_STORAGE_RECENT_ENTRIES);
        if (storedRecent) {
          const r = JSON.parse(storedRecent);
          if (Array.isArray(r.names)) setRecentNames(r.names);
          if (Array.isArray(r.addresses)) setRecentAddresses(r.addresses);
          if (Array.isArray(r.phones)) setRecentPhones(r.phones);
        }
      }
    } catch (e) {
      console.error('Error loading cart/customer from localStorage', e);
    }
    setIsHydrated(true);
  }, []);

  // Guardar en tiempo real los cambios del formulario para recordarlos en este navegador
  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    try {
      const memory = {
        customerName,
        customerPhone,
        customerAddress,
        customerNotes,
        paymentMethod,
        deliveryType,
      };
      localStorage.setItem(LOCAL_STORAGE_CHECKOUT_MEMORY, JSON.stringify(memory));
    } catch (e) {}
  }, [customerName, customerPhone, customerAddress, customerNotes, paymentMethod, deliveryType, isHydrated]);

  // Save cart to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving cart to localStorage', e);
    }
  }, [items, isHydrated]);

  const addToCart = (
    product: Product,
    quantity = 1,
    notes = '',
    selectedAddons: ProductAddon[] = []
  ) => {
    if (quantity <= 0) return;

    setItems((prev) => {
      // Find item with same product AND exact same addons IDs and notes
      const addonKey = selectedAddons.map((a) => a.id).sort().join(',');
      const existingIndex = prev.findIndex((item) => {
        const itemAddonKey = (item.selectedAddons || []).map((a) => a.id).sort().join(',');
        return (
          String(item.product.id) === String(product.id) &&
          itemAddonKey === addonKey &&
          (item.notes || '') === (notes || '')
        );
      });

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }
      return [...prev, { product, quantity, notes, selectedAddons }];
    });

    setLastAddedProduct(product);
    setTimeout(() => {
      setLastAddedProduct((curr) => (String(curr?.id) === String(product.id) ? null : curr));
    }, 3500);
  };

  const removeFromCart = (indexOrId: string | number) => {
    setItems((prev) => {
      if (typeof indexOrId === 'number' && indexOrId < prev.length) {
        return prev.filter((_, idx) => idx !== indexOrId);
      }
      return prev.filter((item) => String(item.product.id) !== String(indexOrId));
    });
  };

  const updateQuantity = (indexOrId: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(indexOrId);
      return;
    }
    setItems((prev) => {
      if (typeof indexOrId === 'number' && indexOrId < prev.length) {
        const next = [...prev];
        next[indexOrId] = { ...next[indexOrId], quantity };
        return next;
      }
      return prev.map((item) =>
        String(item.product.id) === String(indexOrId) ? { ...item, quantity } : item
      );
    });
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
  const subtotal = items.reduce((acc, item) => {
    const addonsCost = (item.selectedAddons || []).reduce((sum, a) => sum + (a.precio || 0), 0);
    return acc + (item.product.precio + addonsCost) * item.quantity;
  }, 0);
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
      let slugParam: string | null = null;
      if (pathname?.startsWith('/r/')) {
        slugParam = pathname.split('/')[2] || null;
      }

      // Recordar entradas en navegador
      rememberCustomerInput(customerName, customerPhone, customerAddress);

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
          branchId: selectedBranchId,
          sedeNombre: selectedBranchName,
          restaurantSlug: slugParam,
          customerId: currentCustomer?.id || null,
          items: items.map((i) => {
            const addonsCost = (i.selectedAddons || []).reduce((sum, a) => sum + (a.precio || 0), 0);
            return {
              nombre: i.product.nombre,
              precio: i.product.precio + addonsCost,
              cantidad: i.quantity,
              notas: i.notes || null,
              adicionales: i.selectedAddons && i.selectedAddons.length > 0 ? JSON.stringify(i.selectedAddons) : null,
            };
          }),
        }),
      });

      if (res.ok) {
        const orderData = await res.json();
        setLastCreatedOrder(orderData);
        if (typeof window !== 'undefined' && orderData.codigo) {
          localStorage.setItem('punto_g_last_order', orderData.codigo);
        }
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

    if (selectedBranchName) {
      message += `🏢 *Sede:* ${selectedBranchName}\n`;
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
      const addonsCost = (item.selectedAddons || []).reduce((sum, a) => sum + (a.precio || 0), 0);
      const itemUnitPrice = item.product.precio + addonsCost;
      message += `${index + 1}. *${item.quantity}x* ${item.product.nombre} - ${formatCurrency(itemUnitPrice * item.quantity)}\n`;
      if (item.selectedAddons && item.selectedAddons.length > 0) {
        message += `   _Toppings: ${item.selectedAddons.map((a) => `+${a.nombre}`).join(', ')}_\n`;
      }
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
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    let tenantSlug = 'punto-g';
    if (pathname?.startsWith('/r/')) {
      const slug = pathname.split('/')[2];
      if (slug) tenantSlug = slug;
    }
    message += `📍 *Rastrea tu pedido en tiempo real:* ${siteUrl}/r/${tenantSlug}/pedido/${orderCode}\n\n`;
    message += `¡Muchas gracias! Ya quedó registrado en el sistema con el código *#${orderCode}*.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${restaurantInfo.whatsappNumber}&text=${encodedMessage}`;
    
    clearCart();
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
        availableBranches,
        selectedBranchId,
        selectedBranchName,
        setSelectedBranchId,
        setSelectedBranchName,
        // Customer Auth & Persistent Memory
        currentCustomer,
        setCurrentCustomer,
        loginCustomer,
        logoutCustomer,
        recentNames,
        recentAddresses,
        recentPhones,
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
