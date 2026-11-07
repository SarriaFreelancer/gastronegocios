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
      {/* Yellow brush glow in top-left corner */}
      <div 
        className="absolute top-0 left-0 w-80 sm:w-[480px] h-80 sm:h-[480px] pointer-events-none opacity-25 mix-blend-screen"
        style={{
          background: 'radial-gradient(circle at 10% 10%, #FFC928 0%, rgba(255, 201, 40, 0.3) 45%, transparent 70%)',
        }}
      />
      {/* Background warm smoke accent */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-brand-yellow/10 rounded-full blur-[140px] pointer-events-none" />

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

          {/* Right Hero Image: Gourmet Burger floating naturally without any box or frame */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            {/* Ambient warm glow directly behind the burger */}
            <div className="absolute w-72 sm:w-96 md:w-[440px] h-72 sm:h-96 md:h-[440px] rounded-full bg-brand-yellow/20 blur-[110px] pointer-events-none" />

            {/* "Sabor Real" callout script above burger */}
            <div className="absolute -top-6 right-4 sm:right-10 z-20 text-right select-none pointer-events-none">
              <span className="font-script text-3xl sm:text-5xl text-white italic drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)] leading-none block">
                Sabor
              </span>
              <span className="font-script text-3xl sm:text-5xl text-brand-yellow italic drop-shadow-[0_4px_12px_rgba(255,201,40,0.5)] leading-none block -mt-1">
                Real
              </span>
              <Sparkles className="w-5 h-5 text-brand-yellow animate-spin-slow ml-auto mt-1" />
            </div>

            {/* Clean Burger silhouette without border, box, or frame */}
            <div className="relative w-full max-w-[520px] h-[360px] sm:h-[460px] md:h-[500px] flex items-center justify-center">
              <Image
                src="/images/assets/hero-burger.png"
                alt="Hamburguesa Artesanal Punto G"
                fill
                priority
                className="object-contain filter drop-shadow-[0_25px_35px_rgba(0,0,0,0.95)] transform hover:scale-105 transition-transform duration-700 select-none"
                sizes="(max-width: 1024px) 100vw, 520px"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
