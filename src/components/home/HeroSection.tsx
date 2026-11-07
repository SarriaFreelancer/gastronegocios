'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Utensils, MessageCircle, Sparkles } from 'lucide-react';
import { restaurantInfo } from '@/data/restaurant-info';

export const HeroSection: React.FC = () => {
  const pathname = usePathname();
  const match = pathname ? pathname.match(/^\/r\/([^\/]+)/) : null;
  const menuHref = match ? `/r/${match[1]}/menu` : '/menu';
  return (
    <section className="relative pt-28 pb-16 bg-[#080808] overflow-hidden min-h-[90vh] flex items-center">
      {/* Yellow brush accent in top-left corner */}
      <div 
        className="absolute top-0 left-0 w-72 sm:w-[380px] h-72 sm:h-[380px] pointer-events-none opacity-20 mix-blend-screen"
        style={{
          background: 'radial-gradient(circle at 10% 10%, #FFC928 0%, rgba(255, 201, 40, 0.2) 40%, transparent 65%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          
          {/* Left Hero Typography & Actions */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="space-y-1">
              {/* Giant PUNTO G with brush stroke styling */}
              <div className="relative inline-block mb-1 sm:mb-2">
                <span className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black italic tracking-tighter text-brand-yellow font-display drop-shadow-[0_8px_30px_rgba(255,201,40,0.55)]">
                  PUNTO&nbsp;G
                </span>
                {/* Yellow swash underline */}
                <div className="w-full h-3 sm:h-4 bg-brand-yellow rounded-full -mt-2 sm:-mt-4 opacity-95 transform -rotate-1 shadow-glow" />
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight font-display drop-shadow-md">
                TU MÁXIMO
              </h1>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-brand-yellow uppercase tracking-tight font-display drop-shadow-md">
                PLACER
              </h2>
            </div>

            <p className="text-base sm:text-lg text-gray-200 max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed">
              Hamburguesas, picadas, parrillas y mucho más.<br />
              El sabor que estabas buscando está aquí.
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              {/* Yellow VER MENÚ */}
              <Link
                href={menuHref}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-brand-yellow hover:bg-brand-yellowHover text-black font-black text-sm uppercase px-8 py-4 rounded-full shadow-[0_4px_25px_rgba(255,201,40,0.4)] transition-all transform hover:scale-105 active:scale-95"
              >
                <Utensils className="w-4 h-4 fill-current" />
                <span>VER MENÚ</span>
              </Link>

              {/* Green PEDIR POR WHATSAPP */}
              <a
                href={`https://api.whatsapp.com/send?phone=${restaurantInfo.whatsappNumber}&text=${encodeURIComponent(
                  '¡Hola Punto G! Quiero hacer un pedido por WhatsApp.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-brand-whatsapp hover:bg-[#20ba59] text-white font-black text-sm uppercase px-8 py-4 rounded-full shadow-[0_4px_25px_rgba(37,211,102,0.35)] transition-all transform hover:scale-105 active:scale-95"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>PEDIR POR WHATSAPP</span>
              </a>
            </div>
          </div>

          {/* Right Hero Image: 3D Burger Floating with Drawing/Doodle Accents (NO circular blur) */}
          <div className="lg:col-span-6 relative flex flex-col justify-center items-center">
            
            {/* Top-Right: 100% Artesanal callout pill */}
            <div className="absolute -top-6 right-2 sm:right-6 z-20 flex items-center gap-1.5 select-none pointer-events-none">
              <span className="px-3 py-1 rounded-full bg-brand-yellow text-black font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-md">
                🔥 100% ARTESANAL
              </span>
            </div>

            {/* Top-Left: Decorative steam / grill aroma lines doodle */}
            <div className="absolute -top-3 left-4 sm:left-12 z-10 pointer-events-none opacity-80">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-brand-yellow animate-float">
                <path d="M10 30C10 20 20 20 20 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 3"/>
                <path d="M22 32C22 24 30 24 30 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 3"/>
              </svg>
            </div>

            {/* Floating 3D Burger with gentle float animation */}
            <div className="relative w-[320px] h-[280px] sm:w-[460px] sm:h-[400px] lg:w-[520px] lg:h-[450px] flex items-center justify-center animate-float">
              <div className="relative w-full h-full select-none transition-transform duration-500 hover:scale-105">
                <Image
                  src="/images/assets/burger-hero-transparent.png"
                  alt="Hamburguesa Gourmet Artesanal Punto G"
                  fill
                  priority
                  className="object-contain drop-shadow-[0_28px_32px_rgba(0,0,0,0.95)]"
                  sizes="(max-width: 1024px) 100vw, 520px"
                />
              </div>
            </div>

            {/* Bottom Gastronomic Badges */}
            <div className="flex items-center gap-2.5 -mt-2 z-20 pointer-events-none select-none">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#141414] border border-[#2b2b2b] text-[11px] font-bold text-gray-300 shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-brand-yellow animate-spin-slow" />
                <span>Pan Brioche</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#141414] border border-[#2b2b2b] text-[11px] font-bold text-gray-300 shadow-md">
                <span className="text-brand-yellow font-black">★</span>
                <span>Doble Smash</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#141414] border border-[#2b2b2b] text-[11px] font-bold text-gray-300 shadow-md">
                <span className="text-amber-500 font-bold">🧀</span>
                <span>Cheddar Fundido</span>
              </div>
            </div>

            {/* Ground Contact Shadow (Slim Horizontal Ellipse on floor, NOT circular haze) */}
            <div className="w-48 sm:w-72 lg:w-80 h-3 sm:h-4 bg-black/80 rounded-[100%] blur-sm mt-3 pointer-events-none" />
          </div>

        </div>
      </div>
    </section>
  );
};
