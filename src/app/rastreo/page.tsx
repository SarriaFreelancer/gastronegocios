'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  Clock, 
  ClipboardCheck, 
  Flame,
  Bike,
  UtensilsCrossed,
  PackageCheck,
  CheckCircle2, 
  ArrowRight, 
  HelpCircle, 
  Sparkles,
  ShoppingBag,
  RefreshCw,
  XCircle,
  MapPin,
  Calendar
} from 'lucide-react';
import { restaurantInfo } from '@/data/restaurant-info';

// Helper to sanitize any code entered:
// e.g. '#1045' -> 'PG-1045', '#PG-1045' -> 'PG-1045', '1045' -> 'PG-1045', 'pg-1045' -> 'PG-1045'
const normalizeOrderCode = (input: string) => {
  let clean = (input || '').trim().toUpperCase();
  // Strip all leading '#'
  clean = clean.replace(/^#+/, '').trim();
  if (!clean) return '';

  // If user typed digits only, prepend PG-
  if (/^\d+$/.test(clean)) {
    return `PG-${clean}`;
  }
  // If user typed PG1045 without hyphen
  if (clean.startsWith('PG') && !clean.startsWith('PG-')) {
    return `PG-${clean.slice(2)}`;
  }
  return clean;
};

// Helper to get step index (0 to 4)
const getStepIndex = (estado: string) => {
  const norm = (estado || '').toLowerCase().trim();
  if (norm.includes('cancelad')) return -1;
  if (norm.includes('entregad') || norm.includes('completad') || norm.includes('finalizad')) return 4;
  if (norm.includes('despachad') || norm.includes('camino') || norm.includes('ruta')) return 3;
  if (norm === 'listo' || norm.includes('listo')) return 2;
  if (norm.includes('prepara') || norm.includes('cocin') || norm.includes('fuego')) return 1;
  if (norm.includes('pendient') || norm.includes('recibid')) return 0;
  return 0;
};

const getStatusBadge = (estado: string) => {
  const step = getStepIndex(estado);
  switch (step) {
    case 0:
      return {
        label: '🟡 Pedido Recibido',
        badgeClass: 'bg-amber-500/20 text-brand-yellow border-brand-yellow/40',
      };
    case 1:
      return {
        label: '🔵 En Cocina / Parrilla',
        badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      };
    case 2:
      return {
        label: '🟣 Listo en Cocina',
        badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      };
    case 3:
      return {
        label: '🛵 En Camino / Despachado',
        badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40 animate-pulse',
      };
    case 4:
      return {
        label: '🟢 ¡Entregado!',
        badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      };
    default:
      return {
        label: '🔴 Cancelado',
        badgeClass: 'bg-red-500/20 text-red-300 border-red-500/40',
      };
  }
};

export default function RastreoPortalPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [lastOrderCode, setLastOrderCode] = useState<string | null>(null);

  // Instant Live Search State
  const [liveOrder, setLiveOrder] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchNotFound, setSearchNotFound] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('punto_g_last_order');
      if (saved) {
        setLastOrderCode(saved);
      }
    }
  }, []);

  // Format currency
  const formatPrice = (val: number) => '$' + Number(val || 0).toLocaleString('es-CO');

  // Debounced Instant Live Search as the user types
  useEffect(() => {
    const raw = code.trim();
    if (!raw) {
      setLiveOrder(null);
      setIsSearching(false);
      setSearchNotFound(false);
      return;
    }

    const clean = normalizeOrderCode(raw);
    // Only search if user typed at least 3 digits or a code
    const digitsOnly = clean.replace(/[^0-9]/g, '');
    if (digitsOnly.length < 3 && clean.length < 5) {
      setLiveOrder(null);
      setSearchNotFound(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(clean)}`);
        if (res.ok) {
          const data = await res.json();
          setLiveOrder(data);
          setSearchNotFound(false);
        } else {
          setLiveOrder(null);
          if (digitsOnly.length >= 4 || clean.startsWith('PG-')) {
            setSearchNotFound(true);
          }
        }
      } catch {
        setLiveOrder(null);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [code]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCode = normalizeOrderCode(code);
    if (!finalCode) return;
    const targetSlug = (liveOrder as any)?.restaurant?.slug || 'punto-g';
    router.push(`/r/${targetSlug}/pedido/${encodeURIComponent(finalCode)}`);
  };

  return (
    <div className="min-h-screen bg-[#080808] pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Header Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Rastreo en tiempo real sin registro</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase font-display tracking-tight">
            ¿DÓNDE ESTÁ MI <span className="text-brand-yellow">PEDIDO?</span>
          </h1>

          <p className="text-sm text-gray-400 max-w-lg mx-auto leading-relaxed">
            Ingresa tu código con o sin numeral (ej: <strong className="text-white">#1045</strong> o <strong className="text-white">PG-1045</strong>) y aparecerá en vivo de inmediato.
          </p>
        </div>

        {/* Recent Order Quick Card (from LocalStorage) */}
        {lastOrderCode && !liveOrder && (
          <div className="bg-gradient-to-r from-brand-yellow/15 via-[#141414] to-[#141414] border border-brand-yellow/40 rounded-2xl p-5 shadow-glow flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-brand-yellow text-black font-black flex items-center justify-center flex-shrink-0 shadow-md">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-brand-yellow tracking-wider">
                  Tu último pedido en este dispositivo
                </span>
                <h3 className="text-lg font-black text-white">
                  PEDIDO #{lastOrderCode}
                </h3>
              </div>
            </div>

            <Link
              href={`/r/punto-g/pedido/${encodeURIComponent(lastOrderCode)}`}
              className="w-full sm:w-auto px-5 py-2.5 bg-brand-yellow hover:bg-brand-yellowHover text-black font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-glow transition-transform hover:scale-105 active:scale-95 flex-shrink-0"
            >
              <span>Ver en vivo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Search Code Form */}
        <div className="bg-[#121212] border border-[#222] rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Código de tu orden:
                </label>
                {isSearching && (
                  <span className="text-[11px] font-mono text-brand-yellow flex items-center gap-1.5 animate-pulse">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Buscando orden...</span>
                  </span>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 font-mono font-bold text-lg">
                  #
                </div>
                <input
                  type="text"
                  placeholder="Escribe tu código, ej: #1045, 1045 o PG-1045"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-[#181818] border-2 border-[#2b2b2b] rounded-2xl pl-10 pr-4 py-3.5 text-base sm:text-lg font-bold text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow transition-colors font-mono uppercase"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-1.5">
                💡 Puedes escribirlo con o sin numeral (ejemplo: <strong>#1045</strong>, <strong>#PG-1045</strong> o simplemente <strong>1045</strong>).
              </p>
            </div>

            <button
              type="submit"
              disabled={!code.trim()}
              className="w-full py-4 bg-brand-yellow hover:bg-brand-yellowHover text-black font-black text-sm uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] active:scale-[0.99] shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search className="w-4 h-4" />
              <span>CONSULTAR ESTADO EN VIVO</span>
            </button>
          </form>

          {/* INSTANT LIVE ORDER RESULT (Appears immediately as user types!) */}
          {liveOrder && (
            <div className="pt-4 border-t border-[#222] animate-fadeIn">
              <div className="bg-gradient-to-br from-[#181818] to-[#111111] border-2 border-brand-yellow/60 rounded-2xl p-5 shadow-[0_0_25px_rgba(255,201,40,0.15)] space-y-4">
                
                {/* Result Header */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                        ¡Orden Encontrada!
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-white font-display uppercase tracking-tight flex items-center gap-2">
                      PEDIDO <span className="text-brand-yellow">#{liveOrder.codigo}</span>
                    </h3>
                    <p className="text-xs text-gray-300 mt-0.5">
                      Cliente: <strong className="text-white">{liveOrder.cliente}</strong>
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border shadow-sm ${
                        getStatusBadge(liveOrder.estado).badgeClass
                      }`}
                    >
                      {getStatusBadge(liveOrder.estado).label}
                    </span>
                    <p className="text-[10px] text-gray-400 font-mono mt-1">
                      {liveOrder.tipo === 'mesa'
                        ? `🍽️ En Mesa #${liveOrder.numeroMesa || 'S/N'}`
                        : liveOrder.tipo === 'domicilio'
                        ? '🛵 Domicilio'
                        : '🛍️ Para Llevar'}
                    </p>
                  </div>
                </div>

                {/* Mini Stepper (5 Steps: 0 to 4) */}
                <div className="py-2">
                  <div className="grid grid-cols-5 gap-1.5 text-center">
                    {[
                      { step: 0, label: 'Recibido' },
                      { step: 1, label: 'Cocina' },
                      { step: 2, label: 'Listo' },
                      { step: 3, label: 'En Camino' },
                      { step: 4, label: 'Entregado' },
                    ].map((s) => {
                      const curStep = getStepIndex(liveOrder.estado);
                      const isDone = curStep >= s.step;
                      const isCurrent = curStep === s.step;

                      return (
                        <div key={s.step} className="space-y-1">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isCurrent
                                ? 'bg-brand-yellow shadow-glow animate-pulse'
                                : isDone
                                ? 'bg-brand-yellow'
                                : 'bg-[#252525]'
                            }`}
                          />
                          <span
                            className={`text-[9px] font-bold uppercase block truncate ${
                              isCurrent
                                ? 'text-brand-yellow font-black'
                                : isDone
                                ? 'text-white'
                                : 'text-gray-500'
                            }`}
                          >
                            {s.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Items preview & Total */}
                <div className="bg-[#141414] border border-[#242424] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="text-gray-300">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Resumen:</span>
                    <span className="font-semibold text-white">
                      {liveOrder.items?.length || 0} plato(s)
                    </span>
                    {liveOrder.items && liveOrder.items.length > 0 && (
                      <span className="text-gray-400 ml-1.5 truncate max-w-[200px] inline-block align-bottom">
                        ({liveOrder.items.map((i: any) => `${i.cantidad}x ${i.nombre}`).join(', ')})
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Total a Pagar:</span>
                    <span className="text-brand-yellow font-black text-base font-display">
                      {formatPrice(liveOrder.total)}
                    </span>
                  </div>
                </div>

                {/* Primary CTA to Full Tracking Screen */}
                <Link
                  href={`/r/${(liveOrder as any)?.restaurant?.slug || 'punto-g'}/pedido/${encodeURIComponent(liveOrder.codigo)}`}
                  className="w-full py-3 bg-brand-yellow hover:bg-brand-yellowHover text-black font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-glow transition-transform hover:scale-105 active:scale-95"
                >
                  <span>🔴 VER SEGUIMIENTO EN VIVO COMPLETO 👉</span>
                </Link>

              </div>
            </div>
          )}

          {/* Not Found hint when typing */}
          {searchNotFound && !liveOrder && !isSearching && (
            <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/40 text-center text-xs text-red-300 flex items-center justify-center gap-2 animate-fadeIn">
              <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>
                No encontramos ningún pedido activo con el código <strong>{normalizeOrderCode(code)}</strong>.
              </span>
            </div>
          )}
        </div>

        {/* Explanatory cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#121212] border border-[#202020] rounded-2xl p-5 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-950/40 border border-brand-yellow/30 text-brand-yellow flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-black text-white uppercase">¿No necesitas registrarte?</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              ¡Exacto! En Punto G no necesitas crear cuentas ni recordar contraseñas. Cada vez que pides por la web o por WhatsApp se genera un código de orden único para ti.
            </p>
          </div>

          <div className="bg-[#121212] border border-[#202020] rounded-2xl p-5 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-black text-white uppercase">Actualización en vivo</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              La pantalla de seguimiento se actualiza en automático sin necesidad de recargar. Sabrás con certeza cuándo tu hamburguesa está en la parrilla o lista para servir.
            </p>
          </div>
        </div>

        {/* CTA to Menu */}
        <div className="text-center pt-4">
          <p className="text-xs text-gray-500 mb-3">¿Aún no has ordenado?</p>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 text-xs font-bold text-brand-yellow hover:underline"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Explorar nuestro menú de hamburguesas y picadas</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
