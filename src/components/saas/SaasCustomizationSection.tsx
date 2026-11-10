'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Palette,
  Layout,
  Layers,
  Smartphone,
  Eye,
  Check
} from 'lucide-react';

interface ColorTheme {
  id: string;
  name: string;
  primary: string;
  accent: string;
  gradient: string;
  badgeBg: string;
}

const COLOR_THEMES: ColorTheme[] = [
  { id: 'red', name: 'Rojo Carmesí', primary: '#EF4444', accent: '#DC2626', gradient: 'from-red-500 to-rose-600', badgeBg: 'bg-red-500' },
  { id: 'orange', name: 'Naranja Fuego', primary: '#F97316', accent: '#EA580C', gradient: 'from-orange-500 to-amber-600', badgeBg: 'bg-orange-500' },
  { id: 'green', name: 'Verde Esmeralda', primary: '#10B981', accent: '#059669', gradient: 'from-emerald-500 to-teal-600', badgeBg: 'bg-emerald-500' },
  { id: 'blue', name: 'Azul Eléctrico', primary: '#3B82F6', accent: '#2563EB', gradient: 'from-blue-500 to-indigo-600', badgeBg: 'bg-blue-500' },
  { id: 'purple', name: 'Violeta Neón', primary: '#8B5CF6', accent: '#7C3AED', gradient: 'from-purple-500 to-violet-600', badgeBg: 'bg-purple-500' },
];

const TEMPLATES = [
  {
    id: 'gourmet',
    name: 'Dark Gourmet',
    subtitle: 'Steakhouse & Grill',
    tag: 'Recomendado',
    bg: 'bg-gradient-to-br from-[#1A120B] to-[#0A0704]',
    border: 'border-amber-600/40',
    accentText: 'text-amber-400',
    badge: 'bg-amber-500/20 text-amber-300',
    previewImg: '/images/assets/burger-hero-transparent.png',
  },
  {
    id: 'fastfood',
    name: 'Red Fast Food',
    subtitle: 'Burgers & Salchipapas',
    tag: 'Alta Conversión',
    bg: 'bg-gradient-to-br from-[#2D0A0A] to-[#120505]',
    border: 'border-red-600/40',
    accentText: 'text-red-400',
    badge: 'bg-red-500/20 text-red-300',
    previewImg: '/images/assets/salchipapa-3d.png',
  },
  {
    id: 'parrilla',
    name: 'Smoke BBQ',
    subtitle: 'Cortes & Ahumados',
    tag: 'Elegante',
    bg: 'bg-gradient-to-br from-[#1F140E] to-[#0C0805]',
    border: 'border-orange-600/40',
    accentText: 'text-orange-400',
    badge: 'bg-orange-500/20 text-orange-300',
    previewImg: '/images/assets/parrilla-3d.png',
  },
  {
    id: 'modern',
    name: 'Light Modern',
    subtitle: 'Café & Brunch',
    tag: 'Minimalista',
    bg: 'bg-gradient-to-br from-[#F5F5F7] to-[#E5E5EA]',
    border: 'border-gray-300',
    accentText: 'text-gray-900',
    badge: 'bg-blue-500/10 text-blue-700',
    previewImg: '/images/assets/drinks-3d.png',
  },
];

