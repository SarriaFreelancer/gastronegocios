'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useSearchParams } from 'next/navigation';
import {
  Utensils,
  UtensilsCrossed,
  MapPin,
  Clock,
  Sparkles,
  Plus,
  Building2,
  Check,
  Flame,
  ArrowRight,
  MessageCircle,
  PhoneCall,
  Star,
  ShieldCheck,
  Tag,
  Zap,
  Bot,
  Send,
  CheckCheck,
  MessageSquare,
} from 'lucide-react';
import { HeroSection } from '@/components/home/HeroSection';
import { CategorySection } from '@/components/home/CategorySection';
import { FeaturedProductsSection } from '@/components/home/FeaturedProductsSection';
import { PromotionBanner } from '@/components/home/PromotionBanner';
import { ParrillaSection } from '@/components/home/ParrillaSection';
import { VirtualAssistantSection } from '@/components/home/VirtualAssistantSection';
import { Logo } from '@/components/ui/Logo';
import { ProductCustomizerModal } from '@/components/menu/ProductCustomizerModal';
import { useCart } from '@/context/CartContext';
import { useTenant } from '@/context/TenantContext';

export default function TenantLandingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = ((params?.slug as string) || 'punto-g').toLowerCase().trim();
  const isPuntoG = slug === 'punto-g' || slug === 'puntog';

  const { restaurant } = useTenant();

  // Si es Punto G y tiene la plantilla por defecto, podemos renderizar la experiencia completa original
  if (isPuntoG && (!restaurant?.plantilla || restaurant.plantilla === 'plantilla-actual')) {
    return (
      <div className="bg-[#080808] min-h-screen text-white space-y-0">
        <HeroSection />
        <CategorySection />
        <FeaturedProductsSection />
        <PromotionBanner />
        <ParrillaSection />
        <VirtualAssistantSection />
      </div>
    );
  }

  return <DynamicClientLanding slug={slug} searchParams={searchParams} />;
}

