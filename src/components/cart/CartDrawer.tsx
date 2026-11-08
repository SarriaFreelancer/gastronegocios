'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useTenant } from '@/context/TenantContext';
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
  CheckCircle,
  MessageCircle,
  ArrowRight,
  Building2,
  Check,
  User,
  Sparkles,
  Clock,
  ChevronRight
} from 'lucide-react';
import { restaurantInfo } from '@/data/restaurant-info';
import { CustomerPortalModal } from '@/components/cart/CustomerPortalModal';

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
    availableBranches,
    selectedBranchId,
    setSelectedBranchId,
    setSelectedBranchName,
    isSubmittingOrder,
    submitWebOrderOnly,
    submitAndSendWhatsAppOrder,
    currentCustomer,
    recentNames,
    recentAddresses,
    recentPhones,
  } = useCart();

  const { restaurant } = useTenant();
  const restaurantName = restaurant?.nombre || 'Restaurante';
  const primaryColor = restaurant?.colorPrimario || '#EAA622';
  const buttonColor = restaurant?.colorBoton || primaryColor;
  const buttonTextColor = restaurant?.colorBotonTexto || '#000000';
  const whatsappNumber = restaurant?.telefonoWhatsapp || restaurant?.telefono || restaurantInfo.whatsappNumber;
  const tenantSlug = restaurant?.slug || 'punto-g';

  const [webOrderSuccess, setWebOrderSuccess] = useState<any | null>(null);
  const [isCustomerPortalOpen, setIsCustomerPortalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    type: 'percent' | 'fixed' | 'shipping';
    value: number;
    label: string;
  } | null>(null);
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'VIP10' || code === 'PUNTOG10') {
      setAppliedCoupon({ code, type: 'percent', value: 10, label: '10% de Descuento VIP' });
      setCouponMsg({ text: '¡Cupón VIP del 10% aplicado!', isError: false });
    } else if (code === 'PROMO5' || code === 'BIENVENIDO') {
      if (subtotal < 20000) {
        setCouponMsg({ text: 'Este cupón aplica para pedidos mayores a $20.000', isError: true });
        return;
      }
      setAppliedCoupon({ code, type: 'fixed', value: 5000, label: '$5.000 de Descuento' });
      setCouponMsg({ text: '¡Descuento de $5.000 aplicado!', isError: false });
    } else if (code === 'ENVIOFREE') {
      if (deliveryType !== 'domicilio') {
        setCouponMsg({ text: 'Este cupón es válido para pedidos con Domicilio', isError: true });
        return;
      }
      setAppliedCoupon({ code, type: 'shipping', value: deliveryFee, label: 'Envío Gratis' });
      setCouponMsg({ text: '¡Costo de envío bonificado!', isError: false });
    } else {
      setCouponMsg({ text: 'Cupón no válido o expirado', isError: true });
    }
  };

  const discountAmount = appliedCoupon
    ? appliedCoupon.type === 'percent'
      ? Math.round((subtotal * appliedCoupon.value) / 100)
      : appliedCoupon.type === 'fixed'
      ? appliedCoupon.value
      : 0
    : 0;

  const effectiveDeliveryFee = appliedCoupon?.type === 'shipping' ? 0 : deliveryFee;
  const finalPayableTotal = Math.max(0, subtotal - discountAmount + effectiveDeliveryFee + tip);

  if (!isCartOpen) return null;

  const formatPrice = (val: number) => '$' + Number(val || 0).toLocaleString('es-CO');

  const handleWebOrder = async () => {
    const order = await submitWebOrderOnly();
    if (order) {
      setWebOrderSuccess(order);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => {
          setIsCartOpen(false);
          setWebOrderSuccess(null);
        }}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-[#101010] border-l border-[#242424] text-white flex flex-col shadow-2xl">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#222] flex items-center justify-between bg-[#151515]">
            <div className="flex items-center gap-2.5">
              <div 
                className="p-2 rounded-lg font-bold"
                style={{ backgroundColor: primaryColor, color: buttonTextColor }}
              >
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold uppercase font-display tracking-wide">
                  Tu Pedido
                </h2>
                <p className="text-xs text-gray-400">
                  {totalItems} {totalItems === 1 ? 'producto' : 'productos'} en tu lista • {restaurantName}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsCartOpen(false);
                setWebOrderSuccess(null);
              }}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#202020] transition-colors"
              aria-label="Cerrar pedido"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {webOrderSuccess ? (
              /* Success screen when ordered from Web */
              <div 
                className="bg-[#141414] border rounded-2xl p-6 text-center space-y-4 shadow-2xl my-auto"
                style={{ borderColor: `${primaryColor}60` }}
              >
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto border"
                  style={{ 
                    backgroundColor: `${primaryColor}20`, 
                    borderColor: `${primaryColor}50`, 
                    color: primaryColor 
                  }}
                >
                  <CheckCircle className="w-10 h-10" />
                </div>
                <div>
                  <span 
                    className="text-[10px] font-black uppercase tracking-wider"
                    style={{ color: primaryColor }}
                  >
                    {webOrderSuccess.isOffline ? '⚡ ¡Guardado en este dispositivo (Modo Offline)!' : '¡Registrado en Sistema!'}
                  </span>
                  <h3 className="text-2xl font-black text-white uppercase font-display mt-0.5">
                    PEDIDO #{webOrderSuccess.codigo}
                  </h3>
                  {webOrderSuccess.isOffline && (
                    <div className="mt-2 p-2 bg-amber-500/15 border border-amber-500/40 rounded-lg text-[11px] text-amber-300 font-bold">
                      📶 Se sincronizará automáticamente con la cocina y caja al restablecerse la conexión a internet.
                    </div>
                  )}
                </div>
                <div className="bg-[#1b1b1b] p-3 rounded-xl text-xs space-y-1 text-left border border-[#2b2b2b]">
                  <p className="text-gray-300">
                    <strong className="text-white">Cliente:</strong> {webOrderSuccess.cliente}
                  </p>
                  <p className="text-gray-300">
                    <strong className="text-white">Modalidad:</strong> {webOrderSuccess.tipo === 'mesa' ? `En Mesa (${webOrderSuccess.numeroMesa})` : webOrderSuccess.tipo === 'domicilio' ? 'Domicilio' : 'Para Llevar'}
                  </p>
                  <p className="text-gray-300">
                    <strong className="text-white">Total a pagar:</strong> <span className="font-black" style={{ color: primaryColor }}>{formatPrice(webOrderSuccess.total)}</span>
                  </p>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Tu pedido ha sido recibido en la plataforma de {restaurantName} y enviado a la cocina. Se enviará un mensaje a tu WhatsApp ({webOrderSuccess.telefono}) con la confirmación.
                </p>
                
                <div className="space-y-2 pt-2">
                  <Link
                    href={`/r/${tenantSlug}/pedido/${webOrderSuccess.codigo}`}
                    onClick={() => {
                      setIsCartOpen(false);
                      setWebOrderSuccess(null);
                    }}
                    className="w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95"
                    style={{ backgroundColor: buttonColor, color: buttonTextColor }}
                  >
                    <span>🔴 Rastrear mi Pedido en Vivo 👉</span>
                  </Link>

                  <a
                    href={`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(
                      `¡Hola ${restaurantName}! Acabo de hacer el pedido #${webOrderSuccess.codigo} desde la web por ${formatPrice(webOrderSuccess.total)}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Ver / Notificar en WhatsApp</span>
                  </a>

                  <button
                    onClick={() => {
                      setWebOrderSuccess(null);
                      setIsCartOpen(false);
                    }}
                    className="w-full py-2.5 bg-[#222] hover:bg-[#2c2c2c] text-gray-300 rounded-xl text-xs font-bold transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div 
                  className="w-20 h-20 rounded-full bg-[#181818] border border-[#262626] flex items-center justify-center mb-4"
                  style={{ color: primaryColor }}
                >
                  <ShoppingBag className="w-10 h-10 opacity-70" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Tu carrito está vacío</h3>
                <p className="text-xs text-gray-400 max-w-xs mb-6">
                  ¡El auténtico sabor de {restaurantName}! Explora nuestra carta y agrega tus platos favoritos.
                </p>
                <Link
                  href={`/r/${tenantSlug}/menu`}
                  onClick={() => setIsCartOpen(false)}
                  className="font-extrabold text-sm px-6 py-3 rounded-full transition-all shadow-lg"
                  style={{ backgroundColor: buttonColor, color: buttonTextColor }}
                >
                  VER MENÚ COMPLETO
                </Link>
              </div>
            ) : (
              <>
                {/* Product List */}
                <div className="space-y-3">
                  {items.map((item, idx) => {
                    const addonsCost = (item.selectedAddons || []).reduce((sum, a) => sum + (a.precio || 0), 0);
                    const itemUnitPrice = item.product.precio + addonsCost;
                    const itemTotalPrice = itemUnitPrice * item.quantity;

                    return (
                      <div
                        key={idx}
                        className="bg-[#161616] border border-[#242424] rounded-xl p-3 flex gap-3 relative group"
                      >
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[#202020] flex-shrink-0">
                          <Image
                            src={item.product.imagen}
                            alt={item.product.nombre}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0 pr-6">
                          <h4 className="text-xs font-bold text-white truncate">
                            {item.product.nombre}
                          </h4>
                          <p className="text-xs font-black mt-0.5" style={{ color: primaryColor }}>
                            {formatPrice(itemTotalPrice)}
                          </p>

                          {/* Toppings / Addons */}
                          {item.selectedAddons && item.selectedAddons.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.selectedAddons.map((addon, aIdx) => (
                                <span
                                  key={aIdx}
                                  className="text-[9px] bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700"
                                  style={{ color: primaryColor }}
                                >
                                  +{addon.nombre}
                                </span>
                              ))}
                            </div>
                          )}

                          {item.notes && (
                            <p className="text-[10px] text-gray-400 italic line-clamp-1 mt-1">
                              👉 {item.notes}
                            </p>
                          )}

                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateQuantity(idx, item.quantity - 1)}
                              className="w-6 h-6 rounded bg-[#252525] hover:bg-[#303030] flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold text-white w-4 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(idx, item.quantity + 1)}
                              className="w-6 h-6 rounded bg-[#252525] hover:bg-[#303030] flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => removeFromCart(idx)}
                          className="absolute top-3 right-3 text-gray-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                          aria-label="Eliminar del pedido"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Sede Selector when more than 1 Sede exists */}
                {availableBranches.length > 1 && (
                  <div className="bg-[#161616] border border-[#252525] rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <label 
                        className="text-[10px] font-black uppercase flex items-center gap-1.5"
                        style={{ color: primaryColor }}
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Sede de Despacho / Atención:</span>
                      </label>
                      <span 
                        className="text-[9px] font-bold px-2 py-0.5 rounded-full border"
                        style={{ 
                          backgroundColor: `${primaryColor}15`, 
                          borderColor: `${primaryColor}40`, 
                          color: primaryColor 
                        }}
                      >
                        {availableBranches.length} Sedes
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {availableBranches.map((branch) => {
                        const isSelected = selectedBranchId === branch.id;
                        return (
                          <button
                            key={branch.id}
                            type="button"
                            onClick={() => {
                              setSelectedBranchId(branch.id);
                              setSelectedBranchName(branch.nombre);
                            }}
                            className="p-2.5 rounded-xl text-left border transition-all cursor-pointer"
                            style={
                              isSelected
                                ? { backgroundColor: `${primaryColor}18`, borderColor: primaryColor }
                                : { backgroundColor: '#1e1e1e', borderColor: '#2c2c2c' }
                            }
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span
                                className="text-xs font-black truncate"
                                style={{ color: isSelected ? primaryColor : '#ffffff' }}
                              >
                                {branch.nombre}
                              </span>
                              {isSelected && <Check className="w-3.5 h-3.5 shrink-0" style={{ color: primaryColor }} />}
                            </div>
                            {branch.direccion && (
                              <p className="text-[10px] text-gray-400 truncate mt-0.5">{branch.direccion}</p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Delivery & Ordering Mode */}
                <div className="bg-[#161616] border border-[#252525] rounded-xl p-3.5 space-y-2.5">
                  <h4 className="text-[11px] font-bold text-gray-300 uppercase tracking-wider flex items-center justify-between">
                    <span>¿Dónde disfrutarás tu pedido?</span>
                    {deliveryType === 'mesa' && (
                      <span 
                        className="font-black text-[10px] px-2 py-0.5 rounded border"
                        style={{ 
                          backgroundColor: `${primaryColor}15`, 
                          borderColor: `${primaryColor}40`, 
                          color: primaryColor 
                        }}
                      >
                        EN MESA
                      </span>
                    )}
                  </h4>
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setDeliveryType('domicilio')}
                      className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg font-bold transition-all border cursor-pointer"
                      style={
                        deliveryType === 'domicilio'
                          ? { backgroundColor: buttonColor, color: buttonTextColor, borderColor: buttonColor }
                          : { backgroundColor: '#202020', color: '#d1d5db', borderColor: '#2d2d2d' }
                      }
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="text-[10px] leading-tight">Domicilio</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setDeliveryType('recoger')}
                      className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg font-bold transition-all border cursor-pointer"
                      style={
                        deliveryType === 'recoger'
                          ? { backgroundColor: buttonColor, color: buttonTextColor, borderColor: buttonColor }
                          : { backgroundColor: '#202020', color: '#d1d5db', borderColor: '#2d2d2d' }
                      }
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span className="text-[10px] leading-tight">Para Llevar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryType('mesa')}
                      className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg font-bold transition-all border cursor-pointer"
                      style={
                        deliveryType === 'mesa'
                          ? { backgroundColor: buttonColor, color: buttonTextColor, borderColor: buttonColor }
                          : { backgroundColor: '#202020', color: '#d1d5db', borderColor: '#2d2d2d' }
                      }
                    >
                      <UtensilsCrossed className="w-3.5 h-3.5" />
                      <span className="text-[10px] leading-tight">En Mesa</span>
                    </button>
                  </div>

                  {deliveryType === 'mesa' && (
                    <div className="pt-1">
                      <label 
                        className="block text-[10px] font-bold uppercase mb-1"
                        style={{ color: primaryColor }}
                      >
                        Número de Mesa o Barra *
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Mesa 1, Mesa 4, Barra 2..."
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        className="w-full bg-[#202020] border rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
                        style={{ borderColor: tableNumber ? primaryColor : undefined }}
                      />
                    </div>
                  )}
                </div>

                {/* Customer Details Form & Customer Account Access */}
                <div className="bg-[#161616] border border-[#252525] rounded-xl p-3.5 space-y-3">
                  
                  {/* Banner de Inicio de Sesión / Mis Pedidos */}
                  {currentCustomer ? (
                    <div className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
                          style={{ backgroundColor: `${primaryColor}25`, color: primaryColor }}
                        >
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white leading-tight">
                            Hola, {currentCustomer.nombre}
                          </p>
                          <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                            <span>✓</span> Datos precargados en tu formulario
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsCustomerPortalOpen(true)}
                        className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-[#262626] hover:bg-[#333] text-gray-200 border border-[#3e3e3e] transition flex items-center gap-1 cursor-pointer"
                      >
                        <Clock className="w-3 h-3" style={{ color: primaryColor }} />
                        <span>Mis Pedidos</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsCustomerPortalOpen(true)}
                      className="w-full bg-[#1c1c1c] hover:bg-[#222] border border-[#2b2b2b] hover:border-brand-yellow/40 rounded-xl p-2.5 text-left transition flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-7 h-7 rounded-lg flex items-center justify-center font-bold"
                          style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                        >
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white group-hover:text-brand-yellow transition">
                            ¿Ya tienes cuenta o quieres registrarte?
                          </p>
                          <p className="text-[10px] text-gray-400">
                            Ingresa para ver tus pedidos anteriores, facturas y favoritos
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white transition" />
                    </button>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <h4 className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">
                      Datos de Entrega / Facturación:
                    </h4>
                    {(customerName || customerPhone || customerAddress) && (
                      <span className="text-[9px] text-gray-500 font-semibold flex items-center gap-1">
                        <span>💾</span> Recuerda lo último escrito
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[10px] font-semibold text-gray-400">
                        Tu Nombre:
                      </label>
                      {recentNames.length > 1 && (
                        <span className="text-[9px] text-gray-500">
                          {recentNames.length} nombres guardados
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      list="recent-customer-names"
                      autoComplete="name"
                      placeholder="Ej: Juan Pérez"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-[#202020] border border-[#2d2d2d] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none transition"
                      style={{ borderColor: customerName ? primaryColor : undefined }}
                    />
                    <datalist id="recent-customer-names">
                      {recentNames.map((name, i) => (
                        <option key={i} value={name} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[10px] font-semibold text-gray-400">
                        Teléfono / WhatsApp *:
                      </label>
                      {recentPhones.length > 1 && (
                        <span className="text-[9px] text-gray-500">
                          {recentPhones.length} teléfonos guardados
                        </span>
                      )}
                    </div>
                    <input
                      type="tel"
                      required
                      list="recent-customer-phones"
                      autoComplete="tel"
                      placeholder="Ej: 315 123 4567"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-[#202020] border border-[#2d2d2d] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none transition"
                      style={{ borderColor: customerPhone ? primaryColor : undefined }}
                    />
                    <datalist id="recent-customer-phones">
                      {recentPhones.map((phone, i) => (
                        <option key={i} value={phone} />
                      ))}
                    </datalist>
                  </div>

                  {deliveryType === 'domicilio' && (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[10px] font-semibold text-gray-400">
                          Dirección y Barrio:
                        </label>
                        {recentAddresses.length > 1 && (
                          <span className="text-[9px] text-gray-500">
                            {recentAddresses.length} direcciones guardadas
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        list="recent-customer-addresses"
                        autoComplete="street-address"
                        placeholder="Ej: Calle 9 # 45-12, Barrio Granada"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        className="w-full bg-[#202020] border border-[#2d2d2d] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none transition"
                        style={{ borderColor: customerAddress ? primaryColor : undefined }}
                      />
                      <datalist id="recent-customer-addresses">
                        {recentAddresses.map((addr, i) => (
                          <option key={i} value={addr} />
                        ))}
                      </datalist>
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
                          className="py-1.5 px-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer"
                          style={
                            paymentMethod === m
                              ? { backgroundColor: buttonColor, color: buttonTextColor, borderColor: buttonColor }
                              : { backgroundColor: '#202020', color: '#9ca3af', borderColor: '#2d2d2d' }
                          }
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
                      placeholder="Ej: Salsas extras, término medio, bien caliente..."
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      className="w-full bg-[#202020] border border-[#2d2d2d] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none resize-none transition"
                      style={{ borderColor: customerNotes ? primaryColor : undefined }}
                    />
                  </div>
                </div>

                {/* Propinas / Tips Module */}
                <div className="bg-[#161616] border border-[#252525] rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                      <span>Propina Voluntaria al Equipo</span>
                    </span>
                    <span className="text-xs font-black" style={{ color: primaryColor }}>
                      {formatPrice(tip)}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 leading-tight">
                    El 100% de tu propina va directo al equipo de cocina y meseros de {restaurantName}.
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
                        className="py-1.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer"
                        style={
                          tipPercentage === btn.pct
                            ? { backgroundColor: buttonColor, color: buttonTextColor, borderColor: buttonColor }
                            : { backgroundColor: '#202020', color: '#9ca3af', borderColor: '#2d2d2d' }
                        }
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
          {!webOrderSuccess && items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[#222] bg-[#141414] space-y-3">
              {/* Cupón Promocional */}
              <form onSubmit={handleApplyCoupon} className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Cupón (ej: VIP10, PROMO5)"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value);
                    if (couponMsg) setCouponMsg(null);
                  }}
                  className="flex-1 bg-[#1a1a1c] border border-[#2e2e32] rounded-xl px-3 py-1.5 text-xs text-white uppercase placeholder:normal-case focus:border-brand-yellow outline-none font-bold"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-[#252528] hover:bg-[#303036] text-gray-200 text-xs font-bold rounded-xl transition border border-[#38383e]"
                >
                  Aplicar
                </button>
              </form>

              {couponMsg && (
                <div className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${couponMsg.isError ? 'bg-red-950/40 text-red-400 border border-red-800/40' : 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'}`}>
                  {couponMsg.text}
                </div>
              )}

              {appliedCoupon && (
                <div className="flex justify-between items-center text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 px-2.5 py-1 rounded-lg">
                  <span className="font-bold">🎉 {appliedCoupon.label}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedCoupon(null);
                      setCouponCode('');
                      setCouponMsg(null);
                    }}
                    className="text-gray-400 hover:text-white text-[10px] underline ml-2"
                  >
                    Quitar
                  </button>
                </div>
              )}

              <div className="space-y-1 text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-white">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Descuento cupón:</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                {deliveryType === 'domicilio' && (
                  <div className="flex justify-between">
                    <span>Domicilio:</span>
                    <span className="font-semibold text-white">
                      {appliedCoupon?.type === 'shipping' ? (
                        <span className="text-emerald-400 font-bold line-through">{formatPrice(deliveryFee)} (Gratis)</span>
                      ) : (
                        formatPrice(deliveryFee)
                      )}
                    </span>
                  </div>
                )}
                {tip > 0 && (
                  <div className="flex justify-between" style={{ color: primaryColor }}>
                    <span>Propina voluntaria:</span>
                    <span className="font-bold">{formatPrice(tip)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-[#252525]">
                  <span>TOTAL A PAGAR:</span>
                  <span className="text-lg font-black" style={{ color: primaryColor }}>{formatPrice(finalPayableTotal)}</span>
                </div>
              </div>

              {/* TWO CHECKOUT BUTTONS */}
              <div className="space-y-2 pt-1">
                {/* BOTÓN 1: HACER PEDIDO (DESDE LA WEB) */}
                <button
                  type="button"
                  disabled={isSubmittingOrder}
                  onClick={handleWebOrder}
                  className="w-full font-black text-xs sm:text-sm py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                  style={{ backgroundColor: buttonColor, color: buttonTextColor }}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    {isSubmittingOrder ? 'REGISTRANDO...' : 'HACER PEDIDO (DESDE LA WEB)'}
                  </span>
                </button>

                {/* BOTÓN 2: HACER PEDIDO Y CONFIRMAR POR WHATSAPP */}
                <button
                  type="button"
                  disabled={isSubmittingOrder}
                  onClick={submitAndSendWhatsAppOrder}
                  className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4 fill-current" />
                  <span>
                    {isSubmittingOrder ? 'REGISTRANDO...' : 'HACER PEDIDO Y CONFIRMAR POR WHATSAPP'}
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500 pt-1 text-center">
                <span>🌐 <strong>Desde la web:</strong> Guarda tu orden en el sistema de {restaurantName}.</span>
                <span>📱 <strong>Por WhatsApp:</strong> Guarda tu orden y abre el chat oficial de inmediato.</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal del Portal de Clientes (Historial, Facturas y Pedidos Habituales) */}
      <CustomerPortalModal
        isOpen={isCustomerPortalOpen}
        onClose={() => setIsCustomerPortalOpen(false)}
      />
    </div>
  );
};
