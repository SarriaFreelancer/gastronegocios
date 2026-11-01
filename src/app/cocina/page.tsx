'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
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
  Layers
} from 'lucide-react';

interface OrderItem {
  id: number;
  nombre: string;
  cantidad: number;
  precio: number;
  subtotal: number;
  notas?: string | null;
}

interface Order {
  id: number;
  codigo: string;
  cliente: string;
  telefono: string;
  tipo: string;
  numeroMesa?: string | null;
  direccion?: string | null;
  notas?: string | null;
  estado: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

export default function CocinaKDSPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState<'todos' | 'Pendiente' | 'En Preparación' | 'Listo'>('todos');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [soundUnlocked, setSoundUnlocked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [updatingId, setUpdatingId] = useState<number | null>(null);

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

  // Fetch kitchen orders
  const fetchOrders = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const res = await fetch('/api/orders?cocina=true');
      if (!res.ok) throw new Error('Error al obtener pedidos');
      const data = await res.json();
      const fetched: Order[] = data.orders || [];

      // Check if new orders arrived to ring the kitchen bell
      if (prevOrderCountRef.current > 0 && fetched.length > prevOrderCountRef.current) {
        if (soundEnabled) {
          playKitchenChime();
        }
      }
      prevOrderCountRef.current = fetched.length;
      setOrders(fetched);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [playKitchenChime, soundEnabled]);

  // Initial fetch and 3-second auto-polling
  useEffect(() => {
    fetchOrders(true);
    const interval = setInterval(() => {
      fetchOrders(false);
    }, 3500);
    return () => clearInterval(interval);
  }, [fetchOrders]);

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
      alert('Error al actualizar el estado del pedido');
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
      <header className="bg-[#101010] border-b border-[#222] px-4 py-3 sticky top-0 z-30 shadow-md">
        <div className="max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Logo & Live Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-brand-yellow text-black rounded-xl font-black shadow-glow flex items-center justify-center">
                <ChefHat className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-wider uppercase text-white flex items-center gap-2">
                  PUNTO G <span className="text-brand-yellow">KDS</span>
                </h1>
                <p className="text-[11px] text-gray-400 font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>SISTEMA DE COCINA EN VIVO</span>
                </p>
              </div>
            </div>

            {/* Live Clock */}
            <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-[#181818] border border-[#2b2b2b] rounded-xl font-mono text-base font-bold text-brand-yellow">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{currentTime || '--:--:--'}</span>
            </div>
          </div>

          {/* Metrics summary pills */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterEstado('todos')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                filterEstado === 'todos'
                  ? 'bg-white text-black shadow-md'
                  : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#252525]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Todos ({orders.length})</span>
            </button>

            <button
              onClick={() => setFilterEstado('Pendiente')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                filterEstado === 'Pendiente'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'bg-amber-950/40 text-amber-400 border border-amber-900/50 hover:bg-amber-900/40'
              }`}
            >
              <span>🟡 Nuevos ({pendientesCount})</span>
            </button>

            <button
              onClick={() => setFilterEstado('En Preparación')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                filterEstado === 'En Preparación'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-blue-950/40 text-blue-400 border border-blue-900/50 hover:bg-blue-900/40'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>En Fuego ({enPreparacionCount})</span>
            </button>

            <button
              onClick={() => setFilterEstado('Listo')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                filterEstado === 'Listo'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/50 hover:bg-emerald-900/40'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Listos ({listosCount})</span>
            </button>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              onClick={() => {
                if (!soundEnabled) {
                  enableSound();
                } else {
                  setSoundEnabled(false);
                }
              }}
              className={`p-2 rounded-xl border transition-colors ${
                soundEnabled
                  ? 'bg-brand-yellow/10 border-brand-yellow text-brand-yellow'
                  : 'bg-[#181818] border-[#2b2b2b] text-gray-400 hover:text-white'
              }`}
              title={soundEnabled ? 'Silenciar campana' : 'Activar sonido de pedidos'}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {/* Refresh */}
            <button
              onClick={() => fetchOrders(false)}
              className="p-2 rounded-xl bg-[#181818] border border-[#2b2b2b] text-gray-400 hover:text-brand-yellow transition-colors"
              title="Refrescar manualmente"
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-[#181818] border border-[#2b2b2b] text-gray-400 hover:text-white transition-colors"
              title="Pantalla Completa (F11)"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>

            {/* Link to Admin */}
            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#181818] border border-[#2b2b2b] text-xs font-semibold text-gray-300 hover:text-brand-yellow transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 items-start">
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

                    {order.tipo === 'domicilio' && order.direccion && (
                      <p className="text-[11px] text-gray-400 truncate mt-1">
                        📍 {order.direccion}
                      </p>
                    )}
                  </div>

                  {/* Card Body: Items List (Very readable and large for kitchen) */}
                  <div className="p-4 flex-1 space-y-3.5 max-h-[360px] overflow-y-auto">
                    {order.items.map((item, idx) => (
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
                    ))}

                    {/* General Order Note */}
                    {order.notas && (
                      <div className="p-2.5 rounded-xl bg-[#201505] border border-amber-600/40 text-amber-300 text-xs font-semibold">
                        <span className="font-bold text-brand-yellow uppercase text-[10px] block mb-0.5">
                          Nota general del cliente:
                        </span>
                        {order.notas}
                      </div>
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

                    {/* State: Listo -> Despachado / Entregado */}
                    {order.estado === 'Listo' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'Entregado')}
                        disabled={isUpdating}
                        className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 disabled:opacity-50"
                      >
                        <ArrowRight className="w-5 h-5" />
                        <span>{isUpdating ? 'Actualizando...' : 'Despachar / Entregado 🚀'}</span>
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
          <span>Último sync: {lastUpdated.toLocaleTimeString()}</span>
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

    </div>
  );
}
