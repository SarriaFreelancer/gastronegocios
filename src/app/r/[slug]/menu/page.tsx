'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useSearchParams } from 'next/navigation';
import { categories as initialCategories } from '@/data/categories';
import { products as initialProducts } from '@/data/products';
import { ProductCard } from '@/components/ui/ProductCard';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { CategorySidebar } from '@/components/menu/CategorySidebar';
import { CategoryComboBanner } from '@/components/menu/CategoryComboBanner';
import { Logo } from '@/components/ui/Logo';
import { useTenant } from '@/context/TenantContext';
import { getCategoryHeroImage } from '@/lib/category-images';
import { 
  Search, 
  Sparkles, 
  Filter, 
  UtensilsCrossed, 
  MessageCircle, 
  ArrowLeft,
  Clock, 
  MapPin, 
  Store
} from 'lucide-react';

export default function TenantMenuGeneralPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = ((params?.slug as string) || 'punto-g').toLowerCase().trim();
  const isPuntoG = slug === 'punto-g' || slug === 'puntog';
  const initialCategoryParam = searchParams.get('category') || 'todos';

  const { restaurant } = useTenant();

  const [restaurantName, setRestaurantName] = useState<string>(restaurant?.nombre || (isPuntoG ? 'PUNTO G' : 'Restaurante'));
  const [allCategories, setAllCategories] = useState<any[]>(isPuntoG ? initialCategories : []);
  const [allProducts, setAllProducts] = useState<any[]>(isPuntoG ? initialProducts : []);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryParam);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Sync restaurant name if tenant loads
  useEffect(() => {
    if (restaurant?.nombre) {
      setRestaurantName(restaurant.nombre);
    }
  }, [restaurant]);

  // Fetch categories & products strictly scoped to this tenant
  useEffect(() => {
    setLoading(true);
    let catsPromise = fetch(`/api/categories?restaurantSlug=${slug}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          if (data.length > 0) {
            setAllCategories(data);
          } else if (!isPuntoG) {
            setAllCategories([]);
          }
        }
      })
      .catch(() => {});

    let prodsPromise = fetch(`/api/products?restaurantSlug=${slug}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          if (data.length > 0) {
            setAllProducts(data);
          } else if (!isPuntoG) {
            setAllProducts([]);
          }
        }
      })
      .catch(() => {});

    Promise.all([catsPromise, prodsPromise]).finally(() => {
      setLoading(false);
    });
  }, [slug, isPuntoG]);

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
      if (p.disponibilidad === false) return false;

      const prodCat = allCategories.find((c) => c.slug === p.categoria || c.id === p.categoriaId);
      if (prodCat && prodCat.activo === false) return false;

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
        p.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.descripcion?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.ingredientes &&
          p.ingredientes.some((i: string) =>
            i.toLowerCase().includes(searchQuery.toLowerCase())
          ));

      return matchesCategory && matchesSearch;
    });
  }, [allProducts, selectedCategory, selectedSubcategory, searchQuery, allCategories]);

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

  // Schema.org JSON-LD for Restaurant Menu
  const jsonLd = useMemo(() => {
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return {
      '@context': 'https://schema.org',
      '@type': 'Menu',
      name: `Menú de ${restaurantName}`,
      description: restaurant?.descripcion || `Carta digital de ${restaurantName}`,
      url: `${siteUrl}/r/${slug}/menu`,
      hasMenuSection: mainCategories.map((cat) => ({
        '@type': 'MenuSection',
        name: cat.nombre,
        description: cat.descripcion || '',
      })),
    };
  }, [restaurantName, restaurant, slug, mainCategories]);

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center text-white pt-20">
        <div className="text-center space-y-4">
          <UtensilsCrossed 
            className="w-12 h-12 mx-auto animate-bounce" 
            style={{ color: 'var(--tenant-primary, #EAA622)' }}
          />
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            Cargando la carta de {restaurantName}...
          </p>
        </div>
      </div>
    );
  }

  // 2. Branded Empty State: When restaurant has 0 products configured yet
  if (allProducts.length === 0) {
    const phone = restaurant?.telefono || restaurant?.telefonoWhatsapp;
    return (
      <div className="min-h-screen bg-[#080808] text-white pt-28 pb-16 px-4">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="max-w-3xl mx-auto">
          {/* Card Container */}
          <div className="bg-[#121212] border border-[#242424] rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
            {/* Ambient Tenant Glow */}
            <div 
              className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-15 pointer-events-none"
              style={{ backgroundColor: 'var(--tenant-primary, #EAA622)' }}
            />

            <div className="relative z-10 space-y-6">
              {/* Tenant Logo or Badge */}
              <div className="flex justify-center">
                <Logo restaurant={restaurant} showSubtext={false} size="lg" />
              </div>

              {/* Status Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider"
                style={{ 
                  backgroundColor: 'rgba(234, 166, 34, 0.1)', 
                  borderColor: 'var(--tenant-primary, #EAA622)', 
                  color: 'var(--tenant-primary, #EAA622)' 
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Menú en Preparación</span>
              </div>

              {/* Title & Slogan */}
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight font-display">
                  ¡Estamos cocinando la carta de{' '}
                  <span style={{ color: 'var(--tenant-primary, #EAA622)' }}>
                    {restaurantName}
                  </span>!
                </h1>
                <p className="text-base text-gray-300 max-w-xl mx-auto">
                  {restaurant?.eslogan || 'Muy pronto podrás consultar todos nuestros deliciosos platos, combos y bebidas en línea.'}
                </p>
              </div>

              {/* Details & Contacts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto pt-4 text-left">
                {restaurant?.direccionCentral && (
                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-4 rounded-2xl flex items-start gap-3">
                    <MapPin className="w-5 h-5 shrink-0 mt-0.5 text-gray-400" />
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase">Ubicación</p>
                      <p className="text-xs font-semibold text-white">{restaurant.direccionCentral}, {restaurant.ciudad}</p>
                    </div>
                  </div>
                )}

                {restaurant?.horarioAtencion && (
                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-4 rounded-2xl flex items-start gap-3">
                    <Clock className="w-5 h-5 shrink-0 mt-0.5 text-gray-400" />
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase">Horario de Atención</p>
                      <p className="text-xs font-semibold text-white">{restaurant.horarioAtencion}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                <Link
                  href={`/r/${slug}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#1e1e1e] hover:bg-[#282828] text-white font-bold text-xs uppercase tracking-wider border border-gray-700 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver al Inicio</span>
                </Link>

                {phone && (
                  <a
                    href={`https://wa.me/57${phone}?text=${encodeURIComponent(
                      `¡Hola ${restaurantName}! Quisiera consultar sobre su menú y horarios.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-black text-xs uppercase tracking-wider shadow-lg transition transform hover:scale-105"
                    style={{
                      backgroundColor: 'var(--tenant-button, var(--tenant-primary, #EAA622))',
                      color: 'var(--tenant-button-text, #000000)',
                    }}
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Consultar por WhatsApp</span>
                  </a>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Normal Menu Page when products exist
  return (
    <div className="min-h-screen bg-[#080808] pt-24 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Dynamic Category Hero Header */}
      {currentCategoryObj ? (
        <div className="relative bg-gradient-to-r from-[#0d0d0d] via-[#141414] to-[#080808] border-b border-[#202020] overflow-hidden mb-8 py-8 transition-all duration-300">
          <div 
            className="absolute top-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-15 pointer-events-none"
            style={{ backgroundColor: 'var(--tenant-primary, #EAA622)' }}
          />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-7 space-y-2">
                <div 
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border"
                  style={{ 
                    backgroundColor: 'rgba(234, 166, 34, 0.1)', 
                    borderColor: 'var(--tenant-primary, #EAA622)', 
                    color: 'var(--tenant-primary, #EAA622)' 
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>NUESTRO MENÚ • {restaurantName}</span>
                </div>
                <div className="relative inline-block">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-white font-display tracking-tight">
                    {currentCategoryObj.nombre}
                  </h1>
                  <div 
                    className="w-full h-2.5 sm:h-3 rounded-full -mt-1 opacity-90 shadow-glow"
                    style={{ backgroundColor: 'var(--tenant-primary, #EAA622)' }}
                  />
                </div>
                <p className="text-sm sm:text-base text-gray-300 max-w-xl pt-2 font-medium">
                  {currentCategoryObj.descripcion || 'Descubre nuestras deliciosas opciones preparadas con los mejores ingredientes.'}
                </p>
              </div>
              {/* 3D Product Highlight without any circular blur */}
              <div className="md:col-span-5 flex flex-col items-center md:items-end">
                <div className="relative w-[260px] h-[210px] sm:w-[320px] sm:h-[250px] flex items-center justify-center animate-float">
                  <div className="relative w-full h-full select-none transition-transform duration-500 hover:scale-105">
                    <Image
                      key={currentCategoryObj.slug}
                      src={getCategoryHeroImage(currentCategoryObj, null)}
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
            <div 
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border"
              style={{ 
                backgroundColor: 'rgba(234, 166, 34, 0.1)', 
                borderColor: 'var(--tenant-primary, #EAA622)', 
                color: 'var(--tenant-primary, #EAA622)' 
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Carta Oficial • {restaurantName}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase text-white font-display tracking-tight">
              NUESTRO MENÚ{' '}
              <span className="italic" style={{ color: 'var(--tenant-primary, #EAA622)' }}>
                {restaurantName}
              </span>
            </h1>

            <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto">
              {restaurant?.descripcion || 'Descubre nuestras mejores recetas, preparadas artesanalmente con ingredientes de primera calidad.'}
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
              placeholder={`Buscar en la carta de ${restaurantName}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-full pl-11 pr-4 py-3 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-tenant-primary"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
          </div>

          {/* Row 1: Main Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start px-1 scroll-smooth">
            <button
              onClick={() => handleSelectCategory('todos')}
              className={`px-4 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedCategory === 'todos' && !selectedSubcategory
                  ? 'shadow-glow font-black'
                  : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#252525] hover:text-white'
              }`}
              style={
                selectedCategory === 'todos' && !selectedSubcategory
                  ? { backgroundColor: 'var(--tenant-primary, #EAA622)', color: 'var(--tenant-button-text, #000000)' }
                  : {}
              }
            >
              <span>Todos los Platos ({activeProductsCount})</span>
            </button>

            {mainCategories.map((cat) => {
              const isSelected = selectedCategory === cat.slug && !selectedSubcategory;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.slug)}
                  className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                    isSelected
                      ? 'shadow-glow font-black'
                      : selectedCategory === cat.slug
                      ? 'border font-bold'
                      : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#252525] hover:text-white'
                  }`}
                  style={
                    isSelected
                      ? { backgroundColor: 'var(--tenant-primary, #EAA622)', color: 'var(--tenant-button-text, #000000)' }
                      : selectedCategory === cat.slug
                      ? { borderColor: 'var(--tenant-primary, #EAA622)', color: 'var(--tenant-primary, #EAA622)' }
                      : {}
                  }
                >
                  <CategoryIcon
                    name={cat.icono}
                    size={14}
                    className={isSelected ? 'text-black' : 'text-tenant-primary'}
                  />
                  <span className="uppercase">{cat.nombre}</span>
                </button>
              );
            })}
          </div>

          {/* Row 2: Subcategories secondary filter chips if current category has subcategories */}
          {activeSubcategories.length > 0 && (
            <div className="pt-2 border-t border-[#222] flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mr-1">
                <Filter className="w-3.5 h-3.5" style={{ color: 'var(--tenant-primary, #EAA622)' }} />
                <span>Subcategorías:</span>
              </span>

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

              {activeSubcategories.map((sub) => {
                const isSelected = selectedSubcategory === sub.slug;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubcategory(sub.slug)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'shadow-glow font-black'
                        : 'bg-[#1e1e1e] text-gray-300 hover:text-white hover:bg-[#282828]'
                    }`}
                    style={
                      isSelected
                        ? { backgroundColor: 'var(--tenant-primary, #EAA622)', color: 'var(--tenant-button-text, #000000)' }
                        : {}
                    }
                  >
                    <CategoryIcon
                      name={sub.icono}
                      size={12}
                      className={isSelected ? 'text-black' : 'text-gray-400'}
                    />
                    <span>{sub.nombre}</span>
                  </button>
                );
              })}
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
                <strong className="uppercase" style={{ color: 'var(--tenant-primary, #EAA622)' }}>
                  {currentCategoryObj ? currentCategoryObj.nombre : 'Todo el Menú'}
                </strong>{' '}
                ({filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'})
              </span>
              
              {selectedSubcategory && (
                <button
                  onClick={() => setSelectedSubcategory(null)}
                  className="text-gray-500 hover:underline text-[11px]"
                  style={{ color: 'var(--tenant-primary, #EAA622)' }}
                >
                  Ver toda la categoría
                </button>
              )}
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-[#121212] border border-[#222] rounded-2xl p-12 text-center space-y-4">
                <div 
                  className="w-14 h-14 mx-auto rounded-full border flex items-center justify-center"
                  style={{ 
                    backgroundColor: 'rgba(234, 166, 34, 0.1)', 
                    borderColor: 'var(--tenant-primary, #EAA622)', 
                    color: 'var(--tenant-primary, #EAA622)' 
                  }}
                >
                  <Sparkles className="w-7 h-7" />
                </div>
                <p className="text-lg font-bold text-white">
                  {selectedSubcategory || selectedCategory !== 'todos'
                    ? `No hay platos activos en ${currentCategoryObj ? currentCategoryObj.nombre : 'esta sección'} en este momento.`
                    : 'No encontramos productos con ese término de búsqueda.'}
                </p>
                <p className="text-xs text-gray-400 max-w-md mx-auto">
                  {selectedSubcategory || selectedCategory !== 'todos'
                    ? 'Esta categoría existe normalmente en nuestra carta, pero los platos están temporalmente pausados. ¡Te invitamos a explorar las demás opciones!'
                    : 'Intenta con otra palabra clave o explora las categorías de nuestro menú.'}
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('todos');
                    setSelectedSubcategory(null);
                    setSearchQuery('');
                  }}
                  className="text-xs font-black px-6 py-2.5 rounded-full uppercase tracking-wider shadow-glow transition-colors"
                  style={{ 
                    backgroundColor: 'var(--tenant-button, var(--tenant-primary, #EAA622))', 
                    color: 'var(--tenant-button-text, #000000)' 
                  }}
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
