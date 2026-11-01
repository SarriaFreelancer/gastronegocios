'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { X, Trash2, Plus, Minus, ShoppingBag, Send, MapPin, Store } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    totalItems,
    subtotal,
    deliveryFee,
    totalPrice,
    deliveryType,
    setDeliveryType,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    customerAddress,
    setCustomerAddress,
    customerNotes,
    setCustomerNotes,
    sendWhatsAppOrder,
  } = useCart();

  if (!isCartOpen) return null;

  const formatPrice = (val: number) => '$' + val.toLocaleString('es-CO');

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#101010] border-l border-[#242424] text-white flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-5 border-b border-[#222] flex items-center justify-between bg-[#151515]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-brand-yellow text-black rounded-lg font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold uppercase font-display tracking-wide">
                  Tu Pedido
                </h2>
                <p className="text-xs text-gray-400">
                  {totalItems} {totalItems === 1 ? 'producto' : 'productos'} en tu lista
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#202020] transition-colors"
              aria-label="Cerrar pedido"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-20 h-20 rounded-full bg-[#181818] border border-[#262626] flex items-center justify-center text-brand-yellow mb-4">
                  <ShoppingBag className="w-10 h-10 opacity-70" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Tu carrito está vacío</h3>
                <p className="text-xs text-gray-400 max-w-xs mb-6">
                  ¡El antojo tiene un solo Punto G! Explora nuestras categorías y agrega tus platos favoritos.
                </p>
                <Link
                  href="/menu"
                  onClick={() => setIsCartOpen(false)}
                  className="bg-brand-yellow hover:bg-brand-yellowHover text-black font-extrabold text-sm px-6 py-3 rounded-full transition-all shadow-glow"
                >
                  VER MENÚ COMPLETO
                </Link>
              </div>
            ) : (
              <>
                {/* Product List */}
                <div className="space-y-4">
                  {items.map(({ product, quantity, notes }) => (
                    <div
                      key={product.id}
                      className="bg-[#161616] border border-[#252525] rounded-xl p-3.5 flex gap-3.5 relative hover:border-brand-yellow/30 transition-colors"
                    >
                      {/* Image */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-black flex-shrink-0 relative">
                        <Image
                          src={product.imagen}
                          alt={product.nombre}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>

                      {/* Info & Controls */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="pr-6">
                          <h4 className="text-sm font-bold text-white leading-tight">
                            {product.nombre}
                          </h4>
                          <p className="text-xs font-bold text-brand-yellow mt-0.5">
                            {formatPrice(product.precio)} c/u
                          </p>
                        </div>

                        {/* Quantity bar */}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#222]">
                          <div className="flex items-center gap-2 bg-[#202020] rounded-lg px-2 py-1 border border-[#2e2e2e]">
                            <button
                              onClick={() => updateQuantity(product.id, quantity - 1)}
                              className="text-gray-400 hover:text-white p-0.5"
                              aria-label="Disminuir cantidad"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-black text-white w-5 text-center">
                              {quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(product.id, quantity + 1)}
                              className="text-gray-400 hover:text-white p-0.5"
                              aria-label="Aumentar cantidad"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <span className="text-xs font-black text-white">
                            {formatPrice(product.precio * quantity)}
                          </span>
                        </div>
                      </div>

                      {/* Remove item button */}
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="absolute top-3 right-3 text-gray-500 hover:text-red-400 p-1 transition-colors"
                        aria-label="Eliminar del pedido"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Delivery Options */}
                <div className="bg-[#161616] border border-[#252525] rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                    Modalidad de Entrega:
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryType('domicilio')}
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                        deliveryType === 'domicilio'
                          ? 'bg-brand-yellow text-black shadow-glow'
                          : 'bg-[#202020] text-gray-300 hover:bg-[#252525]'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      Domicilio (+$5.000)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryType('recoger')}
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                        deliveryType === 'recoger'
                          ? 'bg-brand-yellow text-black shadow-glow'
                          : 'bg-[#202020] text-gray-300 hover:bg-[#252525]'
                      }`}
                    >
                      <Store className="w-3.5 h-3.5" />
                      Para Recoger (Gratis)
                    </button>
                  </div>
                </div>

                {/* Customer Details Form */}
                <div className="bg-[#161616] border border-[#252525] rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                    Tus Datos para el Pedido:
                  </h4>
                  
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                      Tu Nombre:
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Carlos Gómez"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-[#202020] border border-[#2d2d2d] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                      Teléfono / WhatsApp:
                    </label>
                    <input
                      type="tel"
                      placeholder="Ej: 315 123 4567"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-[#202020] border border-[#2d2d2d] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow"
                    />
                  </div>

                  {deliveryType === 'domicilio' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                        Dirección de Entrega y Barrio:
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Calle 15 # 45-20, Barrio San Fernando"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        className="w-full bg-[#202020] border border-[#2d2d2d] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                      Observaciones (opcional):
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ej: Sin cebolla en la hamburguesa, salsas extras..."
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      className="w-full bg-[#202020] border border-[#2d2d2d] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow resize-none"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {items.length > 0 && (
            <div className="p-5 border-t border-[#222] bg-[#141414] space-y-3">
              <div className="space-y-1.5 text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-white">{formatPrice(subtotal)}</span>
                </div>
                {deliveryType === 'domicilio' && (
                  <div className="flex justify-between">
                    <span>Domicilio estimado:</span>
                    <span className="font-semibold text-white">{formatPrice(deliveryFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-[#252525]">
                  <span>TOTAL A PAGAR:</span>
                  <span className="text-brand-yellow">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={sendWhatsAppOrder}
                className="w-full bg-brand-whatsapp hover:bg-[#20ba59] text-white font-extrabold text-sm py-3.5 px-4 rounded-full shadow-[0_4px_20px_rgba(37,211,102,0.35)] transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Send className="w-4 h-4 fill-current" />
                <span>CONTINUAR PEDIDO POR WHATSAPP</span>
              </button>

              <p className="text-[10px] text-gray-500 text-center">
                Se abrirá WhatsApp con el detalle completo de tu pedido para que nuestro equipo lo confirme de inmediato.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
