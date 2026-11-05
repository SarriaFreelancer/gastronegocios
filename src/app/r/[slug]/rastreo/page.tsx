'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  Sparkles, 
  ShoppingBag, 
  RefreshCw, 
  XCircle, 
  MapPin, 
  Calendar 
} from 'lucide-react';
import { useTenant } from '@/context/TenantContext';

// Helper to sanitize any code entered:
const normalizeOrderCode = (input: string) => {
  let clean = (input || '').trim().toUpperCase();
  clean = clean.replace(/^#+/, '').trim();
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

export default function TenantRastreoPortalPage() {
  const router = useRouter();
  const params = useParams();
  const slug = ((params?.slug as string) || 'punto-g').toLowerCase().trim();

  const { restaurant } = useTenant();
  const restaurantName = restaurant?.nombre || 'Restaurante';
  const primaryColor = restaurant?.colorPrimario || '#EAA622';
  const buttonColor = restaurant?.colorBoton || primaryColor;
  const buttonTextColor = restaurant?.colorBotonTexto || '#000000';

  const [code, setCode] = useState('');
  const [lastOrderCode, setLastOrderCode] = useState<string | null>(null);

  // Instant Live Search State
  const [liveOrder, setLiveOrder] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchNotFound, setSearchNotFound] = useState(false);

  // Read last stored order code from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`last_order_${slug}`) || localStorage.getItem('last_order_code');
      if (stored) {
        setLastOrderCode(stored.replace(/^#+/, ''));
      }
    } catch {
      // Ignore storage access errors
    }
  }, [slug]);

  // Live Instant Search: as the user types
  useEffect(() => {
    const raw = code.trim();
    if (!raw) {
      setLiveOrder(null);
      setIsSearching(false);
      setSearchNotFound(false);
      return;
    }

    const clean = normalizeOrderCode(raw);
    if (clean.length < 3) {
      setLiveOrder(null);
      setSearchNotFound(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(clean)}?restaurantSlug=${slug}`);
        if (res.ok) {
          const data = await res.json();
          setLiveOrder(data);
          setSearchNotFound(false);
        } else {
          setLiveOrder(null);
          if (clean.length >= 4) {
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
  }, [code, slug]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCode = normalizeOrderCode(code);
    if (!finalCode) return;
    router.push(`/r/${slug}/pedido/${encodeURIComponent(finalCode)}`);
  };

  const getStatusBadge = (estado: string) => {
    const step = getStepIndex(estado);
    switch (step) {
      case 0:
        return {
          label: '🟡 Pedido Recibido',
          style: { backgroundColor: `${primaryColor}20`, color: primaryColor, borderColor: `${primaryColor}40` },
        };
      case 1:
        return {
          label: '🔵 En Cocina',
          style: { backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', borderColor: 'rgba(59, 130, 246, 0.4)' },
        };
      case 2:
        return {
          label: '🟣 Listo en Cocina',
          style: { backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', borderColor: 'rgba(99, 102, 241, 0.4)' },
        };
      case 3:
        return {
          label: '🛵 En Camino / Despachado',
          style: { backgroundColor: 'rgba(168, 85, 247, 0.2)', color: '#d8b4fe', borderColor: 'rgba(168, 85, 247, 0.4)' },
        };
      case 4:
        return {
          label: '🟢 ¡Entregado!',
          style: { backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', borderColor: 'rgba(16, 185, 129, 0.4)' },
        };
      default:
        return {
          label: '🔴 Cancelado',
          style: { backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', borderColor: 'rgba(239, 68, 68, 0.4)' },
        };
    }
  };

  const formatPrice = (val: number) => '$' + Number(val || 0).toLocaleString('es-CO');

  return (
    <div className="min-h-screen bg-[#080808] pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Header Hero */}
        <div className="text-center space-y-3">
          <div 
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider"
            style={{ 
              backgroundColor: `${primaryColor}15`, 
              borderColor: `${primaryColor}40`, 
              color: primaryColor 
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Rastreo en tiempo real • {restaurantName}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase font-display tracking-tight">
            ¿DÓNDE ESTÁ MI{' '}
            <span style={{ color: primaryColor }}>
              PEDIDO?
            </span>
          </h1>

          <p className="text-sm text-gray-400 max-w-lg mx-auto leading-relaxed">
            Ingresa el código de tu orden para ver en vivo el estado de tu preparación en <strong className="text-white">{restaurantName}</strong>.
          </p>
        </div>

        {/* Recent Order Quick Card (from LocalStorage) */}
        {lastOrderCode && !liveOrder && (
          <div 
            className="rounded-2xl p-5 border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}18 0%, #141414 50%, #101010 100%)`,
              borderColor: `${primaryColor}40`
            }}
          >
            <div className="flex items-center gap-3.5">
              <div 
                className="w-12 h-12 rounded-xl font-black flex items-center justify-center flex-shrink-0 shadow-md"
                style={{ backgroundColor: primaryColor, color: buttonTextColor }}
              >
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span 
                  className="text-[10px] uppercase font-mono font-bold tracking-wider block"
                  style={{ color: primaryColor }}
                >
                  Tu último pedido en este dispositivo
                </span>
                <h3 className="text-lg font-black text-white">
                  PEDIDO #{lastOrderCode}
                </h3>
              </div>
            </div>

            <Link
              href={`/r/${slug}/pedido/${encodeURIComponent(lastOrderCode)}`}
              className="w-full sm:w-auto px-5 py-2.5 font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95 flex-shrink-0"
              style={{ backgroundColor: buttonColor, color: buttonTextColor }}
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
                  <span 
                    className="text-[11px] font-mono flex items-center gap-1.5 animate-pulse"
                    style={{ color: primaryColor }}
                  >
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
                  placeholder="Escribe tu código, ej: 1045 o SR-1045"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-[#181818] border-2 border-[#2b2b2b] rounded-2xl pl-10 pr-4 py-3.5 text-base sm:text-lg font-bold text-white placeholder-gray-500 focus:outline-none transition-colors font-mono uppercase"
                  style={{
                    borderColor: code ? primaryColor : undefined,
                  }}
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-1.5">
                💡 Puedes escribirlo con o sin numeral (ejemplo: <strong>#1045</strong> o <strong>1045</strong>).
              </p>
            </div>

            <button
              type="submit"
              disabled={!code.trim()}
              className="w-full py-4 font-black text-sm uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] active:scale-[0.99] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              style={{
                backgroundColor: buttonColor,
                color: buttonTextColor,
              }}
            >
              <Search className="w-4 h-4" />
              <span>CONSULTAR ESTADO EN VIVO</span>
            </button>
          </form>

          {/* INSTANT LIVE ORDER RESULT */}
          {liveOrder && (
            <div className="pt-4 border-t border-[#222] animate-fadeIn">
              <div 
                className="bg-gradient-to-br from-[#181818] to-[#111111] border-2 rounded-2xl p-5 shadow-2xl space-y-4"
                style={{ borderColor: `${primaryColor}60` }}
              >
                
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
                      PEDIDO <span style={{ color: primaryColor }}>#{liveOrder.codigo}</span>
                    </h3>
                    <p className="text-xs text-gray-300 mt-0.5">
                      Cliente: <strong className="text-white">{liveOrder.cliente}</strong>
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="text-right">
                    <span
                      className="inline-block px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border shadow-sm"
                      style={getStatusBadge(liveOrder.estado).style}
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
                              isCurrent ? 'animate-pulse' : ''
                            }`}
                            style={{
                              backgroundColor: isDone || isCurrent ? primaryColor : '#252525',
                            }}
                          />
                          <span
                            className="text-[9px] font-bold uppercase block truncate"
                            style={{
                              color: isCurrent ? primaryColor : isDone ? '#ffffff' : '#6b7280',
                            }}
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
                    <span 
                      className="font-black text-base font-display"
                      style={{ color: primaryColor }}
                    >
                      {formatPrice(liveOrder.total)}
                    </span>
                  </div>
                </div>

                {/* Primary CTA */}
                <Link
                  href={`/r/${slug}/pedido/${encodeURIComponent(liveOrder.codigo)}`}
                  className="w-full py-3 font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95"
                  style={{ backgroundColor: buttonColor, color: buttonTextColor }}
                >
                  <span>VER SEGUIMIENTO EN VIVO COMPLETO 👉</span>
                </Link>

              </div>
            </div>
          )}

          {/* Not Found hint */}
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
            <div 
              className="w-10 h-10 rounded-xl border flex items-center justify-center"
              style={{ 
                backgroundColor: `${primaryColor}15`, 
                borderColor: `${primaryColor}40`, 
                color: primaryColor 
              }}
            >
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-black text-white uppercase">¿Sin necesidad de registro?</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              ¡Exacto! En {restaurantName} no necesitas recordar contraseñas. Cada vez que pides por nuestra web o por WhatsApp se genera un código único de seguimiento.
            </p>
          </div>

          <div className="bg-[#121212] border border-[#202020] rounded-2xl p-5 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-black text-white uppercase">Actualización en vivo</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              El seguimiento se actualiza en automático sin necesidad de recargar. Sabrás con certeza cuándo tu pedido está en cocina o listo para entrega.
            </p>
          </div>
        </div>

        {/* CTA to Menu */}
        <div className="text-center pt-4">
          <p className="text-xs text-gray-500 mb-3">¿Aún no has ordenado?</p>
          <Link
            href={`/r/${slug}/menu`}
            className="inline-flex items-center gap-2 text-xs font-bold hover:underline"
            style={{ color: primaryColor }}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Explorar la carta completa de {restaurantName}</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
