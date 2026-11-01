'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { categories } from '@/data/categories';
import { products } from '@/data/products';
import { ProductCard } from '@/components/ui/ProductCard';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { CategoryComboBanner } from '@/components/menu/CategoryComboBanner';
import { Search, ArrowRight, Sparkles } from 'lucide-react';

export default function MenuGeneralPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === 'todos' || p.categoria === selectedCategory;
      const matchesSearch =
        p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.ingredientes &&
          p.ingredientes.some((i) =>
            i.toLowerCase().includes(searchQuery.toLowerCase())
          ));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#080808] pt-24 pb-16">
      
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-[#0c0c0c] via-[#141414] to-[#080808] border-b border-[#202020] py-12 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Carta Completa</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase text-white font-display tracking-tight">
            NUESTRO MENÚ <span className="text-brand-yellow italic">PUNTO G</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto">
            Desde las hamburguesas más jugosas hasta picadas abundantes, parrillas al carbón y sodas artesanales. Selecciona tus favoritos y haz tu pedido en segundos.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Category Filter Pills & Search Bar */}
        <div className="bg-[#121212] border border-[#222] rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
          
          {/* Search Input */}
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="Buscar en todo el menú (ej: doble carne, costilla, mojito...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-full pl-11 pr-4 py-3 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start px-1 scroll-smooth">
            <button
              onClick={() => setSelectedCategory('todos')}
              className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedCategory === 'todos'
                  ? 'bg-brand-yellow text-black shadow-glow'
                  : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#252525] hover:text-white'
              }`}
            >
              <span>Todos ({products.length})</span>
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  selectedCategory === cat.slug
                    ? 'bg-brand-yellow text-black shadow-glow font-black'
                    : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#252525] hover:text-white'
                }`}
              >
                <CategoryIcon
                  name={cat.icono}
                  size={14}
                  className={selectedCategory === cat.slug ? 'text-black' : 'text-gray-400'}
                />
                <span>{cat.nombre}</span>
              </button>
            ))}
          </div>

        </div>

        {/* Quick category links banner */}
        {selectedCategory === 'todos' && !searchQuery && (
          <div className="flex items-center justify-between text-xs text-gray-400 border-b border-[#1f1f1f] pb-3">
            <span>Explorando todas las categorías ({products.length} productos)</span>
            <span className="text-brand-yellow font-bold">Haz clic en cualquier categoría para ver su página dedicada</span>
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-[#121212] border border-[#222] rounded-2xl p-12 text-center">
            <p className="text-lg font-bold text-white mb-2">No encontramos platos que coincidan</p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
              Intenta con otra palabra clave o selecciona otra categoría de nuestro menú.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('todos');
                setSearchQuery('');
              }}
              className="bg-brand-yellow text-black font-extrabold text-xs px-5 py-2.5 rounded-full"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Bottom Combo Promo */}
        <CategoryComboBanner />

      </div>
    </div>
  );
}
