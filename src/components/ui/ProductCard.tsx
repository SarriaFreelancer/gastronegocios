'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Plus, Minus, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  variant?: 'compact' | 'standard';
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  variant = 'standard' 
}) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const getBadgeStyle = (badge?: string) => {
    switch (badge) {
      case 'MÁS VENDIDO':
        return 'bg-brand-yellow text-black shadow-[0_2px_10px_rgba(255,201,40,0.5)]';
      case 'RECOMENDADO':
        return 'bg-[#FF9800] text-black shadow-[0_2px_10px_rgba(255,152,0,0.4)]';
      case 'NUEVO':
        return 'bg-[#00E676] text-black shadow-[0_2px_10px_rgba(0,230,118,0.4)]';
      case 'PICANTE':
        return 'bg-[#FF3D00] text-white shadow-[0_2px_10px_rgba(255,61,0,0.4)]';
      case 'VEGETARIANA':
        return 'bg-[#76FF03] text-black shadow-[0_2px_10px_rgba(118,255,3,0.4)]';
      case 'BBQ':
        return 'bg-[#D84315] text-white shadow-[0_2px_10px_rgba(216,67,21,0.4)]';
      case 'INFANTIL':
        return 'bg-[#FFD600] text-black shadow-[0_2px_10px_rgba(255,214,0,0.4)]';
      default:
        return 'bg-brand-yellow text-black';
    }
  };

  return (
    <div className="group bg-[#121212] hover:bg-[#161616] rounded-2xl border border-[#222222] hover:border-brand-yellow/50 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.85)] hover:-translate-y-1">
      {/* Product Image Container */}
      <div className="relative w-full aspect-[4/3] bg-black overflow-hidden">
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
              className={`text-[10px] sm:text-xs font-black tracking-wider uppercase px-2.5 py-1 rounded-md shadow-md ${getBadgeStyle(
                product.etiqueta
              )}`}
            >
              {product.etiqueta}
            </span>
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-brand-yellow transition-colors line-clamp-1">
            {product.nombre}
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
            {product.descripcion}
          </p>
        </div>

        {/* Price & Action Section */}
        <div className="pt-2 border-t border-[#1e1e1e] space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-lg sm:text-xl font-black text-brand-yellow tracking-tight font-display">
              ${product.precio.toLocaleString('es-CO')}
            </span>

            {/* Quantity controls */}
            <div className="flex items-center gap-1.5 bg-[#1b1b1b] border border-[#2d2d2d] rounded-lg px-2 py-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="text-gray-400 hover:text-white p-0.5 transition-colors"
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
                className="text-gray-400 hover:text-white p-0.5 transition-colors"
                aria-label="Más"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Add to order button */}
          <button
            type="button"
            onClick={handleAdd}
            className={`w-full py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 ${
              isAdded
                ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                : 'bg-brand-yellow hover:bg-brand-yellowHover text-black shadow-glow transform active:scale-95'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>¡AGREGADO!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 fill-current" />
                <span>AGREGAR AL PEDIDO</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
