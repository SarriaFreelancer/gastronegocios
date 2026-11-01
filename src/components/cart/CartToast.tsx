'use client';

import React from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { CheckCircle2, ShoppingBag, X } from 'lucide-react';

export const CartToast: React.FC = () => {
  const { lastAddedProduct, clearToast, setIsCartOpen } = useCart();

  if (!lastAddedProduct) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-subtle max-w-sm w-full mx-4 sm:mx-0">
      <div className="bg-[#181818] border-2 border-brand-yellow rounded-2xl p-4 shadow-[0_10px_35px_rgba(0,0,0,0.85)] flex items-center gap-3.5 text-white">
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-black flex-shrink-0 relative border border-[#333]">
          <Image
            src={lastAddedProduct.imagen}
            alt={lastAddedProduct.nombre}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-brand-yellow text-xs font-bold uppercase tracking-wider mb-0.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>¡Agregado al pedido!</span>
          </div>
          <p className="text-sm font-extrabold truncate text-white">
            {lastAddedProduct.nombre}
          </p>
          <p className="text-xs font-bold text-gray-300">
            ${lastAddedProduct.precio.toLocaleString('es-CO')} COP
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              clearToast();
              setIsCartOpen(true);
            }}
            className="bg-brand-yellow hover:bg-brand-yellowHover text-black text-xs font-black px-3 py-2 rounded-lg flex items-center gap-1 shadow-glow"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Ver</span>
          </button>
          <button
            onClick={clearToast}
            className="text-gray-400 hover:text-white p-1"
            aria-label="Cerrar notificación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
