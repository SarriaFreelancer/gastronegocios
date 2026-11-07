'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { categories as initialCategories } from '@/data/categories';
import { products as initialProducts } from '@/data/products';
import { ProductCard } from '@/components/ui/ProductCard';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { CategorySidebar } from '@/components/menu/CategorySidebar';
import { CategoryComboBanner } from '@/components/menu/CategoryComboBanner';
import { Search, Sparkles, Filter } from 'lucide-react';

export default function MenuGeneralPage() {
  const searchParams = useSearchParams();
  const catParam = searchParams ? searchParams.get('category') : null;
  const [allCategories, setAllCategories] = useState<any[]>(initialCategories);
  const [allProducts, setAllProducts] = useState<any[]>(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState<string>(catParam || 'todos');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (catParam) {
      setSelectedCategory(catParam);
    }
  }, [catParam]);

  // Fetch from database API
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAllCategories(data);
        }
      })
      .catch(() => {});

    fetch('/api/products')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAllProducts(data);
        }
      })
      .catch(() => {});
  }, []);

  // Main categories (parentId == null and activo !== false)
  const mainCategories = useMemo(
    () => allCategories.filter((c) => !c.parentId && c.activo !== false),
    [allCategories]
  );

  // Subcategories of currently selected category (only active ones)
  const activeSubcategories = useMemo(() => {
    if (selectedCategory === 'todos') return [];
    const currentMain = allCategories.find(
      (c) => c.slug === selectedCategory && c.activo !== false
    );
    if (!currentMain) return [];
    return allCategories.filter(
      (c) =>
        (c.parentId === currentMain.id || c.parentId === currentMain.slug) &&
        c.activo !== false
    );
  }, [selectedCategory, allCategories]);

  const handleSelectCategory = (catSlug: string, subSlug?: string) => {
    setSelectedCategory(catSlug);
    setSelectedSubcategory(subSlug || null);
  };

  const activeProductsCount = useMemo(
    () => allProducts.filter((p) => p.disponibilidad !== false).length,
    [allProducts]
  );

  const filteredProducts = useMemo(() => {
    return allProducts.filter((p) => {
      // Si el plato fue apagado por el administrador, no se muestra a los clientes
      if (p.disponibilidad === false) return false;

      // Si la categoría padre del producto está inactiva, ocultarlo
      const prodCat = allCategories.find((c) => c.slug === p.categoria || c.id === p.categoriaId);
      if (prodCat && prodCat.activo === false) return false;

      // Si la subcategoría del producto está inactiva, ocultarlo
      if (p.subcategoria || p.subcategoriaId) {
        const prodSub = allCategories.find((c) => c.slug === p.subcategoria || c.id === p.subcategoriaId);
        if (prodSub && prodSub.activo === false) return false;
      }

      let matchesCategory = true;

      if (selectedCategory !== 'todos') {
        if (selectedSubcategory) {
          matchesCategory =
            p.subcategoria === selectedSubcategory ||
            p.categoria === selectedSubcategory;
        } else {
          matchesCategory =
            p.categoria === selectedCategory ||
            p.subcategoria === selectedCategory;
        }
      }

      const matchesSearch =
        !searchQuery.trim() ||
        p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.ingredientes &&
          p.ingredientes.some((i: string) =>
            i.toLowerCase().includes(searchQuery.toLowerCase())
          ));

      return matchesCategory && matchesSearch;
    });
  }, [allProducts, selectedCategory, selectedSubcategory, searchQuery]);

  // Current category metadata
  const currentCategoryObj = useMemo(() => {
    if (selectedSubcategory) {
      return allCategories.find((c) => c.slug === selectedSubcategory);
    }
    if (selectedCategory !== 'todos') {
      return allCategories.find((c) => c.slug === selectedCategory);
    }
    return null;
  }, [allCategories, selectedCategory, selectedSubcategory]);

  return (
    <div className="min-h-screen bg-[#080808] pt-24 pb-16">
      
      {/* Dynamic Category Hero Header */}
      {currentCategoryObj ? (
        <div className="relative bg-gradient-to-r from-[#0d0d0d] via-[#141414] to-[#080808] border-b border-[#202020] overflow-hidden mb-8 py-8 transition-all duration-300">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-yellow/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-7 space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>NUESTRO MENÚ • PUNTO G</span>
                </div>
                <div className="relative inline-block">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-white font-display tracking-tight">
                    {currentCategoryObj.nombre}
                  </h1>
                  <div className="w-full h-2.5 sm:h-3 bg-brand-yellow rounded-full -mt-1 opacity-90 shadow-glow" />
                </div>
                <p className="text-sm sm:text-base text-gray-300 max-w-xl pt-2 font-medium">
                  {currentCategoryObj.descripcion || 'Descubre nuestras deliciosas opciones preparadas al momento.'}
                </p>
              </div>
              {/* 3D Product Highlight without any circular blur */}
              <div className="md:col-span-5 flex flex-col items-center md:items-end">
                <div className="relative w-[260px] h-[210px] sm:w-[320px] sm:h-[250px] flex items-center justify-center animate-float">
                  <div className="relative w-full h-full select-none transition-transform duration-500 hover:scale-105">
                    <Image
                      key={currentCategoryObj.slug}
                      src="/images/assets/burger-hero-transparent.png"
                      alt={currentCategoryObj.nombre}
                      fill
                      priority
                      className="object-contain drop-shadow-[0_24px_30px_rgba(0,0,0,0.95)]"
                      sizes="(max-width: 768px) 260px, 320px"
                    />
                  </div>
                </div>
                {/* Horizontal ground shadow */}
                <div className="w-40 sm:w-56 h-3 bg-black/80 rounded-[100%] blur-sm -mt-3 md:mr-6 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative bg-gradient-to-r from-[#0c0c0c] via-[#141414] to-[#080808] border-b border-[#202020] py-10 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Carta Completa con Categorías y Subcategorías</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase text-white font-display tracking-tight">
              NUESTRO MENÚ <span className="text-brand-yellow italic">PUNTO G</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto">
              Hamburguesas artesanales, picadas para compartir, parrillas al carbón y la más refrescante barra de bebidas y cócteles.
            </p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Category Filter Pills & Search Bar */}
        <div className="bg-[#121212] border border-[#222] rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
          
          {/* Search Input */}
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="Buscar por plato, ingrediente o bebida (ej: monster, costilla, mojito)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-full pl-11 pr-4 py-3 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
          </div>

          {/* Row 1: Main Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start px-1 scroll-smooth">
            <button
              onClick={() => handleSelectCategory('todos')}
              className={`px-4 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedCategory === 'todos' && !selectedSubcategory
                  ? 'bg-brand-yellow text-black shadow-glow font-black'
                  : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#252525] hover:text-white'
              }`}
            >
              <span>Todos los Platos ({activeProductsCount})</span>
            </button>

            {mainCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.slug)}
                className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  selectedCategory === cat.slug && !selectedSubcategory
                    ? 'bg-brand-yellow text-black shadow-glow font-black'
                    : selectedCategory === cat.slug
                    ? 'bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/40 font-bold'
                    : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#252525] hover:text-white'
                }`}
              >
                <CategoryIcon
                  name={cat.icono}
                  size={14}
                  className={selectedCategory === cat.slug && !selectedSubcategory ? 'text-black' : 'text-brand-yellow'}
                />
                <span className="uppercase">{cat.nombre}</span>
              </button>
            ))}
          </div>

          {/* Row 2: Subcategories secondary filter chips if current category has subcategories */}
          {activeSubcategories.length > 0 && (
            <div className="pt-2 border-t border-[#222] flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mr-1">
                <Filter className="w-3.5 h-3.5 text-brand-yellow" />
                <span>Subcategorías:</span>
              </span>

              {/* All subcategories for current main category */}
              <button
                onClick={() => setSelectedSubcategory(null)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedSubcategory === null
                    ? 'bg-white text-black shadow-md'
                    : 'bg-[#1e1e1e] text-gray-400 hover:text-white hover:bg-[#282828]'
                }`}
              >
                <span>Todas</span>
              </button>

              {activeSubcategories.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubcategory(sub.slug)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedSubcategory === sub.slug
                      ? 'bg-brand-yellow text-black shadow-glow font-black'
                      : 'bg-[#1e1e1e] text-gray-300 hover:text-white hover:bg-[#282828]'
                  }`}
                >
                  <CategoryIcon
                    name={sub.icono}
                    size={12}
                    className={selectedSubcategory === sub.slug ? 'text-black' : 'text-gray-400'}
                  />
                  <span>{sub.nombre}</span>
                </button>
              ))}
            </div>
          )}

        </div>

        {/* Two-Column Layout: Sidebar on left + Products on right */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Lateral Category Menu (Sidebar) */}
          <CategorySidebar
            categoriesList={allCategories}
            currentSlug={selectedCategory}
            currentSubSlug={selectedSubcategory || undefined}
            onSelectCategory={handleSelectCategory}
            showAllOption={true}
          />

          {/* Main Content Area */}
          <div className="flex-1 w-full space-y-6">
            
            {/* Quick status bar */}
            <div className="flex items-center justify-between text-xs text-gray-400 border-b border-[#1f1f1f] pb-3">
              <span>
                Mostrando:{' '}
                <strong className="text-brand-yellow uppercase">
                  {currentCategoryObj ? currentCategoryObj.nombre : 'Todo el Menú'}
                </strong>{' '}
                ({filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'})
              </span>
              
              {selectedSubcategory && (
                <button
                  onClick={() => setSelectedSubcategory(null)}
                  className="text-gray-500 hover:text-brand-yellow underline text-[11px]"
                >
                  Ver toda la categoría
                </button>
              )}
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-[#121212] border border-[#222] rounded-2xl p-12 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-brand-yellow/10 border border-brand-yellow/30 flex items-center justify-center text-brand-yellow">
                  <Sparkles className="w-7 h-7" />
                </div>
                <p className="text-lg font-bold text-white">
                  {selectedSubcategory || selectedCategory !== 'todos'
                    ? `No hay platos activos en ${currentCategoryObj ? currentCategoryObj.nombre : 'esta sección'} en este momento.`
                    : 'No encontramos productos con ese término de búsqueda.'}
                </p>
                <p className="text-xs text-gray-400 max-w-md mx-auto">
                  {selectedSubcategory || selectedCategory !== 'todos'
                    ? 'Esta subcategoría existe normalmente en nuestra carta, pero los platos están temporalmente pausados o agotados. ¡Te invitamos a explorar las demás opciones!'
                    : 'Intenta con otra palabra clave o explora las categorías de nuestro menú.'}
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('todos');
                    setSelectedSubcategory(null);
                    setSearchQuery('');
                  }}
                  className="bg-brand-yellow text-black text-xs font-black px-6 py-2.5 rounded-full uppercase tracking-wider hover:bg-yellow-400 transition-colors shadow-glow"
                >
                  Ver todo el menú
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
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
}
