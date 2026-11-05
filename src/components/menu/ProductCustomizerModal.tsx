'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Product, ProductAddon } from '@/types';
import { useCart } from '@/context/CartContext';
import { useTenant } from '@/context/TenantContext';
import { X, Plus, Minus, Check, Sparkles, ChefHat } from 'lucide-react';

interface ProductCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

const FOOD_QUICK_CHIPS = [
  'Sin cebolla',
  'Salsa de la casa aparte',
  'Carne 3/4',
  'Carne bien asada',
  'Sin ripio',
  'Extra servilletas',
];

const BEVERAGE_QUICK_CHIPS = [
  'Bien fría',
  'Con hielo',
  'Sin hielo',
  'Vaso con limón',
  'Con pitillo',
  'Sin azúcar',
];

export const ProductCustomizerModal: React.FC<ProductCustomizerModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const { addToCart } = useCart();
  const { restaurant } = useTenant();
  const primaryColor = restaurant?.colorPrimario || '#EAA622';
  const buttonColor = restaurant?.colorBoton || primaryColor;
  const buttonTextColor = restaurant?.colorBotonTexto || '#000000';

  const [mounted, setMounted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<ProductAddon[]>([]);
  const [notes, setNotes] = useState('');
  const [addonsList, setAddonsList] = useState<ProductAddon[]>([]);
  const [loadingAddons, setLoadingAddons] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determinar si el producto es una bebida o coctel para no mostrar toppings
  const isBeverage = useMemo(() => {
    if (!product) return false;
    const cat = (product.categoria || '').toLowerCase();
    const subcat = (product.subcategoria || '').toLowerCase();
    const catName = ((product as any).categoriaNombre || '').toLowerCase();
    const subcatName = ((product as any).subcategoriaNombre || '').toLowerCase();

    const beverageKeywords = [
      'bebida', 'bebidas', 'coctel', 'cóctel', 'cocteles', 'cócteles',
      'gaseosa', 'gaseosas', 'jugo', 'jugos', 'limonada', 'limonadas',
      'cerveza', 'cervezas', 'michelada', 'micheladas', 'soda', 'sodas',
      'agua', 'aguas', 'licor', 'licores', 'trago', 'tragos'
    ];

    if (beverageKeywords.some(k => cat.includes(k) || subcat.includes(k) || catName.includes(k) || subcatName.includes(k))) {
      return true;
    }

    if ((product as any).categoriaId === 6 || (product as any).subcategoriaId === 6) {
      return true;
    }

    return false;
  }, [product]);

  // Lock body scroll on mobile when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Load available addons from API (solo si NO es bebida)
  useEffect(() => {
    if (!isOpen || isBeverage) {
      setAddonsList([]);
      return;
    }
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
  }, [isOpen, isBeverage]);

  // Reset local state when opened
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSelectedAddons([]);
      setNotes('');
      setIsAdded(false);
    }
  }, [isOpen, product]);

  if (!isOpen || !product || !mounted) return null;

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

  const modalContent = (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn"
      style={{ touchAction: 'pan-y' }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#121212] border border-[#2a2a2a] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Product Hero Banner */}
        <div className="relative w-full h-48 sm:h-56 bg-black flex-shrink-0">
          <Image
            src={product.imagen}
            alt={product.nombre}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-black/50" />

          {/* Close button with large hit target, high z-index, touch & click support */}
          <button
            type="button"
            aria-label="Cerrar personalización"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-3 right-3 z-50 w-11 h-11 flex items-center justify-center rounded-full bg-black/80 hover:bg-black active:scale-90 text-white shadow-xl border border-white/20 transition-all cursor-pointer pointer-events-auto"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>

          <div className="absolute bottom-3 left-4 right-4 pointer-events-none">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-brand-yellow text-black pointer-events-auto">
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

          {/* Addons / Toppings Section (Solo visible para comidas, NO para Bebidas) */}
          {!isBeverage && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" style={{ color: primaryColor }} />
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
                            className="flex items-center justify-between p-2.5 rounded-xl border text-left transition-all"
                            style={
                              isSelected
                                ? { backgroundColor: `${primaryColor}18`, borderColor: primaryColor, color: '#ffffff' }
                                : { backgroundColor: '#181818', borderColor: '#262626', color: '#d4d4d4' }
                            }
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded flex items-center justify-center border text-[10px] transition-colors"
                                style={
                                  isSelected
                                    ? { backgroundColor: primaryColor, borderColor: primaryColor, color: buttonTextColor }
                                    : { borderColor: '#737373', backgroundColor: '#171717' }
                                }
                              >
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span className="text-xs font-semibold">{addon.nombre}</span>
                            </div>
                            <span className="text-xs font-bold font-display" style={{ color: primaryColor }}>
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
          )}

          {/* Cooking / Beverage Notes */}
          <div className="space-y-3 pt-2 border-t border-[#222]">
            <div className="flex items-center gap-2">
              <ChefHat className="w-4 h-4" style={{ color: primaryColor }} />
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wide">
                {isBeverage ? 'Instrucciones para Barman / Servicio' : 'Instrucciones para Cocina'}
              </h3>
            </div>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5">
              {(isBeverage ? BEVERAGE_QUICK_CHIPS : FOOD_QUICK_CHIPS).map((chip) => {
                const isActive = notes.includes(chip);
                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleChipClick(chip)}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-full border transition-colors"
                    style={
                      isActive
                        ? { backgroundColor: primaryColor, borderColor: primaryColor, color: buttonTextColor, fontWeight: 'bold' }
                        : { backgroundColor: '#1c1c1c', borderColor: '#404040', color: '#d4d4d4' }
                    }
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
              placeholder={
                isBeverage
                  ? 'Ej: Bien fría, vaso con hielo y limón, sin pitillo...'
                  : 'Ej: Salsa tártara aparte, carne término medio, bien caliente...'
              }
              className="w-full bg-[#181818] border border-[#2b2b2b] rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none transition"
              style={{ borderColor: notes ? primaryColor : undefined }}
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
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-sm font-black text-white w-6 text-center">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add Button with Total */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdded}
            className={`flex-1 w-full py-3 px-6 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-between gap-3 transition-all duration-200 cursor-pointer ${
              isAdded
                ? 'bg-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                : 'shadow-lg transform active:scale-98'
            }`}
            style={
              !isAdded
                ? { backgroundColor: buttonColor, color: buttonTextColor }
                : undefined
            }
          >
            <span>{isAdded ? '¡AGREGADO AL PEDIDO!' : 'AGREGAR AL PEDIDO'}</span>
            <span className="font-display text-base font-extrabold">{formatCOP(totalPrice)}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
