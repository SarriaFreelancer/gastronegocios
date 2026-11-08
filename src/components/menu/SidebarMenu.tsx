'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useTenant } from '@/context/TenantContext';
import { ProductCustomizerModal } from '@/components/menu/ProductCustomizerModal';
import { 
  Search, 
  Plus, 
  Minus, 
  ShoppingCart, 
  Sparkles, 
  Flame, 
  Heart, 
  Check, 
  ChevronRight,
  UtensilsCrossed,
  Clock,
  Info,
  ChevronDown,
  SlidersHorizontal
} from 'lucide-react';

interface SidebarMenuProps {
  categories: any[];
  products: any[];
  restaurantName: string;
  slug: string;
}

export const SidebarMenu: React.FC<SidebarMenuProps> = ({
  categories,
  products,
  restaurantName,
  slug,
}) => {
  const { addToCart, items: cartItems, totalItems, totalPrice, setIsCartOpen } = useCart();
  const { restaurant } = useTenant();

  const primaryColor = restaurant?.colorPrimario || '#ffc928';
  const buttonColor = restaurant?.colorBoton || primaryColor;
  const buttonTextColor = restaurant?.colorBotonTexto || '#000000';

  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [customizerProduct, setCustomizerProduct] = useState<any | null>(null);

  // Group active root categories (parentId == null)
  const rootCategories = useMemo(
    () => categories.filter((c) => c.activo !== false && !c.parentId),
    [categories]
  );

  // Helper to find subcategories of a category
  const getSubcategories = (parentCat: any) => {
    return categories.filter(
      (c) => c.activo !== false && (c.parentId === parentCat.id || c.parentId === parentCat.slug)
    );
  };

  // Helper to check if a product belongs to a category or its subcategories
  const productBelongsToCategory = (p: any, catIdentifier: string | number) => {
    const catIdStr = String(catIdentifier).toLowerCase();
    
    // Direct match by slug or ID
    if (
      String(p.categoria).toLowerCase() === catIdStr ||
      String(p.category).toLowerCase() === catIdStr ||
      String(p.categoriaId) === catIdStr ||
      String(p.subcategoria).toLowerCase() === catIdStr ||
      String(p.subcategoriaId) === catIdStr
    ) {
      return true;
    }

    // Check if target is a root category, and this product belongs to one of its subcategories
    const parentCat = categories.find(
      (c) => String(c.id) === catIdStr || String(c.slug).toLowerCase() === catIdStr
    );
    if (parentCat) {
      const subs = getSubcategories(parentCat);
      return subs.some(
        (sub) =>
          String(p.subcategoria).toLowerCase() === String(sub.slug).toLowerCase() ||
          String(p.subcategoriaId) === String(sub.id) ||
          String(p.categoria).toLowerCase() === String(sub.slug).toLowerCase() ||
          String(p.categoriaId) === String(sub.id)
      );
    }

    return false;
  };

  // Filter products based on search & selected category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.disponibilidad === false || p.isAvailable === false) return false;

      // Category filter
      if (selectedCategory !== 'todos') {
        if (!productBelongsToCategory(p, selectedCategory)) {
          return false;
        }
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = (p.nombre || p.name || '').toLowerCase().includes(query);
        const matchesDesc = (p.descripcion || p.description || '').toLowerCase().includes(query);
        const matchesIng = p.ingredientes && Array.isArray(p.ingredientes)
          ? p.ingredientes.some((i: string) => i.toLowerCase().includes(query))
          : false;
        return matchesName || matchesDesc || matchesIng;
      }

      return true;
    });
  }, [products, selectedCategory, searchQuery, categories]);

  // Group filtered products by category for clean section headers
  const productsByCategory = useMemo(() => {
    if (selectedCategory !== 'todos') {
      const catObj = categories.find(
        (c) => String(c.slug).toLowerCase() === String(selectedCategory).toLowerCase() || String(c.id) === String(selectedCategory)
      );
      return [{
        category: catObj || { nombre: selectedCategory, name: selectedCategory, slug: selectedCategory },
        items: filteredProducts,
      }];
    }

    const grouped: { category: any; items: any[] }[] = [];
    rootCategories.forEach((cat) => {
      const catItems = filteredProducts.filter((p) => productBelongsToCategory(p, cat.slug || cat.id));
      if (catItems.length > 0) {
        grouped.push({ category: cat, items: catItems });
      }
    });

    // Unmatched products
    const unmatched = filteredProducts.filter(
      (p) => !rootCategories.some((cat) => productBelongsToCategory(p, cat.slug || cat.id))
    );
    if (unmatched.length > 0) {
      grouped.push({
        category: { nombre: 'Otras Especialidades', slug: 'otros' },
        items: unmatched,
      });
    }

    return grouped;
  }, [filteredProducts, rootCategories, selectedCategory, categories]);

  const handleAddToCart = (product: any) => {
    addToCart(product, 1);
  };

  const getItemCartQuantity = (productId: any) => {
    const item = cartItems.find((i) => i.product && (String(i.product.id) === String(productId) || (i.product as any).id === productId));
    return item ? item.quantity : 0;
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 pb-16">
      {/* Subheader Toolbar (Sticky right below main app Navbar) */}
      <div className="sticky top-16 sm:top-20 z-30 bg-[#10121a]/95 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-black text-sm">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <div>
                <h1 className="font-black text-sm sm:text-base text-white tracking-tight flex items-center gap-2">
                  <span>{restaurantName}</span>
                  <span className="text-[10px] bg-orange-500/20 text-orange-400 font-bold px-2 py-0.5 rounded-full border border-orange-500/30 uppercase tracking-widest">
                    Menú Lateral
                  </span>
                </h1>
              </div>
            </div>

            {/* Platos count mobile badge */}
            <span className="text-xs text-slate-400 font-mono sm:hidden">
              {filteredProducts.length} platos
            </span>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72 md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por plato, ingrediente o bebida..."
              className="w-full bg-[#181b26] border border-slate-700/60 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Mobile Horizontal Category Bar (Visible only on mobile / tablets < lg) */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto pt-3 pb-1 scrollbar-none scroll-smooth">
          <button
            type="button"
            onClick={() => setSelectedCategory('todos')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCategory === 'todos'
                ? 'bg-orange-500 text-slate-950 font-black shadow-md shadow-orange-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Todos ({products.length})</span>
          </button>

          {rootCategories.map((cat) => {
            const count = products.filter((p) => productBelongsToCategory(p, cat.slug || cat.id)).length;
            const isSelected = selectedCategory === cat.slug || String(selectedCategory) === String(cat.id);

            return (
              <button
                key={cat.id || cat.slug}
                type="button"
                onClick={() => setSelectedCategory(cat.slug || cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-orange-500 text-slate-950 font-black shadow-md shadow-orange-500/20'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white'
                }`}
              >
                <span>{cat.nombre || cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* DESKTOP SIDEBAR: Sticky Categories on Left */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-36 bg-[#12141c] border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <UtensilsCrossed className="w-3.5 h-3.5 text-orange-400" />
                <span>Categorías de la Carta</span>
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {products.length} platos
              </span>
            </div>

            <nav className="space-y-1 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
              {/* All Items Option */}
              <button
                type="button"
                onClick={() => setSelectedCategory('todos')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  selectedCategory === 'todos'
                    ? 'bg-orange-500 text-slate-950 font-black shadow-lg shadow-orange-500/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Todos los platos</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                  selectedCategory === 'todos' ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                }`}>
                  {products.length}
                </span>
              </button>

              {/* Category Tree (Root categories + subcategories) */}
              {rootCategories.map((cat) => {
                const count = products.filter((p) => productBelongsToCategory(p, cat.slug || cat.id)).length;
                const isSelected = selectedCategory === cat.slug || String(selectedCategory) === String(cat.id);
                const subcats = getSubcategories(cat);

                return (
                  <div key={cat.id || cat.slug} className="space-y-0.5">
                    <button
                      type="button"
                      onClick={() => setSelectedCategory(cat.slug || cat.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                        isSelected
                          ? 'bg-orange-500 text-slate-950 font-black shadow-lg shadow-orange-500/20'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        {cat.imagen || cat.imageUrl ? (
                          <div className="w-5 h-5 rounded-md overflow-hidden relative flex-shrink-0">
                            <Image
                              src={cat.imagen || cat.imageUrl}
                              alt={cat.nombre}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <span className="text-orange-400 font-black text-sm">•</span>
                        )}
                        <span className="truncate">{cat.nombre || cat.name}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                        isSelected ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {count}
                      </span>
                    </button>

                    {/* Subcategories (Indented under main category) */}
                    {subcats.length > 0 && (
                      <div className="pl-4 space-y-0.5 border-l-2 border-slate-800 ml-3 py-0.5">
                        {subcats.map((sub) => {
                          const subCount = products.filter((p) => productBelongsToCategory(p, sub.slug || sub.id)).length;
                          const isSubSelected = selectedCategory === sub.slug || String(selectedCategory) === String(sub.id);

                          return (
                            <button
                              key={sub.id || sub.slug}
                              type="button"
                              onClick={() => setSelectedCategory(sub.slug || sub.id)}
                              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all ${
                                isSubSelected
                                  ? 'bg-orange-500/20 text-orange-400 font-black border border-orange-500/40'
                                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                              }`}
                            >
                              <span className="truncate">{sub.nombre || sub.name}</span>
                              <span className="text-[10px] text-slate-500 font-mono">{subCount}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Quick Quality Badge */}
            <div className="bg-gradient-to-br from-orange-500/15 to-amber-500/5 border border-orange-500/20 rounded-xl p-3 text-xs space-y-1.5">
              <div className="flex items-center space-x-1.5 text-orange-400 font-bold">
                <Flame className="w-4 h-4" />
                <span>Ingredientes Frescos y Al Carbón</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Preparados al instante con los estándares de sabor artesanal que te encantan.
              </p>
            </div>
          </aside>

          {/* MAIN PRODUCT AREA: Sections with Grid Cards */}
          <main className="lg:col-span-9 space-y-10">
            {productsByCategory.length === 0 ? (
              <div className="text-center py-20 bg-[#12141c] rounded-2xl border border-slate-800 p-8 space-y-3">
                <UtensilsCrossed className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-300">No se encontraron productos</h3>
                <p className="text-xs text-slate-500">
                  Prueba buscando con otro término o selecciona otra categoría de la carta.
                </p>
                <button
                  type="button"
                  onClick={() => { setSelectedCategory('todos'); setSearchQuery(''); }}
                  className="mt-3 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-xs font-bold rounded-xl text-slate-950 transition-all shadow-md"
                >
                  Ver toda la carta
                </button>
              </div>
            ) : (
              productsByCategory.map((group) => (
                <section key={group.category.slug || group.category.nombre} className="space-y-4">
                  {/* Category Section Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-orange-500" />
                      <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                        {group.category.nombre || group.category.name}
                      </h2>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">
                      {group.items.length} {group.items.length === 1 ? 'opción' : 'opciones'}
                    </span>
                  </div>

                  {/* Products Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.items.map((prod) => {
                      const name = prod.nombre || prod.name;
                      const price = Number(prod.precio || prod.price || 0);
                      const desc = prod.descripcion || prod.description || '';
                      const img = prod.imagen || prod.imageUrl || '/images/placeholder.jpg';
                      const cartQty = getItemCartQuantity(prod.id);
                      const isFeatured = prod.destacado || prod.isFeatured || prod.etiqueta === 'MÁS VENDIDO' || prod.etiqueta === 'RECOMENDADO';

                      return (
                        <div
                          key={prod.id}
                          className="bg-[#12141c] hover:bg-[#161922] border border-slate-800/80 hover:border-slate-700 rounded-2xl p-3.5 transition-all duration-200 flex flex-col justify-between group shadow-sm hover:shadow-xl relative overflow-hidden"
                        >
                          {/* Featured Tag */}
                          {isFeatured && (
                            <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-md flex items-center space-x-1">
                              <Sparkles className="w-3 h-3" />
                              <span>{prod.etiqueta || 'DESTACADO'}</span>
                            </div>
                          )}

                          <div className="flex space-x-3.5">
                            {/* Product Image */}
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden relative flex-shrink-0 bg-slate-900 border border-slate-800">
                              <Image
                                src={img}
                                alt={name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                              <div>
                                <h3 className="font-bold text-sm sm:text-base text-white tracking-tight group-hover:text-orange-400 transition-colors line-clamp-1">
                                  {name}
                                </h3>
                                {desc && (
                                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                    {desc}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/60 gap-2">
                                <span className="font-extrabold text-sm sm:text-base text-white font-mono">
                                  ${price.toLocaleString('es-CO')}
                                </span>

                                {/* Action Buttons: Toppings & Agregar */}
                                <div className="flex items-center space-x-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setCustomizerProduct(prod)}
                                    className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-orange-500/60 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                                    title="Personalizar toppings, adiciones y salsas"
                                  >
                                    <SlidersHorizontal className="w-3.5 h-3.5 text-orange-400" />
                                    <span className="hidden sm:inline">Toppings</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleAddToCart(prod)}
                                    className="flex items-center space-x-1.5 bg-orange-500 hover:bg-orange-400 text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs transition-all shadow-md active:scale-95"
                                  >
                                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                                    <span>Agregar</span>
                                    {cartQty > 0 && (
                                      <span className="ml-1 w-4 h-4 rounded-full bg-slate-950 text-orange-400 text-[10px] font-black flex items-center justify-center">
                                        {cartQty}
                                      </span>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))
            )}
          </main>
        </div>
      </div>

      {/* Modal para elegir Toppings, Adiciones y Salsas */}
      {customizerProduct && (
        <ProductCustomizerModal
          isOpen={Boolean(customizerProduct)}
          onClose={() => setCustomizerProduct(null)}
          product={customizerProduct}
        />
      )}
    </div>
  );
};
