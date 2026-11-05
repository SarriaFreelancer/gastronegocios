'use client';

import React from 'react';
import Image from 'next/image';
import { MessageCircle, Sparkles } from 'lucide-react';
import { useTenant } from '@/context/TenantContext';
import { restaurantInfo } from '@/data/restaurant-info';

export const CategoryComboBanner: React.FC = () => {
  const { restaurant } = useTenant();

  // If the tenant explicitly hides promotions, do not render
  if (restaurant && restaurant.mostrarPromociones === false) {
    return null;
  }

  const isPuntoG = !restaurant || restaurant.slug === 'punto-g' || restaurant.slug === 'puntog';
  const name = restaurant?.nombre || restaurantInfo.name;
  const phone = restaurant?.telefono || restaurantInfo.whatsappNumber;
  const promoText = restaurant?.textoPromocional || (isPuntoG ? 'Combo Especial Hamburguesa + Papas + Gaseosa' : `Promoción especial de la casa en ${name}`);
  const bannerImg = restaurant?.bannerPromocional || (isPuntoG ? 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=900&auto=format&fit=crop' : (restaurant?.imagenHero || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=900&auto=format&fit=crop'));

  return (
    <div className="relative rounded-3xl bg-gradient-to-r from-[#121212] via-[#181818] to-[#0f0f0f] border border-[#2b2b2b] p-6 sm:p-8 overflow-hidden shadow-2xl my-12">
      {/* Subtle ambient glow using tenant primary color */}
      <div 
        className="absolute top-1/2 left-1/3 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ backgroundColor: 'var(--tenant-primary, #EAA622)' }}
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
        
        {/* Left Combo Info */}
        <div className="md:col-span-5 text-center md:text-left space-y-2">
          <div className="inline-block transform -rotate-1">
            <span 
              className="font-black text-xs sm:text-sm uppercase tracking-wider px-3.5 py-1 rounded shadow-md inline-flex items-center gap-1.5"
              style={{ backgroundColor: 'var(--tenant-primary, #EAA622)', color: 'var(--tenant-button-text, #000000)' }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              PROMOCIÓN DESTACADA
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-white leading-tight">
            {promoText}
          </h3>

          <p 
            className="text-2xl sm:text-3xl font-black font-display tracking-tight drop-shadow-md"
            style={{ color: 'var(--tenant-primary, #EAA622)' }}
          >
            {isPuntoG ? '$28.900' : '¡Precios de Locura!'}
          </p>
        </div>

        {/* Center: Image Asset */}
        <div className="md:col-span-4 flex justify-center">
          <div className="relative w-full max-w-[260px] aspect-[4/3] drop-shadow-[0_12px_25px_rgba(0,0,0,0.95)]">
            <Image
              src={bannerImg}
              alt={`Promoción ${name}`}
              fill
              className="object-cover rounded-2xl transform hover:scale-105 transition-transform duration-300"
              sizes="260px"
            />
          </div>
        </div>

        {/* Right Action & Script Text */}
        <div className="md:col-span-3 flex flex-col items-center md:items-end justify-center space-y-3">
          <a
            href={`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(
              `¡Hola ${name}! Quisiera información sobre sus promociones y pedir a domicilio.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-black text-xs sm:text-sm px-6 py-3.5 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: 'var(--tenant-button, var(--tenant-primary, #EAA622))', color: 'var(--tenant-button-text, #000000)' }}
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
