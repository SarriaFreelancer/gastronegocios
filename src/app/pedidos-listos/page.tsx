'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { 
  BellRing, 
  CheckCircle2, 
  Clock, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  Sparkles, 
  Utensils, 
  ShoppingBag, 
  Bike, 
  Building2, 
  ArrowLeft,
  ChevronRight,
  Check
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

interface OrderItem {
  id: number;
  nombre: string;
  cantidad: number;
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
  barrio?: string | null;
  notasCliente?: string | null;
  estado: string;
  total: number;
  metodoPago: string;
  branchId?: number | null;
  sedeNombre?: string | null;
  createdAt: string;
  updatedAt?: string;
  items: OrderItem[];
}

interface Branch {
  id: number;
  nombre: string;
  slug: string;
}

export default function PedidosListosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [deliveringId, setDeliveringId] = useState<number | null>(null);

  // Track previous order IDs to detect when a new order becomes ready
  const prevReadyIdsRef = useRef<Set<number>>(new Set());

  // Web Audio chime for new ready orders
  const playChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      // Play a high-low-high restaurant call chime (C5 - E5 - G5 - C6)
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.12);

        gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.12);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + index * 0.12 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.12 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + index * 0.12);
        osc.stop(ctx.currentTime + index * 0.12 + 0.7);
      });
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }, [soundEnabled]);

  // Fetch branches
  useEffect(() => {
    fetch('/api/branches')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setBranches(data);
      })
      .catch(() => {});
  }, []);

  // Fetch orders with estado = "Listo"
  const fetchOrders = useCallback(async () => {
    try {
      let url = '/api/orders?estado=Listo';
      if (selectedBranchId !== 'all') {
        url += `&branchId=${selectedBranchId}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const readyOrders: Order[] = Array.isArray(data) ? data : (data.orders || []);
        
        // Detect newly arrived ready orders
        const currentIds = new Set(readyOrders.map((o: Order) => o.id));
        let hasNew = false;
        currentIds.forEach((id) => {
          if (!prevReadyIdsRef.current.has(id)) {
            hasNew = true;
          }
        });

        if (hasNew && prevReadyIdsRef.current.size > 0) {
          playChime();
        }

        prevReadyIdsRef.current = currentIds;
        setOrders(readyOrders);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Error fetching ready orders:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedBranchId, playChime]);

  // Polling every 4 seconds
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 4000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Live Clock
  useEffect(() => {
    const updateTime = () => {
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
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Mark order as Entregado
  const markAsEntregado = async (orderId: number) => {
    setDeliveringId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'Entregado' }),
      });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        prevReadyIdsRef.current.delete(orderId);
      }
    } catch (err) {
      console.error('Error marking delivered:', err);
    } finally {
      setDeliveringId(null);
    }
  };

  // Calculate elapsed minutes since ready/updated
  const getElapsedMinutes = (dateStr: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 60000);
    return Math.max(0, diff);
  };

  return (
    <div className="min-h-screen bg-[#070707] text-white flex flex-col font-sans select-none overflow-x-hidden">
      {/* Top Header Bar */}
      <header className="bg-[#101010] border-b border-[#222] px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-2xl">
        <div className="flex items-center gap-3">
          <Logo />
          <div className="h-6 w-px bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h1 className="text-lg sm:text-2xl font-black uppercase tracking-tight font-display flex items-center gap-2 text-white">
              PEDIDOS LISTOS
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold tracking-wider">
                PANTALLA DE ENTREGA
              </span>
            </h1>
          </div>
        </div>

        {/* Center / Right Controls */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-4">
          {/* Branch selector */}
          <div className="flex items-center gap-1.5 bg-[#181818] border border-[#2c2c2c] rounded-xl px-2.5 py-1 text-xs">
            <Building2 className="w-3.5 h-3.5 text-brand-yellow" />
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="bg-transparent text-gray-200 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="all" className="bg-[#181818] text-white">Todas las Sedes</option>
              {branches.map((b) => (
                <option key={b.id} value={String(b.id)} className="bg-[#181818] text-white">
                  {b.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Clock */}
          <div suppressHydrationWarning className="bg-[#181818] border border-[#2c2c2c] px-3 py-1 rounded-xl font-mono text-xs sm:text-sm text-brand-yellow font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span suppressHydrationWarning>{currentTime || '--:--'}</span>
          </div>

          {/* Audio Chime Toggle */}
          <button
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              if (next) playChime();
            }}
            className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
              soundEnabled
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-[#181818] text-gray-400 border-[#2c2c2c] hover:bg-[#202020]'
            }`}
            title={soundEnabled ? 'Sonido de aviso activado' : 'Sonido silenciado'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden md:inline">{soundEnabled ? 'Aviso Activo' : 'Silencio'}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-[#181818] text-gray-300 border border-[#2c2c2c] hover:bg-[#202020] transition-colors"
            title="Pantalla Completa"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Back to Kitchen or Admin */}
          <Link
            href="/cocina"
            className="px-3 py-1.5 rounded-xl bg-[#1a1a1a] hover:bg-[#252525] text-xs font-bold text-gray-300 border border-[#303030] flex items-center gap-1 transition-colors"
          >
            <span>Ir a Cocina</span>
            <ChevronRight className="w-3 h-3 text-brand-yellow" />
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400 py-24">
            <RefreshCw className="w-10 h-10 animate-spin text-brand-yellow" />
            <p className="font-bold text-sm">Cargando turnero de pedidos...</p>
          </div>
        ) : orders.length === 0 ? (
          /* Empty State: Ready Waiting Screen */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-[#222] rounded-3xl bg-[#0c0c0c]/80 my-auto">
            <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6 animate-pulse">
              <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white font-display mb-3">
              TODOS LOS PEDIDOS ESTÁN ENTREGADOS
            </h2>
            <p className="text-base sm:text-xl text-gray-400 max-w-xl mb-6">
              Tan pronto como cocina marque un plato como <span className="text-emerald-400 font-bold">"Listo"</span>, aparecerá aquí automáticamente con aviso sonoro para ser recogido por el cliente o llevado a la mesa.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
              <Clock className="w-4 h-4 text-brand-yellow" />
              <span>Última comprobación: {lastUpdated.toLocaleTimeString('es-CO')}</span>
            </div>
          </div>
        ) : (
          /* Orders Grid Display */
          <div className="space-y-6">
            {/* Alert Banner */}
            <div className="bg-gradient-to-r from-emerald-950/60 via-[#102418] to-emerald-950/60 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500 text-black font-black rounded-xl animate-bounce">
                  <BellRing className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black uppercase text-emerald-300">
                    {orders.length} {orders.length === 1 ? 'PEDIDO LISTO PARA ENTREGA' : 'PEDIDOS LISTOS PARA ENTREGA'}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300">
                    Acércate a la barra o espera a tu mesero con el número de pedido en pantalla.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-black/40 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Actualización automática en vivo</span>
              </div>
            </div>

            {/* Big Visual Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {orders.map((order) => {
                const elapsed = getElapsedMinutes(order.updatedAt || order.createdAt);
                const isTable = order.tipo === 'mesa' || !!order.numeroMesa;
                const isPickup = order.tipo === 'recoger';
                const isDelivery = order.tipo === 'domicilio';

                return (
                  <div
                    key={order.id}
                    className="relative bg-gradient-to-b from-[#161616] to-[#0f0f0f] border-2 border-emerald-500/50 rounded-3xl p-6 shadow-2xl flex flex-col justify-between overflow-hidden group hover:border-emerald-400 transition-all hover:scale-[1.01]"
                  >
                    {/* Top Glow Accent */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-brand-yellow to-emerald-400" />

                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-500 text-black">
                          <CheckCircle2 className="w-4 h-4" />
                          ¡LISTO!
                        </span>

                        {/* Order Type Badge */}
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                          isTable 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                            : isPickup 
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' 
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        }`}>
                          {isTable ? <Utensils className="w-3 h-3" /> : isPickup ? <ShoppingBag className="w-3 h-3" /> : <Bike className="w-3 h-3" />}
                          {isTable ? (order.numeroMesa || 'Mesa') : isPickup ? 'Para Llevar / Recoger' : 'Domicilio'}
                        </span>
                      </div>

                      {/* Giant Order Code */}
                      <div className="bg-black/60 rounded-2xl p-4 border border-[#252525] text-center mb-4">
                        <div className="text-xs uppercase text-gray-400 font-bold tracking-widest mb-1">CÓDIGO DE ORDEN</div>
                        <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-brand-yellow drop-shadow-[0_2px_12px_rgba(255,215,0,0.4)]">
                          #{order.codigo}
                        </div>
                      </div>

                      {/* Customer & Location */}
                      <div className="space-y-2 mb-4">
                        <div className="text-xl sm:text-2xl font-black text-white truncate">
                          {order.cliente || 'Cliente'}
                        </div>
                        {order.sedeNombre && (
                          <div className="text-xs text-gray-400 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-brand-yellow" />
                            <span>{order.sedeNombre}</span>
                          </div>
                        )}
                        {isTable && order.numeroMesa && (
                          <div className="inline-block px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 font-black text-sm">
                            📍 Entregar en: {order.numeroMesa}
                          </div>
                        )}
                        {isPickup && (
                          <div className="inline-block px-3 py-1 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 font-black text-sm">
                            🥡 Entregar en: Barra / Mostrador
                          </div>
                        )}
                        {isDelivery && (
                          <div className="inline-block px-3 py-1 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 font-black text-sm truncate max-w-full">
                            🛵 Domicilio: {order.direccion || 'Dirección de envío'}
                          </div>
                        )}
                      </div>

                      {/* Order Items Summary */}
                      <div className="bg-[#121212] rounded-xl p-3 border border-[#222] mb-4 space-y-1.5 max-h-40 overflow-y-auto">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Platos de esta orden:</div>
                        {order.items && order.items.map((it, idx) => (
                          <div key={idx} className="flex items-start justify-between text-xs text-gray-200">
                            <span className="font-bold text-white mr-2">x{it.cantidad} {it.nombre}</span>
                            {it.notas && <span className="text-[10px] text-brand-yellow truncate max-w-[120px]">({it.notas})</span>}
                          </div>
                        ))}
                      </div>

                      {/* Time Ready */}
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-4 px-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-brand-yellow" />
                          <span>Listo hace:</span>
                        </span>
                        <span className={`font-mono font-bold ${elapsed > 10 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                          {elapsed === 0 ? 'Menos de 1 min' : `${elapsed} min`}
                        </span>
                      </div>
                    </div>

                    {/* Action Button for Waitstaff / Cashier */}
                    <button
                      onClick={() => markAsEntregado(order.id)}
                      disabled={deliveringId === order.id}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-black uppercase text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {deliveringId === order.id ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Entregando...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5 stroke-[3]" />
                          <span>MARCAR ENTREGADO</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Footer Banner */}
      <footer className="bg-[#0b0b0b] border-t border-[#1c1c1c] px-4 py-3 text-center text-xs text-gray-500 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-yellow" />
          <span className="text-gray-400 font-semibold">PUNTO G • TU MÁXIMO PLACER</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/cocina" className="hover:text-white transition-colors">Cocina KDS</Link>
          <span>•</span>
          <Link href="/menu" className="hover:text-white transition-colors">Menú Digital</Link>
          <span>•</span>
          <Link href="/admin" className="hover:text-white transition-colors">Panel Admin</Link>
        </div>
      </footer>
    </div>
  );
}
