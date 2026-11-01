'use client';

import React from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { Check, PhoneCall } from 'lucide-react';
import { restaurantInfo } from '@/data/restaurant-info';

export const PromotionBanner: React.FC = () => {
  const { addToCart, setIsCartOpen } = useCart();

  const handleOrderCombo = () => {
    const comboProduct = {
      id: 'promo-combo-punto-g',
      nombre: 'Combo Punto G (Hamburguesa + Papas + Gaseosa)',
      slug: 'combo-punto-g',
      descripcion: 'Hamburguesa Clásica artesanal + Porción de papas a la francesa + Gaseosa 400 ml.',
      precio: 28900,
      imagen: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=900&auto=format&fit=crop',
      categoria: 'hamburguesas',
      etiqueta: 'MÁS VENDIDO' as const,
      disponibilidad: true,
      destacado: true,
    };
    addToCart(comboProduct, 1);
    setIsCartOpen(true);
  };

  return (
    <section className="relative py-12 sm:py-16 bg-[#080808] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner with yellow brush background */}
        <div 
          className="relative rounded-3xl p-6 sm:p-10 lg:p-12 overflow-hidden shadow-2xl border border-yellow-500/30"
          style={{
            background: 'linear-gradient(135deg, rgba(255,201,40,0.18) 0%, rgba(20,20,20,0.95) 40%, rgba(10,10,10,0.98) 100%)',
          }}
        >
          {/* Yellow decorative diagonal splash */}
          <div className="absolute -top-16 -left-16 w-80 h-80 bg-brand-yellow/20 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Left Headline */}
            <div className="lg:col-span-4 text-center lg:text-left space-y-1">
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white font-display leading-tight">
                COMBOS QUE
              </h3>
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white font-display leading-tight">
                NO TE PUEDES
              </h3>
              <div className="pt-1">
                <span className="text-5xl sm:text-6xl md:text-7xl font-black italic text-brand-yellow font-display drop-shadow-[0_4px_25px_rgba(255,201,40,0.6)]">
                  PERDER
                </span>
              </div>
            </div>

            {/* Center: Clear high-res Burger + Fries + Drink Photo */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative w-full max-w-[340px] aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-[#2b2b2b]">
                <Image
                  src="https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=900&auto=format&fit=crop"
                  alt="Combo Punto G Hamburguesa y Papas"
                  fill
                  className="object-cover transform hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 300px, 340px"
                />
              </div>
            </div>

            {/* Right: Combo Card */}
            <div className="lg:col-span-4 bg-[#111111]/95 border border-[#2c2c2c] rounded-2xl p-6 sm:p-7 shadow-2xl space-y-4">
              <div>
                <h4 className="text-xl sm:text-2xl font-black text-white font-display uppercase tracking-wide">
                  Combo Punto G
                </h4>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-200">
                    <Check className="w-4 h-4 text-brand-yellow flex-shrink-0" />
                    <span>Hamburguesa Clásica</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-200">
                    <Check className="w-4 h-4 text-brand-yellow flex-shrink-0" />
                    <span>Porción de Papas</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-200">
                    <Check className="w-4 h-4 text-brand-yellow flex-shrink-0" />
                    <span>Gaseosa 400 ml</span>
                  </div>
                </div>
              </div>

              {/* Price & CTA Button */}
              <div className="pt-2 border-t border-[#222] flex items-center justify-between gap-3">
                <span className="text-2xl sm:text-3xl font-black text-brand-yellow font-display tracking-tight">
                  $28.900
                </span>

                <button
                  type="button"
                  onClick={handleOrderCombo}
                  className="inline-flex items-center gap-2 bg-brand-yellow hover:bg-brand-yellowHover text-black font-black text-xs sm:text-sm px-6 py-3 rounded-full shadow-glow transition-all transform hover:scale-105 active:scale-95"
                >
                  <PhoneCall className="w-4 h-4 fill-current" />
                  <span>PEDIR AHORA</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