function DynamicClientLanding({
  slug,
  searchParams,
}: {
  slug: string;
  searchParams: any;
}) {
  const { addToCart, setIsCartOpen } = useCart();
  const { restaurant, loading: tenantLoading } = useTenant();

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [customizerProduct, setCustomizerProduct] = useState<any | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Chat del Asistente Virtual Interactivo para el restaurante
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string; time: string }>>([]);

  useEffect(() => {
    if (restaurant?.nombre) {
      setChatMessages([
        {
          sender: 'bot',
          text: `¡Hola! 👋 Bienvenido a ${restaurant.nombre}. ¿Qué se te antoja hoy?`,
          time: '12:00',
        },
        {
          sender: 'user',
          text: 'Quisiera ver sus especialidades y pedir a domicilio.',
          time: '12:01',
        },
        {
          sender: 'bot',
          text: `¡Con gusto! 😋 Puedes pedir a domicilio o para recoger directamente por nuestra línea de WhatsApp.`,
          time: '12:01',
        },
      ]);
    }
  }, [restaurant?.nombre]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userText = chatInput.trim();
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

    setChatMessages((prev) => [...prev, { sender: 'user', text: userText, time: timeStr }]);
    setChatInput('');

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `¡Excelente elección! 🍔 Dale clic a 'Pedir por WhatsApp' para confirmar los detalles directamente a nuestra línea oficial.`,
          time: timeStr,
        },
      ]);
    }, 700);
  };

  const formatCOP = (num: number) => '$' + (num || 0).toLocaleString('es-CO');

  useEffect(() => {
    if (!restaurant) return;
    if (restaurant.branches && restaurant.branches.length > 0 && !selectedBranchId) {
      setSelectedBranchId(restaurant.branches[0].id);
    }

    setDataLoading(true);
    const catReq = fetch(`/api/categories?restaurantId=${restaurant.id}&principales=true`)
      .then((res) => (res.ok ? res.json() : []))
      .then((cats) => setCategories(Array.isArray(cats) ? cats : []))
      .catch(() => setCategories([]));

    const prodReq = fetch(`/api/products?restaurantId=${restaurant.id}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((prods) => setProducts(Array.isArray(prods) ? prods : []))
      .catch(() => setProducts([]));

    Promise.all([catReq, prodReq]).finally(() => setDataLoading(false));
  }, [restaurant]);

  if (tenantLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <UtensilsCrossed 
            className="w-12 h-12 mx-auto animate-bounce" 
            style={{ color: 'var(--tenant-primary, #EAA622)' }}
          />
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            Cargando restaurante...
          </p>
        </div>
      </div>
    );
  }

  if (!restaurant || !restaurant.activo) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center text-white p-6">
        <div className="bg-[#141414] border border-[#2a2a2a] p-8 rounded-3xl text-center max-w-md w-full space-y-4">
          <UtensilsCrossed className="w-12 h-12 text-gray-600 mx-auto" />
          <h2 className="text-xl font-black uppercase text-white font-display">
            Restaurante no disponible
          </h2>
          <p className="text-xs text-gray-400">
            El restaurante solicitado no se encuentra activo o el enlace no es válido.
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 bg-brand-yellow text-black font-black text-xs uppercase rounded-xl"
          >
            Ir a la Página Principal
          </Link>
        </div>
      </div>
    );
  }

  const primary = restaurant.colorPrimario || '#EAA622';
  const plantilla = restaurant.plantilla || 'plantilla-actual';

  // Section visibility flags (default to true if undefined)
  const showHero = restaurant.mostrarHero !== false;
  const showCategories = restaurant.mostrarCategorias !== false;
  const showDestacados = restaurant.mostrarDestacados !== false;
  const showPromociones = restaurant.mostrarPromociones !== false;
  const showResenas = restaurant.mostrarResenas !== false;
  const showHorarios = restaurant.mostrarHorarios !== false;

  const phone = restaurant.telefonoWhatsapp || restaurant.telefono;
  const heroTitle = restaurant.tituloHero || restaurant.nombre;
  const heroSubtitle = restaurant.subtituloHero || restaurant.eslogan || 'TU MÁXIMO PLACER';
  const heroDesc = restaurant.descripcionHero || restaurant.descripcion || 'Sabores excepcionales preparados al momento con ingredientes frescos.';
  const heroBtnText = restaurant.textoBotonHero || 'VER MENÚ COMPLETO';
  const heroImage = restaurant.bannerHero || restaurant.imagenHero || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1200&auto=format&fit=crop';

  // If the restaurant has no products and no categories yet, show a polite branded welcome page
  const isBrandNew = categories.length === 0 && products.length === 0;

  if (isBrandNew) {
    return (
      <div className="min-h-screen bg-[#080808] text-white pt-28 pb-16 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-[#121212] border border-[#242424] rounded-3xl p-8 sm:p-14 text-center shadow-2xl relative overflow-hidden">
            <div 
              className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: primary }}
            />
            <div className="relative z-10 space-y-6">
              <div className="flex justify-center">
                <Logo restaurant={restaurant} showSubtext={false} size="lg" />
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight font-display">
                  ¡Bienvenidos a{' '}
                  <span style={{ color: primary }}>{restaurant.nombre}</span>!
                </h1>
                <p className="text-lg text-gray-300 font-medium max-w-xl mx-auto">
                  {heroSubtitle}
                </p>
                <p className="text-sm text-gray-400 max-w-2xl mx-auto">
                  {heroDesc}
                </p>
              </div>

              {/* Informative Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-left max-w-3xl mx-auto">
                {restaurant.direccionCentral && (
                  <div className="bg-[#1a1a1a] border border-[#262626] p-4 rounded-2xl flex items-start gap-3">
                    <MapPin className="w-5 h-5 shrink-0 mt-0.5" style={{ color: primary }} />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Dirección</p>
                      <p className="text-xs font-semibold text-white">{restaurant.direccionCentral}</p>
                      <p className="text-[11px] text-gray-400">{restaurant.ciudad}</p>
                    </div>
                  </div>
                )}

                {restaurant.horarioAtencion && (
                  <div className="bg-[#1a1a1a] border border-[#262626] p-4 rounded-2xl flex items-start gap-3">
                    <Clock className="w-5 h-5 shrink-0 mt-0.5" style={{ color: primary }} />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Horario</p>
                      <p className="text-xs font-semibold text-white">{restaurant.horarioAtencion}</p>
                    </div>
                  </div>
                )}

                {phone && (
                  <div className="bg-[#1a1a1a] border border-[#262626] p-4 rounded-2xl flex items-start gap-3">
                    <MessageCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#25D366]" />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pedidos Directos</p>
                      <p className="text-xs font-semibold text-white">+57 {phone}</p>
                      <p className="text-[11px] text-[#25D366]">WhatsApp Disponible</p>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                <Link
                  href={`/r/${slug}/menu`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full font-black text-xs uppercase tracking-wider shadow-lg transition transform hover:scale-105"
                  style={{
                    backgroundColor: 'var(--tenant-button, var(--tenant-primary, #EAA622))',
                    color: 'var(--tenant-button-text, #000000)',
                  }}
                >
                  <Utensils className="w-4 h-4" />
                  <span>Ver Carta Digital</span>
                </Link>

                {phone && (
                  <a
                    href={`https://wa.me/57${phone}?text=${encodeURIComponent(
                      `¡Hola ${restaurant.nombre}! Quisiera hacer un pedido o consultar su carta.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#181818] hover:bg-[#222222] text-white font-bold text-xs uppercase tracking-wider px-7 py-4 rounded-full border border-gray-700 transition"
                  >
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                    <span>Contactar por WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // RENDER BASED ON TEMPLATE:
  // 1. plantilla-comercial
  // 2. plantilla-minimalista
  // 3. plantilla-actual (default)
  // ========================================================

  return (
    <div
      className="min-h-screen text-white font-sans space-y-0"
      style={{ backgroundColor: restaurant.colorFondo || '#080808' }}
    >
      {/* ======================================================== */}
      {/* TOP PROMO RIBBON (PLANTILLA COMERCIAL) */}
      {/* ======================================================== */}
      {plantilla === 'plantilla-comercial' && (
        <div 
          className="py-2.5 px-4 text-center text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
          style={{ backgroundColor: primary, color: 'var(--tenant-button-text, #000000)' }}
        >
          <Zap className="w-4 h-4 fill-current animate-pulse" />
          <span>¡OFERTAS DEL DÍA EN {restaurant.nombre.toUpperCase()}! PIDE HOY Y RECIBE CON DESPACHO PRIORITARIO</span>
          <Zap className="w-4 h-4 fill-current animate-pulse" />
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. HERO SECTION */}
      {/* ======================================================== */}
      {showHero && (
        <section className={`relative overflow-hidden min-h-[85vh] flex items-center ${
          plantilla === 'plantilla-minimalista' ? 'pt-28 pb-20 bg-[#070707]' : 'pt-24 sm:pt-28 pb-16'
        }`}>
          {/* Ambient Glow */}
          <div
            className="absolute top-0 left-0 w-80 sm:w-[520px] h-80 sm:h-[520px] pointer-events-none opacity-20 mix-blend-screen"
            style={{
              background: `radial-gradient(circle at 10% 10%, ${primary} 0%, rgba(255, 201, 40, 0.15) 45%, transparent 70%)`,
            }}
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Text column */}
              <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
                {plantilla === 'plantilla-comercial' && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-black uppercase tracking-wider">
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    <span>¡PIDE EN LÍNEA FÁCIL Y RÁPIDO!</span>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="relative inline-block">
                    <span
                      className={`font-black italic tracking-tighter uppercase font-display block ${
                        plantilla === 'plantilla-minimalista'
                          ? 'text-4xl sm:text-6xl lg:text-7xl tracking-normal not-italic font-sans'
                          : 'text-5xl sm:text-7xl lg:text-8xl'
                      }`}
                      style={{ color: primary }}
                    >
                      {heroTitle}
                    </span>
                    {plantilla !== 'plantilla-minimalista' && (
                      <div
                        className="w-full h-3 sm:h-4 rounded-full -mt-2 sm:-mt-4 opacity-95 transform -rotate-1 shadow-glow"
                        style={{ backgroundColor: primary }}
                      />
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight font-display">
                    {heroSubtitle}
                  </h1>
                </div>

                <p className="text-base sm:text-lg text-gray-300 max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed">
                  {heroDesc}
                </p>

                {/* Hero CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                  <Link
                    href={`/r/${slug}/menu`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 font-black text-sm uppercase tracking-wider px-8 py-4 rounded-full shadow-lg transition-all transform hover:scale-105"
                    style={{
                      backgroundColor: 'var(--tenant-button, var(--tenant-primary, #EAA622))',
                      color: 'var(--tenant-button-text, #000000)',
                    }}
                  >
                    <Utensils className="w-4 h-4 stroke-[2.5]" />
                    <span>{heroBtnText}</span>
                  </Link>

                  {phone && (
                    <a
                      href={`https://wa.me/57${phone}?text=${encodeURIComponent(`¡Hola ${restaurant.nombre}! Quiero hacer un pedido a domicilio.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#181818] hover:bg-[#222222] text-white font-bold text-sm uppercase tracking-wider px-7 py-4 rounded-full border border-gray-700/60 transition-all hover:border-gray-500"
                    >
                      <MessageCircle className="w-4 h-4 text-[#25D366] fill-[#25D366]/20" />
                      <span>PEDIR POR WHATSAPP</span>
                    </a>
                  )}
                </div>

                {/* Quick Info Badges */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-3 text-xs sm:text-sm text-gray-300 font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: primary }} />
                    <span>{restaurant.ciudad}</span>
                  </div>
                  {restaurant.branches && restaurant.branches.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" style={{ color: primary }} />
                      <span>{restaurant.branches.length} Sede(s) Disponible(s)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Hero Image */}
              <div className="lg:col-span-6 relative flex items-center justify-center">
                <div className={`relative w-72 sm:w-96 md:w-[440px] lg:w-[480px] aspect-square ${
                  plantilla === 'plantilla-minimalista' ? 'rounded-2xl' : 'rounded-3xl'
                }`}>
                  <div
                    className="absolute inset-4 rounded-full filter blur-3xl opacity-35"
                    style={{ backgroundColor: primary }}
                  />
                  <Image
                    src={heroImage}
                    alt={restaurant.nombre}
                    fill
                    className={`object-cover shadow-2xl relative z-10 border border-white/10 ${
                      plantilla === 'plantilla-minimalista' ? 'rounded-2xl' : 'rounded-3xl'
                    }`}
                    priority
                  />
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* BRANCH SELECTOR (IF MULTI-SEDE) */}
      {/* ======================================================== */}
      {restaurant.branches && restaurant.branches.length > 1 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-[#141414] border border-[#262626] rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-black shrink-0"
                style={{ backgroundColor: primary }}
              >
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase text-white font-display">
                  SELECCIONA TU SEDE DE ATENCIÓN
                </h3>
                <p className="text-xs text-gray-400">
                  Tus pedidos se despacharán desde la sede que elijas.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {restaurant.branches.map((branch: any) => {
                const isSelected = selectedBranchId === branch.id;
                return (
                  <button
                    key={branch.id}
                    type="button"
                    onClick={() => setSelectedBranchId(branch.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      isSelected
                        ? 'text-black shadow-glow'
                        : 'bg-[#1c1c1c] text-gray-300 hover:text-white border border-[#303030]'
                    }`}
                    style={isSelected ? { backgroundColor: primary } : {}}
                  >
                    <Check className={`w-3.5 h-3.5 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                    <span>{branch.nombre}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* 2. CATEGORIES SECTION */}
      {/* ======================================================== */}
      {showCategories && categories.length > 0 && (
        <section id="categorias" className="relative py-14 sm:py-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center space-y-3 mb-10 sm:mb-14">
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-white/20"
                style={{ color: primary }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Nuestras Especialidades</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase text-white font-display tracking-wider text-center">
                EXPLORA NUESTRAS <span className="italic" style={{ color: primary }}>CATEGORÍAS</span>
              </h2>

              <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto">
                Selecciona tu categoría favorita para ver los platos disponibles.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/r/${slug}/menu/${cat.slug}`}
                  className="bg-[#121212] border border-[#222] hover:border-white/30 rounded-3xl p-5 space-y-3 transition-all group block cursor-pointer"
                >
                  <div className="relative w-full h-40 rounded-2xl overflow-hidden bg-[#202020]">
                    <Image
                      src={cat.imagen || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=600&auto=format&fit=crop'}
                      alt={cat.nombre}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="text-base font-black uppercase text-white font-display group-hover:text-tenant-primary transition-colors">
                    {cat.nombre}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2">
                    {cat.descripcion || 'Platos preparados artesanalmente con los mejores ingredientes.'}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* 3. FEATURED PRODUCTS SECTION */}
      {/* ======================================================== */}
      {showDestacados && products.length > 0 && (
        <section id="destacados" className="relative py-14 sm:py-20 bg-[#0a0a0a] border-t border-[#1a1a1a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-3 mb-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase text-white font-display tracking-wider text-center">
                {restaurant.tituloSeccionDestacados || 'LOS MÁS'} <span className="italic" style={{ color: primary }}>PEDIDOS</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto">
                Los platos y recetas favoritos de nuestros comensales.
              </p>
            </div>

            <div className={`grid gap-6 ${
              plantilla === 'plantilla-minimalista'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
            }`}>
              {products.slice(0, plantilla === 'plantilla-minimalista' ? 6 : 8).map((prod) => {
                const targetCatSlug = prod.subcategoria || prod.categoria || '';
                const productTargetUrl = targetCatSlug
                  ? `/r/${slug}/menu/${targetCatSlug}`
                  : `/r/${slug}/menu`;

                return (
                  <div
                    key={prod.id}
                    className={`bg-[#141414] border border-[#242424] hover:border-white/30 rounded-3xl p-4 flex flex-col justify-between space-y-3 transition-all group shadow-xl ${
                      plantilla === 'plantilla-comercial' ? 'hover:-translate-y-1' : ''
                    }`}
                  >
                    <Link
                      href={productTargetUrl}
                      className="space-y-3 block group/link cursor-pointer"
                      title={`Ver ${prod.nombre} en la categoría`}
                    >
                      <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-[#1e1e1e]">
                        <Image
                          src={prod.imagen}
                          alt={prod.nombre}
                          fill
                          className="object-cover group-hover/link:scale-105 transition-transform duration-500"
                        />
                        {prod.etiqueta && (
                          <span
                            className="absolute top-2 left-2 text-black text-[10px] font-black uppercase px-2.5 py-1 rounded-md shadow"
                            style={{ backgroundColor: primary }}
                          >
                            {prod.etiqueta}
                          </span>
                        )}
                      </div>

                      <div>
                        <h4
                          className="text-sm sm:text-base font-bold text-white group-hover/link:underline transition-colors"
                          style={{ textDecorationColor: primary }}
                        >
                          {prod.nombre}
                        </h4>
                        <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                          {prod.descripcion}
                        </p>
                      </div>
                    </Link>

                    <div className="pt-3 border-t border-[#222] flex items-center justify-between gap-2">
                      <span
                        className="text-base sm:text-lg font-black font-display"
                        style={{ color: primary }}
                      >
                        {formatCOP(prod.precio)}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setCustomizerProduct(prod)}
                          className="px-2.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-[11px] font-bold uppercase flex items-center gap-1 transition cursor-pointer"
                          title="Personalizar toppings y adiciones"
                        >
                          <Sparkles className="w-3.5 h-3.5" style={{ color: primary }} />
                          <span className="hidden sm:inline">Toppings</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            addToCart(prod, 1);
                            setIsCartOpen(true);
                          }}
                          className="flex items-center gap-1 px-3 py-2 rounded-xl text-black font-black text-xs uppercase tracking-wider shadow transition active:scale-95 cursor-pointer"
                          style={{ backgroundColor: primary }}
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Agregar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* View Full Menu CTA */}
            <div className="text-center pt-10">
              <Link
                href={`/r/${slug}/menu`}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#181818] hover:bg-[#222222] text-white font-bold text-xs uppercase tracking-wider border border-gray-700 hover:border-gray-500 transition"
              >
                <span>Explorar Carta Completa</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* 4. PROMOTIONAL BANNER */}
      {/* ======================================================== */}
      {showPromociones && (
        <section className="relative py-14 sm:py-20 overflow-hidden border-t border-[#1a1a1a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className="relative rounded-3xl p-8 sm:p-12 overflow-hidden shadow-2xl border border-white/10"
              style={{
                background: `linear-gradient(135deg, rgba(234,166,34,0.12) 0%, rgba(20,20,20,0.95) 50%, rgba(10,10,10,0.98) 100%)`,
              }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                <div className="lg:col-span-8 space-y-3 text-center lg:text-left">
                  <span
                    className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 text-white"
                  >
                    ¿Deseas pedir ahora mismo?
                  </span>
                  <h3 className="text-3xl sm:text-5xl font-black uppercase text-white font-display">
                    {restaurant.textoPromocional || (
                      <>
                        PIDE TUS PLATOS A{' '}
                        <span className="italic" style={{ color: primary }}>
                          DOMICILIO
                        </span>
                      </>
                    )}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-300 max-w-xl">
                    {restaurant.direccionCentral ? `${restaurant.direccionCentral} • ` : ''}
                    Atención rápida y entregas seguras en {restaurant.ciudad}.
                  </p>
                </div>

                <div className="lg:col-span-4 flex justify-center lg:justify-end">
                  {phone && (
                    <a
                      href={`https://wa.me/57${phone}?text=${encodeURIComponent(`¡Hola ${restaurant.nombre}! Quiero hacer un pedido a domicilio.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-black font-black text-sm uppercase px-8 py-4 rounded-full shadow-glow transition transform hover:scale-105"
                      style={{ backgroundColor: primary }}
                    >
                      <PhoneCall className="w-5 h-5" />
                      <span>Pedir por WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* 5. ESPECIALIDAD DE LA CASA / PLATO INSIGNIA               */}
      {/* ======================================================== */}
      <section className="relative py-12 sm:py-16 bg-[#090909] border-t border-[#1a1a1a] overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            background: `radial-gradient(circle at center, ${primary} 0%, transparent 70%)`,
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="relative rounded-3xl overflow-hidden border border-[#2b2b2b] shadow-2xl bg-[#121212] group">
            <div className="relative w-full h-72 sm:h-80 md:h-96">
              <Image
                src={heroImage}
                alt={restaurant.nombre}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/85 flex items-center p-6 sm:p-12">
                <div className="max-w-xl space-y-4">
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border"
                    style={{
                      backgroundColor: `${primary}15`,
                      borderColor: `${primary}40`,
                      color: primary,
                    }}
                  >
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    <span>Nuestra Especialidad Insignia</span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-white font-display tracking-tight leading-tight">
                    EL SABOR DE{' '}
                    <span className="italic" style={{ color: primary }}>
                      {restaurant.nombre}
                    </span>{' '}
                    EN CADA BOCADO
                  </h2>

                  <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                    {heroDesc}
                  </p>

                  <div className="pt-2">
                    <Link
                      href={`/r/${slug}/menu`}
                      className="inline-flex items-center gap-2 text-black font-black text-xs sm:text-sm px-7 py-3.5 rounded-full shadow-glow transition-all transform hover:scale-105"
                      style={{ backgroundColor: primary }}
                    >
                      <span>EXPLORAR LA CARTA</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. ASISTENTE VIRTUAL INTERACTIVO & WHATSAPP 24/7        */}
      {/* ======================================================== */}
      <section className="relative py-16 sm:py-20 bg-gradient-to-b from-[#0a0a0a] via-[#111111] to-[#080808] border-t border-[#1f1f1f] overflow-hidden">
        <div
          className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-10"
          style={{ backgroundColor: primary }}
        />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-[#25D366]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Headline & Action */}
            <div className="lg:col-span-5 text-center lg:text-left space-y-5">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold tracking-wider uppercase"
                style={{
                  backgroundColor: `${primary}15`,
                  borderColor: `${primary}40`,
                  color: primary,
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Atención Digital al Instante</span>
              </div>

              <h2
                className="text-4xl sm:text-5xl lg:text-6xl font-black italic uppercase font-display tracking-tight drop-shadow-md"
                style={{ color: primary }}
              >
                ¿YA SE TE ANTOJÓ?
              </h2>

              <p className="text-base sm:text-lg text-gray-300 max-w-md mx-auto lg:mx-0 leading-relaxed">
                Haz tu pedido en segundos. Nuestro asistente virtual y equipo de {restaurant.nombre} están listos para atenderte{phone ? ` al WhatsApp ${phone}` : ''}.
              </p>

              {phone && (
                <div className="pt-2">
                  <a
                    href={`https://wa.me/57${phone}?text=${encodeURIComponent(`¡Hola ${restaurant.nombre}! Quiero hacer un pedido a domicilio.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#20ba5a] text-black font-black text-sm uppercase px-8 py-4 rounded-full shadow-[0_4px_25px_rgba(37,211,102,0.4)] transition-all transform hover:scale-105 active:scale-95"
                  >
                    <MessageSquare className="w-5 h-5 fill-black" />
                    <span>HABLAR POR WHATSAPP</span>
                  </a>
                </div>
              )}
            </div>

            {/* Right Column: Simulated Chat Widget */}
            <div className="lg:col-span-7 flex justify-center lg:justify-end">
              <div className="w-full max-w-md bg-[#141414] border border-[#2b2b2b] rounded-3xl p-5 shadow-2xl relative overflow-hidden">
                
                {/* Chat Top Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-[#242424] mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-black"
                      style={{ backgroundColor: primary }}
                    >
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>Asistente {restaurant.nombre}</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      </h4>
                      <p className="text-[11px] text-gray-400">En línea para tomar tu orden</p>
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="space-y-3 min-h-[190px] max-h-[220px] overflow-y-auto pr-1">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                          msg.sender === 'user'
                            ? 'text-black font-medium rounded-tr-none'
                            : 'bg-[#222222] text-gray-200 rounded-tl-none border border-[#303030]'
                        }`}
                        style={msg.sender === 'user' ? { backgroundColor: primary } : {}}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-gray-500 mt-0.5 px-1 flex items-center gap-1">
                        {msg.time}
                        {msg.sender === 'user' && <CheckCheck className="w-3 h-3 text-emerald-400" />}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Interactive Input Form */}
                <form onSubmit={handleSendChat} className="mt-4 pt-3 border-t border-[#242424] flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Escribe tu plato favorito aquí..."
                    className="flex-1 bg-[#1e1e1e] border border-[#333] rounded-full px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="w-10 h-10 rounded-full flex items-center justify-center text-black font-black transition transform active:scale-90 shrink-0"
                    style={{ backgroundColor: primary }}
                  >
                    <Send className="w-4 h-4 fill-current" />
                  </button>
                </form>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. SCHEDULES & DETAILS (SHOW IF ENABLED) */}
      {showHorarios && (
        <section className="py-12 bg-[#0c0c0c] border-t border-[#181818]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
              <div className="bg-[#141414] border border-[#222] p-6 rounded-2xl space-y-2">
                <Clock className="w-6 h-6 mx-auto md:mx-0" style={{ color: primary }} />
                <h4 className="text-sm font-bold uppercase text-white">Horarios de Atención</h4>
                <p className="text-xs text-gray-400">{restaurant.horarioAtencion || 'Lunes a Domingo: 12:00 m. a 11:30 p.m.'}</p>
              </div>

              <div className="bg-[#141414] border border-[#222] p-6 rounded-2xl space-y-2">
                <MapPin className="w-6 h-6 mx-auto md:mx-0" style={{ color: primary }} />
                <h4 className="text-sm font-bold uppercase text-white">Sede Central</h4>
                <p className="text-xs text-gray-400">{restaurant.direccionCentral || 'Principal'}, {restaurant.ciudad}</p>
              </div>

              <div className="bg-[#141414] border border-[#222] p-6 rounded-2xl space-y-2">
                <ShieldCheck className="w-6 h-6 mx-auto md:mx-0 text-emerald-400" />
                <h4 className="text-sm font-bold uppercase text-white">Garantía de Calidad</h4>
                <p className="text-xs text-gray-400">Ingredientes frescos y protocolos de bioseguridad en cada despacho.</p>
              </div>
            </div>
          </div>
        </section>
      )}
      {/* Customizer modal for toppings & additions from landing page */}
      {customizerProduct && (
        <ProductCustomizerModal
          isOpen={Boolean(customizerProduct)}
          onClose={() => setCustomizerProduct(null)}
          product={customizerProduct}
        />
      )}
    </div>
  );
}
