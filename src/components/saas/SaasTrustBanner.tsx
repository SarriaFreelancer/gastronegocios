'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Star, Headphones, Handshake } from 'lucide-react';

export function SaasTrustBanner() {
  return (
    <div className="relative bg-[#07090F] border-t border-b border-white/5 py-8 text-white overflow-hidden">
      {/* Red ambient bottom light wave / ribbon effect */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-[#E53E3E] to-transparent shadow-[0_0_25px_#E53E3E]" />
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-red-600/20 blur-[90px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
          
          {/* STATS: 3 items (Exact match with reference image) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 w-full lg:w-auto text-center sm:text-left">
            
            {/* Stat 1: +1.000 Restaurantes */}
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 shrink-0">
                <Handshake className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-white font-display tracking-tight">+1.000</div>
                <div className="text-xs text-gray-400 font-medium">Restaurantes confían en nosotros</div>
              </div>
            </div>

            {/* Stat 2: 4.9/5 Satisfacción */}
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 shrink-0">
                <Star className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-white font-display tracking-tight">4.9/5</div>
                <div className="text-xs text-gray-400 font-medium">Satisfacción de nuestros clientes</div>
              </div>
            </div>

            {/* Stat 3: Soporte 24/7 */}
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-white font-display tracking-tight">Soporte 24/7</div>
                <div className="text-xs text-gray-400 font-medium">Siempre contigo</div>
              </div>
            </div>

          </div>

          {/* RIGHT ACTION BUTTON: Solid Red Pill Button (Exact match with reference) */}
          <div className="w-full sm:w-auto flex justify-center lg:justify-end">
            <Link
              href="/registro"
              className="inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-[#E53E3E] hover:bg-[#D42B2B] text-white font-black text-sm sm:text-base tracking-wide shadow-[0_0_30px_rgba(229,62,62,0.5)] hover:shadow-[0_0_40px_rgba(229,62,62,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group"
            >
              <span className="text-lg">🚀</span>
              <span>¡Empieza hoy y lleva tu restaurante al futuro!</span>
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </div>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
