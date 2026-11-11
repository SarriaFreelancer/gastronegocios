'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  ArrowRight,
  BarChart3,
  ShoppingBag,
  UtensilsCrossed,
  Layers,
  Users,
  Settings,
  Flame,
  TrendingUp,
} from 'lucide-react';

const BRAND_COLORS = [
  { hex: '#F10F1A', name: 'Rojo Intenso' },
  { hex: '#F97316', name: 'Naranja Fuego' },
  { hex: '#FA9B23', name: 'Ámbar Dorado' },
  { hex: '#10B981', name: 'Verde Fresco' },
  { hex: '#6366F1', name: 'Índigo Real' },
];

const MINI_TEMPLATES = [
  {
    id: 'oscura-gourmet',
    title: 'Oscura Gourmet',
    tag: 'COMIDA RÁPIDA & GOURMET',
    headline: 'SABOR ARTESANAL AL CARBÓN',
    bg: 'from-[#180A06] via-[#0E0604] to-[#080302]',
    accent: '#FA9B23',
    badgeBg: '#E50914',
    foodImg: '/images/saas/hero-burger-3d.png',
    darkText: false,
  },
  {
    id: 'roja-intensa',
    title: 'Roja Intensa',
    tag: 'PROMOCIÓN ESPECIAL',
    headline: 'COMBOS & HAMBURGUESAS',
    bg: 'from-[#9E0810] via-[#680409] to-[#2B0204]',
    accent: '#FFE169',
    badgeBg: '#FA9B23',
    foodImg: '/images/saas/demo-salchi-3d.png',
    darkText: false,
  },
  {
    id: 'carbon-brasa',
    title: 'Carbón & Brasa',
    tag: 'ASADOS & PARRILLA',
    headline: 'CORTES PREMIUM AL FUEGO',
    bg: 'from-[#141414] via-[#0B0B0B] to-[#050505]',
    accent: '#F97316',
    badgeBg: '#F97316',
    foodImg: '/images/saas/demo-doncarbon-3d.png',
    darkText: false,
  },
  {
    id: 'minimal-clara',
    title: 'Minimalista Clara',
    tag: 'CAFÉ & ARTESANAL',
    headline: 'FRESCO TODOS LOS DÍAS',
    bg: 'from-[#FFFFFF] via-[#F8FAFC] to-[#F1F5F9]',
    accent: '#E50914',
    badgeBg: '#2563EB',
    foodImg: '/images/assets/burger-hero-transparent.png',
    darkText: true,
  },
];

