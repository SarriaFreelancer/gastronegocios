'use client';

import React from 'react';
import Image from 'next/image';
import { promotions } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { Check, ShoppingCart, Sparkles, Tag } from 'lucide-react';
import { restaurantInfo } from '@/data/restaurant-info';

export default function PromocionesPage() {
  const { addToCart, setIsCartOpen } = useCart();

  const handleOrderPromo = (promo: (typeof promotions)[0]) => {
    const promoProduct = {
      id: promo.id,
      nombre: promo.nombre,
      slug: promo.id,
      descripcion: promo.descripcion,
      precio: promo.precio,
      imagen: promo.imagen,
      categoria: 'hamburguesas',
      etiqueta: 'MÁS VENDIDO' as const,
      disponibilidad: true,
      destacado: true,
    };
    addToCart(promoProduct, 1);
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#080808] pt-24 pb-16">
      
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-[#0c0c0c] via-[#141414] to-[#080808] border-b border-[#202020] py-14 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Precios Especiales</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase text-white font-display tracking-tight">
            COMBOS Y <span className="text-brand-yellow italic">PROMOCIONES</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto">
            Disfruta de la mejor combinación de hamburguesas, papas crujientes, salchipapas y bebidas con descuentos diseñados para compartir.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Promos Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {promotions.map((promo) => (
            <div
              key={promo.id}
              className="bg-[#121212] border-2 border-[#242424] hover:border-brand-yellow/60 rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
            >
              <div>
                {/* Image */}
                <div className="relative w-full aspect-[16/10] bg-black overflow-hidden">
                  <Image
                    src={promo.imagen}
                    alt={promo.nombre}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />
                  
                  {promo.etiqueta && (
                    <div className="absolute top-4 left-4 z-10">
                      <span className="bg-brand-yellow text-black text-xs font-black px-3 py-1 rounded-md shadow-lg uppercase tracking-wider">
                        {promo.etiqueta}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-2xl font-black text-white font-display uppercase tracking-wide group-hover:text-brand-yellow transition-colors">
                      {promo.nombre}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-400 mt-2 leading-relaxed">
                      {promo.descripcion}
                    </p>
                  </div>

                  {/* Included list */}
                  <div className="bg-[#181818] border border-[#262626] rounded-2xl p-4 space-y-2">
                    <p className="text-xs font-bold text-brand-yellow uppercase tracking-wider">
                      ¿Qué incluye?
                    </p>
                    {promo.incluye.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-gray-200">
                        <Check className="w-3.5 h-3.5 text-brand-yellow flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price & Action */}
              <div className="p-6 pt-0 border-t border-[#1e1e1e] mt-4 flex items-center justify-between">
                <div>
                  {promo.precioAntes && (
                    <span className="block text-xs text-gray-500 line-through">
                      ${promo.precioAntes.toLocaleString('es-CO')}
                    </span>
                  )}
                  <span className="text-2xl font-black text-brand-yellow font-display">
                    ${promo.precio.toLocaleString('es-CO')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleOrderPromo(promo)}
                  className="bg-brand-yellow hover:bg-brand-yellowHover text-black font-black text-xs uppercase px-5 py-3 rounded-full shadow-glow flex items-center gap-2 transition-all transform active:scale-95"
                >
                  <ShoppingCart className="w-4 h-4 fill-current" />
                  <span>PEDIR COMBO</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Combo callout */}
        <div className="bg-[#121212] border border-[#252525] rounded-3xl p-8 sm:p-10 text-center space-y-4">
          <Tag className="w-8 h-8 text-brand-yellow mx-auto" />
          <h2 className="text-2xl sm:text-3xl font-black text-white font-display uppercase">
            ¿TIENES UN EVENTO O PEDIDO ESPECIAL?
          </h2>
          <p className="text-sm text-gray-400 max-w-xl mx-auto">
            Armamos combos personalizados para cumpleaños, reuniones corporativas o parches de amigos con precios especiales al por mayor.
          </p>
          <a
            href={`https://api.whatsapp.com/send?phone=${restaurantInfo.whatsappNumber}&text=${encodeURIComponent(
              '¡Hola Punto G! Quiero cotizar un pedido para un evento o grupo grande.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-brand-whatsapp hover:bg-[#20ba59] text-white font-black text-sm px-8 py-3.5 rounded-full shadow-lg transition-transform hover:scale-105"
          >
            CONSULTAR POR WHATSAPP
          </a>
        </div>

      </div>
    </div>
  );
}
