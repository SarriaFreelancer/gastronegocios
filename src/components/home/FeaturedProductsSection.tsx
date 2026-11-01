'use client';

import React from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/types';

export const FeaturedProductsSection: React.FC = () => {
  const { addToCart } = useCart();

  const featuredList: (Product & { badgeColor: string })[] = [
    {
      id: 'prod-hamb-clasica',
      nombre: 'Hamburguesa Clásica',
      slug: 'hamburguesa-clasica',
      descripcion: 'Carne, queso, lechuga y tomate.',
      precio: 18000,
      imagen: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=900&auto=format&fit=crop',
      categoria: 'hamburguesas',
      etiqueta: 'MÁS VENDIDO',
      badgeColor: 'bg-brand-yellow text-black shadow-glow',
      disponibilidad: true,
      destacado: true,
    },
    {
      id: 'prod-salchipapa-especial',
      nombre: 'Salchipapa Especial',
      slug: 'salchipapa-especial',
      descripcion: 'Salchicha, papas, salsas y queso.',
      precio: 16000,
      imagen: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?q=80&w=900&auto=format&fit=crop',
      categoria: 'salchipapas',
      etiqueta: 'NUEVO',
      badgeColor: 'bg-[#00E676] text-black shadow-[0_2px_10px_rgba(0,230,118,0.4)]',
      disponibilidad: true,
      destacado: true,
    },
    {
      id: 'prod-parrilla-mixta',
      nombre: 'Parrillada Mixta',
      slug: 'parrillada-mixta',
      descripcion: 'Carne y pollo a la parrilla.',
      precio: 45000,
      imagen: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=900&auto=format&fit=crop',
      categoria: 'parrillas',
      etiqueta: 'RECOMENDADO',
      badgeColor: 'bg-[#FF9800] text-black shadow-[0_2px_10px_rgba(255,152,0,0.4)]',
      disponibilidad: true,
      destacado: true,
    },
    {
      id: 'prod-perro-especial',
      nombre: 'Perro Caliente Especial',
      slug: 'perro-caliente-especial',
      descripcion: 'Salchicha, papas y salsas.',
      precio: 14000,
      imagen: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?q=80&w=900&auto=format&fit=crop',
      categoria: 'perros-calientes',
      badgeColor: 'hidden',
      disponibilidad: true,
      destacado: true,
    },
  ];

  return (
    <section className="relative py-12 sm:py-16 bg-[#0a0a0a] border-t border-[#181818]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title with yellow flanking lines */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 mb-8 sm:mb-12">
          <div className="h-[2px] w-12 sm:w-28 bg-gradient-to-r from-transparent via-brand-yellow to-brand-yellow" />
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase text-brand-yellow font-display tracking-widest text-center">
            PRODUCTOS DESTACADOS
          </h2>
          <div className="h-[2px] w-12 sm:w-28 bg-gradient-to-l from-transparent via-brand-yellow to-brand-yellow" />
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredList.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-2xl overflow-hidden border border-[#242424] hover:border-brand-yellow/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(0,0,0,0.9)] bg-[#121212] flex flex-col justify-between"
            >
              {/* Product Photo & Badge */}
              <div className="relative w-full aspect-[4/3] bg-black overflow-hidden">
                <Image
                  src={item.imagen}
                  alt={item.nombre}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent pointer-events-none" />

                {/* Badge ribbon */}
                {item.etiqueta && (
                  <div className="absolute top-3 left-3 z-10">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-md ${item.badgeColor}`}>
                      {item.etiqueta}
                    </span>
                  </div>
                )}
              </div>

              {/* Info Container */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="text-center">
                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-brand-yellow transition-colors leading-tight">
                    {item.nombre}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {item.descripcion}
                  </p>
                  <p className="text-lg sm:text-xl font-black text-brand-yellow font-display mt-2 tracking-tight">
                    ${item.precio.toLocaleString('es-CO')}
                  </p>
                </div>

                {/* AGREGAR AL PEDIDO button */}
                <button
                  type="button"
                  onClick={() => addToCart(item, 1)}
                  className="w-full py-2.5 px-4 rounded-xl bg-brand-yellow hover:bg-brand-yellowHover text-black font-black text-xs uppercase tracking-wider shadow-glow transition-all flex items-center justify-center gap-2 transform active:scale-95"
                >
                  <ShoppingCart className="w-3.5 h-3.5 fill-current" />
                  <span>AGREGAR AL PEDIDO</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