export const SaasCustomizationSection: React.FC = () => {
  const [activeColor, setActiveColor] = useState('#F10F1A');
  const [selectedTpl, setSelectedTpl] = useState('oscura-gourmet');

  return (
    <section id="personalizacion" className="relative py-14 sm:py-20 overflow-hidden">
      {/* Subtle Crimson Wave Ribbon in Background */}
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-[380px] opacity-35 blur-3xl"
        style={{
          background:
            'radial-gradient(ellipse at 25% 50%, rgba(229,9,20,0.35) 0%, rgba(250,155,35,0.15) 45%, transparent 75%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          {/* LEFT: 3D-Styled Laptop Mockup + Floating "Personaliza tu marca" Card (Built 100% from scratch) */}
          <div className="lg:col-span-6 relative pt-6 pb-8 sm:py-6">
            {/* Ambient glow under laptop */}
            <div
              className="absolute inset-x-6 bottom-2 h-24 rounded-full blur-2xl opacity-70 pointer-events-none transition-colors duration-500"
              style={{
                background: `radial-gradient(ellipse at center, ${activeColor}55 0%, rgba(250,155,35,0.25) 50%, transparent 80%)`,
              }}
            />

            {/* Floating "Personaliza tu marca" White Card (Left Overlap, Tilted 3D) */}
            <div
              className="relative sm:absolute sm:-left-3 sm:top-6 z-30 w-full sm:w-[215px] mb-5 sm:mb-0 rounded-2xl bg-gradient-to-b from-white via-[#FFFDF9] to-[#F5EFE6] text-stone-900 p-4 shadow-[0_24px_50px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.9)] sm:-rotate-6 transition-transform hover:rotate-0 duration-300"
            >
              <div className="text-[13px] font-black text-stone-900 tracking-tight mb-2.5">
                Personaliza tu marca
              </div>

              {/* Interactive Color Swatches */}
              <div className="flex items-center gap-2 mb-3.5">
                {BRAND_COLORS.map((c) => {
                  const isSelected = activeColor === c.hex;
                  return (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setActiveColor(c.hex)}
                      title={c.name}
                      className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                        isSelected ? 'scale-125 ring-2 ring-stone-900 ring-offset-2' : 'hover:scale-110'
                      }`}
                      style={{
                        backgroundColor: c.hex,
                        boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.4), 0 3px 6px rgba(0,0,0,0.2)',
                      }}
                    />
                  );
                })}
              </div>

              {/* Checklist */}
              <ul className="space-y-2 text-[11.5px] font-bold text-stone-700">
                {[
                  'Plantillas profesionales',
                  'Colores a tu medida',
                  'Tu propio estilo',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 py-1 px-2 rounded-lg bg-stone-100/90 border border-stone-200/80">
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: activeColor }}
                    >
                      <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                    </span>
                    <span className="truncate">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3D Perspective Laptop Mockup built from scratch */}
            <div className="sm:ml-24 relative z-20">
              {/* Laptop Lid / Screen Bezel */}
              <div className="rounded-t-2xl bg-[#0D0D11] p-2 sm:p-2.5 border-t-2 border-x-2 border-stone-600/80 shadow-[0_25px_60px_rgba(0,0,0,0.95)]">
                {/* Camera notch */}
                <div className="w-12 h-1 bg-stone-800 rounded-full mx-auto mb-1.5 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
                </div>

                {/* Inner Screen: Live GastroNegocios Dashboard UI */}
                <div className="rounded-xl overflow-hidden bg-[#0F1117] border border-white/10 grid grid-cols-12 min-h-[250px] sm:min-h-[275px]">
                  {/* Dark Sidebar */}
                  <div className="col-span-3 bg-[#090B10] border-r border-white/10 p-2.5 flex flex-col justify-between">
                    <div>
                      {/* Mini Brand Header */}
                      <div className="flex items-center gap-1.5 pb-2.5 mb-2.5 border-b border-white/10">
                        <span
                          className="w-4 h-4 rounded-md flex items-center justify-center text-white shrink-0"
                          style={{ backgroundColor: activeColor }}
                        >
                          <Flame className="w-2.5 h-2.5" />
                        </span>
                        <span className="text-[8px] font-black tracking-tight text-white uppercase truncate">
                          GASTRO<span className="text-[#FA9B23]">NEGOCIOS</span>
                        </span>
                      </div>

                      {/* Sidebar Menu Items */}
                      <div className="space-y-1">
                        {[
                          { icon: BarChart3, label: 'Dashboard', active: true },
                          { icon: ShoppingBag, label: 'Pedidos', active: false },
                          { icon: UtensilsCrossed, label: 'Carta QR', active: false },
                          { icon: Layers, label: 'Inventario', active: false },
                          { icon: Users, label: 'Clientes', active: false },
                          { icon: Settings, label: 'Ajustes', active: false },
                        ].map((nav, i) => {
                          const Icon = nav.icon;
                          return (
                            <div
                              key={i}
                              className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[8.5px] font-bold transition-colors ${
                                nav.active
                                  ? 'text-white shadow-sm'
                                  : 'text-stone-400 hover:text-stone-200'
                              }`}
                              style={nav.active ? { backgroundColor: activeColor } : undefined}
                            >
                              <Icon className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate">{nav.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="p-1.5 rounded-lg bg-white/[0.04] border border-white/5 text-[7.5px] text-stone-400">
                      <div className="font-bold text-emerald-400">● Sede Principal</div>
                      <div className="truncate">En línea • 0% comisión</div>
                    </div>
                  </div>

                  {/* Main Dashboard Canvas */}
                  <div className="col-span-9 bg-[#F8FAFC] text-slate-900 p-3 flex flex-col justify-between">
                    {/* Top Bar */}
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-[10px] font-black text-slate-800 uppercase tracking-tight">
                          Resumen Ejecutivo en Tiempo Real
                        </div>
                        <div className="text-[8px] text-slate-500">
                          Ventas, comandas KDS y rendimiento por sede
                        </div>
                      </div>
                      <span
                        className="px-2 py-0.5 rounded-full text-[8px] font-black text-white shadow-sm"
                        style={{ backgroundColor: activeColor }}
                      >
                        +28.4% Hoy
                      </span>
                    </div>

                    {/* 3 KPI Cards matching the reference ($12.580.000, $8.200.000, $4.200.000) */}
                    <div className="grid grid-cols-3 gap-2 mb-2.5">
                      <div className="rounded-xl p-2 bg-gradient-to-br from-blue-50 to-indigo-100/80 border border-blue-200/80 shadow-sm">
                        <div className="text-[7.5px] font-bold text-blue-700 uppercase">Ingresos Mes</div>
                        <div className="text-[11px] sm:text-[12px] font-black text-slate-900 leading-tight mt-0.5">
                          $12.580.000
                        </div>
                        <div className="text-[7px] font-bold text-emerald-600 mt-0.5">▲ +18% vs mes ant.</div>
                      </div>

                      <div className="rounded-xl p-2 bg-gradient-to-br from-emerald-50 to-teal-100/80 border border-emerald-200/80 shadow-sm">
                        <div className="text-[7.5px] font-bold text-emerald-700 uppercase">Ventas POS</div>
                        <div className="text-[11px] sm:text-[12px] font-black text-slate-900 leading-tight mt-0.5">
                          $8.200.000
                        </div>
                        <div className="text-[7px] font-bold text-emerald-600 mt-0.5">▲ 342 pedidos</div>
                      </div>

                      <div className="rounded-xl p-2 bg-gradient-to-br from-amber-50 to-orange-100/80 border border-amber-200/80 shadow-sm">
                        <div className="text-[7.5px] font-bold text-amber-800 uppercase">Menú QR Web</div>
                        <div className="text-[11px] sm:text-[12px] font-black text-slate-900 leading-tight mt-0.5">
                          $4.200.000
                        </div>
                        <div className="text-[7px] font-bold text-amber-700 mt-0.5">★ 4.9 Satisfacción</div>
                      </div>
                    </div>

                    {/* Crisp Vector Area Chart */}
                    <div className="rounded-xl bg-white border border-slate-200 p-2.5 shadow-sm flex-1 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[8.5px] font-extrabold text-slate-700 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" style={{ color: activeColor }} />
                          <span>Curva de Ventas Semanal</span>
                        </span>
                        <div className="flex items-center gap-2 text-[7.5px] font-bold text-slate-400">
                          <span>Lun</span>
                          <span>Mié</span>
                          <span>Vie</span>
                          <span className="text-slate-800">Dom</span>
                        </div>
                      </div>

                      <svg viewBox="0 0 320 90" className="w-full h-20 overflow-visible">
                        <defs>
                          <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={activeColor} stopOpacity="0.42" />
                            <stop offset="100%" stopColor={activeColor} stopOpacity="0.02" />
                          </linearGradient>
                        </defs>
                        {/* Horizontal grid lines */}
                        <line x1="0" y1="20" x2="320" y2="20" stroke="#F1F5F9" strokeWidth="1" />
                        <line x1="0" y1="45" x2="320" y2="45" stroke="#F1F5F9" strokeWidth="1" />
                        <line x1="0" y1="70" x2="320" y2="70" stroke="#F1F5F9" strokeWidth="1" />

                        {/* Filled Area */}
                        <path
                          d="M 0 72 L 45 55 L 95 62 L 145 32 L 195 48 L 250 22 L 320 12 L 320 85 L 0 85 Z"
                          fill="url(#chartAreaGrad)"
                        />
                        {/* Crisp Line */}
                        <path
                          d="M 0 72 L 45 55 L 95 62 L 145 32 L 195 48 L 250 22 L 320 12"
                          fill="none"
                          stroke={activeColor}
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {/* Data points */}
                        {[
                          [0, 72],
                          [45, 55],
                          [95, 62],
                          [145, 32],
                          [195, 48],
                          [250, 22],
                          [320, 12],
                        ].map(([cx, cy], idx) => (
                          <circle
                            key={idx}
                            cx={cx}
                            cy={cy}
                            r="3.5"
                            fill="#FFFFFF"
                            stroke={activeColor}
                            strokeWidth="2.2"
                          />
                        ))}
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3D Metallic Laptop Base / Chin */}
              <div className="relative mx-auto w-[104%] -left-[2%] h-3.5 rounded-b-2xl bg-gradient-to-b from-stone-400 via-stone-600 to-stone-800 shadow-[0_14px_30px_rgba(0,0,0,0.95)] flex items-center justify-center">
                <div className="w-16 h-1 rounded-full bg-stone-800/80" />
              </div>
            </div>
          </div>

          {/* CENTER: Copy & Feature Bullets */}
          <div className="lg:col-span-3 space-y-4">
            <div
              className="inline-flex items-center px-3.5 py-1 rounded-full text-white text-xs font-extrabold tracking-wide shadow-md"
              style={{
                background: 'linear-gradient(90deg, #E50914 0%, #B80710 100%)',
                border: '1px solid rgba(255,130,130,0.35)',
              }}
            >
              Personalización Total
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white leading-[1.12] tracking-tight">
              Adapta la plataforma a tu estilo
            </h2>

            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              Elige entre múltiples plantillas, personaliza colores, textos y secciones sin conocimientos de programación.
            </p>

            <ul className="space-y-2.5 pt-1">
              {[
                '3+ plantillas profesionales',
                'Tu logo y colores',
                'Diseño 100% responsivo',
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-2.5 text-white font-bold text-xs sm:text-sm">
                  <span className="w-5 h-5 rounded-full bg-[#E50914] text-white flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(229,9,20,0.6)]">
                    <Check className="w-3 h-3 stroke-[3.5]" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <Link
                href="/registro"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#120806]/90 hover:bg-[#1F0E0A] border border-[#D4AF37]/50 text-white text-xs font-bold transition-all"
              >
                <span>Probar Personalizador</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#FA9B23]" />
              </Link>
            </div>
          </div>

          {/* RIGHT: Stack of 4 Native Vector/UI Mini Template Previews (Built from scratch, zero crops) */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            {MINI_TEMPLATES.map((tpl) => {
              const isSelected = selectedTpl === tpl.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => {
                    setSelectedTpl(tpl.id);
                    setActiveColor(tpl.accent);
                  }}
                  className={`group text-left rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer bg-gradient-to-r ${tpl.bg} ${
                    isSelected
                      ? 'border-[#FA9B23] ring-2 ring-[#FA9B23]/40 scale-[1.02] shadow-[0_12px_30px_rgba(0,0,0,0.85)]'
                      : 'border-white/15 hover:border-[#FA9B23]/60 hover:scale-[1.01] shadow-[0_8px_20px_rgba(0,0,0,0.7)]'
                  }`}
                >
                  {/* Browser Mini Top Bar */}
                  <div
                    className={`px-2.5 py-1 flex items-center justify-between border-b ${
                      tpl.darkText ? 'bg-slate-200/80 border-slate-300' : 'bg-black/40 border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </div>
                    <span
                      className={`text-[8px] font-extrabold uppercase tracking-wider ${
                        tpl.darkText ? 'text-slate-700' : 'text-stone-300'
                      }`}
                    >
                      {tpl.title}
                    </span>
                  </div>

                  {/* Mini Template Hero Body */}
                  <div className="p-2.5 flex items-center justify-between gap-2">
                    <div className="space-y-1 min-w-0 flex-1">
                      <span
                        className="inline-block px-1.5 py-0.5 rounded text-[7px] font-black uppercase text-white"
                        style={{ backgroundColor: tpl.badgeBg }}
                      >
                        {tpl.tag}
                      </span>
                      <div
                        className={`text-[10px] font-black leading-tight truncate ${
                          tpl.darkText ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        {tpl.headline}
                      </div>
                      <div className="flex items-center gap-1 pt-0.5">
                        <span
                          className="px-2 py-0.5 rounded-full text-[7px] font-black text-black shadow-sm"
                          style={{ backgroundColor: tpl.accent }}
                        >
                          Pedir Ahora →
                        </span>
                      </div>
                    </div>

                    {/* Crisp High-Res 3D Food Thumbnail */}
                    <div
                      className={`w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden border shrink-0 shadow-md ${
                        tpl.darkText ? 'border-slate-300 bg-slate-900' : 'border-white/20 bg-black/50'
                      }`}
                    >
                      <img
                        src={tpl.foodImg}
                        alt={`Vista previa ${tpl.title}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
