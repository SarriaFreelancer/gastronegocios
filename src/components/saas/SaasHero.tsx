'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Rocket,
  MessageCircle,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  Star,
  Clock,
  Flame,
  ArrowRight
} from 'lucide-react';

export function SaasHero() {
  const whatsappUrl = `https://wa.me/573229088736?text=${encodeURIComponent(
    '¡Hola! Me interesa conocer más sobre la plataforma GastroNegocios para mi restaurante.'
  )}`;

  return (
    <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 px-4 sm:px-6 overflow-hidden bg-[#090B14]">
      {/* BACKGROUND ATMOSPHERE LIGHTING (Kitchen warm bokeh & ambient dark blues) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Warm golden light on top right behind burger */}
        <div className="absolute top-10 right-0 w-[600px] h-[600px] bg-gradient-to-br from-amber-500/20 via-orange-600/10 to-transparent rounded-full blur-[120px] -mr-40" />
        {/* Subtle violet/magenta aura on the left */}
        <div className="absolute top-40 left-0 w-[450px] h-[450px] bg-gradient-to-tr from-purple-700/15 via-indigo-600/10 to-transparent rounded-full blur-[100px] -ml-20" />
        {/* Subtle radial floor spotlight */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-radial from-amber-900/10 to-transparent blur-3xl opacity-60" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* LEFT COLUMN: HEADLINE & ACTIONS */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">
          {/* TOP PILL BADGE */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#181C2E] via-[#201525] to-[#181C2E] border border-white/10 shadow-[0_0_20px_rgba(229,62,62,0.25)]">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-[11px] sm:text-xs font-bold text-white tracking-wide">
              Sistema Gastronómico Multi-Restaurante • <strong className="text-amber-400">0% Comisiones</strong>
            </span>
          </div>

          {/* MAIN H1 TITLE */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white font-display tracking-tight leading-[1.08]">
            Tu negocio gastronómico, <br />
            <span className="text-[#FFC928] drop-shadow-[0_4px_25px_rgba(255,201,40,0.35)]">
              bajo control.
            </span>
          </h1>

          {/* DESCRIPTION */}
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-xl font-normal">
            Gestiona tu restaurante, acepta pedidos, controla inventario y haz crecer tu negocio con la mejor plataforma SaaS todo-en-uno.
          </p>

          {/* BULLET CHECKPOINTS */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-200 font-semibold">
              <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40">
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Menú QR y comandas KDS en tiempo real</span>
            </div>

            <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-200 font-semibold">
              <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40">
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Inventario inteligente y costeo de recetas</span>
            </div>

            <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-200 font-semibold">
              <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40">
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Reportes en tiempo real y facturación POS</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="pt-2 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <Link
                href="/registro"
                className="py-4 px-7 rounded-full bg-gradient-to-r from-[#E53E3E] via-[#FF4D4D] to-[#E53E3E] hover:brightness-110 text-white font-black text-sm uppercase tracking-wider shadow-[0_10px_35px_rgba(229,62,62,0.45)] flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-95 group"
              >
                <Rocket className="w-4 h-4 fill-white group-hover:rotate-12 transition-transform" />
                <span>Crear Mi Restaurante Gratis</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </Link>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-4 px-6 rounded-full bg-[#121626] hover:bg-[#181E35] border border-white/15 text-white font-bold text-sm flex items-center justify-center gap-2.5 transition hover:scale-[1.02] active:scale-95 shadow-md"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Hablar con un Asesor</span>
              </a>
            </div>

            <p className="text-[11px] text-gray-400 font-medium pl-1">
              ✓ 14 días gratis sin ingresar tarjeta de crédito
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: GOURMET BURGER & FLOATING SMARTPHONE MOCKUP */}
        <div className="lg:col-span-5 relative flex items-center justify-center pt-6 lg:pt-0">
          {/* FLOATING RED BADGE: "0% COMISIONES" */}
          <div className="absolute -top-3 right-4 sm:right-10 z-30 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#C53030] to-[#E53E3E] text-white flex flex-col items-center justify-center shadow-[0_10px_30px_rgba(229,62,62,0.6)] rotate-12 border-2 border-white/30 animate-pulse">
            <span className="text-base sm:text-xl font-black leading-none tracking-tighter">0%</span>
            <span className="text-[8px] sm:text-[9px] uppercase font-black tracking-widest text-white/90">
              Comisiones
            </span>
          </div>

          {/* MAIN VISUAL COMPOSITION */}
          <div className="relative w-full max-w-[520px] aspect-square flex items-center justify-center">
            {/* WARM BACKGROUND GLOW BEHIND BURGER */}
            <div className="absolute inset-0 bg-radial from-amber-500/25 via-orange-600/10 to-transparent blur-2xl rounded-full scale-90" />

            {/* GOURMET BURGER IMAGE */}
            <div className="relative z-10 w-[300px] sm:w-[380px] lg:w-[420px] -translate-x-6 sm:-translate-x-10 filter drop-shadow-[0_25px_40px_rgba(0,0,0,0.9)] hover:scale-105 transition-transform duration-500">
              <Image
                src="/images/assets/burger-hero-transparent.png"
                alt="Hamburguesa Gourmet GastroNegocios"
                width={500}
                height={500}
                priority
                className="w-full h-auto object-contain"
              />
            </div>

            {/* FLOATING SMARTPHONE MOCKUP (Showing Digital Menu QR) */}
            <div className="absolute right-0 sm:right-2 bottom-0 sm:bottom-4 z-20 w-[170px] sm:w-[210px] bg-[#111525] border-2 border-white/20 rounded-[28px] sm:rounded-[36px] p-2.5 sm:p-3 shadow-[0_25px_60px_rgba(0,0,0,0.95)] backdrop-blur-xl rotate-[-3deg] hover:rotate-0 transition-transform duration-500">
              {/* Speaker notch */}
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-2" />

              {/* Phone screen content */}
              <div className="bg-[#090B14] rounded-[22px] sm:rounded-[26px] p-2.5 sm:p-3 border border-white/10 space-y-2">
                {/* App header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-black text-white font-display">GASTRO<span className="text-amber-400">NEGOCIOS</span></span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>

                {/* Food Card inside phone */}
                <div className="bg-[#171B2C] rounded-2xl p-2 border border-white/10 space-y-2">
                  <div className="w-full h-20 sm:h-24 rounded-xl overflow-hidden relative bg-[#0d101d]">
                    <Image
                      src="/images/assets/burger-hero-transparent.png"
                      alt="Burger preview"
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <div>
                    <h4 className="text-[11px] sm:text-xs font-black text-white leading-tight">
                      Hamburguesa Gourmet
                    </h4>
                    <p className="text-[9px] text-gray-400 leading-tight line-clamp-1">
                      Pan brioche, doble carne, tocineta
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-0.5">
                    <span className="text-xs sm:text-sm font-black text-amber-400 font-mono">
                      $28.000
                    </span>
                    <button className="px-2.5 py-1 rounded-lg bg-[#E53E3E] text-white font-black text-[9px] uppercase tracking-wider shadow-sm">
                      Agregar
                    </button>
                  </div>
                </div>

                {/* Bottom phone nav */}
                <div className="flex items-center justify-around pt-1 text-[8px] text-gray-400 border-t border-white/5">
                  <span className="text-amber-400 font-bold">Carta</span>
                  <span>Buscar</span>
                  <span>Mesa</span>
                  <span>Cuenta</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
