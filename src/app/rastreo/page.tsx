'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  Clock, 
  ClipboardCheck, 
  ArrowRight, 
  HelpCircle, 
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  PhoneCall
} from 'lucide-react';
import { restaurantInfo } from '@/data/restaurant-info';

export default function RastreoPortalPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [lastOrderCode, setLastOrderCode] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('punto_g_last_order');
      if (saved) {
        setLastOrderCode(saved);
      }
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (!clean) return;

    // Standardize: if user typed 1045, format to PG-1045
    const finalCode = clean.startsWith('PG-') ? clean : `PG-${clean}`;
    router.push(`/pedido/${encodeURIComponent(finalCode)}`);
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
            Ingresa el código de tu orden (ej: <strong className="text-white">PG-1045</strong>) para ver en vivo cuando entra a la parrilla, sale de cocina o va en camino.
          </p>
        </div>

        {/* Recent Order Quick Card (from LocalStorage) */}
        {lastOrderCode && (
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
              href={`/pedido/${encodeURIComponent(lastOrderCode)}`}
              className="w-full sm:w-auto px-5 py-2.5 bg-brand-yellow hover:bg-brand-yellowHover text-black font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-glow transition-transform hover:scale-105 active:scale-95 flex-shrink-0"
            >
              <span>Ver en vivo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Search Code Form */}
        <div className="bg-[#121212] border border-[#222] rounded-3xl p-6 sm:p-8 shadow-xl">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                Código de tu orden:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 font-mono font-bold">
                  #
                </div>
                <input
                  type="text"
                  placeholder="Ej: PG-1045 o 1045"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-[#181818] border-2 border-[#2b2b2b] rounded-2xl pl-9 pr-4 py-3.5 text-base sm:text-lg font-bold text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow transition-colors font-mono uppercase"
                  autoFocus
                />
              </div>
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
