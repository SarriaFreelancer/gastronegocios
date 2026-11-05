'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Category, Product } from '@/types';
import { categories } from '@/data/categories';
import { products as allStaticProducts } from '@/data/products';
import { CategorySidebar } from '@/components/menu/CategorySidebar';
import { ProductCard } from '@/components/ui/ProductCard';
import { CategoryComboBanner } from '@/components/menu/CategoryComboBanner';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { ChevronDown, Search, ArrowUpDown, Filter, Sparkles } from 'lucide-react';
import { useTenant } from '@/context/TenantContext';

interface CategoryClientViewProps {
  category: Category;
  products?: Product[];
}

export const CategoryClientView: React.FC<CategoryClientViewProps> = ({
  category: initialCategory,
  products: initialProducts,
}) => {
  const { restaurant } = useTenant();
  const primaryColor = restaurant?.colorPrimario || '#EAA622';
  const buttonColor = restaurant?.colorBoton || primaryColor;
  const buttonTextColor = restaurant?.colorBotonTexto || '#000000';
  const allProducts = allStaticProducts;

  // Detect whether initialCategory is a subcategory or a main category
  const initialIsSub = Boolean(initialCategory.parentId);
  const initialParent = initialIsSub
    ? categories.find(
        (c) => c.id === initialCategory.parentId || c.slug === initialCategory.parentId
      )
    : null;

  // Active main category slug (e.g. 'comidas-rapidas', 'bebidas', 'platos-fuertes', 'combos')
  const [activeMainSlug, setActiveMainSlug] = useState<string>(
    initialParent ? initialParent.slug : initialCategory.slug
  );

  // Active subcategory slug (e.g. 'hamburguesas', 'cocteles', etc., or null for "all")
  const [activeSubSlug, setActiveSubSlug] = useState<string | null>(
    initialIsSub ? initialCategory.slug : null
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recomendados' | 'precio-menor' | 'precio-mayor' | 'nombre'>('recomendados');

  // Currently displayed category metadata for the Hero Banner and Title
  const currentDisplayCategory = useMemo(() => {
    if (activeSubSlug) {
      const sub = categories.find((c) => c.slug === activeSubSlug);
      if (sub) return sub;
    }
    const main = categories.find((c) => c.slug === activeMainSlug);
    return main || initialCategory;
  }, [activeMainSlug, activeSubSlug, initialCategory]);

  // Main category object
  const activeMainCategory = useMemo(() => {
    return categories.find((c) => c.slug === activeMainSlug) || initialCategory;
  }, [activeMainSlug, initialCategory]);

  // Subcategories belonging to the active main category
  const availableSubcategories = useMemo(() => {
    return categories.filter(
      (c) =>
        (c.parentId === activeMainCategory.id || c.parentId === activeMainCategory.slug) &&
        c.activo !== false
    );
  }, [activeMainCategory]);

  // Handler for category and subcategory selection
  const handleSelectCategory = (mainCatSlug: string, subSlug?: string) => {
    setActiveMainSlug(mainCatSlug);
    setActiveSubSlug(subSlug || null);
    setSearchQuery('');

    // Smoothly synchronize browser URL without full page reload
    if (typeof window !== 'undefined') {
      const targetSlug = subSlug || mainCatSlug;
      window.history.pushState(null, '', `/menu/${targetSlug}`);
    }
  };

  // Filter & Sort products from the whole catalog
  const filteredAndSortedProducts = useMemo(() => {
    let result = allProducts.filter((p) => {
      // Si el plato está inactivo / apagado, no mostrar en la carta
      if (p.disponibilidad === false) return false;

      // 1. Category / Subcategory Matching
      let matchesCategory = false;
      if (activeSubSlug) {
        matchesCategory = p.subcategoria === activeSubSlug || p.categoria === activeSubSlug;
      } else {
        matchesCategory =
          p.categoria === activeMainSlug ||
          p.subcategoria === activeMainSlug ||
          availableSubcategories.some((s) => s.slug === p.subcategoria);
      }

      // 2. Search query matching
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        p.nombre.toLowerCase().includes(query) ||
        p.descripcion.toLowerCase().includes(query) ||
        (p.ingredientes && p.ingredientes.some((i) => i.toLowerCase().includes(query)));

      return matchesCategory && matchesSearch;
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
  }, [allProducts, activeMainSlug, activeSubSlug, availableSubcategories, searchQuery, sortBy]);

  // Total products count in active main category
  const totalInMainCategory = useMemo(() => {
    return allProducts.filter(
      (p) =>
        p.categoria === activeMainSlug ||
        p.subcategoria === activeMainSlug ||
        availableSubcategories.some((s) => s.slug === p.subcategoria)
    ).length;
  }, [allProducts, activeMainSlug, availableSubcategories]);

  return (
    <div className="min-h-screen bg-[#080808] pt-24 pb-16">
      
      {/* 1. Dynamic Category Top Hero Banner */}
      <div className="relative bg-gradient-to-r from-[#0d0d0d] via-[#141414] to-[#080808] border-b border-[#202020] overflow-hidden mb-8 sm:mb-12 transition-all duration-300">
        <div 
          className="absolute top-0 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ backgroundColor: primaryColor }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Left Category Title & Intro */}
            <div className="md:col-span-7 space-y-2">
              <div 
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-black uppercase tracking-wider mb-1"
                style={{ 
                  backgroundColor: `${primaryColor}15`, 
                  borderColor: `${primaryColor}40`, 
                  color: primaryColor 
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>NUESTRO MENÚ • {activeMainCategory.nombre}</span>
              </div>
              
              <div className="relative inline-block">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase font-display tracking-tight drop-shadow-md">
                  {currentDisplayCategory.nombre}
                </h1>
                {/* Accent swash underline */}
                <div 
                  className="w-full h-2.5 sm:h-3 rounded-full -mt-1 sm:-mt-2 opacity-90 shadow-glow"
                  style={{ backgroundColor: primaryColor }}
                />
              </div>

              <p className="text-sm sm:text-base text-gray-300 max-w-xl pt-2 font-medium">
                {currentDisplayCategory.descripcion}
              </p>
            </div>

            {/* Right Hero Food Image */}
            <div className="md:col-span-5 flex justify-center md:justify-end">
              <div className="relative w-full max-w-[340px] aspect-[16/10] drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)] overflow-hidden rounded-2xl border border-[#262626]">
                <Image
                  key={currentDisplayCategory.imagen}
                  src={currentDisplayCategory.imagen}
                  alt={currentDisplayCategory.nombre}
                  fill
                  priority
                  className="object-cover rounded-2xl transition-all duration-500 hover:scale-105"
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
          <CategorySidebar
            currentSlug={activeMainSlug}
            currentSubSlug={activeSubSlug || undefined}
            onSelectCategory={handleSelectCategory}
          />

          {/* Right Column: Main Products Area */}
          <div className="flex-1 w-full space-y-6">
            
            {/* Top Toolbar: Category Title + Subtitle + Search + Sort */}
            <div className="bg-[#121212] border border-[#222] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
              
              {/* Category Info Header */}
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 shadow-md"
                  style={{ backgroundColor: primaryColor, color: buttonTextColor }}
                >
                  <CategoryIcon name={currentDisplayCategory.icono} size={20} className="text-black" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white font-display uppercase tracking-wide">
                    {currentDisplayCategory.nombre}
                  </h2>
                  <p className="text-xs text-gray-400">
                    {currentDisplayCategory.subtitulo || `${filteredAndSortedProducts.length} deliciosas opciones disponibles`}
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

            {/* Subcategories Filter Chips Toolbar */}
            {availableSubcategories.length > 0 && (
              <div className="bg-[#121212] border border-[#222] rounded-2xl p-3 sm:p-4 flex flex-wrap items-center gap-2 shadow-md">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mr-1">
                  <Filter className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                  <span>Subcategorías:</span>
                </span>

                {/* Button: All products in active main category */}
                <button
                  onClick={() => handleSelectCategory(activeMainSlug, undefined)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeSubSlug === null
                      ? 'shadow-md font-black'
                      : 'bg-[#1c1c1c] text-gray-300 hover:text-white hover:bg-[#252525]'
                  }`}
                  style={
                    activeSubSlug === null
                      ? { backgroundColor: buttonColor, color: buttonTextColor }
                      : {}
                  }
                >
                  Todas ({totalInMainCategory})
                </button>

                {availableSubcategories.map((sub) => {
                  const isSelected = activeSubSlug === sub.slug;
                  const count = allProducts.filter(
                    (p) => p.subcategoria === sub.slug || p.categoria === sub.slug
                  ).length;

                  return (
                    <button
                      key={sub.id}
                      onClick={() => handleSelectCategory(activeMainSlug, sub.slug)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'shadow-md font-black'
                          : 'bg-[#1c1c1c] text-gray-300 hover:text-white hover:bg-[#252525]'
                      }`}
                      style={
                        isSelected
                          ? { backgroundColor: buttonColor, color: buttonTextColor }
                          : {}
                      }
                    >
                      <CategoryIcon
                        name={sub.icono}
                        size={12}
                        className={isSelected ? 'text-black' : ''}
                      />
                      <span>{sub.nombre}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-black/20 text-black font-extrabold'
                            : 'bg-black/40 text-gray-400'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Products Grid: 3 columns on desktop */}
            {filteredAndSortedProducts.length === 0 ? (
              <div className="bg-[#121212] border border-[#222] rounded-2xl p-12 text-center">
                <p className="text-base font-bold text-gray-300">
                  No se encontraron productos disponibles en esta sección{searchQuery ? ` con "${searchQuery}"` : ''}.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    handleSelectCategory(activeMainSlug, undefined);
                  }}
                  className="mt-4 text-xs font-bold hover:underline"
                  style={{ color: primaryColor }}
                >
                  Ver todos los platos de {activeMainCategory.nombre}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAndSortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Bottom Promo Combo Banner */}
            <CategoryComboBanner />

          </div>

        </div>
      </div>

    </div>
  );
};

