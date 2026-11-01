'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Category, Product } from '@/types';
import { CategorySidebar } from '@/components/menu/CategorySidebar';
import { ProductCard } from '@/components/ui/ProductCard';
import { CategoryComboBanner } from '@/components/menu/CategoryComboBanner';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { ChevronDown, Search, ArrowUpDown } from 'lucide-react';

interface CategoryClientViewProps {
  category: Category;
  products: Product[];
}

export const CategoryClientView: React.FC<CategoryClientViewProps> = ({
  category,
  products,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recomendados' | 'precio-menor' | 'precio-mayor' | 'nombre'>('recomendados');

  // Filter & Sort products
  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter((p) => {
      const query = searchQuery.toLowerCase();
      return (
        p.nombre.toLowerCase().includes(query) ||
        p.descripcion.toLowerCase().includes(query) ||
        (p.ingredientes && p.ingredientes.some((i) => i.toLowerCase().includes(query)))
      );
    });

    switch (sortBy) {
      case 'precio-menor':
        result = [...result].sort((a, b) => a.precio - b.precio);
        break;
      case 'precio-mayor':
        result = [...result].sort((a, b) => b.precio - a.precio);
        break;
      case 'nombre':
        result = [...result].sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'recomendados':
      default:
        result = [...result].sort((a, b) => (a.orden || 99) - (b.orden || 99));
        break;
    }

    return result;
  }, [products, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-[#080808] pt-24 pb-16">
      
      {/* 1. Category Top Hero Banner (matches Image 2 top section) */}
      <div className="relative bg-gradient-to-r from-[#0d0d0d] via-[#141414] to-[#080808] border-b border-[#202020] overflow-hidden mb-8 sm:mb-12">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-yellow/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Left Category Title & Intro */}
            <div className="md:col-span-7 space-y-2">
              <span className="text-xs sm:text-sm font-black tracking-widest text-brand-yellow uppercase font-display">
                NUESTRO MENÚ
              </span>
              
              <div className="relative inline-block">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white uppercase font-display tracking-tight drop-shadow-md">
                  {category.nombre}
                </h1>
                {/* Yellow swash underline */}
                <div className="w-full h-2.5 sm:h-3 bg-brand-yellow rounded-full -mt-1 sm:-mt-2 opacity-90 shadow-glow" />
              </div>

              <p className="text-sm sm:text-base text-gray-300 max-w-xl pt-2 font-medium">
                {category.descripcion}
              </p>
            </div>

            {/* Right Hero Food Image (from approved design asset for burgers or high-res) */}
            <div className="md:col-span-5 flex justify-center md:justify-end">
              <div className="relative w-full max-w-[340px] aspect-[16/10] drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]">
                <Image
                  src={
                    category.slug === 'hamburguesas'
                      ? '/images/assets/menu-hero-burger.png'
                      : category.imagen
                  }
                  alt={category.nombre}
                  fill
                  priority
                  className="object-contain"
                  sizes="(max-width: 768px) 280px, 340px"
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Column: Category Sidebar */}
          <CategorySidebar currentSlug={category.slug} />

          {/* Right Column: Main Products Area */}
          <div className="flex-1 w-full space-y-6">
            
            {/* Top Toolbar: Category Title + Subtitle + Search + Sort */}
            <div className="bg-[#121212] border border-[#222] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
              
              {/* Category Info Header */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-yellow text-black flex items-center justify-center font-bold flex-shrink-0 shadow-glow">
                  <CategoryIcon name={category.icono} size={20} className="text-black" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white font-display uppercase tracking-wide">
                    {category.nombre}
                  </h2>
                  <p className="text-xs text-gray-400">
                    {category.subtitulo || `${filteredAndSortedProducts.length} deliciosas opciones`}
                  </p>
                </div>
              </div>

              {/* Filters & Sorting */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Search input */}
                <div className="relative w-full sm:w-48">
                  <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-[#2c2c2c] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow"
                  />
                  <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                </div>

                {/* Sort dropdown */}
                <div className="relative w-full sm:w-auto">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full sm:w-auto appearance-none bg-[#1c1c1c] border border-[#2c2c2c] rounded-xl pl-8 pr-8 py-2 text-xs text-white font-bold cursor-pointer focus:outline-none focus:border-brand-yellow"
                  >
                    <option value="recomendados">Ordenar por: Recomendados</option>
                    <option value="precio-menor">Menor precio</option>
                    <option value="precio-mayor">Mayor precio</option>
                    <option value="nombre">Por nombre</option>
                  </select>
                  <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5 pointer-events-none" />
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

            </div>

            {/* Products Grid: 3 columns on desktop, matching Image 2 */}
            {filteredAndSortedProducts.length === 0 ? (
              <div className="bg-[#121212] border border-[#222] rounded-2xl p-12 text-center">
                <p className="text-base font-bold text-gray-300">
                  No se encontraron productos con el término "{searchQuery}".
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 text-xs font-bold text-brand-yellow hover:underline"
                >
                  Limpiar búsqueda
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAndSortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Bottom Promo Combo Banner (matches Image 2 bottom section) */}
            <CategoryComboBanner />

          </div>

        </div>
      </div>

    </div>
  );
};
