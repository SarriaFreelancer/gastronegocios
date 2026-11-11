'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Check,
  ArrowRight,
  MessageCircle
} from 'lucide-react';

export function SaasHero() {
  const whatsappUrl = `https://wa.me/573229088736?text=${encodeURIComponent(
    '¡Hola! Me interesa conocer más sobre la plataforma GastroNegocios para mi restaurante.'
  )}`;

  return (
    <section className="relative pt-20 sm:pt-24 pb-6 sm:pb-10 px-4 sm:px-6 overflow-hidden">
      {/* Intense warm golden-amber & crimson restaurant bokeh lighting */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-[8%] w-[640px] h-[520px] bg-radial from-[#FF8C00]/30 via-[#D9460F]/15 to-transparent rounded-full blur-[95px]" />
        <div className="absolute top-12 left-[5%] w-[420px] h-[340px] bg-radial from-[#E11D48]/15 via-[#7F1D1D]/10 to-transparent rounded-full blur-[110px]" />
        {/* Warm polished wooden bar counter reflection glow across bottom of hero */}
        <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#3B1906]/55 via-[#6B2D0B]/25 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-2 items-center">
        {/* LEFT COLUMN: HEADLINE & ACTIONS */}
        <div className="lg:col-span-6 space-y-4 sm:space-y-5 text-left relative z-20 pt-2">
          {/* TOP GLOSSY CRIMSON PILL BADGE */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#880B10] via-[#C81018] to-[#7A090E] border border-[#FF5A5F]/55 shadow-[0_0_25px_rgba(241,15,26,0.55)]">
            <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-b from-[#8BF19B] via-[#22C55E] to-[#15803D] shadow-[0_0_12px_#4ADE80] shrink-0" />
            <span className="text-xs sm:text-[13.5px] font-bold text-white tracking-wide drop-shadow">
              Sistema Gastronómico Multi-Restaurante • <strong className="font-black text-white">0% Comisiones</strong>
            </span>
          </div>

          {/* MAIN H1 TITLE (Intense white + vibrant golden-amber 'bajo control.') */}
          <h1 className="font-display tracking-tight">
            <span className="block text-3xl sm:text-5xl lg:text-[46px] font-extrabold text-white leading-[1.08] drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
              Tu negocio gastronómico,
            </span>
            <span
              className="block text-5xl sm:text-6xl lg:text-[74px] font-black leading-[1.0] mt-1 bg-gradient-to-b from-[#FFD859] via-[#FBB024] to-[#E8880B] bg-clip-text text-transparent"
              style={{
                filter: 'drop-shadow(0 6px 22px rgba(250, 155, 35, 0.42)) drop-shadow(0 3px 2px rgba(0, 0, 0, 0.9))',
              }}
            >
              bajo control.
            </span>
          </h1>

          {/* DESCRIPTION */}
          <p className="text-sm sm:text-[16px] text-gray-100 leading-relaxed max-w-xl font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            Gestiona tu restaurante, acepta pedidos, controla inventario y haz crecer tu negocio con la mejor plataforma SaaS.
          </p>

          {/* 3 BULLET CHECKPOINTS (Bright golden circles with dark check) */}
          <div className="space-y-2.5 pt-0.5">
            <div className="flex items-center gap-3 text-sm sm:text-[15.5px] text-white font-semibold drop-shadow">
              <div className="w-5 h-5 rounded-full bg-gradient-to-b from-[#FFD65A] to-[#F09819] text-[#1C0F02] flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(250,155,35,0.65)]">
                <Check className="w-3.5 h-3.5 stroke-[3.5]" />
              </div>
              <span>Menú QR y comandas KDS</span>
            </div>

            <div className="flex items-center gap-3 text-sm sm:text-[15.5px] text-white font-semibold drop-shadow">
              <div className="w-5 h-5 rounded-full bg-gradient-to-b from-[#FFD65A] to-[#F09819] text-[#1C0F02] flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(250,155,35,0.65)]">
                <Check className="w-3.5 h-3.5 stroke-[3.5]" />
              </div>
              <span>Inventario inteligente</span>
            </div>

            <div className="flex items-center gap-3 text-sm sm:text-[15.5px] text-white font-semibold drop-shadow">
              <div className="w-5 h-5 rounded-full bg-gradient-to-b from-[#FFD65A] to-[#F09819] text-[#1C0F02] flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(250,155,35,0.65)]">
                <Check className="w-3.5 h-3.5 stroke-[3.5]" />
              </div>
              <span>Reportes en tiempo real</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="pt-2">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3.5">
              {/* Primary Intense Red Pill + Subtitle centered underneath */}
              <div className="flex flex-col items-center">
                <Link
                  href="/registro"
                  className="w-full sm:w-auto py-3.5 px-7 rounded-full bg-gradient-to-b from-[#FF2E36] via-[#F10F1A] to-[#B5050D] hover:brightness-110 text-white font-extrabold text-sm sm:text-[15px] shadow-[0_8px_32px_rgba(241,15,26,0.75)] border border-red-300/45 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.03]"
                >
                  <span className="text-lg leading-none drop-shadow">🚀</span>
                  <span>Crear Mi Restaurante Gratis</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.8]" />
                </Link>
                <span className="text-[11.5px] text-gray-200 font-medium mt-1.5 drop-shadow">
                  14 días sin tarjeta de crédito
                </span>
              </div>

              {/* Secondary Dark Glossy Pill with Neon WhatsApp Icon */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3.5 px-6 rounded-full bg-black/70 hover:bg-white/10 border border-white/45 text-white font-bold text-sm sm:text-[15px] flex items-center justify-center gap-2.5 transition hover:scale-[1.02] backdrop-blur-md shadow-[0_8px_25px_rgba(0,0,0,0.8)]"
              >
                <span className="w-5 h-5 rounded-full bg-[#22C55E]/25 border border-[#4ADE80] flex items-center justify-center text-[#4ADE80] shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                </span>
                <span>Hablar con un Asesor</span>
              </a>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: GOURMET TRIPLE BURGER + FRIES ON WOODEN TABLE + 3D IPHONE MOCKUP + "0% COMISIONES" SEAL */}
        <div className="lg:col-span-6 relative flex items-center justify-center lg:-ml-8 z-10">
          <Link
            href="/r/punto-g"
            className="relative w-full max-w-[660px] group block select-none"
            title="Explorar Demo Interactivo"
          >
            {/* Warm golden-orange aura behind the burger and phone */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[360px] bg-radial from-[#FA9B23]/35 via-[#E90712]/15 to-transparent blur-2xl rounded-full pointer-events-none" />

            <Image
              src="/images/saas/hero-right-scene.png"
              alt="Hamburguesa Gourmet y App Móvil GastroNegocios 0% Comisiones"
              width={774}
              height={576}
              priority
              unoptimized
              className="w-full h-auto object-contain drop-shadow-[0_20px_45px_rgba(0,0,0,0.95)] group-hover:scale-[1.015] transition-transform duration-500"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
