'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Flame,
  Utensils,
  Store,
  Sparkles
} from 'lucide-react';

interface DemoRestaurant {
  id: string;
  name: string;
  slug: string;
  slogan: string;
  bgGradient: string;
  borderColor: string;
  logoImg: string;
  buttonClass: string;
  productsCount: number;
}

const STATIC_DEMOS: DemoRestaurant[] = [
  {
    id: 'punto-g',
    name: 'Punto G',
    slug: 'punto-g',
    slogan: '¡Tu máximo placer!',
    bgGradient: 'from-amber-500 via-amber-600 to-yellow-600',
    borderColor: 'border-amber-400/50',
    logoImg: '/images/assets/burger-hero-transparent.png',
    buttonClass: 'bg-white text-black hover:bg-yellow-50',
    productsCount: 84,
  },
  {
    id: 'salchiricurras',
    name: 'Salchi Ricurras',
    slug: 'salchiricurras',
    slogan: 'El auténtico sabor callejero',
    bgGradient: 'from-red-600 via-red-700 to-rose-800',
    borderColor: 'border-red-400/50',
    logoImg: '/images/assets/salchipapa-3d.png',
    buttonClass: 'bg-white text-black hover:bg-red-50',
    productsCount: 15,
  },
  {
    id: 'bryan',
    name: 'Don Carbón / Bryan',
    slug: 'bryan',
    slogan: 'Cortes finos y parrilla al carbón',
    bgGradient: 'from-stone-900 via-zinc-800 to-neutral-950',
    borderColor: 'border-orange-500/30',
    logoImg: '/images/assets/parrilla-3d.png',
    buttonClass: 'bg-white/90 text-black hover:bg-white',
    productsCount: 12,
  },
];

export function SaasDemoRestaurants() {
  const [demos, setDemos] = useState<DemoRestaurant[]>(STATIC_DEMOS);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Intentar cargar dinámicamente desde /api/restaurants?landing=true
  useEffect(() => {
    fetch('/api/restaurants?landing=true')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: DemoRestaurant[] = data.map((r: any, idx: number) => {
            const isPuntoG = r.slug === 'punto-g' || r.slug === 'puntog';
            const isSalchi = r.slug === 'salchiricurras';
            return {
              id: r.slug,
              name: r.nombre,
              slug: r.slug,
              slogan: r.eslogan || (isPuntoG ? '¡Tu máximo placer!' : 'Sabor y pasión'),
              bgGradient: isPuntoG
                ? 'from-amber-500 via-amber-600 to-yellow-600'
                : isSalchi
                ? 'from-red-600 via-red-700 to-rose-800'
                : 'from-stone-900 via-zinc-800 to-neutral-950',
              borderColor: isPuntoG ? 'border-amber-400/50' : isSalchi ? 'border-red-400/50' : 'border-orange-500/30',
              logoImg: isPuntoG
                ? '/images/assets/burger-hero-transparent.png'
                : isSalchi
                ? '/images/assets/salchipapa-3d.png'
                : '/images/assets/parrilla-3d.png',
              buttonClass: 'bg-white text-black hover:bg-gray-100',
              productsCount: r._count?.products || (isPuntoG ? 84 : 15),
            };
          });
          setDemos(mapped);
        }
      })
      .catch(() => {
        // Fallback estático
      });
  }, []);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % demos.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + demos.length) % demos.length);
  };

  return (
    <section id="demos" className="py-20 sm:py-28 px-4 sm:px-6 bg-[#090B14] relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
        {/* LEFT COLUMN: TITLE & INTRO */}
        <div className="lg:col-span-4 space-y-5 text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E53E3E] text-white text-[11px] font-black uppercase tracking-wider shadow-[0_0_15px_rgba(229,62,62,0.4)]">
            <span>Explora nuestros</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-display tracking-tight leading-[1.1]">
            Restaurantes Demo
          </h2>

          <p className="text-sm text-gray-300 leading-relaxed font-normal">
            Descubre cómo cada negocio personaliza su marca, colores y menú digital según su identidad gastronómica.
          </p>

          <div className="pt-2">
            <a
              href="#demos"
              className="inline-flex items-center gap-2 py-2.5 px-5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-xs transition hover:scale-105 active:scale-95"
            >
              <span>Ver todos los demos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* RIGHT COLUMN: CAROUSEL CARDS */}
        <div className="lg:col-span-8 relative">
          {/* CAROUSEL CONTROLS */}
          <div className="flex items-center justify-end gap-2 mb-4">
            <button
              onClick={handlePrev}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition hover:scale-105 active:scale-95"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition hover:scale-105 active:scale-95"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* CARDS GRID / CAROUSEL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {demos.map((rest, idx) => (
              <div
                key={rest.id}
                className={`relative rounded-3xl p-6 bg-gradient-to-br ${rest.bgGradient} border-2 ${rest.borderColor} shadow-[0_15px_35px_rgba(0,0,0,0.6)] flex flex-col justify-between items-center text-center group hover:scale-[1.03] transition-all duration-300 min-h-[300px] overflow-hidden`}
              >
                {/* AMBIENT LIGHT */}
                <div className="absolute inset-0 bg-radial from-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* LOGO ICON / MOCKUP */}
                <div className="relative z-10 w-28 h-28 my-auto flex items-center justify-center drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] group-hover:scale-110 transition-transform duration-300">
                  <Image
                    src={rest.logoImg}
                    alt={rest.name}
                    width={120}
                    height={120}
                    className="object-contain max-h-24 w-auto"
                  />
                </div>

                {/* NAME & SLOGAN */}
                <div className="relative z-10 space-y-1 mb-5">
                  <h3 className="text-xl font-black text-white font-display tracking-tight drop-shadow-md">
                    {rest.name}
                  </h3>
                  <p className="text-xs text-white/90 font-medium italic">
                    {rest.slogan}
                  </p>
                </div>

                {/* CTA BUTTON */}
                <Link
                  href={`/r/${rest.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`relative z-10 w-full py-2.5 px-4 rounded-full font-black text-xs uppercase tracking-wider ${rest.buttonClass} shadow-lg flex items-center justify-center gap-1.5 transition active:scale-95`}
                >
                  <span>Ver Menú</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
