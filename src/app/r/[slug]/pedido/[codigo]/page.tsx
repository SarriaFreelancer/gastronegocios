'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ClipboardCheck, 
  Flame, 
  PackageCheck, 
  Bike, 
  UtensilsCrossed, 
  ShoppingBag, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MapPin, 
  CreditCard, 
  MessageCircle, 
  RefreshCw, 
  Star, 
  ArrowLeft,
  Share2
} from 'lucide-react';
import { restaurantInfo } from '@/data/restaurant-info';

interface OrderItem {
  id: number;
  nombre: string;
  cantidad: number;
  precio: number;
  subtotal: number;
  notas?: string | null;
}

interface OrderData {
  id: number;
  codigo: string;
  cliente: string;
  telefono: string;
  tipo: string;
  numeroMesa?: string | null;
  direccion?: string | null;
  subtotal: number;
  costoEnvio: number;
  propina: number;
  total: number;
  metodoPago: string;
  notas?: string | null;
  estado: string;
  createdAt: string;
  items: OrderItem[];
}

export default function TenantOrderTrackingPage() {
  const params = useParams();
  const slug = ((params?.slug as string) || 'punto-g').toLowerCase().trim();
  const rawCode = params?.codigo as string;
  // Clean leading '#' and trim
  const codigo = rawCode
    ? decodeURIComponent(rawCode).replace(/^#+/, '').trim()
    : '';

  const [restaurantName, setRestaurantName] = useState<string>('Punto G');
  const [whatsappNumber, setWhatsappNumber] = useState<string>(restaurantInfo.whatsappNumber);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch restaurant metadata
  useEffect(() => {
    fetch(`/api/restaurants?slug=${slug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.restaurant) {
          if (data.restaurant.nombre) setRestaurantName(data.restaurant.nombre);
          if (data.restaurant.telefonoWhatsapp) setWhatsappNumber(data.restaurant.telefonoWhatsapp);
        }
      })
      .catch(() => {});
  }, [slug]);

  // Format currency
  const formatPrice = (val: number) => '$' + Number(val || 0).toLocaleString('es-CO');

  // Fetch order status
  const fetchOrder = useCallback(async (isInitial = false) => {
    if (!codigo) return;
    try {
      if (isInitial) setLoading(true);
      const res = await fetch(`/api/orders/${encodeURIComponent(codigo)}?restaurantSlug=${slug}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError(`No encontramos ningún pedido registrado con el código #${codigo}.`);
        } else {
          setError('Ocurrió un error al consultar el estado de tu pedido.');
        }
        return;
      }
      const data = await res.json();
      setOrder(data);
      setError(null);
      setLastCheck(new Date());

      // Save to localStorage for quick retrieval
      if (typeof window !== 'undefined' && data.codigo) {
        localStorage.setItem(`order_last_${slug}`, data.codigo);
        if (slug === 'punto-g' || slug === 'puntog') {
          localStorage.setItem('punto_g_last_order', data.codigo);
        }
      }
    } catch {
      setError('Problema de conexión con el servidor. Reintentando...');
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [codigo, slug]);

  // Polling every 4.5 seconds for live status updates
  useEffect(() => {
    fetchOrder(true);
    const interval = setInterval(() => {
      fetchOrder(false);
    }, 4500);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  const copyTrackingLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const getStepIndex = (estado: string) => {
    const norm = (estado || '').toLowerCase().trim();
    if (norm.includes('cancelad')) return -1;
    if (norm.includes('entregad') || norm.includes('completad') || norm.includes('finalizad')) return 4;
    if (norm.includes('despachad') || norm.includes('camino') || norm.includes('ruta')) return 3;
    if (norm === 'listo' || norm.includes('listo')) return 2;
    if (norm.includes('prepara') || norm.includes('cocin') || norm.includes('fuego')) return 1;
    if (norm.includes('pendient') || norm.includes('recibid')) return 0;
    return 0;
  };

  const steps = [
    {
      id: 0,
      title: 'Pedido Recibido',
      subtitle: 'Registrado y enviado a cocina',
      icon: ClipboardCheck,
      color: 'amber',
    },
    {
      id: 1,
      title: 'En la Cocina / Parrilla',
      subtitle: 'Preparando con todo el sabor',
      icon: Flame,
      color: 'blue',
    },
    {
      id: 2,
      title: 'Listo en Cocina',
      subtitle: 'Empacado y listo para salir',
      icon: PackageCheck,
      color: 'indigo',
    },
    {
      id: 3,
      title: order?.tipo === 'domicilio' ? 'En Camino / Despachado' : 'Saliendo a tu Mesa',
      subtitle: order?.tipo === 'domicilio' ? 'Domiciliario en ruta a tu dirección' : 'Mesero llevándolo a tu mesa',
      icon: order?.tipo === 'domicilio' ? Bike : UtensilsCrossed,
      color: 'purple',
    },
    {
      id: 4,
      title: '¡Entregado!',
      subtitle: `¡A disfrutar tu ${restaurantName}!`,
      icon: CheckCircle2,
      color: 'emerald',
    },
  ];

  if (loading && !order) {
    return (
      <div className="min-h-screen bg-[#080808] pt-24 pb-16 px-4 flex flex-col items-center justify-center text-center">
        <RefreshCw className="w-12 h-12 text-brand-yellow animate-spin mb-4" />
        <h2 className="text-xl font-black text-white uppercase font-display tracking-wider">
          Buscando tu pedido #{codigo}...
        </h2>
        <p className="text-sm text-gray-400 mt-1">Conectando con el sistema en tiempo real.</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#080808] pt-28 pb-16 px-4">
        <div className="max-w-md mx-auto bg-[#121212] border border-[#222] rounded-2xl p-6 sm:p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-950/60 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto">
            <XCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase font-display">
            Pedido no Encontrado
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            {error || `No encontramos ningún pedido registrado con el código #${codigo}. Verifica el código o realiza un nuevo pedido.`}
          </p>

          <div className="pt-3 space-y-2.5">
            <Link
              href={`/r/${slug}/rastreo`}
              className="w-full py-3 bg-brand-yellow hover:bg-brand-yellowHover text-black font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-colors shadow-glow"
            >
              <span>Buscar otro código</span>
            </Link>
            <Link
              href={`/r/${slug}/menu`}
              className="w-full py-3 bg-[#1c1c1c] hover:bg-[#252525] text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-colors border border-[#2b2b2b]"
            >
              <span>Ir al Menú</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentStep = getStepIndex(order.estado);
  const isCancelled = order.estado.toLowerCase().includes('cancelad');

  return (
    <div className="min-h-screen bg-[#080808] pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/r/${slug}/rastreo`}
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-brand-yellow transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a mis pedidos</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={copyTrackingLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181818] border border-[#2a2a2a] text-xs font-semibold text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? '¡Enlace copiado!' : 'Compartir seguimiento'}</span>
            </button>

            <button
              onClick={() => fetchOrder(false)}
              className="p-1.5 rounded-lg bg-[#181818] border border-[#2a2a2a] text-gray-400 hover:text-brand-yellow transition-colors"
              title="Actualizar estado"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Status Card */}
        <div className="bg-[#121212] border border-[#222] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          
          {/* Subtle glow background */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-brand-yellow/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Status Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-[#202020] relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  Seguimiento en Vivo
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white uppercase font-display tracking-tight flex items-center gap-2">
                PEDIDO <span className="text-brand-yellow">#{order.codigo}</span>
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Hola <strong className="text-white">{order.cliente}</strong>, aquí puedes seguir el progreso de tu orden en tiempo real sin recargar.
              </p>
            </div>

            {/* Modality Tag */}
            <div className="text-right">
              {order.tipo === 'mesa' ? (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-yellow text-black font-black text-xs uppercase tracking-wider shadow-glow">
                  <UtensilsCrossed className="w-4 h-4" />
                  <span>Mesa {order.numeroMesa || 'S/N'}</span>
                </div>
              ) : order.tipo === 'domicilio' ? (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-500 text-white font-black text-xs uppercase tracking-wider">
                  <Bike className="w-4 h-4" />
                  <span>Domicilio</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-500 text-white font-black text-xs uppercase tracking-wider">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Para Llevar</span>
                </div>
              )}
              <p className="text-[11px] text-gray-500 font-mono mt-1">
                {new Date(order.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </p>
            </div>
          </div>

          {/* Stepper Timeline (5 Steps: 0 to 4) */}
          {isCancelled ? (
            <div className="my-8 p-6 rounded-2xl bg-red-950/40 border border-red-500/50 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-red-900/60 text-red-400 flex items-center justify-center mx-auto">
                <XCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white uppercase">Pedido Cancelado</h3>
              <p className="text-xs text-gray-300 max-w-md mx-auto">
                Este pedido ha sido cancelado. Si tienes preguntas o necesitas reprogramarlo, contáctanos por WhatsApp.
              </p>
            </div>
          ) : (
            <div className="py-8 relative z-10">
              
              {/* Stepper Bar for Desktop */}
              <div className="relative">
                {/* Connecting Line */}
                <div className="absolute top-6 left-6 right-6 h-1 bg-[#222] -z-0 hidden md:block">
                  <div
                    className="h-full bg-brand-yellow transition-all duration-700 ease-out shadow-glow"
                    style={{
                      width: `${(Math.max(0, currentStep) / (steps.length - 1)) * 100}%`,
                    }}
                  />
                </div>

                {/* Steps Grid (5 Columns on Desktop) */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-2 relative z-10">
                  {steps.map((step) => {
                    const isDone = currentStep >= step.id;
                    const isCurrent = currentStep === step.id;
                    const StepIcon = step.icon;

                    return (
                      <div
                        key={step.id}
                        className={`flex md:flex-col items-center md:items-center gap-3.5 md:gap-2 transition-all ${
                          isDone ? 'opacity-100' : 'opacity-40'
                        }`}
                      >
                        {/* Circle Indicator */}
                        <div
                          className={`w-11 h-11 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-all ${
                            isCurrent
                              ? 'bg-brand-yellow text-black scale-110 shadow-glow font-black ring-4 ring-brand-yellow/30'
                              : isDone
                              ? 'bg-[#1e1e1e] border-2 border-brand-yellow text-brand-yellow'
                              : 'bg-[#181818] border border-[#2e2e2e] text-gray-500'
                          }`}
                        >
                          <StepIcon className="w-5 h-5 md:w-6 md:h-6" />
                        </div>

                        {/* Step Text */}
                        <div className="text-left md:text-center">
                          <h4
                            className={`text-xs md:text-xs font-black uppercase leading-tight ${
                              isCurrent
                                ? 'text-brand-yellow'
                                : isDone
                                ? 'text-white'
                                : 'text-gray-500'
                            }`}
                          >
                            {step.title}
                          </h4>
                          <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">
                            {step.subtitle}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Banner */}
              <div className="mt-8 p-4 rounded-2xl bg-[#181818] border border-[#272727] flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/30 flex-shrink-0">
                  {currentStep === 0 && <ClipboardCheck className="w-5 h-5" />}
                  {currentStep === 1 && <Flame className="w-5 h-5 animate-bounce" />}
                  {currentStep === 2 && <PackageCheck className="w-5 h-5 animate-pulse" />}
                  {currentStep === 3 && <Bike className="w-5 h-5 animate-pulse" />}
                  {currentStep === 4 && <Star className="w-5 h-5 text-brand-yellow fill-brand-yellow" />}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-white">
                    {currentStep === 0 && '¡Orden en fila de cocina!'}
                    {currentStep === 1 && '¡En el fuego! Preparando tus platos'}
                    {currentStep === 2 && '¡Platos listos en cocina!'}
                    {currentStep === 3 && (order.tipo === 'domicilio' ? '¡Tu comida va en camino con domiciliario!' : '¡Tu pedido va saliendo a tu mesa!')}
                    {currentStep === 4 && '¡Tu pedido fue entregado!'}
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {currentStep === 0 && 'Tu pedido fue recibido en cocina. En breve comenzará su cocción artesanal.'}
                    {currentStep === 1 && 'Nuestros parrilleros están preparando tus hamburguesas y acompañamientos con los mejores ingredientes.'}
                    {currentStep === 2 && 'Tu pedido está recién empacado y verificado, esperando salida de despacho.'}
                    {currentStep === 3 && (order.tipo === 'domicilio' ? 'Tu comida va caliente en camino hacia tu dirección con nuestro domiciliario.' : order.tipo === 'mesa' ? `El mesero lleva tu pedido caliente a la Mesa ${order.numeroMesa || ''}.` : 'Tu orden está lista para entrega en mostrador.')}
                    {currentStep === 4 && '¡Esperamos que lo disfrutes al máximo! No olvides dejarnos tu calificación.'}
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* Calificar CTA if Entregado */}
          {currentStep === 4 && (
            <div className="mt-4 p-5 rounded-2xl bg-gradient-to-r from-brand-yellow/20 via-[#181818] to-transparent border border-brand-yellow/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-brand-yellow text-black rounded-xl font-bold shadow-glow">
                  <Star className="w-6 h-6 fill-black" />
                </div>
                <div>
                  <h4 className="text-base font-black text-white uppercase">¿Qué tal estuvo tu experiencia?</h4>
                  <p className="text-xs text-gray-300">Ayúdanos a seguir mejorando calificando el sabor y la atención.</p>
                </div>
              </div>
              <Link
                href={`/r/${slug}/calificar?mesa=${encodeURIComponent(order.numeroMesa || 'Web')}&order=${order.codigo}`}
                className="bg-brand-yellow hover:bg-brand-yellowHover text-black font-black text-xs px-5 py-3 rounded-xl uppercase tracking-wider transition-all shadow-glow hover:scale-105 active:scale-95 flex-shrink-0"
              >
                Calificar ahora ⭐
              </Link>
            </div>
          )}

        </div>

        {/* Order Details & Items Card */}
        <div className="bg-[#121212] border border-[#222] rounded-3xl p-6 sm:p-8 space-y-6">
          <h3 className="text-lg font-black text-white uppercase font-display tracking-wider flex items-center justify-between">
            <span>Detalle de tu Orden</span>
            <span className="text-xs font-mono font-normal text-gray-400">
              {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
            </span>
          </h3>

          {/* Items */}
          <div className="space-y-3 divide-y divide-[#1e1e1e]">
            {order.items.map((item, idx) => (
              <div key={idx} className="pt-3 first:pt-0 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-md bg-[#222] text-brand-yellow font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {item.cantidad}x
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">
                      {item.nombre}
                    </h4>
                    {item.notas && (
                      <p className="text-xs text-brand-yellow/80 mt-0.5 italic">
                        Nota: {item.notas}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-sm font-black text-brand-yellow whitespace-nowrap">
                  {formatPrice(item.precio * item.cantidad)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Summary */}
          <div className="pt-4 border-t border-[#202020] space-y-2 text-xs text-gray-400">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="text-white font-semibold">{formatPrice(order.subtotal)}</span>
            </div>
            {order.costoEnvio > 0 && (
              <div className="flex justify-between">
                <span>Costo Domicilio:</span>
                <span className="text-white font-semibold">{formatPrice(order.costoEnvio)}</span>
              </div>
            )}
            {order.propina > 0 && (
              <div className="flex justify-between text-brand-yellow">
                <span>Propina voluntaria al equipo:</span>
                <span className="font-bold">{formatPrice(order.propina)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-white pt-2 border-t border-[#252525]">
              <span>TOTAL:</span>
              <span className="text-brand-yellow text-lg font-black">{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Order Info & Delivery Meta */}
          <div className="pt-4 border-t border-[#202020] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-[#181818] p-3.5 rounded-xl border border-[#252525]">
              <span className="text-gray-400 font-bold uppercase text-[10px] block mb-1">
                Método de Pago:
              </span>
              <div className="flex items-center gap-2 text-white font-bold">
                <CreditCard className="w-4 h-4 text-brand-yellow" />
                <span>{order.metodoPago || 'Efectivo'}</span>
              </div>
            </div>

            <div className="bg-[#181818] p-3.5 rounded-xl border border-[#252525]">
              <span className="text-gray-400 font-bold uppercase text-[10px] block mb-1">
                {order.tipo === 'mesa' ? 'Ubicación en restaurante:' : 'Lugar de entrega:'}
              </span>
              <div className="flex items-center gap-2 text-white font-bold truncate">
                <MapPin className="w-4 h-4 text-brand-yellow flex-shrink-0" />
                <span className="truncate">
                  {order.tipo === 'mesa'
                    ? `Mesa #${order.numeroMesa}`
                    : order.direccion || 'Recoger en restaurante'}
                </span>
              </div>
            </div>
          </div>

          {/* Order Notes */}
          {order.notas && (
            <div className="bg-[#1c1408] border border-amber-600/30 p-3.5 rounded-xl text-xs text-amber-300">
              <strong className="text-brand-yellow block mb-0.5">Observaciones adicionales:</strong>
              {order.notas}
            </div>
          )}

        </div>

        {/* Support CTA */}
        <div className="bg-[#141414] border border-[#242424] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="p-3 bg-brand-whatsapp/20 text-brand-whatsapp rounded-xl flex-shrink-0">
              <MessageCircle className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">¿Tienes alguna pregunta sobre tu pedido?</h4>
              <p className="text-xs text-gray-400">Escríbenos directamente a nuestra línea oficial de WhatsApp.</p>
            </div>
          </div>
          <a
            href={`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(
              `¡Hola ${restaurantName}! Quiero consultar sobre mi pedido #${order.codigo}.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-2.5 bg-brand-whatsapp hover:bg-[#20ba59] text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 flex-shrink-0 shadow-sm"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Chat WhatsApp</span>
          </a>
        </div>

        {/* Live sync footer indicator */}
        <div className="text-center text-xs text-gray-500 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Actualización en tiempo real sin recargar • Último chequeo: {lastCheck.toLocaleTimeString()}</span>
        </div>

      </div>
    </div>
  );
}
