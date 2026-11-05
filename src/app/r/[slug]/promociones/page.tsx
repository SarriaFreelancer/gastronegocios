'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { promotions as initialPromotions } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { useTenant } from '@/context/TenantContext';
import { Check, ShoppingCart, Sparkles, Tag, Utensils, ArrowLeft, MessageCircle } from 'lucide-react';

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
  const isPuntoG = slug === 'punto-g' || slug === 'puntog';

  const { addToCart, setIsCartOpen } = useCart();
  const { restaurant } = useTenant();
  const restaurantName = restaurant?.nombre || 'Restaurante';
  const primaryColor = restaurant?.colorPrimario || '#EAA622';
  const buttonColor = restaurant?.colorBoton || primaryColor;
  const buttonTextColor = restaurant?.colorBotonTexto || '#000000';
  const whatsappNumber = restaurant?.telefonoWhatsapp || restaurant?.telefono;

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

  // Construir la lista de promociones
  const allPromos = useMemo<PromoDisplayItem[]>(() => {
    const promoKeywords = ['PROMO', 'COMBO', 'OFERTA', '2X1', 'DESCUENTO', 'ESPECIAL', 'MÁS VENDID', 'FAVORIT'];
    const dbPromos = dbProducts
      .filter((p) => {
        if (p.disponibilidad === false) return false;
        const catSlug = (p.categoria || '').toLowerCase();
        const subcatSlug = (p.subcategoria || '').toLowerCase();
        const tag = (p.etiqueta || '').toUpperCase();

        const isComboCat =
          catSlug.includes('combo') ||
          subcatSlug.includes('combo') ||
          catSlug.includes('especial');

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
          incluyeList = ['Preparación artesanal fresca de la casa', 'Ingredientes seleccionados'];
        }

        return {
          id: p.id,
          nombre: p.nombre,
          slug: p.slug,
          descripcion: p.descripcion || 'Especial preparado con los mejores ingredientes de la casa.',
          precio: p.precio,
          precioAntes: Math.round((p.precio * 1.2) / 1000) * 1000,
          imagen: p.imagen,
          etiqueta: p.etiqueta || 'DESTACADO',
          incluye: incluyeList,
          originalProduct: p,
        };
      });

    if (dbPromos.length > 0) {
      return dbPromos;
    }

    if (isPuntoG) {
      return initialPromotions as PromoDisplayItem[];
    }

    // If restaurant has regular products, show the first 3 with special tags
    if (dbProducts.length > 0) {
      return dbProducts.slice(0, 3).map((p) => ({
        id: p.id,
        nombre: p.nombre,
        slug: p.slug,
        descripcion: p.descripcion,
        precio: p.precio,
        precioAntes: Math.round((p.precio * 1.15) / 1000) * 1000,
        imagen: p.imagen,
        etiqueta: p.etiqueta || 'OFERTA DE LA CASA',
        incluye: ['Receta tradicional artesanal', 'Porción generosa', 'Salsas especiales'],
        originalProduct: p,
      }));
    }

    return [];
  }, [dbProducts, isPuntoG]);

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
      <div className="relative border-b border-[#202020] py-16 mb-12 overflow-hidden">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-60 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: primaryColor }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3 relative z-10">
          <div 
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-xs font-bold uppercase tracking-wider"
            style={{ 
              backgroundColor: `${primaryColor}15`, 
              borderColor: `${primaryColor}40`, 
              color: primaryColor 
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Precios Especiales • {restaurantName}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase text-white font-display tracking-tight">
            COMBOS Y{' '}
            <span className="italic" style={{ color: primaryColor }}>
              PROMOCIONES
            </span>
          </h1>

          <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto">
            {restaurant?.textoPromocional || `Disfruta de las mejores recetas de ${restaurantName} con precios especiales diseñados para compartir.`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Promos Grid */}
        {allPromos.length === 0 ? (
          <div className="bg-[#121212] border border-[#222] rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4">
            <Sparkles className="w-12 h-12 mx-auto" style={{ color: primaryColor }} />
            <h3 className="text-xl font-black text-white uppercase font-display">Pronto Nuevas Promociones</h3>
            <p className="text-xs text-gray-400">
              Estamos preparando promociones especiales para ti en {restaurantName}. Te invitamos a conocer nuestra carta completa.
            </p>
            <div className="pt-2">
              <Link
                href={`/r/${slug}/menu`}
                className="inline-block px-7 py-3 rounded-full font-black text-xs uppercase tracking-wider"
                style={{ backgroundColor: buttonColor, color: buttonTextColor }}
              >
                Ver Todo el Menú
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {allPromos.map((promo) => (
              <div
                key={promo.id}
                className="bg-[#121212] border-2 border-[#242424] hover:border-white/30 rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
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
                        <span 
                          className="text-xs font-black px-3 py-1 rounded-md shadow-lg uppercase tracking-wider"
                          style={{ backgroundColor: primaryColor, color: buttonTextColor }}
                        >
                          {promo.etiqueta}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-2xl font-black text-white font-display uppercase tracking-wide group-hover:text-white transition-colors">
                        {promo.nombre}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-400 mt-2 leading-relaxed">
                        {promo.descripcion}
                      </p>
                    </div>

                    {/* Includes List */}
                    <div className="space-y-2 pt-2 border-t border-[#1e1e1e]">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 block">
                        Incluye:
                      </span>
                      <ul className="space-y-1.5">
                        {promo.incluye.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                            <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: primaryColor }} />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Pricing & CTA */}
                <div className="p-6 pt-0">
                  <div className="pt-4 border-t border-[#1e1e1e] flex items-center justify-between">
                    <div>
                      {promo.precioAntes && (
                        <span className="text-xs text-gray-500 line-through block">
                          ${promo.precioAntes.toLocaleString('es-CO')}
                        </span>
                      )}
                      <span className="text-2xl font-black font-display" style={{ color: primaryColor }}>
                        ${promo.precio.toLocaleString('es-CO')}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOrderPromo(promo)}
                      className="px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transition transform hover:scale-105 active:scale-95 cursor-pointer"
                      style={{ backgroundColor: buttonColor, color: buttonTextColor }}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Pedir Combo</span>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
