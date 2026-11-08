'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useTenant } from '@/context/TenantContext';
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
  Info
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
  const { addToCart, items: cartItems } = useCart();
  const { restaurant } = useTenant();

  const primaryColor = restaurant?.colorPrimario || '#F97316';
  const buttonColor = restaurant?.colorBoton || primaryColor;
  const buttonTextColor = restaurant?.colorBotonTexto || '#000000';

  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedItemNotice, setAddedItemNotice] = useState<string | null>(null);

  // Group active categories
  const activeCategories = useMemo(
    () => categories.filter((c) => c.activo !== false && !c.parentId),
    [categories]
  );

  // Filter products based on search & category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.disponibilidad === false || p.isAvailable === false) return false;

      // Category filter
      if (selectedCategory !== 'todos') {
        const matchesCat =
          p.categoria === selectedCategory ||
          p.category === selectedCategory ||
          p.categoriaId === selectedCategory;
        if (!matchesCat) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = (p.nombre || p.name || '').toLowerCase().includes(query);
        const matchesDesc = (p.descripcion || p.description || '').toLowerCase().includes(query);
        return matchesName || matchesDesc;
      }

      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  // Group filtered products by category for section headers
  const productsByCategory = useMemo(() => {
    if (selectedCategory !== 'todos') {
      const catObj = activeCategories.find((c) => c.slug === selectedCategory || c.id === selectedCategory);
      return [{
        category: catObj || { nombre: selectedCategory, name: selectedCategory, slug: selectedCategory },
        items: filteredProducts,
      }];
    }

    const grouped: { category: any; items: any[] }[] = [];
    activeCategories.forEach((cat) => {
      const catItems = filteredProducts.filter(
        (p) => p.categoria === cat.slug || p.category === cat.slug || p.categoriaId === cat.id
      );
      if (catItems.length > 0) {
        grouped.push({ category: cat, items: catItems });
      }
    });

    // Items without a matching active category
    const unmatched = filteredProducts.filter(
      (p) => !activeCategories.some((cat) => p.categoria === cat.slug || p.category === cat.slug || p.categoriaId === cat.id)
    );
    if (unmatched.length > 0) {
      grouped.push({
        category: { nombre: 'Otras Especialidades', slug: 'otros' },
        items: unmatched,
      });
    }

    return grouped;
  }, [filteredProducts, activeCategories, selectedCategory]);

  const handleAddToCart = (product: any) => {
    addToCart(product, 1);
    setAddedItemNotice(product.nombre || product.name);
    setTimeout(() => setAddedItemNotice(null), 2000);
  };

  const getItemCartQuantity = (productId: any) => {
    const item = cartItems.find((i) => i.product && (String(i.product.id) === String(productId) || (i.product as any).id === productId));
    return item ? item.quantity : 0;
  };

  return (
    <div className="min-h-screen bg-[#0c0d12] text-slate-100 pb-20">
      {/* Toast Notification */}
      {addedItemNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 animate-bounce">
          <Check className="w-5 h-5" />
          <span>¡{addedItemNotice} agregado al pedido!</span>
        </div>
      )}

      {/* Top Banner / Restaurant Header */}
      <header className="sticky top-0 z-40 bg-[#12141c]/95 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 font-black text-xl">
            {restaurantName.charAt(0)}
          </div>
          <div>
            <h1 className="font-extrabold text-base lg:text-lg tracking-tight text-white flex items-center space-x-2">
              <span>{restaurantName}</span>
              <span className="text-[10px] bg-orange-500/20 text-orange-400 font-bold px-2 py-0.5 rounded-full border border-orange-500/30 uppercase tracking-widest">
                Menú Lateral
              </span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              Carta digital gastronómica interactiva
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-44 sm:w-72 md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar hamburguesa, bebida..."
            className="w-full bg-[#1b1e2a] border border-slate-700/60 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-all"
          />
        </div>
      </header>

      {/* Main Content Layout with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR: Categories Navigation */}
          <aside className="lg:col-span-3 sticky top-20 bg-[#12141c] border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <UtensilsCrossed className="w-3.5 h-3.5 text-orange-400" />
                <span>Categorías de la Carta</span>
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {products.length} platos
              </span>
            </div>

            <nav className="space-y-1.5 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => setSelectedCategory('todos')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  selectedCategory === 'todos'
                    ? 'bg-orange-500 text-slate-950 font-bold shadow-lg shadow-orange-500/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Todos los platos</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  selectedCategory === 'todos' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  {products.length}
                </span>
              </button>

              {activeCategories.map((cat) => {
                const count = products.filter(
                  (p) => p.categoria === cat.slug || p.category === cat.slug || p.categoriaId === cat.id
                ).length;
                const isSelected = selectedCategory === cat.slug || selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id || cat.slug}
                    type="button"
                    onClick={() => setSelectedCategory(cat.slug || cat.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                      isSelected
                        ? 'bg-orange-500 text-slate-950 font-bold shadow-lg shadow-orange-500/20'
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
                        <span className="text-orange-400 font-bold">•</span>
                      )}
                      <span className="truncate">{cat.nombre || cat.name}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Quick Promo Card in Sidebar */}
            <div className="bg-gradient-to-br from-orange-500/15 to-amber-500/5 border border-orange-500/20 rounded-xl p-3 text-xs space-y-1.5 hidden lg:block">
              <div className="flex items-center space-x-1.5 text-orange-400 font-bold">
                <Flame className="w-4 h-4" />
                <span>¡Pedido directo al chef!</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Cada plato es preparado fresco al momento con los más altos estándares de calidad.
              </p>
            </div>
          </aside>

          {/* RIGHT AREA: Products grouped by Sections */}
          <main className="lg:col-span-9 space-y-10">
            {productsByCategory.length === 0 ? (
              <div className="text-center py-20 bg-[#12141c] rounded-2xl border border-slate-800 p-8 space-y-3">
                <UtensilsCrossed className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-300">No se encontraron productos</h3>
                <p className="text-xs text-slate-500">
                  Prueba buscando con otro término o selecciona otra categoría.
                </p>
                <button
                  type="button"
                  onClick={() => { setSelectedCategory('todos'); setSearchQuery(''); }}
                  className="mt-3 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-white transition-all"
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
                      const isFeatured = prod.destacado || prod.isFeatured;

                      return (
                        <div
                          key={prod.id}
                          className="bg-[#12141c] hover:bg-[#161922] border border-slate-800/80 hover:border-slate-700 rounded-2xl p-3.5 transition-all duration-200 flex flex-col justify-between group shadow-sm hover:shadow-xl relative overflow-hidden"
                        >
                          {/* Highlight Tag */}
                          {isFeatured && (
                            <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-md flex items-center space-x-1">
                              <Sparkles className="w-3 h-3" />
                              <span>DESTACADO</span>
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

                              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/60">
                                <span className="font-extrabold text-sm sm:text-base text-white font-mono">
                                  ${price.toLocaleString('es-CO')}
                                </span>

                                {/* Add to Cart Action */}
                                <button
                                  type="button"
                                  onClick={() => handleAddToCart(prod)}
                                  className="flex items-center space-x-1.5 bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs transition-all shadow-md active:scale-95"
                                >
                                  <Plus className="w-3.5 h-3.5" />
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
                      );
                    })}
                  </div>
                </section>
              ))
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
