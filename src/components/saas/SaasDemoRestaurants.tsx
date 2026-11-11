'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

export interface DemoRestaurantCardData {
  id?: number;
  nombre: string;
  slug: string;
  eslogan?: string | null;
  descripcion?: string | null;
  ciudad?: string;
  colorPrimario?: string;
  colorSecundario?: string;
  bannerHero?: string | null;
  logo?: string | null;
}

interface SaasDemoRestaurantsProps {
  restaurants?: DemoRestaurantCardData[];
}

export const SaasDemoRestaurants: React.FC<SaasDemoRestaurantsProps> = () => {
  return (
    <section id="demos" className="relative py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* LEFT HEADER COLUMN */}
          <div className="lg:col-span-4 space-y-4">
            <div
              className="inline-flex items-center px-4 py-1 rounded-full text-white text-xs font-extrabold tracking-wide shadow-md"
              style={{
                background: 'linear-gradient(90deg, #E50914 0%, #B80710 100%)',
                border: '1px solid rgba(255,130,130,0.35)',
              }}
            >
              Explora nuestros
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none">
              Restaurantes Demo
            </h2>

            <p className="text-stone-300 text-sm leading-relaxed">
              Descubre cómo cada negocio personaliza su marca, colores y menú.
            </p>

            <div className="pt-1">
              <Link
                href="/r/punto-g/menu"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#120806]/90 hover:bg-[#1F0E0A] border border-[#D4AF37]/45 text-white text-xs font-bold transition-all shadow-md"
              >
                <span>Ver todos los demos</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#FA9B23]" />
              </Link>
            </div>
          </div>

          {/* RIGHT 3 CARDS COLUMN (Built from scratch with 3D illustrations + crisp vector typography) */}
          <div className="lg:col-span-8 relative flex items-center gap-3">
            {/* Left Carousel Arrow */}
            <Link
              href="/r/punto-g/menu"
              aria-label="Anterior demo"
              className="hidden sm:flex w-9 h-9 rounded-full bg-[#160A07] hover:bg-[#26120D] border border-white/20 items-center justify-center text-white shrink-0 shadow-lg transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>

            {/* 3 Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 w-full">
              {/* CARD 1: PUNTO G */}
              <Link
                href="/r/punto-g/menu"
                className="group relative rounded-[26px] overflow-hidden border-2 border-[#FA9B23]/80 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_45px_rgba(250,155,35,0.4)] aspect-[1/1.05] flex flex-col justify-between p-4"
                style={{
                  background: 'radial-gradient(circle at 50% 35%, #FFE47A 0%, #FA9B23 55%, #C85A00 100%)',
                }}
              >
                {/* 3D Background Illustration generated from scratch */}
                <img
                  src="/images/saas/demo-puntog-3d.png"
                  alt="Punto G Tu Máximo Placer"
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                {/* Bottom gradient for crisp typography */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.08) 45%, rgba(120,45,0,0.82) 100%)',
                  }}
                />

                <div className="relative z-10" />

                {/* Crisp Vector Brand Title + Pill CTA */}
                <div className="relative z-10 text-center space-y-2 pt-16">
                  <div className="leading-none">
                    <div
                      className="text-2xl sm:text-[26px] font-black uppercase tracking-tight text-[#FFE66D]"
                      style={{
                        textShadow: '0 3px 0 #1B4332, 0 5px 12px rgba(0,0,0,0.75)',
                      }}
                    >
                      PUNTO <span className="text-[#2EC4B6]">G</span>
                    </div>
                    <div className="text-[11px] font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] mt-0.5">
                      ¡Tu máximo placer!
                    </div>
                  </div>

                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1.5 px-5 py-1.5 rounded-full bg-white text-stone-950 font-black text-xs shadow-[0_6px_16px_rgba(0,0,0,0.4)] group-hover:scale-105 transition-transform">
                      <span>Ver Menú</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>

              {/* CARD 2: SALCHI RICURRAS */}
              <Link
                href="/r/salchiricurras/menu"
                className="group relative rounded-[26px] overflow-hidden border-2 border-[#FF4D4D]/75 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_45px_rgba(241,15,26,0.45)] aspect-[1/1.05] flex flex-col justify-between p-4"
                style={{
                  background: 'radial-gradient(circle at 50% 35%, #FF4D4D 0%, #D90712 60%, #5A0207 100%)',
                }}
              >
                <img
                  src="/images/saas/demo-salchi-3d.png"
                  alt="Salchi Ricurras"
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.12) 45%, rgba(90,2,7,0.88) 100%)',
                  }}
                />

                <div className="relative z-10" />

                <div className="relative z-10 text-center space-y-2 pt-16">
                  <div className="leading-none">
                    <div
                      className="text-2xl sm:text-[26px] font-black tracking-tight text-white"
                      style={{
                        textShadow: '0 3px 0 #5A0207, 0 5px 12px rgba(0,0,0,0.85)',
                      }}
                    >
                      Salchi
                    </div>
                    <div
                      className="text-xl sm:text-[22px] font-black tracking-tight text-[#FFE169] -mt-1"
                      style={{
                        textShadow: '0 3px 0 #5A0207, 0 5px 12px rgba(0,0,0,0.85)',
                      }}
                    >
                      Ricurras
                    </div>
                  </div>

                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1.5 px-5 py-1.5 rounded-full bg-white text-stone-950 font-black text-xs shadow-[0_6px_16px_rgba(0,0,0,0.45)] group-hover:scale-105 transition-transform">
                      <span>Ver Menú</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>

              {/* CARD 3: DON CARBÓN */}
              <Link
                href="/r/bryan/menu"
                className="group relative rounded-[26px] overflow-hidden border-2 border-stone-600/80 hover:border-[#FA9B23]/80 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_45px_rgba(250,155,35,0.3)] aspect-[1/1.05] flex flex-col justify-between p-4"
                style={{
                  background: 'radial-gradient(circle at 50% 35%, #3A2010 0%, #140B06 60%, #070403 100%)',
                }}
              >
                <img
                  src="/images/saas/demo-doncarbon-3d.png"
                  alt="Don Carbón"
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.15) 45%, rgba(7,4,3,0.9) 100%)',
                  }}
                />

                <div className="relative z-10" />

                <div className="relative z-10 text-center space-y-2 pt-16">
                  <div className="leading-none">
                    <div
                      className="text-2xl sm:text-[26px] font-black tracking-tight text-white"
                      style={{
                        textShadow: '0 3px 0 #000000, 0 5px 14px rgba(250,155,35,0.6)',
                      }}
                    >
                      Don
                    </div>
                    <div
                      className="text-xl sm:text-[23px] font-black tracking-tight text-[#FA9B23] -mt-1"
                      style={{
                        textShadow: '0 3px 0 #000000, 0 5px 14px rgba(0,0,0,0.9)',
                      }}
                    >
                      Carbón
                    </div>
                  </div>

                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1.5 px-5 py-1.5 rounded-full bg-white text-stone-950 font-black text-xs shadow-[0_6px_16px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform">
                      <span>Ver Menú</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Right Carousel Arrow */}
            <Link
              href="/r/salchiricurras/menu"
              aria-label="Siguiente demo"
              className="hidden sm:flex w-9 h-9 rounded-full bg-[#160A07] hover:bg-[#26120D] border border-white/20 items-center justify-center text-white shrink-0 shadow-lg transition"
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
