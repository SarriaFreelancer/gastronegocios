'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { 
  ChefHat, 
  Clock, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  CheckCircle2, 
  Flame, 
  Bike, 
  UtensilsCrossed, 
  ShoppingBag, 
  AlertTriangle,
  ArrowRight,
  Shield,
  Layers,
  Printer,
  MessageCircle,
  Send,
  Building2,
  Bell
} from 'lucide-react';
import { ThermalReceiptModal } from '@/components/pos/ThermalReceiptModal';
import { showError } from '@/lib/swal';
import { requestNotificationPermission, sendBrowserNotification } from '@/lib/pwa-notifications';

interface Branch {
  id: number;
  nombre: string;
  slug: string;
}

interface OrderItem {
  id: number;
  nombre: string;
  cantidad: number;
  precio: number;
  subtotal?: number;
  notas?: string | null;
  adicionales?: string | null;
}

interface Order {
  id: number;
  codigo: string;
  cliente: string;
  telefono: string;
  tipo: string;
  numeroMesa?: string | null;
  direccion?: string | null;
  branchId?: number | null;
  sedeNombre?: string | null;
  barrio?: string | null;
  notasCliente?: string | null;
  notas?: string | null;
  estado: string;
  subtotal: number;
  propina?: number;
  costoEnvio?: number;
  total: number;
  metodoPago: string;
  repartidor?: string | null;
  createdAt: string;
  branch?: { id: number; nombre: string; slug: string } | null;
  items: OrderItem[];
}

