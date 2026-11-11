'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const DEMO_CARDS = [
  {
    id: 'punto-g',
    name: 'Punto G - ¡Tu máximo placer!',
    href: '/r/punto-g',
    image: '/images/saas/demo-puntog.png',
    glow: 'hover:shadow-[0_18px_45px_rgba(250,155,35,0.35)]',
  },
  {
    id: 'salchiricurras',
    name: 'Salchi Ricurras',
    href: '/r/salchiricurras',
    image: '/images/saas/demo-salchi.png',
    glow: 'hover:shadow-[0_18px_45px_rgba(241,15,26,0.4)]',
  },
  {
    id: 'don-carbon',
    name: 'Don Carbón',
    href: '/r/bryan',
    image: '/images/saas/demo-doncarbon.png',
    glow: 'hover:shadow-[0_18px_45px_rgba(249,115,22,0.35)]',
  },
];

export function SaasDemoRestaurants() {
  return (
    <section id="demos" className="py-10 sm:py-14 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* LEFT COLUMN: TITLE & INTRO */}
        <div className="lg:col-span-4 space-y-3.5 text-left">
          <div className="inline-flex items-center px-4 py-1 rounded-full bg-gradient-to-b from-[#FF2A32] via-[#E90712] to-[#9E050C] text-white text-xs font-extrabold shadow-[0_4px_20px_rgba(241,15,26,0.65)] border border-red-400/40">
            <span>Explora nuestros</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-white font-display tracking-tight leading-[1.06] drop-shadow-[0_4px_14px_rgba(0,0,0,0.85)]">
            Restaurantes Demo
          </h2>

          <p className="text-sm sm:text-[15px] text-gray-200 leading-relaxed font-normal max-w-sm">
            Descubre cómo cada negocio personaliza su marca, colores y menú.
          </p>

          <div className="pt-1.5">
            <Link
              href="/r/punto-g"
              className="inline-flex items-center gap-2 py-2.5 px-5 rounded-full border border-white/40 bg-black/65 hover:bg-white/10 text-white font-bold text-xs transition shadow-[0_6px_20px_rgba(0,0,0,0.75)]"
            >
              <span>Ver todos los demos</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: 3 ILLUSTRATED DEMO CARDS WITH SIDE ARROWS */}
        <div className="lg:col-span-8 relative flex items-center gap-2 sm:gap-3">
          {/* LEFT ARROW */}
          <Link
            href="/r/punto-g"
            className="hidden sm:flex w-9 h-9 rounded-full bg-[#1C1418] hover:bg-white/20 border border-white/25 text-gray-200 hover:text-white items-center justify-center shrink-0 transition shadow-lg"
            aria-label="Anterior demo"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          </Link>

          {/* 3 CARDS */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {DEMO_CARDS.map((card) => (
              <Link
                key={card.id}
                href={card.href}
                className={`relative p-2 rounded-[24px] bg-gradient-to-b from-[#2A2229] via-[#171218] to-[#110D12] border border-white/20 shadow-[0_18px_40px_rgba(0,0,0,0.85)] group hover:-translate-y-1.5 transition-all duration-300 block ${card.glow}`}
              >
                <div className="relative rounded-[18px] overflow-hidden aspect-[113/100] w-full">
                  <Image
                    src={card.image}
                    alt={card.name}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    sizes="(max-width: 640px) 90vw, 260px"
                  />

                  {/* Crisp vector pill button overlaid on the bottom pill slot */}
                  <div className="absolute inset-x-0 bottom-[6.5%] flex justify-center pointer-events-none">
                    <span className="py-1.5 px-5 rounded-full bg-white group-hover:bg-amber-50 text-gray-950 font-extrabold text-xs shadow-[0_4px_12px_rgba(0,0,0,0.35)] flex items-center gap-1.5 transition-transform group-hover:scale-105">
                      <span>Ver Menú</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.8]" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* RIGHT ARROW */}
          <Link
            href="/r/salchiricurras"
            className="hidden sm:flex w-9 h-9 rounded-full bg-[#1C1418] hover:bg-white/20 border border-white/25 text-gray-200 hover:text-white items-center justify-center shrink-0 transition shadow-lg"
            aria-label="Siguiente demo"
          >
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </Link>
        </div>
      </div>
    </section>
  );
}