export function SaasCustomizationSection() {
  const [activeTheme, setActiveTheme] = useState<ColorTheme>(COLOR_THEMES[0]);
  const [activeTemplate, setActiveTemplate] = useState<string>('gourmet');

  return (
    <section id="personalizacion" className="relative py-24 bg-[#0A0C14] text-white overflow-hidden border-t border-white/5">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-orange-600/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT COLUMN: Floating Card + Laptop Mockup */}
          <div className="lg:col-span-7 relative">
            
            {/* FLOATING CARD: "Personaliza tu marca" (Matching reference image) */}
            <div className="absolute -top-10 -left-4 sm:-top-8 sm:-left-6 z-30 bg-white text-gray-900 rounded-2xl p-4 sm:p-5 shadow-2xl border border-gray-100 max-w-[240px] sm:max-w-[270px] backdrop-blur-md transform -rotate-2 hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center gap-2 mb-3">
                <Palette className="w-4 h-4 text-red-500" />
                <h4 className="text-sm font-extrabold text-gray-900">Personaliza tu marca</h4>
              </div>

              {/* Color dots picker */}
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                {COLOR_THEMES.map((theme) => {
                  const isSelected = activeTheme.id === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => setActiveTheme(theme)}
                      className={`w-6 h-6 rounded-full transition-transform duration-200 flex items-center justify-center relative ${
                        isSelected ? 'scale-125 ring-2 ring-offset-2 ring-gray-900 shadow-md' : 'hover:scale-110 opacity-90'
                      }`}
                      style={{ backgroundColor: theme.primary }}
                      title={theme.name}
                      type="button"
                    >
                      {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                    </button>
                  );
                })}
              </div>

              {/* 3 bullet checks with red circular check icons */}
              <ul className="space-y-2 text-xs font-semibold text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-red-600 stroke-[3]" />
                  </div>
                  <span>Plantillas profesionales</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-red-600 stroke-[3]" />
                  </div>
                  <span>Colores a tu medida</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-red-600 stroke-[3]" />
                  </div>
                  <span>Tu propio estilo</span>
                </li>
              </ul>
            </div>

            {/* LAPTOP MOCKUP CONTAINER */}
            <div className="relative pt-12 pl-4 sm:pl-8">
              
              {/* Laptop Outer Bezel */}
              <div className="relative mx-auto rounded-t-2xl bg-[#1E222D] border-4 sm:border-[6px] border-[#2E3445] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden">
                
                {/* Laptop Camera notch / dot */}
                <div className="h-4 bg-[#161822] flex items-center justify-center border-b border-black/40">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                </div>

                {/* Laptop Screen Content: Live GastroNegocios Dashboard UI */}
                <div className="bg-[#0C0F1A] text-white p-3 sm:p-5 select-none font-sans min-h-[320px] sm:min-h-[380px]">
                  
                  {/* Top Bar inside Dashboard */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-bold tracking-wider text-[11px] text-gray-300">GASTRONEGOCIOS OS</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/5">
                        Punto G - Sede Principal
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                      <span className="hidden sm:inline">Hoy, 9:42 PM</span>
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-black"
                        style={{ backgroundColor: activeTheme.primary }}
                      >
                        A
                      </div>
                    </div>
                  </div>

                  {/* Dashboard Layout: Mini Sidebar + Main Content */}
                  <div className="grid grid-cols-12 gap-3">
                    
                    {/* Mini Sidebar */}
                    <div className="hidden sm:block col-span-3 space-y-1 text-[11px] text-gray-400 border-r border-white/5 pr-2">
                      <div
                        className="px-2 py-1.5 rounded-lg text-white font-bold flex items-center gap-1.5"
                        style={{ backgroundColor: `${activeTheme.primary}25`, color: activeTheme.primary }}
                      >
                        <Layout className="w-3 h-3" />
                        <span>Dashboard</span>
                      </div>
                      <div className="px-2 py-1.5 rounded-lg hover:text-white flex items-center gap-1.5">
                        <ShoppingBag className="w-3 h-3" />
                        <span>Comandas KDS</span>
                      </div>
                      <div className="px-2 py-1.5 rounded-lg hover:text-white flex items-center gap-1.5">
                        <Layers className="w-3 h-3" />
                        <span>Carta & Menú</span>
                      </div>
                      <div className="px-2 py-1.5 rounded-lg hover:text-white flex items-center gap-1.5">
                        <DollarSign className="w-3 h-3" />
                        <span>Caja & Ventas</span>
                      </div>
                      <div className="px-2 py-1.5 rounded-lg hover:text-white flex items-center gap-1.5">
                        <Smartphone className="w-3 h-3" />
                        <span>Meseros Móvil</span>
                      </div>
                    </div>

                    {/* Main Area */}
                    <div className="col-span-12 sm:col-span-9 space-y-3">
                      
                      {/* 3 Metric Cards (Matching reference layout) */}
                      <div className="grid grid-cols-3 gap-2">
                        {/* Card 1 */}
                        <div className="p-2 sm:p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                          <div className="text-[9px] text-gray-400 uppercase font-semibold">Ventas Hoy</div>
                          <div className="text-xs sm:text-sm font-black text-white mt-0.5">$12.580.000</div>
                          <div className="text-[8px] sm:text-[9px] text-emerald-400 font-bold flex items-center gap-0.5 mt-0.5">
                            <TrendingUp className="w-2.5 h-2.5" /> +14.2%
                          </div>
                        </div>

                        {/* Card 2 */}
                        <div className="p-2 sm:p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                          <div className="text-[9px] text-gray-400 uppercase font-semibold">Órdenes</div>
                          <div className="text-xs sm:text-sm font-black text-white mt-0.5">548</div>
                          <div className="text-[8px] sm:text-[9px] text-emerald-400 font-bold flex items-center gap-0.5 mt-0.5">
                            <TrendingUp className="w-2.5 h-2.5" /> +8.5%
                          </div>
                        </div>

                        {/* Card 3 */}
                        <div className="p-2 sm:p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                          <div className="text-[9px] text-gray-400 uppercase font-semibold">Promedio</div>
                          <div className="text-xs sm:text-sm font-black text-white mt-0.5">$22.950</div>
                          <div className="text-[8px] sm:text-[9px] text-emerald-400 font-bold flex items-center gap-0.5 mt-0.5">
                            <TrendingUp className="w-2.5 h-2.5" /> +3.1%
                          </div>
                        </div>
                      </div>

                      {/* Area Chart Simulation (Wave shape matching reference image) */}
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-gray-300">Ventas en Tiempo Real (Semana)</span>
                          <span className="text-[9px] font-bold" style={{ color: activeTheme.primary }}>+24% vs mes ant.</span>
                        </div>

                        {/* SVG Area Chart with Dynamic Gradient */}
                        <div className="h-24 sm:h-32 w-full relative">
                          <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id={`chart-grad-${activeTheme.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor={activeTheme.primary} stopOpacity="0.45" />
                                <stop offset="100%" stopColor={activeTheme.primary} stopOpacity="0.0" />
                              </linearGradient>
                            </defs>
                            {/* Grid lines */}
                            <line x1="0" y1="25" x2="300" y2="25" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                            <line x1="0" y1="50" x2="300" y2="50" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                            <line x1="0" y1="75" x2="300" y2="75" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />

                            {/* Area fill */}
                            <path
                              d="M 0,85 Q 35,40 70,60 T 140,30 T 210,55 T 260,20 T 300,10 L 300,100 L 0,100 Z"
                              fill={`url(#chart-grad-${activeTheme.id})`}
                            />
                            {/* Stroke line */}
                            <path
                              d="M 0,85 Q 35,40 70,60 T 140,30 T 210,55 T 260,20 T 300,10"
                              fill="none"
                              stroke={activeTheme.primary}
                              strokeWidth="2.5"
                              strokeLinecap="round"
                            />

                            {/* Active pulse point */}
                            <circle cx="300" cy="10" r="4" fill={activeTheme.primary} />
                            <circle cx="300" cy="10" r="8" fill={activeTheme.primary} opacity="0.3" className="animate-ping" />
                          </svg>
                        </div>

                        {/* Chart Day Labels */}
                        <div className="flex justify-between text-[8px] text-gray-500 pt-1 border-t border-white/5">
                          <span>Lun</span>
                          <span>Mar</span>
                          <span>Mié</span>
                          <span>Jue</span>
                          <span>Vie</span>
                          <span>Sáb</span>
                          <span className="font-bold text-gray-300">Dom</span>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              </div>

              {/* Laptop Bottom Base / Keyboard Lip */}
              <div className="relative mx-auto h-3.5 sm:h-4 bg-[#232736] rounded-b-xl border-t border-black/30 shadow-lg flex items-center justify-center">
                <div className="w-16 h-1 bg-[#151722] rounded-full" />
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Copy + Bullet points + Action Button + Template previews */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Pill Badge (Red capsule matching reference) */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E53E3E] text-white text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(229,62,62,0.5)]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalización Total</span>
            </div>

            {/* Title */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] font-display">
              Adapta la plataforma <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-300">
                a tu estilo
              </span>
            </h2>

            {/* Description */}
            <p className="text-base text-gray-300 leading-relaxed font-normal">
              Elige entre múltiples plantillas, personaliza colores, textos y secciones sin conocimientos de programación.
            </p>

            {/* 3 check items with red circular icons (Exact match) */}
            <ul className="space-y-3.5 pt-2">
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#E53E3E] flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(229,62,62,0.6)]">
                  <Check className="w-3 h-3 text-white stroke-[3]" />
                </div>
                <span className="text-sm font-semibold text-white">3+ plantillas profesionales</span>
              </li>

              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#E53E3E] flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(229,62,62,0.6)]">
                  <Check className="w-3 h-3 text-white stroke-[3]" />
                </div>
                <span className="text-sm font-semibold text-white">Tu logo y colores</span>
              </li>

              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#E53E3E] flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(229,62,62,0.6)]">
                  <Check className="w-3 h-3 text-white stroke-[3]" />
                </div>
                <span className="text-sm font-semibold text-white">Diseño 100% responsivo</span>
              </li>
            </ul>

            {/* Button: Probar Personalizador → */}
            <div className="pt-2">
              <Link
                href="/registro"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#151926] hover:bg-[#1E2336] text-white font-bold text-sm border border-white/10 hover:border-white/20 transition-all duration-200 shadow-lg group"
              >
                <span>Probar Personalizador</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Vertical Stack of 4 Template Cards (Matching right column in reference) */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {TEMPLATES.map((tmpl) => {
                const isSelected = activeTemplate === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => setActiveTemplate(tmpl.id)}
                    type="button"
                    className={`p-2.5 rounded-xl text-left transition-all duration-200 border ${
                      isSelected
                        ? 'border-red-500 bg-white/10 shadow-lg scale-105'
                        : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="h-10 rounded-lg bg-black/40 relative overflow-hidden flex items-center justify-center mb-2 border border-white/5">
                      <Image
                        src={tmpl.previewImg}
                        alt={tmpl.name}
                        width={40}
                        height={40}
                        className="object-contain"
                      />
                    </div>
                    <div className="text-[10px] font-black text-white truncate">{tmpl.name}</div>
                    <div className="text-[9px] text-gray-400 truncate">{tmpl.subtitle}</div>
                  </button>
                );
              })}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
