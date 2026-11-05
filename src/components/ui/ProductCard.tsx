'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useTenant } from '@/context/TenantContext';
import { ShoppingCart, Plus, Minus, Check, SlidersHorizontal } from 'lucide-react';
import { ProductCustomizerModal } from '@/components/menu/ProductCustomizerModal';

interface ProductCardProps {
  product: Product;
  variant?: 'compact' | 'standard';
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  variant = 'standard' 
}) => {
  const { addToCart } = useCart();
  const { restaurant } = useTenant();
  const primaryColor = restaurant?.colorPrimario || '#EAA622';
  const buttonColor = restaurant?.colorBoton || primaryColor;
  const buttonTextColor = restaurant?.colorBotonTexto || '#000000';

  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  const handleAdd = () => {
    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const getBadgeStyle = (badge?: string) => {
    switch (badge) {
      case 'MÁS VENDIDO':
      case 'MÁS VENDIDA':
        return { backgroundColor: primaryColor, color: buttonTextColor };
      case 'RECOMENDADO':
      case 'FAVORITO DE LA CASA':
        return { backgroundColor: '#FF9800', color: '#000000' };
      case 'NUEVO':
        return { backgroundColor: '#00E676', color: '#000000' };
      case 'PICANTE':
        return { backgroundColor: '#FF3D00', color: '#ffffff' };
      case 'ESPECIALIDAD':
        return { backgroundColor: primaryColor, color: buttonTextColor };
      default:
        return { backgroundColor: primaryColor, color: buttonTextColor };
    }
  };

  return (
    <div className="group bg-[#121212] hover:bg-[#161616] rounded-2xl border border-[#222222] hover:border-white/30 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.85)] hover:-translate-y-1">
      {/* Product Image Container */}
      <div 
        onClick={() => setIsCustomizerOpen(true)}
        className="relative w-full aspect-[4/3] bg-black overflow-hidden cursor-pointer"
      >
        <Image
          src={product.imagen}
          alt={product.nombre}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Subtle dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-black/30 pointer-events-none" />

        {/* Badge */}
        {product.etiqueta && (
          <div className="absolute top-3 left-3 z-10">
            <span
              className="text-[10px] sm:text-xs font-black tracking-wider uppercase px-2.5 py-1 rounded-md shadow-md"
              style={getBadgeStyle(product.etiqueta)}
            >
              {product.etiqueta}
            </span>
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div onClick={() => setIsCustomizerOpen(true)} className="cursor-pointer">
          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-white transition-colors line-clamp-1">
            {product.nombre}
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
            {product.descripcion}
          </p>
        </div>

        {/* Price & Action Section */}
        <div className="pt-2 border-t border-[#1e1e1e] space-y-2.5">
          <div className="flex items-baseline justify-between">
            <span 
              className="text-lg sm:text-xl font-black tracking-tight font-display"
              style={{ color: primaryColor }}
            >
              ${product.precio.toLocaleString('es-CO')}
            </span>

            {/* Quantity controls */}
            <div className="flex items-center gap-1.5 bg-[#1b1b1b] border border-[#2d2d2d] rounded-lg px-2 py-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="text-gray-400 hover:text-white p-0.5 transition-colors cursor-pointer"
                aria-label="Menos"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-xs font-bold text-white w-4 text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="text-gray-400 hover:text-white p-0.5 transition-colors cursor-pointer"
                aria-label="Más"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Action buttons: Personalizar (toppings) + Agregar */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setIsCustomizerOpen(true)}
              className="py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 hover:border-neutral-500 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" style={{ color: primaryColor }} />
              <span className="truncate">Toppings & Adiciones</span>
            </button>

            <button
              type="button"
              onClick={handleAdd}
              className={`py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
                isAdded
                  ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                  : 'shadow-md transform active:scale-95'
              }`}
              style={
                !isAdded
                  ? { backgroundColor: buttonColor, color: buttonTextColor }
                  : undefined
              }
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>¡Listo!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5 fill-current" />
                  <span>Agregar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Product Customizer Modal */}
      <ProductCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        product={product}
      />
    </div>
  );
};
