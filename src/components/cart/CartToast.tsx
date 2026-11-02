'use client';

import React from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { CheckCircle2, ShoppingBag, X } from 'lucide-react';

export const CartToast: React.FC = () => {
  const { lastAddedProduct, clearToast, setIsCartOpen } = useCart();

  if (!lastAddedProduct) return null;

  return (
    <div className="fixed bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-50 w-[calc(100%-1.5rem)] sm:w-auto max-w-sm animate-bounce-subtle pointer-events-none">
      <div className="pointer-events-auto bg-[#181818]/95 backdrop-blur-md border-2 border-brand-yellow rounded-2xl p-3 sm:p-4 shadow-[0_12px_40px_rgba(0,0,0,0.9)] flex items-center gap-2.5 sm:gap-3.5 text-white">
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-black flex-shrink-0 relative border border-[#333]">
          <Image
            src={lastAddedProduct.imagen}
            alt={lastAddedProduct.nombre}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-brand-yellow text-[11px] sm:text-xs font-black uppercase tracking-wider mb-0.5">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">¡Agregado al pedido!</span>
          </div>
          <p className="text-xs sm:text-sm font-extrabold truncate text-white">
            {lastAddedProduct.nombre}
          </p>
          <p className="text-[11px] sm:text-xs font-bold text-gray-300">
            ${lastAddedProduct.precio.toLocaleString('es-CO')} COP
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => {
              clearToast();
              setIsCartOpen(true);
            }}
            className="bg-brand-yellow hover:bg-brand-yellowHover text-black text-xs font-black px-3 py-2 rounded-xl flex items-center gap-1 shadow-glow transition active:scale-95"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Ver</span>
          </button>
          <button
            onClick={clearToast}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition"
            aria-label="Cerrar notificación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
