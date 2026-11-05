'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { promotions as initialPromotions } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { Check, ShoppingCart, Sparkles, Tag, Utensils } from 'lucide-react';
import { restaurantInfo } from '@/data/restaurant-info';

interface PromoDisplayItem {
  id: string | number;
  nombre: string;
  slug?: string;
  descripcion: string;
  precio: number;
  precioAntes?: number;
  imagen: string;
  etiqueta?: string;
  incluye: string[];
  originalProduct?: any;
}

export default function TenantPromocionesPage() {
  const params = useParams();
  const slug = ((params?.slug as string) || 'punto-g').toLowerCase().trim();
  const { addToCart, setIsCartOpen } = useCart();
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Consultar productos reales de la base de datos para este restaurante
  useEffect(() => {
    fetch(`/api/products?restaurantSlug=${slug}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setDbProducts(data);
        }
      })
      .catch((err) => console.error('Error fetching promo products:', err))
      .finally(() => setLoading(false));
  }, [slug]);

  // Construir la lista de promociones unificando los combos de la base de datos y promociones base
  const allPromos = useMemo<PromoDisplayItem[]>(() => {
    const promoKeywords = ['PROMO', 'COMBO', 'OFERTA', '2X1', 'DESCUENTO', 'ESPECIAL'];
    const dbPromos = dbProducts
      .filter((p) => {
        if (p.disponibilidad === false) return false;
        const catSlug = (p.categoria || '').toLowerCase();
        const subcatSlug = (p.subcategoria || '').toLowerCase();
        const catName = ((p.categoriaNombre || '') as string).toLowerCase();
        const subcatName = ((p.subcategoriaNombre || '') as string).toLowerCase();
        const tag = (p.etiqueta || '').toUpperCase();

        const isComboCat =
          catSlug.includes('combo') ||
          subcatSlug.includes('combo') ||
          catName.includes('combo') ||
          subcatName.includes('combo');

        const hasPromoTag = promoKeywords.some((k) => tag.includes(k));

        return isComboCat || hasPromoTag;
      })
      .map((p) => {
        let incluyeList: string[] = [];
        if (Array.isArray(p.ingredientes) && p.ingredientes.length > 0) {
          incluyeList = p.ingredientes;
        } else if (p.descripcion) {
          const parts = p.descripcion.split(/[\n,•+]/).map((s: string) => s.trim()).filter((s: string) => s.length > 2);
          incluyeList = parts.length > 1 ? parts.slice(0, 4) : [p.descripcion];
        } else {
          incluyeList = ['Preparación artesanal fresca de la casa', 'Bebida y acompañamiento'];
        }

        return {
          id: p.id,
          nombre: p.nombre,
          slug: p.slug,
          descripcion: p.descripcion || 'Combo especial preparado con los mejores ingredientes.',
          precio: p.precio,
          precioAntes: Math.round((p.precio * 1.2) / 1000) * 1000,
          imagen: p.imagen,
          etiqueta: p.etiqueta || 'COMBO RECOMENDADO',
          incluye: incluyeList,
          originalProduct: p,
        };
      });

    if (dbPromos.length > 0) {
      const combined = [...dbPromos];
      for (const initial of initialPromotions) {
        if (!combined.some((c) => c.nombre.toLowerCase().trim() === initial.nombre.toLowerCase().trim())) {
          combined.push(initial as any);
        }
      }
      return combined;
    }

    return initialPromotions as PromoDisplayItem[];
  }, [dbProducts]);

  const handleOrderPromo = (promo: PromoDisplayItem) => {
    const promoProduct = promo.originalProduct || {
      id: promo.id,
      nombre: promo.nombre,
      slug: promo.slug || String(promo.id),
      descripcion: promo.descripcion,
      precio: promo.precio,
      imagen: promo.imagen,
      categoria: 'combos',
      etiqueta: promo.etiqueta || ('COMBO' as any),
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
          {allPromos.map((promo) => (
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

                  {/* Pricing */}
                  <div className="flex items-baseline gap-3 pt-2">
                    <span className="text-3xl font-black text-brand-yellow font-display">
                      ${promo.precio.toLocaleString('es-CO')}
                    </span>
                    {promo.precioAntes && (
                      <span className="text-sm font-semibold text-gray-500 line-through">
                        ${promo.precioAntes.toLocaleString('es-CO')}
                      </span>
                    )}
                  </div>

                  {/* Included Items Checklist */}
                  <div className="space-y-2 pt-2 border-t border-[#1f1f1f]">
                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">
                      ¿QUÉ INCLUYE ESTE COMBO?
                    </span>
                    <ul className="space-y-1.5">
                      {promo.incluye.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                          <Check className="w-4 h-4 text-brand-yellow flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 pt-0">
                <button
                  onClick={() => handleOrderPromo(promo)}
                  className="w-full py-3.5 bg-brand-yellow hover:bg-brand-yellowHover text-black font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-glow transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4 fill-current" />
                  <span>PEDIR ESTE COMBO</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