export default function CocinaKDSPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const tenantSlug = (params?.slug as string) || null;
  const branchParam = searchParams?.get('branchId') || null;
  const [restaurant, setRestaurant] = useState<{ id: number; nombre: string; colorPrimario?: string; logo?: string; eslogan?: string } | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState<'todos' | 'Pendiente' | 'En Preparación' | 'Listo' | 'Despachado'>('todos');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [soundUnlocked, setSoundUnlocked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [mounted, setMounted] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>(branchParam || 'all');
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptType, setReceiptType] = useState<'comanda' | 'factura'>('comanda');

  const [availableRestaurants, setAvailableRestaurants] = useState<any[]>([]);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(!tenantSlug);

  // Sync branch selection with query param or localStorage
  useEffect(() => {
    if (branchParam) {
      setSelectedBranchId(branchParam);
      if (tenantSlug && typeof window !== 'undefined') {
        localStorage.setItem(`kds_branch_${tenantSlug}`, branchParam);
      }
    } else if (tenantSlug && typeof window !== 'undefined') {
      const saved = localStorage.getItem(`kds_branch_${tenantSlug}`);
      if (saved) {
        setSelectedBranchId(saved);
      }
    }
  }, [branchParam, tenantSlug]);

  const handleBranchChange = (newBranchId: string) => {
    setSelectedBranchId(newBranchId);
    if (tenantSlug && typeof window !== 'undefined') {
      localStorage.setItem(`kds_branch_${tenantSlug}`, newBranchId);
    }
  };

  // Fetch restaurant branding if tenantSlug exists
  useEffect(() => {
    if (tenantSlug) {
      fetch(`/api/restaurants?slug=${tenantSlug}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) setRestaurant(data);
        })
        .catch(console.error);
    }
  }, [tenantSlug]);

  // Set dynamic browser tab title
  useEffect(() => {
    const name = restaurant?.nombre || (tenantSlug ? tenantSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'KDS Cocina');
    document.title = `${name} | Pantalla de Cocina (KDS)`;
  }, [restaurant?.nombre, tenantSlug]);

  // If accessed directly via /cocina without slug, auto-redirect if session has a restaurant
  useEffect(() => {
    if (!tenantSlug && typeof window !== 'undefined') {
      try {
        const activeRest = localStorage.getItem('punto_g_active_restaurant');
        if (activeRest) {
          const parsed = JSON.parse(activeRest);
          if (parsed?.slug) {
            window.location.replace(`/r/${parsed.slug}/cocina`);
            return;
          }
        }
        for (const key of ['punto_g_auth', 'puntog_user', 'punto_g_user', 'user']) {
          const stored = localStorage.getItem(key);
          if (stored) {
            const u = JSON.parse(stored);
            if (u?.restaurant?.slug) {
              window.location.replace(`/r/${u.restaurant.slug}/cocina`);
              return;
            }
            if (u?.restaurantId) {
              fetch(`/api/restaurants?id=${u.restaurantId}`)
                .then((r) => (r.ok ? r.json() : null))
                .then((data) => {
                  if (data?.slug) {
                    window.location.replace(`/r/${data.slug}/cocina`);
                  }
                });
              return;
            }
          }
        }
      } catch (e) {
        // Ignore JSON error
      }

      // If no session found, fetch active restaurants for tenant selection
      fetch('/api/restaurants')
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          const list = data?.restaurants || [];
          setAvailableRestaurants(list);
          setIsRedirecting(false);
        })
        .catch(() => setIsRedirecting(false));
    }
  }, [tenantSlug]);

  const openReceipt = (order: Order, type: 'comanda' | 'factura' = 'comanda') => {
    setReceiptOrder(order);
    setReceiptType(type);
    setIsReceiptOpen(true);
  };

  const notifyCustomerWhatsApp = (order: Order) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const cleanPhone = (order.telefono || '').replace(/\D/g, '');
    const phone = cleanPhone.length === 10 ? `57${cleanPhone}` : cleanPhone;
    const restName = (restaurant?.nombre || (tenantSlug ? tenantSlug : 'RESTAURANTE')).toUpperCase();
    const trackingSlug = (order as any)?.restaurant?.slug || tenantSlug || 'punto-g';
    const trackingUrl = `${origin}/r/${trackingSlug}/pedido/${order.codigo}`;
    const msg = `¡Hola ${order.cliente}! 🔥 Te escribimos de *${restName}*.\nTu pedido *#${order.codigo}* está actualmente en estado: *${order.estado.toUpperCase()}* 🍔✨\n\nPuedes ver el estado de preparación y despacho en vivo aquí:\n👉 ${trackingUrl}\n\n¡Muchas gracias por elegirnos!`;
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`, '_blank');
  };

  const dispatchToDeliveryWhatsApp = (order: Order) => {
    const addressQuery = encodeURIComponent(`${order.direccion || ''}, Cali, Colombia`);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${addressQuery}`;
    const restName = (restaurant?.nombre || (tenantSlug ? tenantSlug : 'RESTAURANTE')).toUpperCase();
    const msg = `🛵 *PEDIDO PARA DOMICILIO - ${restName}* 🛵\n\n` +
      `📦 Orden: *#${order.codigo}*\n` +
      `👤 Cliente: *${order.cliente}*\n` +
      `📱 Teléfono: *${order.telefono}*\n` +
      `📍 Dirección: *${order.direccion || 'No especificada'}* ${order.barrio ? `(${order.barrio})` : ''}\n` +
      `💳 Método de Pago: *${order.metodoPago || 'Efectivo'}*\n` +
      `💵 Total a Cobrar: *$${(order.total || 0).toLocaleString('es-CO')}*\n` +
      `${order.notasCliente ? `⚠️ Nota: ${order.notasCliente}\n` : ''}\n` +
      `🗺️ Enlace a Google Maps:\n${mapsUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const prevOrderCountRef = useRef<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play kitchen chime notification using Web Audio API
  const playKitchenChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // Note 1: E5 (659.25 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.35, now + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.5);

      // Note 2: A5 (880.00 Hz) - higher bell chime
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880, now + 0.18);
      gain2.gain.setValueAtTime(0, now + 0.18);
      gain2.gain.linearRampToValueAtTime(0.4, now + 0.23);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.18);
      osc2.stop(now + 0.8);
    } catch {
      // Audio playback error or autoplay policy
    }
  }, []);

  const enableSound = () => {
    setSoundEnabled(true);
    setSoundUnlocked(true);
    playKitchenChime();
  };

  // Clock timer
  useEffect(() => {
    setMounted(true);
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('es-CO', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch branches on mount
  useEffect(() => {
    if (!tenantSlug) return;
    fetch(`/api/branches?activo=true&restaurantSlug=${tenantSlug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data)) setBranches(data);
      })
      .catch(() => {});
  }, [tenantSlug]);

  // Fetch kitchen orders
  const fetchOrders = useCallback(async (isInitial = false) => {
    if (!tenantSlug) return;
    try {
      if (isInitial) setLoading(true);
      let url = `/api/orders?cocina=true&restaurantSlug=${tenantSlug}`;
      if (selectedBranchId !== 'all') {
        url += `&branchId=${selectedBranchId}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error('Error al obtener pedidos');
      const data = await res.json();
      const fetched: Order[] = data.orders || [];

      // Check if new orders arrived to ring the kitchen bell & trigger browser notification
      if (prevOrderCountRef.current > 0 && fetched.length > prevOrderCountRef.current) {
        if (soundEnabled) {
          playKitchenChime();
        }
        sendBrowserNotification('👨‍🍳 ¡Nuevo Pedido en Cocina!', {
          body: `Llegó un nuevo pedido. Hay ${fetched.length} pedidos en cola.`,
          tag: 'kds-new-order',
        });
      }
      prevOrderCountRef.current = fetched.length;
      setOrders(fetched);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [playKitchenChime, soundEnabled, selectedBranchId, tenantSlug]);

  // Initial fetch and 3-second auto-polling
  useEffect(() => {
    if (!tenantSlug) return;
    fetchOrders(true);
    const interval = setInterval(() => {
      fetchOrders(false);
    }, 3500);
    return () => clearInterval(interval);
  }, [fetchOrders, tenantSlug]);

  // Update order status with immediate optimistic UI update
  const handleUpdateStatus = async (orderId: number, nuevoEstado: string) => {
    try {
      setUpdatingId(orderId);
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (!res.ok) throw new Error('Error al actualizar estado');

      // If moving to Entregado, remove immediately from kitchen screen
      if (nuevoEstado === 'Entregado') {
        setOrders(prev => prev.filter(o => o.id !== orderId));
        prevOrderCountRef.current = Math.max(0, prevOrderCountRef.current - 1);
      } else {
        setOrders(prev =>
          prev.map(o => (o.id === orderId ? { ...o, estado: nuevoEstado } : o))
        );
      }
    } catch (err) {
      showError('Error en KDS Cocina', 'Error al actualizar el estado del pedido');
    } finally {
      setUpdatingId(null);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Calculate elapsed minutes and styling
  const getElapsedInfo = (createdAt: string) => {
    const created = new Date(createdAt).getTime();
    const now = new Date().getTime();
    const diffMins = Math.floor((now - created) / 60000);

    if (diffMins < 10) {
      return {
        mins: diffMins,
        label: `${diffMins} min`,
        badgeClass: 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40',
        cardBorder: 'border-emerald-500/30',
        isLate: false,
      };
    } else if (diffMins < 20) {
      return {
        mins: diffMins,
        label: `${diffMins} min`,
        badgeClass: 'bg-amber-950/80 text-brand-yellow border border-brand-yellow/50',
        cardBorder: 'border-brand-yellow/40',
        isLate: false,
      };
    } else {
      return {
        mins: diffMins,
        label: `⚠️ ${diffMins} min (Demorado)`,
        badgeClass: 'bg-red-950 text-red-400 border border-red-500 font-black animate-pulse',
        cardBorder: 'border-red-600 shadow-[0_0_20px_rgba(239,68,68,0.25)]',
        isLate: true,
      };
    }
  };

  // Counts
  const pendientesCount = orders.filter(o => o.estado === 'Pendiente').length;
  const enPreparacionCount = orders.filter(o => o.estado === 'En Preparación').length;
  const listosCount = orders.filter(o => o.estado === 'Listo').length;

  const filteredOrders = orders.filter(o => {
    if (filterEstado === 'todos') return true;
    return o.estado === filterEstado;
  });

  // Multi-tenant check: if accessed via /cocina without slug, render restaurant selector
  if (!tenantSlug) {
    if (isRedirecting) {
      return (
        <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              Conectando con la cocina KDS de tu restaurante...
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#070707] text-white flex flex-col justify-between p-6">
        <div className="max-w-4xl mx-auto w-full pt-12 space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow text-xs font-black uppercase tracking-wider">
              <ChefHat className="w-4 h-4" />
              <span>Aislamiento de Cocinas KDS</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-display">
              Selecciona tu Restaurante
            </h1>
            <p className="text-sm text-neutral-400 max-w-lg mx-auto">
              Cada restaurante opera su propia pantalla KDS en una ruta aislada. Selecciona tu negocio para visualizar exclusivamente sus pedidos:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {availableRestaurants.map((r) => (
              <div
                key={r.id}
                className="group relative flex flex-col justify-between p-6 rounded-2xl bg-[#121212] border border-[#242424] hover:border-brand-yellow/70 transition-all duration-300 hover:shadow-glow"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-[#1a1a1a] border border-[#333] flex items-center justify-center group-hover:scale-105 transition">
                      <ChefHat className="w-7 h-7 text-brand-yellow" />
                    </div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Activo
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-white group-hover:text-brand-yellow transition">
                      {r.nombre}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                      {r.eslogan || r.descripcion || 'Comandas y pedidos en tiempo real'}
                    </p>
                  </div>

                  {/* Sede direct buttons */}
                  <div className="pt-2 space-y-1.5">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                      Sedes de Cocina:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <Link
                        href={`/r/${r.slug}/cocina`}
                        className="px-2.5 py-1 rounded-lg bg-[#202020] hover:bg-brand-yellow hover:text-black text-[11px] font-bold text-gray-200 transition"
                      >
                        Todas las Sedes
                      </Link>
                      {r.branches && r.branches.length > 0 && r.branches.map((b: any) => (
                        <Link
                          key={b.id}
                          href={`/r/${r.slug}/cocina?branchId=${b.id}`}
                          className="px-2.5 py-1 rounded-lg bg-brand-yellow/15 hover:bg-brand-yellow hover:text-black text-[11px] font-bold text-brand-yellow border border-brand-yellow/40 transition flex items-center gap-1"
                        >
                          <Building2 className="w-3 h-3" />
                          <span>{b.nombre}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#222] flex items-center justify-between text-xs font-bold text-brand-yellow">
                  <Link href={`/r/${r.slug}/cocina`} className="flex items-center gap-1 hover:underline">
                    <span>Entrar a Cocina KDS</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center text-xs text-neutral-500 py-6">
          Desarrollado por SarriaTech Solutions S.A.S Todos los derechos reservados;
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070707] text-white flex flex-col font-sans select-none">
      
      {/* Sound enablement banner if not active yet */}
      {!soundUnlocked && (
        <div className="bg-brand-yellow text-black px-4 py-2 flex items-center justify-between text-xs sm:text-sm font-bold shadow-lg animate-bounce">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            <span>¿Deseas activar el sonido de campana para cuando entre un pedido a cocina?</span>
          </div>
          <button
            onClick={enableSound}
            className="bg-black text-brand-yellow hover:bg-neutral-900 px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider transition-colors shadow-sm"
          >
            Activar Campana 🔔
          </button>
        </div>
      )}

      {/* Top Bar for KDS */}
      <header className="bg-[#101010] border-b border-[#222] px-3 sm:px-5 py-2.5 sm:py-3 sticky top-0 z-30 shadow-md">
        <div className="max-w-[1920px] mx-auto flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          
          {/* Top Row: Logo, Status & Action Tools */}
          <div className="flex items-center justify-between w-full xl:w-auto gap-3">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="p-1.5 sm:p-2 bg-brand-yellow text-black rounded-xl font-black shadow-glow flex items-center justify-center">
                <ChefHat className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h1 className="text-sm sm:text-lg md:text-xl font-black tracking-wider uppercase text-white flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span>{restaurant?.nombre || (tenantSlug ? tenantSlug.toUpperCase() : 'RESTAURANTE')}</span> <span className="text-brand-yellow">KDS</span>
                  {selectedBranchId !== 'all' && (
                    <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md bg-brand-yellow/15 text-brand-yellow border border-brand-yellow/40">
                      📍 Sede: {branches.find(b => String(b.id) === selectedBranchId)?.nombre || `Sede #${selectedBranchId}`}
                    </span>
                  )}
                </h1>
                <p className="text-[9px] sm:text-[11px] text-gray-400 font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>SISTEMA DE COCINA EN VIVO</span>
                </p>
              </div>
            </div>

            {/* Action Tools & Clock (Available on phones, tablets & desktop) */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div suppressHydrationWarning className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#181818] border border-[#2b2b2b] rounded-xl font-mono text-xs font-bold text-brand-yellow">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span suppressHydrationWarning className="hidden sm:inline">{mounted ? (currentTime || '--:--:--') : '--:--:--'}</span>
                <span suppressHydrationWarning className="sm:hidden">{mounted && currentTime ? currentTime.slice(0, 5) : '--:--'}</span>
              </div>

              <button
                onClick={() => {
                  if (!soundEnabled) enableSound();
                  else setSoundEnabled(false);
                }}
                className={`p-2 rounded-xl border transition-colors ${
                  soundEnabled
                    ? 'bg-brand-yellow/10 border-brand-yellow text-brand-yellow'
                    : 'bg-[#181818] border-[#2b2b2b] text-gray-400 hover:text-white'
                }`}
                title={soundEnabled ? 'Silenciar campana' : 'Activar sonido'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={async () => {
                  enableSound();
                  const granted = await requestNotificationPermission();
                  if (granted) {
                    sendBrowserNotification('✅ Notificaciones Activadas', {
                      body: 'Recibirás avisos sonoros y en pantalla cuando lleguen nuevos pedidos a cocina.',
                    });
                  }
                }}
                className="p-2 rounded-xl bg-[#181818] border border-[#2b2b2b] text-gray-400 hover:text-emerald-400 transition"
                title="Activar Notificaciones Push de Escritorio"
              >
                <Bell className="w-4 h-4" />
              </button>

              <button
                onClick={() => fetchOrders(false)}
                className="p-2 rounded-xl bg-[#181818] border border-[#2b2b2b] text-gray-400 hover:text-brand-yellow transition"
                title="Refrescar manualmente"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-xl bg-[#181818] border border-[#2b2b2b] text-gray-400 hover:text-white transition"
                title="Pantalla Completa"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Sede Selector */}
              <div className="flex items-center gap-1.5 bg-[#181818] border border-[#2b2b2b] px-2.5 py-1.5 rounded-xl text-xs">
                <Building2 className="w-3.5 h-3.5 text-brand-yellow shrink-0" />
                <select
                  value={selectedBranchId}
                  onChange={(e) => handleBranchChange(e.target.value)}
                  className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer max-w-[120px] sm:max-w-[150px] truncate"
                >
                  <option value="all" className="bg-[#181818] text-white">Todas las Sedes</option>
                  {branches.map((b) => (
                    <option key={b.id} value={String(b.id)} className="bg-[#181818] text-white">
                      {b.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <Link
                href={tenantSlug ? `/r/${tenantSlug}/pedidos-listos` : '/pedidos-listos'}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition inline-flex items-center gap-1.5"
                title="Pantalla de Pedidos Listos"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span className="hidden md:inline">Turnero Listos</span>
              </Link>

              <Link
                href={tenantSlug ? (restaurant?.id ? `/admin?restaurantId=${restaurant.id}` : `/r/${tenantSlug}`) : '/admin'}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-[#181818] border border-[#2b2b2b] text-xs font-semibold text-gray-300 hover:text-brand-yellow transition inline-flex items-center gap-1.5"
                title="Panel de Administración"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden md:inline">Admin</span>
              </Link>
            </div>
          </div>

          {/* Metrics summary pills (Scrollable on small devices, flexible on tablets) */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 xl:pb-0 scrollbar-none w-full xl:w-auto">
            <button
              onClick={() => setFilterEstado('todos')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all whitespace-nowrap ${
                filterEstado === 'todos'
                  ? 'bg-white text-black shadow-md font-black'
                  : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#252525]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Todos ({orders.length})</span>
            </button>

            <button
              onClick={() => setFilterEstado('Pendiente')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all whitespace-nowrap ${
                filterEstado === 'Pendiente'
                  ? 'bg-amber-500 text-black shadow-md font-black'
                  : 'bg-amber-950/40 text-amber-400 border border-amber-900/50 hover:bg-amber-900/40'
              }`}
            >
              <span>🟡 Nuevos ({pendientesCount})</span>
            </button>

            <button
              onClick={() => setFilterEstado('En Preparación')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all whitespace-nowrap ${
                filterEstado === 'En Preparación'
                  ? 'bg-blue-500 text-white shadow-md font-black'
                  : 'bg-blue-950/40 text-blue-400 border border-blue-900/50 hover:bg-blue-900/40'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>En Fuego ({enPreparacionCount})</span>
            </button>

            <button
              onClick={() => setFilterEstado('Listo')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all whitespace-nowrap ${
                filterEstado === 'Listo'
                  ? 'bg-emerald-500 text-black shadow-md font-black'
                  : 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/50 hover:bg-emerald-900/40'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Listos ({listosCount})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content: Orders Grid */}
      <main className="flex-1 p-4 sm:p-6 max-w-[1920px] mx-auto w-full">
        {loading && orders.length === 0 ? (
          <div className="h-[60vh] flex flex-col items-center justify-center text-gray-400 gap-3">
            <RefreshCw className="w-10 h-10 animate-spin text-brand-yellow" />
            <p className="text-sm font-semibold">Cargando pedidos de cocina...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-[#101010] border border-[#202020] rounded-3xl max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-full bg-[#181818] border border-[#282828] flex items-center justify-center text-brand-yellow mb-4">
              <ChefHat className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-white">¡Cocina al día!</h2>
            <p className="text-gray-400 text-sm mt-1 max-w-xs">
              No hay pedidos pendientes en este momento. Los nuevos pedidos aparecerán aquí automáticamente sin recargar.
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs text-gray-500 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Escuchando pedidos en vivo...</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5 sm:gap-5 items-start">
            {filteredOrders.map((order) => {
              const elapsed = getElapsedInfo(order.createdAt);
              const isUpdating = updatingId === order.id;

              return (
                <div
                  key={order.id}
                  className={`bg-[#121212] rounded-2xl border-2 transition-all flex flex-col justify-between overflow-hidden shadow-xl ${elapsed.cardBorder} ${
                    order.estado === 'Listo' ? 'bg-[#101712]' : ''
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-[#222] bg-[#161616]">
                    
                    <div className="flex items-center justify-between gap-2 mb-2">
                      {/* Big Modality Badge */}
                      {order.tipo === 'mesa' ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-brand-yellow text-black font-black text-sm tracking-wide shadow-glow">
                          <UtensilsCrossed className="w-4 h-4" />
                          <span>MESA {order.numeroMesa || 'S/N'}</span>
                        </div>
                      ) : order.tipo === 'domicilio' ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500 text-white font-black text-sm tracking-wide">
                          <Bike className="w-4 h-4" />
                          <span>DOMICILIO</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-500 text-white font-black text-sm tracking-wide">
                          <ShoppingBag className="w-4 h-4" />
                          <span>PARA LLEVAR</span>
                        </div>
                      )}

                      {/* Elapsed Time Badge */}
                      <div className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1 ${elapsed.badgeClass}`}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>{elapsed.label}</span>
                      </div>
                    </div>

                    {/* Order Code & Customer */}
                    <div className="flex items-center justify-between text-xs text-gray-400 font-mono mt-1">
                      <span className="font-black text-white text-base">#{order.codigo}</span>
                      <span className="truncate max-w-[140px] text-gray-300 font-sans font-semibold">
                        {order.cliente}
                      </span>
                    </div>

                    {(order.sedeNombre || order.branch?.nombre) && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-brand-yellow/90 mt-1">
                        <Building2 className="w-3 h-3 text-brand-yellow" />
                        <span className="truncate">{order.sedeNombre || order.branch?.nombre}</span>
                      </div>
                    )}

                    {order.tipo === 'domicilio' && order.direccion && (
                      <p className="text-[11px] text-gray-400 truncate mt-1">
                        📍 {order.direccion}
                      </p>
                    )}
                  </div>

                  {/* Card Body: Items List (Very readable and large for kitchen) */}
                  <div className="p-4 flex-1 space-y-3.5 max-h-[360px] overflow-y-auto">
                    {order.items.map((item, idx) => {
                      let itemAddons: any[] = [];
                      if (item.adicionales) {
                        try {
                          const parsed = JSON.parse(item.adicionales);
                          if (Array.isArray(parsed)) itemAddons = parsed;
                        } catch {}
                      }

                      return (
                        <div
                          key={idx}
                          className="bg-[#181818] p-3 rounded-xl border border-[#262626] flex flex-col gap-1.5"
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="w-7 h-7 rounded-lg bg-brand-yellow text-black font-black text-sm flex items-center justify-center flex-shrink-0 shadow-sm">
                              {item.cantidad}x
                            </span>
                            <div className="flex-1">
                              <h4 className="font-black text-white text-sm sm:text-base leading-tight uppercase">
                                {item.nombre}
                              </h4>

                              {/* Toppings / Addons */}
                              {itemAddons.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {itemAddons.map((ad, aIdx) => (
                                    <span
                                      key={aIdx}
                                      className="text-[10px] bg-brand-yellow/20 text-brand-yellow font-extrabold px-1.5 py-0.5 rounded border border-brand-yellow/40"
                                    >
                                      + {ad.nombre}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Special Customization Note */}
                          {item.notas && (
                            <div className="mt-1 px-2.5 py-1.5 rounded-lg bg-amber-950/70 border border-brand-yellow/50 text-brand-yellow text-xs font-bold flex items-start gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                              <span>{item.notas}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* General Order Note */}
                    {(order.notasCliente || order.notas) && (
                      <div className="p-2.5 rounded-xl bg-[#201505] border border-amber-600/40 text-amber-300 text-xs font-semibold">
                        <span className="font-bold text-brand-yellow uppercase text-[10px] block mb-0.5">
                          Nota general del cliente:
                        </span>
                        {order.notasCliente || order.notas}
                      </div>
                    )}
                  </div>

                  {/* Card Quick Action Tools: Imprimir Comanda & WhatsApp */}
                  <div className="px-3 pt-2.5 pb-1 bg-[#141414] border-t border-[#222] flex items-center justify-between gap-1.5">
                    <button
                      type="button"
                      onClick={() => openReceipt(order, 'comanda')}
                      className="flex-1 min-w-0 py-1.5 px-2 rounded-lg bg-[#202020] hover:bg-[#2c2c2c] text-neutral-300 hover:text-white font-bold text-[11px] flex items-center justify-center gap-1 transition"
                      title="Imprimir comanda térmica 58mm/80mm"
                    >
                      <Printer className="w-3.5 h-3.5 text-brand-yellow flex-shrink-0" />
                      <span className="truncate">Comanda</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => notifyCustomerWhatsApp(order)}
                      className="flex-1 min-w-0 py-1.5 px-2 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-400 font-bold text-[11px] border border-emerald-800/40 flex items-center justify-center gap-1 transition"
                      title="Notificar cambio de estado al cliente por WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">Avisar</span>
                    </button>

                    {order.tipo === 'domicilio' && (
                      <button
                        type="button"
                        onClick={() => dispatchToDeliveryWhatsApp(order)}
                        className="py-1.5 px-2.5 rounded-lg bg-blue-950/40 hover:bg-blue-900/50 text-blue-400 font-bold text-[11px] border border-blue-800/40 flex items-center justify-center gap-1 transition flex-shrink-0"
                        title="Enviar detalles y Google Maps al repartidor"
                      >
                        <Bike className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Ruta</span>
                      </button>
                    )}
                  </div>

                  {/* Card Footer: Kitchen Action Buttons */}
                  <div className="p-3 bg-[#151515] border-t border-[#242424] space-y-2">
                    
                    {/* State: Pendiente -> Iniciar Preparación */}
                    {order.estado === 'Pendiente' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'En Preparación')}
                        disabled={isUpdating}
                        className="w-full py-3.5 px-4 rounded-xl bg-brand-yellow hover:bg-brand-yellowHover text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow transition-transform active:scale-95 disabled:opacity-50"
                      >
                        <Flame className="w-5 h-5" />
                        <span>{isUpdating ? 'Actualizando...' : 'Iniciar Preparación 🔥'}</span>
                      </button>
                    )}

                    {/* State: En Preparación -> Listo */}
                    {order.estado === 'En Preparación' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'Listo')}
                        disabled={isUpdating}
                        className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>{isUpdating ? 'Actualizando...' : '¡Plato Listo! ✅'}</span>
                      </button>
                    )}

                    {/* State: Listo -> Despachado / En Camino */}
                    {order.estado === 'Listo' && (
                      <div className="space-y-1.5">
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'Despachado')}
                          disabled={isUpdating}
                          className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 disabled:opacity-50"
                        >
                          <Bike className="w-4 h-4" />
                          <span>{isUpdating ? 'Actualizando...' : order.tipo === 'domicilio' ? 'Despachar (En Camino 🛵)' : 'Saliendo a Mesa 🍽️'}</span>
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'Entregado')}
                          disabled={isUpdating}
                          className="w-full py-2 px-3 rounded-lg bg-[#222] hover:bg-emerald-600/80 text-gray-300 hover:text-white font-bold text-[11px] uppercase tracking-wider transition-colors disabled:opacity-50"
                        >
                          Directo a Entregado ✅
                        </button>
                      </div>
                    )}

                    {/* State: Despachado -> Entregado */}
                    {order.estado === 'Despachado' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'Entregado')}
                        disabled={isUpdating}
                        className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>{isUpdating ? 'Actualizando...' : '¡Marcar como Entregado! ✅'}</span>
                      </button>
                    )}

                    {/* Secondary State selector dropdown/button for edge cases */}
                    <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 px-1">
                      <span>Estado: <strong className="text-white">{order.estado}</strong></span>
                      {order.estado !== 'Pendiente' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'Pendiente')}
                          className="hover:text-brand-yellow underline transition-colors"
                        >
                          Reiniciar
                        </button>
                      )}
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer Info Bar */}
      <footer className="bg-[#101010] border-t border-[#1f1f1f] px-4 py-2 text-xs text-gray-500 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Auto-actualización cada 3.5 segundos</span>
          <span className="text-gray-700">•</span>
          <span suppressHydrationWarning>
            Último sync: {mounted ? lastUpdated.toLocaleTimeString('es-CO') : '--:--'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/rastreo" className="hover:text-brand-yellow transition-colors">
            Ver Rastreador de Clientes
          </Link>
          <span className="text-gray-700">•</span>
          <Link href="/admin" className="hover:text-brand-yellow transition-colors">
            Panel Administrador
          </Link>
        </div>
      </footer>

      {/* POS Thermal Receipt Modal for Kitchen Tickets */}
      <ThermalReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        order={receiptOrder}
        ticketType={receiptType}
      />

    </div>
  );
}
