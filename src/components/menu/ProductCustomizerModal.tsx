'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Product, ProductAddon } from '@/types';
import { useCart } from '@/context/CartContext';
import { X, Plus, Minus, Check, Sparkles, ChefHat } from 'lucide-react';

interface ProductCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

const QUICK_CHIPS = [
  'Sin cebolla',
  'Salsa de la casa aparte',
  'Carne 3/4',
  'Carne bien asada',
  'Sin ripio',
  'Extra servilletas',
];

export const ProductCustomizerModal: React.FC<ProductCustomizerModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<ProductAddon[]>([]);
  const [notes, setNotes] = useState('');
  const [addonsList, setAddonsList] = useState<ProductAddon[]>([]);
  const [loadingAddons, setLoadingAddons] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // Load available addons from API
  useEffect(() => {
    if (!isOpen) return;
    setLoadingAddons(true);
    fetch('/api/addons?activo=true')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAddonsList(data);
        }
      })
      .catch((err) => console.error('Error fetching addons:', err))
      .finally(() => setLoadingAddons(false));
  }, [isOpen]);

  // Reset local state when opened
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSelectedAddons([]);
      setNotes('');
      setIsAdded(false);
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const toggleAddon = (addon: ProductAddon) => {
    setSelectedAddons((prev) => {
      const exists = prev.some((a) => a.id === addon.id);
      if (exists) {
        return prev.filter((a) => a.id !== addon.id);
      }
      return [...prev, addon];
    });
  };

  const handleChipClick = (chip: string) => {
    setNotes((prev) => {
      if (prev.includes(chip)) {
        return prev.replace(chip, '').replace(/,\s*,/g, ',').replace(/^,\s*|\s*,$/g, '').trim();
      }
      return prev ? `${prev}, ${chip}` : chip;
    });
  };

  // Group addons by category
  const groupedAddons = addonsList.reduce((acc, a) => {
    const cat = a.categoria || 'Toppings';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(a);
    return acc;
  }, {} as Record<string, ProductAddon[]>);

  const addonsTotal = selectedAddons.reduce((sum, a) => sum + (a.precio || 0), 0);
  const unitPrice = product.precio + addonsTotal;
  const totalPrice = unitPrice * quantity;

  const formatCOP = (num: number) => '$' + (num || 0).toLocaleString('es-CO');

  const handleAddToCart = () => {
    addToCart(product, quantity, notes.trim(), selectedAddons);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#121212] border border-[#2a2a2a] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white transition backdrop-blur-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Hero Banner */}
        <div className="relative w-full h-48 sm:h-56 bg-black flex-shrink-0">
          <Image
            src={product.imagen}
            alt={product.nombre}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-black/40" />

          <div className="absolute bottom-3 left-4 right-4">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-brand-yellow text-black">
              {product.categoria || 'PUNTO G'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase drop-shadow-md mt-1">
              {product.nombre}
            </h2>
            <p className="text-xs text-neutral-300 line-clamp-1 mt-0.5 font-medium">
              {product.descripcion}
            </p>
          </div>
        </div>

        {/* Scrollable Customization Options */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1 text-white">
          {/* Base Price Display */}
          <div className="flex items-center justify-between pb-3 border-b border-[#222]">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Precio Base
            </span>
            <span className="text-lg font-black text-brand-yellow font-display">
              {formatCOP(product.precio)}
            </span>
          </div>

          {/* Addons / Toppings Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-yellow" />
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wide">
                Adicionales & Toppings
              </h3>
            </div>

            {loadingAddons ? (
              <div className="text-xs text-neutral-500 py-3 text-center animate-pulse">
                Cargando adicionales disponibles...
              </div>
            ) : Object.keys(groupedAddons).length === 0 ? (
              <p className="text-xs text-neutral-500 italic">No hay adicionales configurados para este plato.</p>
            ) : (
              Object.entries(groupedAddons).map(([categoria, items]) => (
                <div key={categoria} className="space-y-2">
                  <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    {categoria}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {items.map((addon) => {
                      const isSelected = selectedAddons.some((a) => a.id === addon.id);
                      return (
                        <button
                          key={addon.id}
                          type="button"
                          onClick={() => toggleAddon(addon)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'bg-brand-yellow/15 border-brand-yellow text-white shadow-sm'
                              : 'bg-[#181818] border-[#262626] text-neutral-300 hover:border-neutral-600'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] transition-colors ${
                                isSelected
                                  ? 'bg-brand-yellow border-brand-yellow text-black'
                                  : 'border-neutral-500 bg-neutral-900'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="text-xs font-semibold">{addon.nombre}</span>
                          </div>
                          <span className="text-xs font-bold text-brand-yellow font-display">
                            +{formatCOP(addon.precio)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cooking Notes / Customizations */}
          <div className="space-y-3 pt-2 border-t border-[#222]">
            <div className="flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-brand-yellow" />
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wide">
                Instrucciones para Cocina
              </h3>
            </div>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5">
              {QUICK_CHIPS.map((chip) => {
                const isActive = notes.includes(chip);
                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleChipClick(chip)}
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition-colors ${
                      isActive
                        ? 'bg-amber-400 text-black border-amber-400 font-bold'
                        : 'bg-[#1c1c1c] text-neutral-300 border-neutral-700 hover:border-neutral-500'
                    }`}
                  >
                    {isActive ? `✓ ${chip}` : `+ ${chip}`}
                  </button>
                );
              })}
            </div>

            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Salsa tártara aparte, carne término medio, bien caliente..."
              className="w-full bg-[#181818] border border-[#2b2b2b] rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-brand-yellow transition"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-[#0f0f0f] border-t border-[#222] flex flex-col sm:flex-row items-center gap-3">
          {/* Quantity Controls */}
          <div className="flex items-center justify-between w-full sm:w-auto bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl px-3 py-2 gap-3">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-sm font-black text-white w-6 text-center">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add Button with Total */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdded}
            className={`flex-1 w-full py-3 px-6 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-between gap-3 transition-all duration-200 ${
              isAdded
                ? 'bg-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                : 'bg-brand-yellow hover:bg-brand-yellowHover text-black shadow-glow transform active:scale-98'
            }`}
          >
            <span>{isAdded ? '¡AGREGADO AL PEDIDO!' : 'AGREGAR AL PEDIDO'}</span>
            <span className="font-display text-base font-extrabold">{formatCOP(totalPrice)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
