'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Check
} from 'lucide-react';

const MINI_TEMPLATES = [
  {
    id: 'tpl-1',
    title: 'Plantilla Gourmet Gold',
    img: '/images/saas/mini-tpl-1.png',
    href: '/r/punto-g',
  },
  {
    id: 'tpl-2',
    title: 'Plantilla Fast Food Red',
    img: '/images/saas/mini-tpl-2.png',
    href: '/r/salchiricurras',
  },
  {
    id: 'tpl-3',
    title: 'Plantilla Parrilla & Brasa',
    img: '/images/saas/mini-tpl-3.png',
    href: '/r/bryan',
  },
  {
    id: 'tpl-4',
    title: 'Plantilla Bistro Light',
    img: '/images/saas/mini-tpl-4.png',
    href: '/r/punto-g',
  },
];

export function SaasCustomizationSection() {
  const [activeTemplate, setActiveTemplate] = useState<string>('tpl-1');

  return (
    <section id="personalizacion" className="relative py-8 sm:py-12 text-white overflow-hidden">
      {/* Intense crimson & warm amber ambient lighting */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[540px] h-[420px] bg-radial from-[#E90712]/20 via-[#7F1D1D]/10 to-transparent rounded-full blur-[110px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-5 items-center">
          
          {/* LEFT COLUMN (Cols 1-6): 3D Tilted "Personaliza tu marca" Card + Angled Laptop on Wooden Table */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            <div className="relative w-full max-w-[640px] lg:-ml-4">
              <Image
                src="/images/saas/personaliza-laptop-scene.png"
                alt="Personaliza tu marca y Dashboard GastroNegocios"
                width={712}
                height={428}
                unoptimized
                className="w-full h-auto object-contain drop-shadow-[0_22px_45px_rgba(0,0,0,0.95)]"
              />
            </div>
          </div>

          {/* MIDDLE COLUMN (Cols 7-10): Heading, Description, 3 Intense Red Checks, Button */}
          <div className="lg:col-span-4 space-y-3.5 text-left lg:pl-2">
            <div className="inline-flex items-center px-4 py-1 rounded-full bg-gradient-to-b from-[#FF2A32] via-[#E90712] to-[#9E050C] text-white text-xs font-extrabold shadow-[0_4px_20px_rgba(241,15,26,0.65)] border border-red-400/40">
              <span>Personalización Total</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[38px] font-black text-white tracking-tight leading-[1.08] font-display drop-shadow-[0_4px_14px_rgba(0,0,0,0.85)]">
              Adapta la plataforma <br />a tu estilo
            </h2>

            <p className="text-sm sm:text-[14.5px] text-gray-200 leading-relaxed font-normal">
              Elige entre múltiples plantillas, personaliza colores, textos y secciones sin conocimientos de programación.
            </p>

            {/* 3 intense red circular checks */}
            <ul className="space-y-2.5 pt-1">
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-gradient-to-b from-[#FF2E36] to-[#D90710] flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(241,15,26,0.75)]">
                  <Check className="w-3 h-3 text-white stroke-[3.5]" />
                </span>
                <span className="text-sm sm:text-[15px] font-semibold text-white">3+ plantillas profesionales</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-gradient-to-b from-[#FF2E36] to-[#D90710] flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(241,15,26,0.75)]">
                  <Check className="w-3 h-3 text-white stroke-[3.5]" />
                </span>
                <span className="text-sm sm:text-[15px] font-semibold text-white">Tu logo y colores</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-gradient-to-b from-[#FF2E36] to-[#D90710] flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(241,15,26,0.75)]">
                  <Check className="w-3 h-3 text-white stroke-[3.5]" />
                </span>
                <span className="text-sm sm:text-[15px] font-semibold text-white">Diseño 100% responsivo</span>
              </li>
            </ul>

            <div className="pt-2">
              <Link
                href="/registro"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-black/70 hover:bg-white/10 text-white font-bold text-xs sm:text-[13px] border border-white/45 transition shadow-[0_8px_24px_rgba(0,0,0,0.85)]"
              >
                <span>Probar Personalizador</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN (Cols 11-12): 4 Stacked Horizontal Mini Website Screenshots */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-1 gap-2.5">
            {MINI_TEMPLATES.map((t) => {
              const isSelected = activeTemplate === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTemplate(t.id)}
                  className={`group relative rounded-xl overflow-hidden border-2 transition-all duration-200 block w-full ${
                    isSelected
                      ? 'border-[#FFB82E] shadow-[0_0_20px_rgba(250,155,35,0.45)] scale-[1.03]'
                      : 'border-white/40 hover:border-white/80 shadow-[0_10px_25px_rgba(0,0,0,0.85)]'
                  }`}
                >
                  <div className="relative aspect-[285/141] w-full bg-[#111]">
                    <Image
                      src={t.img}
                      alt={t.title}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="180px"
                    />
                  </div>
                </button>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
