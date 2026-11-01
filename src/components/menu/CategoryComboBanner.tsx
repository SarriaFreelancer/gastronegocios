import React from 'react';
import Image from 'next/image';
import { MessageCircle } from 'lucide-react';
import { restaurantInfo } from '@/data/restaurant-info';

export const CategoryComboBanner: React.FC = () => {
  return (
    <div className="relative rounded-3xl bg-gradient-to-r from-[#121212] via-[#181818] to-[#0f0f0f] border border-[#2b2b2b] p-6 sm:p-8 overflow-hidden shadow-2xl my-12">
      {/* Background yellow subtle ambient glow */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-80 h-80 bg-brand-yellow/10 rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
        
        {/* Left Combo Info */}
        <div className="md:col-span-4 text-center md:text-left space-y-2">
          {/* Slanted yellow badge */}
          <div className="inline-block transform -rotate-1">
            <span className="bg-brand-yellow text-black font-black text-xs sm:text-sm uppercase tracking-wider px-3.5 py-1 rounded shadow-md">
              COMBO ESPECIAL
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-white leading-tight">
            Hamburguesa + Papas + Gaseosa
          </h3>

          <p className="text-3xl sm:text-4xl font-black text-brand-yellow font-display tracking-tight drop-shadow-md">
            $28.900
          </p>
        </div>

        {/* Center: Burger + Fries + Coke Image Asset */}
        <div className="md:col-span-4 flex justify-center">
          <div className="relative w-full max-w-[260px] aspect-[4/3] drop-shadow-[0_12px_25px_rgba(0,0,0,0.95)]">
            <Image
              src="/images/assets/menu-bottom-combo.png"
              alt="Combo Especial Hamburguesa + Papas + Gaseosa"
              fill
              className="object-contain transform hover:scale-105 transition-transform duration-300"
              sizes="260px"
            />
          </div>
        </div>

        {/* Right Action & Script Text */}
        <div className="md:col-span-4 flex flex-col items-center md:items-end justify-center space-y-3">
          <a
            href={`https://api.whatsapp.com/send?phone=${restaurantInfo.whatsappNumber}&text=${encodeURIComponent(
              '¡Hola Punto G! Quiero pedir el Combo Especial de $28.900 (Hamburguesa + Papas + Gaseosa).'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-brand-yellow hover:bg-brand-yellowHover text-black font-black text-xs sm:text-sm px-6 py-3.5 rounded-full shadow-glow transition-all transform hover:scale-105 active:scale-95"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Pedir por WhatsApp</span>
          </a>

          <p className="font-script text-xl sm:text-2xl text-gray-300 italic tracking-wide">
            ¡Rápido, fácil y delicioso!
          </p>
        </div>

      </div>
    </div>
  );
};
