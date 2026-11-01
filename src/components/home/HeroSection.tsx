import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Utensils, MessageCircle, Sparkles } from 'lucide-react';
import { restaurantInfo } from '@/data/restaurant-info';

export const HeroSection: React.FC = () => {
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
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight font-display drop-shadow-md">
                EL ANTOJO
              </h1>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight font-display drop-shadow-md">
                TIENE UN SOLO
              </h2>
              
              {/* Giant PUNTO G with brush stroke styling */}
              <div className="relative inline-block my-2">
                <span className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black italic tracking-tighter text-brand-yellow font-display drop-shadow-[0_8px_30px_rgba(255,201,40,0.55)]">
                  PUNTO&nbsp;G
                </span>
                {/* Yellow swash underline */}
                <div className="w-full h-3 sm:h-4 bg-brand-yellow rounded-full -mt-2 sm:-mt-4 opacity-95 transform -rotate-1 shadow-glow" />
              </div>
            </div>

            <p className="text-base sm:text-lg text-gray-200 max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed">
              Hamburguesas, picadas, parrillas y mucho más.<br />
              El sabor que estabas buscando está aquí.
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              {/* Yellow VER MENÚ */}
              <Link
                href="/menu"
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

          {/* Right Hero Image (Crisp, ultra-clear gourmet burger & fries) */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            {/* "Sabor Real" callout script above fries */}
            <div className="absolute -top-4 right-4 sm:right-10 z-20 text-right select-none pointer-events-none">
              <span className="font-script text-3xl sm:text-5xl text-white italic drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)] leading-none block">
                Sabor
              </span>
              <span className="font-script text-3xl sm:text-5xl text-brand-yellow italic drop-shadow-[0_4px_12px_rgba(255,201,40,0.5)] leading-none block -mt-1">
                Real
              </span>
              <Sparkles className="w-5 h-5 text-brand-yellow animate-spin-slow ml-auto mt-1" />
            </div>

            {/* Clear, High-Resolution Gastronomic Burger Composition */}
            <div className="relative w-full max-w-[540px] aspect-square rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.95)] border border-[#222]">
              <Image
                src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1200&auto=format&fit=crop"
                alt="Hamburguesa Artesanal Punto G"
                fill
                priority
                className="object-cover transform hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 1024px) 100vw, 540px"
              />
              {/* Subtle dark vignette around edges */}
              <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/60 pointer-events-none" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
