'use client';

import React from 'react';
import Link from 'next/link';
import {
  Check,
  ArrowRight,
  MessageCircle,
  Rocket,
  Home,
  UtensilsCrossed,
  ShoppingCart,
  ClipboardList,
  User,
} from 'lucide-react';

export const SaasHero: React.FC = () => {
  return (
    <section className="relative pt-24 pb-8 sm:pt-28 sm:pb-12 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center">
          {/* LEFT COLUMN: Copy, Gold Gradient Headline, Checklist, CTAs */}
          <div className="lg:col-span-6 space-y-5 text-left z-20">
            {/* Red Pill Badge with Glowing Green Dot */}
            <div
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full shadow-lg"
              style={{
                background: 'linear-gradient(90deg, rgba(220,16,24,0.92) 0%, rgba(165,12,20,0.85) 100%)',
                border: '1px solid rgba(255,120,90,0.45)',
                boxShadow: '0 4px 20px rgba(229,9,20,0.4)',
              }}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] shadow-[0_0_10px_#22C55E]" />
              <span className="text-xs sm:text-[13px] font-bold text-white tracking-wide">
                GastroNegocios • Software Integral para Restaurantes • 0% Comisiones
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-1">
              <h1 className="text-[32px] sm:text-[44px] lg:text-[48px] font-extrabold tracking-tight leading-[1.08] text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.9)]">
                Digitaliza y escala tu restaurante,
              </h1>
              <div
                className="text-[42px] sm:text-[56px] lg:text-[62px] font-black tracking-tight leading-[1.02] text-transparent bg-clip-text drop-shadow-[0_6px_24px_rgba(250,155,35,0.32)]"
                style={{
                  backgroundImage: 'linear-gradient(180deg, #FFE169 0%, #FA9B23 55%, #E87A00 100%)',
                }}
              >
                todo en un solo lugar.
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-stone-200 text-sm sm:text-[15.5px] leading-relaxed max-w-xl font-medium">
              Con <strong className="text-[#FFE169]">GastroNegocios</strong> creas tu carta digital QR, recibes pedidos directos por WhatsApp, gestionas comandas en cocina (KDS), meseros y facturación POS multi-sede en minutos.
            </p>

            {/* 3 Gold Checkmarks */}
            <ul className="space-y-2.5 pt-1">
              {[
                'Menú QR y comandas KDS',
                'Inventario inteligente',
                'Reportes en tiempo real',
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-white font-semibold text-sm sm:text-[15px]">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-black shrink-0 shadow-[0_0_12px_rgba(250,155,35,0.6)]"
                    style={{
                      background: 'linear-gradient(180deg, #FFE066 0%, #FA9B23 100%)',
                    }}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <div className="flex flex-col items-center sm:items-start">
                <Link
                  href="/registro"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full text-white font-extrabold text-sm tracking-wide transition-all hover:scale-[1.03] active:scale-95"
                  style={{
                    background: 'linear-gradient(180deg, #FF2A2A 0%, #D80812 100%)',
                    boxShadow: '0 10px 30px rgba(241, 15, 26, 0.6), inset 0 1px 1px rgba(255,255,255,0.4)',
                    border: '1px solid rgba(255,120,120,0.5)',
                  }}
                >
                  <Rocket className="w-4 h-4 text-[#FFE169]" />
                  <span>Crear Mi Restaurante Gratis</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <span className="text-[11px] text-stone-300 mt-1.5 sm:pl-6 font-medium">
                  14 días sin tarjeta de crédito
                </span>
              </div>

              <a
                href="https://wa.me/573229088736?text=Hola,%20quiero%20informaci%C3%B3n%20sobre%20la%20plataforma%20GastroNegocios%20para%20mi%20restaurante"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-[#120A07]/90 hover:bg-[#1E110C] border border-[#D4AF37]/50 text-white font-bold text-sm transition-all self-start shadow-[0_6px_20px_rgba(0,0,0,0.6)]"
              >
                <span className="w-5 h-5 rounded-full bg-[#25D366] flex items-center justify-center text-black shrink-0 shadow-[0_0_10px_rgba(37,211,102,0.5)]">
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                </span>
                <span>Hablar con un Asesor</span>
              </a>
            </div>
          </div>

          {/* RIGHT COLUMN: Newly Generated 3D Burger Scene + Custom 3D iPhone Mockup + 3D Wax Seal */}
          <div className="lg:col-span-6 relative flex items-center justify-center lg:justify-end min-h-[380px] sm:min-h-[460px]">
            {/* Warm Golden & Crimson Ambient Backlight */}
            <div
              className="absolute inset-0 rounded-full blur-3xl opacity-75 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 50% 55%, rgba(250,155,35,0.35) 0%, rgba(229,9,20,0.25) 45%, transparent 75%)',
              }}
            />

            {/* 3D Scalloped Crimson Wax Seal "0% Comisiones" (Built from scratch in SVG) */}
            <div className="absolute -top-3 right-2 sm:right-4 z-40 w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center select-none drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)] animate-pulse">
              <svg viewBox="0 0 120 120" className="w-full h-full">
                <defs>
                  <radialGradient id="sealRedGrad" cx="35%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#FF3B3B" />
                    <stop offset="55%" stopColor="#D90712" />
                    <stop offset="100%" stopColor="#7A0208" />
                  </radialGradient>
                </defs>
                {/* 16-point scalloped rosette */}
                <path
                  d="M60 4 L69 12 L81 8 L86 19 L99 19 L99 32 L111 37 L107 49 L116 58 L108 68 L113 80 L102 86 L102 99 L89 100 L84 112 L72 108 L63 116 L53 108 L41 112 L36 100 L23 99 L23 86 L12 80 L17 68 L9 58 L18 49 L14 37 L26 32 L26 19 L39 19 L44 8 L56 12 Z"
                  fill="url(#sealRedGrad)"
                  stroke="#FF8A8A"
                  strokeWidth="1.5"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="42"
                  fill="none"
                  stroke="rgba(255,225,105,0.45)"
                  strokeWidth="1.2"
                  strokeDasharray="3 2"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-none rotate-3">
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">
                  0%
                </span>
                <span className="text-[10px] sm:text-[11px] font-extrabold text-[#FFE169] tracking-wide mt-0.5">
                  Comisiones
                </span>
              </div>
            </div>

            {/* Seamless High-Res 3D Gourmet Burger + Fries Scene (No square frame or border — blended directly into background) */}
            <div className="relative w-full max-w-[650px] lg:-ml-8 pr-6 sm:pr-20 pointer-events-none select-none">
              <div
                className="relative w-full"
                style={{
                  WebkitMaskImage:
                    'radial-gradient(ellipse 84% 80% at 50% 52%, rgba(0,0,0,1) 50%, rgba(0,0,0,0.88) 65%, rgba(0,0,0,0.38) 82%, rgba(0,0,0,0) 98%)',
                  maskImage:
                    'radial-gradient(ellipse 84% 80% at 50% 52%, rgba(0,0,0,1) 50%, rgba(0,0,0,0.88) 65%, rgba(0,0,0,0.38) 82%, rgba(0,0,0,0) 98%)',
                }}
              >
                <img
                  src="/images/saas/hero-burger-3d.png"
                  alt="Hamburguesa Gourmet 3D con Papas y Escenario"
                  className="w-full h-[350px] sm:h-[440px] object-cover object-center scale-[1.03] drop-shadow-[0_28px_45px_rgba(0,0,0,0.95)]"
                />
              </div>
            </div>

            {/* 3D iPhone 15 Pro Mockup (Built 100% from scratch in Vector/CSS, overlapping right side) */}
            <div className="absolute right-0 sm:right-2 bottom-0 sm:bottom-2 z-30 w-[195px] sm:w-[230px] rounded-[34px] p-[6px] bg-gradient-to-b from-stone-400 via-stone-700 to-stone-900 shadow-[-18px_25px_55px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.22)] -rotate-2 hover:rotate-0 transition-transform duration-300">
              <div className="rounded-[29px] bg-[#0B0504] overflow-hidden border border-black flex flex-col">
                {/* Dynamic Island Notch */}
                <div className="pt-2 pb-1.5 px-3 bg-gradient-to-b from-black to-[#120705] flex flex-col items-center">
                  <div className="w-16 h-3.5 rounded-full bg-black border border-white/10 mb-1.5 flex items-center justify-end pr-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-900/80" />
                  </div>
                  {/* App Header inside Phone */}
                  <div className="flex items-center gap-1.5">
                    <svg viewBox="0 0 32 32" className="w-4 h-4">
                      <path d="M8 26 L24 10 M24 26 L8 10" stroke="#FA9B23" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="16" cy="10" r="5" fill="#FFFFFF" />
                    </svg>
                    <span className="text-[9.5px] font-black tracking-tight text-white uppercase">
                      GASTRO<span className="text-[#FA9B23]">NEGOCIOS</span>
                    </span>
                  </div>
                </div>

                {/* Burger Photo Inside Phone */}
                <div className="relative h-28 sm:h-32 mx-2 rounded-2xl overflow-hidden border border-[#FA9B23]/30 shadow-inner">
                  <img
                    src="/images/saas/hero-burger-3d.png"
                    alt="Hamburguesa Gourmet App"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-black/75 text-[#FFE169] text-[7.5px] font-black border border-[#FA9B23]/40">
                    ★ 4.9
                  </span>
                </div>

                {/* White Product Order Sheet inside Phone */}
                <div className="bg-white text-stone-900 mx-2 mt-2 mb-1.5 p-2.5 rounded-2xl shadow-lg">
                  <div className="text-[11px] sm:text-[12px] font-black text-stone-900 leading-tight">
                    Hamburguesa Gourmet
                  </div>
                  <div className="text-[8px] text-stone-500 font-semibold mt-0.5">
                    Parrilla • Acompañamientos
                  </div>
                  <div className="text-[14px] sm:text-[16px] font-black text-stone-900 mt-1">
                    $28.000
                  </div>
                  <Link
                    href="/r/punto-g/menu"
                    className="mt-1.5 w-full py-1.5 rounded-full text-white font-extrabold text-[9.5px] flex items-center justify-center shadow-md transition hover:brightness-110"
                    style={{
                      background: 'linear-gradient(180deg, #FF2A2A 0%, #D90712 100%)',
                    }}
                  >
                    Agregar al carrito
                  </Link>
                </div>

                {/* Phone Bottom Navigation Bar */}
                <div className="bg-white px-2.5 py-1.5 flex items-center justify-between text-[7px] font-bold text-stone-500 border-t border-stone-200">
                  <div className="flex flex-col items-center text-[#E50914]">
                    <Home className="w-3 h-3" />
                    <span>Inicio</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <UtensilsCrossed className="w-3 h-3" />
                    <span>Menú</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <ShoppingCart className="w-3 h-3" />
                    <span>Carrito</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <ClipboardList className="w-3 h-3" />
                    <span>Pedidos</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <User className="w-3 h-3" />
                    <span>Cuenta</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
