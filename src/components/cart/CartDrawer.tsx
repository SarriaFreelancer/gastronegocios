'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Send, 
  MapPin, 
  Store, 
  UtensilsCrossed,
  Heart,
  CreditCard,
  Banknote,
  Smartphone
} from 'lucide-react';

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
    tip,
    tipPercentage,
    setTipPercentage,
    setTipAmount,
    totalPrice,
    deliveryType,
    setDeliveryType,
    tableNumber,
    setTableNumber,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    customerAddress,
    setCustomerAddress,
    customerNotes,
    setCustomerNotes,
    paymentMethod,
    setPaymentMethod,
    isSubmittingOrder,
    submitAndSendWhatsAppOrder,
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

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-[#101010] border-l border-[#242424] text-white flex flex-col shadow-2xl">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#222] flex items-center justify-between bg-[#151515]">
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
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
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
                <div className="space-y-3">
                  {items.map(({ product, quantity, notes }) => (
                    <div
                      key={product.id}
                      className="bg-[#161616] border border-[#242424] rounded-xl p-3 flex gap-3 relative group"
                    >
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[#202020] flex-shrink-0">
                        <Image
                          src={product.imagen}
                          alt={product.nombre}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0 pr-6">
                        <h4 className="text-xs font-bold text-white truncate">
                          {product.nombre}
                        </h4>
                        <p className="text-xs font-black text-brand-yellow mt-0.5">
                          {formatPrice(product.precio * quantity)}
                        </p>
                        {notes && (
                          <p className="text-[10px] text-gray-400 italic line-clamp-1 mt-0.5">
                            Nota: {notes}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="w-6 h-6 rounded bg-[#252525] hover:bg-[#303030] flex items-center justify-center text-gray-300 hover:text-white transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-white w-4 text-center">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            className="w-6 h-6 rounded bg-[#252525] hover:bg-[#303030] flex items-center justify-center text-gray-300 hover:text-white transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

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

                {/* Delivery & Ordering Mode */}
                <div className="bg-[#161616] border border-[#252525] rounded-xl p-3.5 space-y-2.5">
                  <h4 className="text-[11px] font-bold text-gray-300 uppercase tracking-wider flex items-center justify-between">
                    <span>¿Dónde disfrutarás tu pedido?</span>
                    {deliveryType === 'mesa' && (
                      <span className="text-brand-yellow font-black text-[10px] bg-brand-yellow/10 px-2 py-0.5 rounded">
                        EN MESA
                      </span>
                    )}
                  </h4>
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setDeliveryType('domicilio')}
                      className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg font-bold transition-all border ${
                        deliveryType === 'domicilio'
                          ? 'bg-brand-yellow text-black border-brand-yellow shadow-glow'
                          : 'bg-[#202020] text-gray-300 border-[#2d2d2d] hover:bg-[#252525]'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="text-[10px] leading-tight">Domicilio</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setDeliveryType('recoger')}
                      className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg font-bold transition-all border ${
                        deliveryType === 'recoger'
                          ? 'bg-brand-yellow text-black border-brand-yellow shadow-glow'
                          : 'bg-[#202020] text-gray-300 border-[#2d2d2d] hover:bg-[#252525]'
                      }`}
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span className="text-[10px] leading-tight">Para Llevar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryType('mesa')}
                      className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg font-bold transition-all border ${
                        deliveryType === 'mesa'
                          ? 'bg-brand-yellow text-black border-brand-yellow shadow-glow'
                          : 'bg-[#202020] text-gray-300 border-[#2d2d2d] hover:bg-[#252525]'
                      }`}
                    >
                      <UtensilsCrossed className="w-3.5 h-3.5" />
                      <span className="text-[10px] leading-tight">En Mesa (QR)</span>
                    </button>
                  </div>

                  {deliveryType === 'mesa' && (
                    <div className="pt-1">
                      <label className="block text-[10px] font-bold uppercase text-brand-yellow mb-1">
                        Número de Mesa o Barra *
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Mesa 1, Mesa 4, Barra 2..."
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        className="w-full bg-[#202020] border border-brand-yellow/50 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow"
                      />
                    </div>
                  )}
                </div>

                {/* Customer Details Form */}
                <div className="bg-[#161616] border border-[#252525] rounded-xl p-3.5 space-y-2.5">
                  <h4 className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">
                    Datos del Cliente:
                  </h4>
                  
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 mb-1">
                      Tu Nombre:
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Juan Pérez"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-[#202020] border border-[#2d2d2d] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 mb-1">
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
                      <label className="block text-[10px] font-semibold text-gray-400 mb-1">
                        Dirección y Barrio en Cali:
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Calle 9 # 45-12, Barrio Granada"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        className="w-full bg-[#202020] border border-[#2d2d2d] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow"
                      />
                    </div>
                  )}

                  {/* Payment Method */}
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 mb-1">
                      Método de Pago:
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                      {['Efectivo', 'Nequi', 'Daviplata', 'Datáfono'].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setPaymentMethod(m)}
                          className={`py-1.5 px-1 rounded-lg text-[10px] font-bold border transition-colors ${
                            paymentMethod === m
                              ? 'bg-brand-yellow text-black border-brand-yellow'
                              : 'bg-[#202020] text-gray-400 border-[#2d2d2d] hover:text-white'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comments / Special Requests */}
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 mb-1">
                      Comentarios del Pedido (opcional):
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ej: Término 3/4, sin cebolla, salsas extras..."
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      className="w-full bg-[#202020] border border-[#2d2d2d] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow resize-none"
                    />
                  </div>
                </div>

                {/* Propinas / Tips Module */}
                <div className="bg-[#161616] border border-[#252525] rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-brand-orange fill-brand-orange" />
                      <span>Propina Voluntaria al Equipo</span>
                    </span>
                    <span className="text-xs font-black text-brand-yellow">
                      {formatPrice(tip)}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 leading-tight">
                    El 100% de tu propina va directo a los parrilleros, cocineros y meseros de Punto G.
                  </p>
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    {[
                      { label: 'Sin propina', pct: 0 },
                      { label: '5%', pct: 5 },
                      { label: '10% ⭐', pct: 10 },
                      { label: '15%', pct: 15 },
                    ].map((btn) => (
                      <button
                        key={btn.pct}
                        type="button"
                        onClick={() => setTipPercentage(btn.pct)}
                        className={`py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${
                          tipPercentage === btn.pct
                            ? 'bg-brand-yellow text-black border-brand-yellow shadow-glow'
                            : 'bg-[#202020] text-gray-400 border-[#2d2d2d] hover:text-white'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[#222] bg-[#141414] space-y-3">
              <div className="space-y-1 text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-white">{formatPrice(subtotal)}</span>
                </div>
                {deliveryType === 'domicilio' && (
                  <div className="flex justify-between">
                    <span>Domicilio en Cali:</span>
                    <span className="font-semibold text-white">{formatPrice(deliveryFee)}</span>
                  </div>
                )}
                {tip > 0 && (
                  <div className="flex justify-between text-brand-yellow">
                    <span>Propina voluntaria:</span>
                    <span className="font-bold">{formatPrice(tip)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-[#252525]">
                  <span>TOTAL A PAGAR:</span>
                  <span className="text-brand-yellow font-black">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <button
                type="button"
                disabled={isSubmittingOrder}
                onClick={submitAndSendWhatsAppOrder}
                className="w-full bg-brand-whatsapp hover:bg-[#20ba59] text-white font-extrabold text-xs sm:text-sm py-3.5 px-4 rounded-xl shadow-[0_4px_20px_rgba(37,211,102,0.35)] transition-all flex items-center justify-center gap-2 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                <Send className="w-4 h-4 fill-current" />
                <span>
                  {isSubmittingOrder ? 'REGISTRANDO PEDIDO...' : 'CONFIRMAR Y ENVIAR A WHATSAPP'}
                </span>
              </button>

              <p className="text-[10px] text-gray-500 text-center">
                Se guardará tu pedido en la base de datos y se abrirá WhatsApp con el resumen oficial para confirmación inmediata.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
