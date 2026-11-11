'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Star, Headphones, Handshake } from 'lucide-react';

export function SaasTrustBanner() {
  return (
    <div className="relative bg-gradient-to-b from-[#12090B]/95 to-[#070405] border-t border-red-500/20 py-5 sm:py-6 text-white overflow-hidden">
      {/* Intense warm crimson glow from top wave */}
      <div className="absolute -top-12 left-1/4 w-1/2 h-24 bg-[#F10F1A]/30 blur-[65px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* STATS: 3 items with vertical dividers and intense golden icons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-0 sm:divide-x sm:divide-white/20 w-full lg:w-auto">
            
            {/* Stat 1: +1.000 Restaurantes */}
            <div className="flex items-center justify-center sm:justify-start gap-3 sm:pr-7">
              <Handshake className="w-8 h-8 text-[#FA9B23] stroke-[2] shrink-0 drop-shadow-[0_0_10px_rgba(250,155,35,0.45)]" />
              <div>
                <div className="text-xl sm:text-2xl font-black text-white font-display leading-tight">+1.000</div>
                <div className="text-[11.5px] text-gray-200 font-normal">Restaurantes confían en nosotros</div>
              </div>
            </div>

            {/* Stat 2: 4.9/5 Satisfacción */}
            <div className="flex items-center justify-center sm:justify-start gap-3 sm:px-7">
              <Star className="w-8 h-8 text-[#FA9B23] fill-[#FA9B23] shrink-0 drop-shadow-[0_0_10px_rgba(250,155,35,0.45)]" />
              <div>
                <div className="text-xl sm:text-2xl font-black text-white font-display leading-tight">4.9/5</div>
                <div className="text-[11.5px] text-gray-200 font-normal">Satisfacción de nuestros clientes</div>
              </div>
            </div>

            {/* Stat 3: Soporte 24/7 */}
            <div className="flex items-center justify-center sm:justify-start gap-3 sm:pl-7">
              <Headphones className="w-8 h-8 text-[#FA9B23] stroke-[2] shrink-0 drop-shadow-[0_0_10px_rgba(250,155,35,0.45)]" />
              <div>
                <div className="text-xl sm:text-2xl font-black text-white font-display leading-tight">Soporte 24/7</div>
                <div className="text-[11.5px] text-gray-200 font-normal">Siempre contigo</div>
              </div>
            </div>

          </div>

          {/* RIGHT ACTION BUTTON: 2-line Intense Red Pill Button with Rocket + White Circle Arrow */}
          <div className="w-full sm:w-auto flex justify-center lg:justify-end">
            <Link
              href="/registro"
              className="inline-flex items-center justify-between gap-4 px-6 py-3 rounded-full bg-gradient-to-b from-[#FF2E36] via-[#F10F1A] to-[#A5040C] hover:brightness-110 text-white shadow-[0_0_35px_rgba(241,15,26,0.75)] border border-red-300/45 hover:scale-[1.02] transition-all duration-200 group"
            >
              <span className="text-3xl leading-none drop-shadow-md">🚀</span>
              <span className="text-xs sm:text-[14px] font-extrabold leading-tight text-left drop-shadow">
                ¡Empieza hoy y lleva tu <br />
                restaurante al futuro!
              </span>
              <span className="w-8 h-8 rounded-full bg-white text-gray-950 flex items-center justify-center shrink-0 shadow-md group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
