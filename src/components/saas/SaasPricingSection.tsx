'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, Sparkles, Flame, Rocket, Crown, Diamond, ArrowRight, HelpCircle } from 'lucide-react';

export function SaasPricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const whatsappSalesUrl =
    'https://wa.me/573215894178?text=' +
    encodeURIComponent(
      'Hola GastroNegocios, deseo información comercial del Plan Enterprise para mi cadena de restaurantes.'
    );

  return (
    <section id="planes" className="relative py-24 bg-[#0A0C14] text-white overflow-hidden border-t border-white/5">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-red-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header (Matching Reference Layout) */}
        <div className="text-left mb-16 relative">
          
          {/* Pill Badge: Planes Flexibles */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E53E3E] text-white text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(229,62,62,0.5)] mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Planes Flexibles</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] font-display">
            Elige el plan ideal <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-300">
              para tu negocio
            </span>
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-3">
            <p className="text-base text-gray-300 font-normal">
              Desde emprendedores hasta cadenas de restaurantes.
            </p>

            {/* Billing Toggle (Monthly / Annual with 2 months free) */}
            <div className="inline-flex items-center p-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
                  billingPeriod === 'monthly'
                    ? 'bg-[#E53E3E] text-white font-bold shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Facturación Mensual
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`px-4 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1 ${
                  billingPeriod === 'annual'
                    ? 'bg-[#E53E3E] text-white font-bold shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>Anual</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-black text-[10px] font-black">
                  -20% OFF
                </span>
              </button>
            </div>
          </div>

          {/* Curved playful arrow pointing to cards */}
          <div className="hidden md:block absolute left-72 top-24 pointer-events-none">
            <svg width="80" height="40" viewBox="0 0 100 50" fill="none" className="text-amber-400">
              <path
                d="M 10,10 Q 50,45 85,25"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 75,18 L 86,25 L 78,35"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>

        </div>

        {/* 3 PRICING CARDS (EXACT MATCH WITH REFERENCE IMAGE) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-end">
          
          {/* CARD 1: BÁSICO */}
          <div className="rounded-3xl bg-white text-gray-900 p-6 sm:p-8 border border-gray-100 shadow-xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1">
            <div>
              {/* Header */}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🚀</span>
                <h3 className="text-xl font-extrabold text-gray-900 font-display">Básico</h3>
              </div>
              <p className="text-xs text-gray-500 mb-6 font-medium">Perfecto para empezar</p>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight font-display">
                  {billingPeriod === 'monthly' ? '$29.990' : '$23.990'}
                </span>
                <span className="text-sm font-semibold text-gray-500">/mes</span>
              </div>

              {/* Feature list */}
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-amber-600 stroke-[3]" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">1 restaurante</span>
                </li>

                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-amber-600 stroke-[3]" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Menú QR y POS</span>
                </li>

                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-amber-600 stroke-[3]" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Reportes básicos</span>
                </li>
              </ul>
            </div>

            {/* CTA Button */}
            <Link
              href="/registro?plan=basico"
              className="w-full text-center py-3.5 px-6 rounded-full border border-gray-900 text-gray-900 font-bold text-sm hover:bg-gray-900 hover:text-white transition-all duration-200"
            >
              Comenzar Ahora
            </Link>
          </div>

          {/* CARD 2: INTERMEDIO (MÁS POPULAR - HIGHLIGHTED) */}
          <div className="relative rounded-3xl bg-gradient-to-b from-[#FFFDF7] to-[#FFF6E5] text-gray-900 p-6 sm:p-8 border-2 border-amber-300 shadow-2xl flex flex-col justify-between transform md:-translate-y-4 transition-all duration-300 hover:-translate-y-5">
            
            {/* Top Badge: Más Popular 🔥 */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#FFB800] text-gray-950 text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-1.5">
              <span>Más Popular</span>
              <Flame className="w-3.5 h-3.5 fill-current text-red-600" />
            </div>

            <div>
              {/* Header */}
              <div className="flex items-center gap-2 mb-1 mt-1">
                <span className="text-lg">👑</span>
                <h3 className="text-xl font-extrabold text-gray-900 font-display">Intermedio</h3>
              </div>
              <p className="text-xs text-gray-600 mb-6 font-medium">Crece sin límites</p>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight font-display">
                  {billingPeriod === 'monthly' ? '$49.990' : '$39.990'}
                </span>
                <span className="text-sm font-semibold text-gray-600">/mes</span>
              </div>

              {/* Feature list */}
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-amber-800 stroke-[3]" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">Hasta 3 restaurantes</span>
                </li>

                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-amber-800 stroke-[3]" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">Inventario y recetas</span>
                </li>

                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-amber-800 stroke-[3]" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">Reportes avanzados</span>
                </li>
              </ul>
            </div>

            {/* CTA Button: Solid Red Pill (Exact match) */}
            <Link
              href="/registro?plan=intermedio"
              className="w-full text-center py-4 px-6 rounded-full bg-[#E53E3E] hover:bg-[#D42B2B] text-white font-extrabold text-sm tracking-wide shadow-lg shadow-red-500/40 hover:shadow-red-500/60 transition-all duration-200"
            >
              Comenzar Ahora
            </Link>
          </div>

          {/* CARD 3: ENTERPRISE */}
          <div className="rounded-3xl bg-white text-gray-900 p-6 sm:p-8 border border-gray-100 shadow-xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1">
            <div>
              {/* Header */}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">💎</span>
                <h3 className="text-xl font-extrabold text-gray-900 font-display">Enterprise</h3>
              </div>
              <p className="text-xs text-gray-500 mb-6 font-medium">Para grandes negocios</p>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight font-display">
                  {billingPeriod === 'monthly' ? '$89.990' : '$71.990'}
                </span>
                <span className="text-sm font-semibold text-gray-500">/mes</span>
              </div>

              {/* Feature list */}
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-amber-600 stroke-[3]" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Restaurantes ilimitados</span>
                </li>

                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-amber-600 stroke-[3]" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Soporte prioritario</span>
                </li>

                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-amber-600 stroke-[3]" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Todas las funciones</span>
                </li>
              </ul>
            </div>

            {/* CTA Button */}
            <a
              href={whatsappSalesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center py-3.5 px-6 rounded-full border border-gray-900 text-gray-900 font-bold text-sm hover:bg-gray-900 hover:text-white transition-all duration-200"
            >
              Contactar Ventas
            </a>
          </div>

        </div>

      </div>
    </section>
  );
}
