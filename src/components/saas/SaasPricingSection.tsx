'use client';

import React from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';

export function SaasPricingSection() {
  const whatsappSalesUrl =
    'https://wa.me/573215894178?text=' +
    encodeURIComponent(
      'Hola GastroNegocios, deseo información comercial del Plan Enterprise para mi cadena de restaurantes.'
    );

  return (
    <section id="planes" className="relative py-10 sm:py-14 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* LEFT COLUMN: Header + Curved Golden Arrow */}
        <div className="lg:col-span-3 text-left relative">
          <div className="inline-flex items-center px-4 py-1 rounded-full bg-gradient-to-b from-[#FF2A32] via-[#E90712] to-[#9E050C] text-white text-xs font-extrabold shadow-[0_4px_20px_rgba(241,15,26,0.65)] border border-red-400/40 mb-3">
            <span>Planes Flexibles</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-black text-white tracking-tight leading-[1.08] font-display drop-shadow-[0_4px_14px_rgba(0,0,0,0.85)]">
            Elige el plan ideal para tu negocio
          </h2>

          <p className="text-sm sm:text-[15px] text-gray-200 font-normal mt-3 leading-relaxed">
            Desde emprendedores hasta cadenas de restaurantes.
          </p>

          {/* Curved golden arrow pointing right/up toward cards */}
          <div className="hidden lg:block mt-1 ml-28 pointer-events-none">
            <svg width="105" height="52" viewBox="0 0 110 55" fill="none" className="drop-shadow-[0_0_10px_rgba(250,155,35,0.6)]">
              <path
                d="M 6,38 Q 55,54 98,14"
                stroke="#FA9B23"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 83,12 L 99,13 L 95,28"
                stroke="#FA9B23"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
        </div>

        {/* RIGHT COLUMN: 3 PRICING CARDS */}
        <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-5 items-end pt-4">
          
          {/* CARD 1: BÁSICO */}
          <div className="rounded-[26px] bg-gradient-to-b from-[#F8FAFF] via-[#EFF2FC] to-[#E6E9F5] text-gray-950 p-6 border-2 border-white shadow-[0_22px_50px_rgba(0,0,0,0.8)] flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1">
            <div>
              {/* Centered Title & Subtitle */}
              <div className="text-center mb-3.5">
                <div className="inline-flex items-center justify-center gap-1.5">
                  <span className="text-xl drop-shadow-sm">🚀</span>
                  <h3 className="text-xl sm:text-[22px] font-black text-gray-950 font-display">Básico</h3>
                </div>
                <p className="text-xs text-gray-600 font-medium mt-0.5">Perfecto para empezar</p>
              </div>

              {/* Centered Price */}
              <div className="text-center pb-4 mb-4 border-b border-gray-300/90">
                <span className="text-4xl sm:text-[40px] font-black text-gray-950 tracking-tight font-display">
                  $29.990
                </span>
                <span className="text-xs font-extrabold text-gray-700">/mes</span>
              </div>

              {/* Features */}
              <ul className="space-y-2.5 mb-6 px-2">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#E08A1E] stroke-[3.2] shrink-0" />
                  <span className="text-xs sm:text-[13.5px] font-semibold text-gray-800">1 restaurante</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#E08A1E] stroke-[3.2] shrink-0" />
                  <span className="text-xs sm:text-[13.5px] font-semibold text-gray-800">Menú QR y POS</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#E08A1E] stroke-[3.2] shrink-0" />
                  <span className="text-xs sm:text-[13.5px] font-semibold text-gray-800">Reportes básicos</span>
                </li>
              </ul>
            </div>

            <Link
              href="/registro?plan=basico"
              className="w-full text-center py-2.5 px-5 rounded-full border-[1.8px] border-gray-800 bg-white hover:bg-gray-950 text-gray-950 hover:text-white font-extrabold text-xs sm:text-[13.5px] shadow-sm transition-all"
            >
              Comenzar Ahora
            </Link>
          </div>

          {/* CARD 2: INTERMEDIO (MÁS POPULAR 🔥) */}
          <div className="relative rounded-[28px] bg-gradient-to-b from-[#FFFDF9] via-[#FDEEE1] to-[#FBDDC4] text-gray-950 p-6 sm:p-7 border-2 border-[#FBB024] shadow-[0_0_50px_rgba(250,155,35,0.45)] flex flex-col justify-between md:-translate-y-2.5 transition-transform duration-300 hover:-translate-y-3.5">
            {/* Top Golden Pill Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-b from-[#FFE27A] via-[#FBB024] to-[#E0870B] text-gray-950 text-xs font-black shadow-[0_4px_15px_rgba(250,155,35,0.65)] flex items-center gap-1 whitespace-nowrap border border-amber-100">
              <span>Más Popular</span>
              <span>🔥</span>
            </div>

            <div>
              {/* Centered Title & Subtitle */}
              <div className="text-center mb-3.5 mt-1">
                <div className="inline-flex items-center justify-center gap-1.5">
                  <span className="text-xl drop-shadow-sm">👑</span>
                  <h3 className="text-2xl sm:text-[25px] font-black text-gray-950 font-display">Intermedio</h3>
                </div>
                <p className="text-xs text-gray-700 font-medium mt-0.5">Crece sin límites</p>
              </div>

              {/* Centered Price */}
              <div className="text-center pb-4 mb-4 border-b border-amber-300/80">
                <span className="text-4xl sm:text-[44px] font-black text-gray-950 tracking-tight font-display">
                  $49.990
                </span>
                <span className="text-xs font-extrabold text-gray-800">/mes</span>
              </div>

              {/* Features */}
              <ul className="space-y-2.5 mb-7 px-2">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#D97706] stroke-[3.5] shrink-0" />
                  <span className="text-xs sm:text-[13.5px] font-bold text-gray-900">Hasta 3 restaurantes</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#D97706] stroke-[3.5] shrink-0" />
                  <span className="text-xs sm:text-[13.5px] font-bold text-gray-900">Inventario y recetas</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#D97706] stroke-[3.5] shrink-0" />
                  <span className="text-xs sm:text-[13.5px] font-bold text-gray-900">Reportes avanzados</span>
                </li>
              </ul>
            </div>

            <Link
              href="/registro?plan=intermedio"
              className="w-full text-center py-3 px-6 rounded-full bg-gradient-to-b from-[#FF2A32] via-[#F10F1A] to-[#B5050D] hover:brightness-110 text-white font-extrabold text-xs sm:text-[14px] shadow-[0_8px_24px_rgba(241,15,26,0.65)] border border-red-400/40 transition-all"
            >
              Comenzar Ahora
            </Link>
          </div>

          {/* CARD 3: ENTERPRISE */}
          <div className="rounded-[26px] bg-gradient-to-b from-[#F8FAFF] via-[#EFF2FC] to-[#E6E9F5] text-gray-950 p-6 border-2 border-white shadow-[0_22px_50px_rgba(0,0,0,0.8)] flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1">
            <div>
              {/* Centered Title & Subtitle */}
              <div className="text-center mb-3.5">
                <div className="inline-flex items-center justify-center gap-1.5">
                  <span className="text-xl drop-shadow-sm">💎</span>
                  <h3 className="text-xl sm:text-[22px] font-black text-gray-950 font-display">Enterprise</h3>
                </div>
                <p className="text-xs text-gray-600 font-medium mt-0.5">Para grandes negocios</p>
              </div>

              {/* Centered Price */}
              <div className="text-center pb-4 mb-4 border-b border-gray-300/90">
                <span className="text-4xl sm:text-[40px] font-black text-gray-950 tracking-tight font-display">
                  $89.990
                </span>
                <span className="text-xs font-extrabold text-gray-700">/mes</span>
              </div>

              {/* Features */}
              <ul className="space-y-2.5 mb-6 px-2">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#E08A1E] stroke-[3.2] shrink-0" />
                  <span className="text-xs sm:text-[13.5px] font-semibold text-gray-800">Restaurantes ilimitados</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#E08A1E] stroke-[3.2] shrink-0" />
                  <span className="text-xs sm:text-[13.5px] font-semibold text-gray-800">Soporte prioritario</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#E08A1E] stroke-[3.2] shrink-0" />
                  <span className="text-xs sm:text-[13.5px] font-semibold text-gray-800">Todas las funciones</span>
                </li>
              </ul>
            </div>

            <a
              href={whatsappSalesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center py-2.5 px-5 rounded-full border-[1.8px] border-gray-800 bg-white hover:bg-gray-950 text-gray-950 hover:text-white font-extrabold text-xs sm:text-[13.5px] shadow-sm transition-all"
            >
              Contactar Ventas
            </a>
          </div>

        </div>

      </div>
    </section>
  );
}
