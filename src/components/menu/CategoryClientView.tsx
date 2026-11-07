'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Category, Product } from '@/types';
import { categories as defaultStaticCategories } from '@/data/categories';
import { products as allStaticProducts } from '@/data/products';
import { CategorySidebar } from '@/components/menu/CategorySidebar';
import { ProductCard } from '@/components/ui/ProductCard';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { ChevronDown, Search, ArrowUpDown, Filter, Sparkles } from 'lucide-react';
import { useTenant } from '@/context/TenantContext';

interface CategoryClientViewProps {
  category: Category;
  products?: Product[];
  categoriesList?: any[];
  tenantSlug?: string;
  initialSubSlug?: string;
}

export const CategoryClientView: React.FC<CategoryClientViewProps> = ({
  category: initialCategory,
  products: initialProducts,
  categoriesList: initialCategoriesList,
  tenantSlug,
  initialSubSlug,
}) => {
  const { restaurant } = useTenant();
  const primaryColor = restaurant?.colorPrimario || '#EAA622';
  const buttonColor = restaurant?.colorBoton || primaryColor;
  const buttonTextColor = restaurant?.colorBotonTexto || '#000000';

  // Usar categorías provistas o fallback a default
  const categoriesList = useMemo(() => {
    if (initialCategoriesList && initialCategoriesList.length > 0) {
      return initialCategoriesList;
    }
    return defaultStaticCategories;
  }, [initialCategoriesList]);

  // Usar productos provistos o fallback a estáticos
  const allProducts = useMemo(() => {
    if (initialProducts && initialProducts.length > 0) {
      return initialProducts;
    }
    return allStaticProducts;
  }, [initialProducts]);

  // Detect whether initialCategory is a subcategory or a main category
  const initialIsSub = Boolean(initialCategory.parentId);
  const initialParent = initialIsSub
    ? categoriesList.find(
        (c) => c.id === initialCategory.parentId || c.slug === initialCategory.parentId
      )
    : null;

  // Active main category slug
  const [activeMainSlug, setActiveMainSlug] = useState<string>(
    initialParent ? initialParent.slug : initialCategory.slug
  );

  // Active subcategory slug (e.g. 'hamburguesas', etc., or null for "all")
  const [activeSubSlug, setActiveSubSlug] = useState<string | null>(
    initialSubSlug || (initialIsSub ? initialCategory.slug : null)
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recomendados' | 'precio-menor' | 'precio-mayor' | 'nombre'>('recomendados');

  // Currently displayed category metadata for the Hero Banner and Title
  const currentDisplayCategory = useMemo(() => {
    if (activeSubSlug) {
      const sub = categoriesList.find((c) => c.slug === activeSubSlug);
      if (sub) return sub;
    }
    const main = categoriesList.find((c) => c.slug === activeMainSlug);
    return main || initialCategory;
  }, [activeMainSlug, activeSubSlug, initialCategory, categoriesList]);

  // Featured hero image for the category banner (clean 3D transparent product asset)
  const heroImageSrc = useMemo(() => {
    return '/images/assets/burger-hero-transparent.png';
  }, []);

  // Main category object
  const activeMainCategory = useMemo(() => {
    return categoriesList.find((c) => c.slug === activeMainSlug) || initialCategory;
  }, [activeMainSlug, initialCategory, categoriesList]);

  // Subcategories belonging to the active main category
  const availableSubcategories = useMemo(() => {
    return categoriesList.filter(
      (c) =>
        (c.parentId === activeMainCategory.id || c.parentId === activeMainCategory.slug) &&
        c.activo !== false
    );
  }, [activeMainCategory, categoriesList]);

  // Handler for category and subcategory selection
  const handleSelectCategory = (mainCatSlug: string, subSlug?: string) => {
    setActiveMainSlug(mainCatSlug);
    setActiveSubSlug(subSlug || null);
    setSearchQuery('');

    // Smoothly synchronize browser URL without full page reload
    if (typeof window !== 'undefined') {
      const targetSlug = subSlug || mainCatSlug;
      const targetUrl = tenantSlug && tenantSlug !== 'punto-g' && tenantSlug !== 'puntog'
        ? `/r/${tenantSlug}/menu/${targetSlug}`
        : `/menu/${targetSlug}`;
      window.history.pushState(null, '', targetUrl);
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
        matchesCategory =
          p.subcategoria === activeSubSlug ||
          p.categoria === activeSubSlug ||
          (p as any).subcategoriaSlug === activeSubSlug;
      } else {
        matchesCategory =
          p.categoria === activeMainSlug ||
          p.subcategoria === activeMainSlug ||
          p.categoriaId === activeMainCategory.id ||
          availableSubcategories.some((s) => s.slug === p.subcategoria || s.id === p.subcategoriaId);
      }

      // 2. Search query matching
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        p.nombre?.toLowerCase().includes(query) ||
        p.descripcion?.toLowerCase().includes(query) ||
        (p.ingredientes && p.ingredientes.some((i: string) => i.toLowerCase().includes(query)));

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
        result = [...result].sort((a, b) => ((a as any).orden || 99) - ((b as any).orden || 99));
        break;
    }

    return result;
  }, [allProducts, activeMainSlug, activeSubSlug, activeMainCategory, availableSubcategories, searchQuery, sortBy]);

  // Total products count in active main category
  const totalInMainCategory = useMemo(() => {
    return allProducts.filter(
      (p) =>
        p.categoria === activeMainSlug ||
        p.subcategoria === activeMainSlug ||
        p.categoriaId === activeMainCategory.id ||
        availableSubcategories.some((s) => s.slug === p.subcategoria || s.id === p.subcategoriaId)
    ).length;
  }, [allProducts, activeMainSlug, activeMainCategory, availableSubcategories]);

  return (
    <div className="min-h-screen bg-[#080808] pt-24 pb-16">
      
      {/* 1. Dynamic Category Top Hero Banner */}
      <div className="relative bg-gradient-to-r from-[#0d0d0d] via-[#141414] to-[#080808] border-b border-[#202020] overflow-hidden mb-8 sm:mb-12 transition-all duration-300">
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

            {/* Right Hero Food Image: 3D Product Highlight without any circular blur */}
            <div className="md:col-span-5 flex flex-col items-center md:items-end">
              <div className="relative w-[260px] h-[210px] sm:w-[320px] sm:h-[250px] flex items-center justify-center animate-float">
                <div className="relative w-full h-full select-none transition-transform duration-500 hover:scale-105">
                  <Image
                    key={heroImageSrc}
                    src={heroImageSrc}
                    alt={currentDisplayCategory.nombre}
                    fill
                    priority
                    className="object-contain drop-shadow-[0_24px_30px_rgba(0,0,0,0.95)]"
                    sizes="(max-width: 768px) 260px, 320px"
                  />
                </div>
              </div>
              {/* Subtle ground shadow */}
              <div className="w-40 sm:w-56 h-3 bg-black/80 rounded-[100%] blur-sm -mt-3 md:mr-6 pointer-events-none" />
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
            categoriesList={categoriesList}
            tenantSlug={tenantSlug}
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
                  <CategoryIcon name={currentDisplayCategory.icono} size={20} className="text-current" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white font-display uppercase tracking-wide">
                    {currentDisplayCategory.nombre}
                  </h2>
                  <p className="text-xs text-gray-400">
                    {(currentDisplayCategory as any).subtitulo || `${filteredAndSortedProducts.length} deliciosas opciones disponibles`}
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
                    className="w-full bg-[#1c1c1c] border border-[#2c2c2c] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
                    style={{ borderColor: searchQuery ? primaryColor : undefined }}
                  />
                  <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                </div>

                {/* Sort dropdown */}
                <div className="relative w-full sm:w-auto">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full sm:w-auto appearance-none bg-[#1c1c1c] border border-[#2c2c2c] rounded-xl pl-8 pr-8 py-2 text-xs text-white font-bold cursor-pointer focus:outline-none"
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
                    (p) =>
                      p.subcategoria === sub.slug ||
                      p.categoria === sub.slug ||
                      p.subcategoriaId === sub.id ||
                      (p as any).subcategoriaSlug === sub.slug
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
                        className={isSelected ? 'text-current' : ''}
                      />
                      <span>{sub.nombre}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-black/20 text-current font-extrabold'
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

            {/* Products Grid */}
            {filteredAndSortedProducts.length === 0 ? (
              <div className="bg-[#121212] border border-[#222] rounded-2xl p-12 text-center space-y-4">
                <div 
                  className="w-12 h-12 mx-auto rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                >
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">No encontramos productos en esta sección</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Prueba seleccionando otra subcategoría o cambiando tu búsqueda.
                </p>
                <button
                  onClick={() => {
                    setActiveSubSlug(null);
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl font-bold text-xs uppercase"
                  style={{ backgroundColor: buttonColor, color: buttonTextColor }}
                >
                  Ver todos los platos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredAndSortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

          </div>

        </div>
      </div>

    </div>
  );
};
