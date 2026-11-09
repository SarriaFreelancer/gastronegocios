'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  UtensilsCrossed,
  ChefHat,
  Smartphone,
  BellRing,
  Layers,
  Palette,
  ShieldCheck,
  Zap,
  TrendingUp,
  Store,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  Clock,
  Sparkles,
  DollarSign,
  Globe,
  Users,
  ChevronDown,
  ChevronRight,
  Calculator,
  Flame,
  Check,
  Star,
  Tv,
  Printer,
  Volume2,
  Play,
  Receipt,
  QrCode,
  Tablet,
  Monitor,
  CheckCheck
} from 'lucide-react';

interface BrandPreset {
  id: string;
  name: string;
  slogan: string;
  color: string;
  category: string;
  image: string;
  samplePrice: string;
}

const BRAND_SIMULATOR_PRESETS: BrandPreset[] = [
  {
    id: 'burger',
    name: 'BURGER MASTER HOUSE',
    slogan: 'Hamburguesas Gourmet al Carbón',
    color: '#FFC928',
    category: 'Hamburguesas',
    image: '/images/assets/burger-hero-transparent.png',
    samplePrice: '$32.900',
  },
  {
    id: 'salchipapa',
    name: 'SALCHI RICURRAS',
    slogan: 'Las Mejores Salchipapas y Mazorcadas',
    color: '#E53E3E',
    category: 'Salchipapas',
    image: '/images/assets/salchipapa-3d.png',
    samplePrice: '$28.500',
  },
  {
    id: 'parrilla',
    name: 'DON CARBÓN ASADOS',
    slogan: 'Cortes Finos y Parrillada Mixta',
    color: '#F97316',
    category: 'Parrilla BBQ',
    image: '/images/assets/parrilla-3d.png',
    samplePrice: '$42.000',
  },
  {
    id: 'hotdog',
    name: 'CALI HOT DOGS',
    slogan: 'Perros Calientes Americanos Especiales',
    color: '#10B981',
    category: 'Perros Calientes',
    image: '/images/assets/hotdog-3d.png',
    samplePrice: '$18.900',
  },
  {
    id: 'drinks',
    name: 'BAR & CÓCTELES LOUNGE',
    slogan: 'Bebidas Premium y Coctelería de Autor',
    color: '#06B6D4',
    category: 'Bebidas',
    image: '/images/assets/drinks-3d.png',
    samplePrice: '$24.000',
  },
];

const HERO_PRODUCTS = [
  { id: 'burger', name: 'Hamburguesas', img: '/images/assets/burger-hero-transparent.png', tag: 'Ticket +28%', color: '#FFC928' },
  { id: 'salchipapa', name: 'Salchipapas', img: '/images/assets/salchipapa-3d.png', tag: 'Top Ventas', color: '#E53E3E' },
  { id: 'parrilla', name: 'Parrilla BBQ', img: '/images/assets/parrilla-3d.png', tag: 'Cortes Finos', color: '#F97316' },
  { id: 'hotdog', name: 'Hot Dogs', img: '/images/assets/hotdog-3d.png', tag: 'Despacho Rápido', color: '#10B981' },
  { id: 'drinks', name: 'Bar & Bebidas', img: '/images/assets/drinks-3d.png', tag: 'Alto Margen', color: '#06B6D4' },
];

export function SaasLandingPage() {
  const whatsappSalesUrl =
    'https://wa.me/573229088736?text=' +
    encodeURIComponent('¡Hola! Me interesa adquirir la plataforma GastroNegocios para mi restaurante. ¿Podrían brindarme información y una demostración guiada?');

  // Hero Interactive 3D Dish Switcher
  const [heroProductIndex, setHeroProductIndex] = useState(0);
  const currentHeroProduct = HERO_PRODUCTS[heroProductIndex];

  // Interactive Brand Simulator State
  const [activeBrand, setActiveBrand] = useState<BrandPreset>(BRAND_SIMULATOR_PRESETS[0]);

  // Interactive ROI Calculator State
  const [monthlySalesMillion, setMonthlySalesMillion] = useState<number>(15);
  const appCommissionPercent = 25; // 25% average apps commission
  const appCommissionLost = (monthlySalesMillion * 1000000 * appCommissionPercent) / 100;
  const saasMonthlyCost = 149000;
  const netMonthlySavings = appCommissionLost - saasMonthlyCost;
  const netYearlySavings = netMonthlySavings * 12;

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Dynamic Live Showcase Restaurants from DB
  const [liveRestaurants, setLiveRestaurants] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/restaurants?landing=true')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setLiveRestaurants(data);
        }
      })
      .catch((e) => console.error('Error fetching landing restaurants:', e));
  }, []);

  // Interactive Live KDS & POS Simulator State
  const [simView, setSimView] = useState<'kds' | 'pos' | 'qr'>('kds');
  const [simOrders, setSimOrders] = useState([
    {
      id: 'PG-2045',
      mesa: 'Mesa 4 (Terraza)',
      items: '1x Hamburguesa Master Especial + 1x Papas Rústicas',
      total: 38900,
      minutos: 2,
      estado: 'En preparación',
      color: '#ffc928',
    },
    {
      id: 'SR-102',
      mesa: 'Mesa 2 (Salón Principal)',
      items: '1x Salchipapa Salvaje Mixta + 1x Gaseosa 400ml',
      total: 28500,
      minutos: 4,
      estado: 'Nuevo',
      color: '#ef4444',
    },
    {
      id: 'PG-2046',
      mesa: 'Barra 1',
      items: '1x Desgranado Mixto al Carbón',
      total: 32000,
      minutos: 6,
      estado: 'Listo',
      color: '#10b981',
    },
  ]);
  const [simNotification, setSimNotification] = useState<string | null>(null);

  const playKitchenChime = () => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  };

  const handleSimulateNewOrder = () => {
    playKitchenChime();
    const newId = `PG-${Math.floor(2050 + Math.random() * 50)}`;
    const tableNum = Math.floor(1 + Math.random() * 12);
    const sampleItems = [
      '1x Parrillada Mixta al Carbón + 1x Cerveza Corona',
      '2x Hamburguesa Clásica Artesanal + Topping Queso Cheddar',
      '1x Salchipapa Salvaje Extragrande para Compartir',
      '1x Perro Gourmet Suizo + 1x Limonada Cerezada',
    ];
    const item = sampleItems[Math.floor(Math.random() * sampleItems.length)];
    const price = 25000 + Math.floor(Math.random() * 30) * 1000;

    const newOrder = {
      id: newId,
      mesa: `Mesa ${tableNum} (Salón)`,
      items: item,
      total: price,
      minutos: 0,
      estado: 'Nuevo',
      color: '#ffc928',
    };

    setSimOrders((prev) => [newOrder, ...prev.slice(0, 3)]);
    setSimNotification(`¡Comanda recibida en KDS: ${newId} (${newOrder.mesa})!`);
    setTimeout(() => setSimNotification(null), 3500);
  };

  const handleAdvanceSimOrder = (id: string) => {
    setSimOrders((prev) =>
      prev.map((o) => {
        if (o.id === id) {
          const nextState = o.estado === 'Nuevo' ? 'En preparación' : o.estado === 'En preparación' ? 'Listo' : 'Entregado';
          return { ...o, estado: nextState };
        }
        return o;
      })
    );
  };

  const formatCOP = (val: number) => '$' + Math.round(val).toLocaleString('es-CO');

  return (
    <div className="min-h-screen bg-[#070707] text-white selection:bg-brand-yellow selection:text-black overflow-x-hidden font-sans">
      
      {/* ======================================================== */}
      {/* HEADER SUPERIOR SAAS                                     */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#1c1c1c] px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-brand-yellow flex items-center justify-center font-black text-black shadow-glow group-hover:scale-105 transition-transform duration-300">
              <UtensilsCrossed className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-lg font-black tracking-wider text-white font-display flex items-center gap-1.5 leading-none">
                GASTRONEGOCIOS <span className="text-[10px] bg-brand-yellow text-black font-black px-1.5 py-0.5 rounded tracking-normal">PLATAFORMA</span>
              </span>
              <span className="text-[10px] text-gray-400 block tracking-widest uppercase font-semibold mt-0.5">
                Software & POS Gastronómico
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs font-bold uppercase tracking-wider text-gray-300">
            <a href="#demos" className="hover:text-brand-yellow transition">
              Restaurantes Demo
            </a>
            <a href="#simulator" className="hover:text-brand-yellow transition">
              Personalizador 3D
            </a>
            <a href="#modulos" className="hover:text-brand-yellow transition">
              Módulos
            </a>
            <a href="#calculadora" className="hover:text-brand-yellow transition">
              Calculadora Ahorro
            </a>
            <a href="#planes" className="hover:text-brand-yellow transition">
              Planes
            </a>
            <a href="#faq" className="hover:text-brand-yellow transition">
              Preguntas
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/registro"
              className="px-4 py-2 bg-gradient-to-r from-amber-400 via-brand-yellow to-yellow-500 hover:brightness-110 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-glow transition hover:scale-105 active:scale-95 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Crear Restaurante</span>
            </Link>
            <Link
              href="/login"
              className="hidden sm:inline-block px-4 py-2 text-xs font-black uppercase tracking-wider text-gray-300 hover:text-white bg-[#161616] hover:bg-[#222] border border-[#2b2b2b] rounded-xl transition"
            >
              Ingreso Clientes
            </Link>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* TICKER OPERATIVO EN VIVO (GASTRONOMÍA COLOMBIANA)        */}
      {/* ======================================================== */}
      <div className="bg-[#0b0b0e] border-b border-[#1b1b22] px-4 py-2.5 overflow-hidden text-xs z-40 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">En Vivo</span>
            <span className="hidden sm:inline text-gray-600">|</span>
            <span className="hidden sm:inline text-[11px] text-gray-400 font-bold">Red GastroNegocios:</span>
          </div>
          <div className="overflow-hidden whitespace-nowrap text-right text-gray-300 text-xs font-medium">
            <span>
              🔥 <strong className="text-white">Punto G (Cali)</strong>: 18 comandas KDS procesadas hoy • 🍟 <strong className="text-white">Salchi Ricurras</strong>: 9 combos en línea activos • 🥩 <strong className="text-white">Don Carbón</strong>: $1.280.000 COP sin comisiones de apps • 📱 <strong className="text-white">Meseros</strong>: comanderas móviles conectadas
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* HERO PRINCIPAL SAAS CON ANIMACIÓN Y PRODUCTO 3D          */}
      {/* ======================================================== */}
      <section className="relative pt-16 sm:pt-24 pb-24 sm:pb-32 px-4 sm:px-6 overflow-hidden border-b border-[#181818]">
        
        {/* Subtle grid pattern background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #333 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: SaaS Pitch */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow text-xs font-black uppercase tracking-widest shadow-glow">
                <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
                <span>Plataforma White-Label para Restaurantes y Cadenas</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase font-display tracking-tight text-white leading-[1.02]">
                EL SISTEMA QUE <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-brand-yellow to-yellow-500">
                  MULTIPLICA LAS VENTAS
                </span> <br />
                DE TU RESTAURANTE
              </h1>

              <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Menú digital interactivo con pedidos directos por WhatsApp o web, comanderas móviles para meseros, pantalla táctil de cocina (KDS), turnero de entregas y arqueo de turnos. <strong>Todo bajo tu propio nombre y logotipo con 0% comisiones.</strong>
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/registro"
                  className="w-full sm:w-auto py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-400 via-brand-yellow to-yellow-500 hover:brightness-110 text-black font-black text-sm uppercase tracking-wider transition shadow-glow flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
                >
                  <Sparkles className="w-4 h-4 stroke-[3]" />
                  <span>Crear Restaurante Gratis</span>
                </Link>
                <a
                  href="#demos"
                  className="w-full sm:w-auto py-4 px-8 rounded-2xl bg-[#141414] hover:bg-[#1e1e1e] text-white font-black text-sm uppercase tracking-wider border border-[#2d2d2d] transition flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-4 h-4 text-brand-yellow" />
                  <span>Ver Demos en Vivo</span>
                </a>
              </div>

              {/* Key Trust Stats */}
              <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left border-t border-[#1e1e1e]">
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-brand-yellow font-display block">0%</span>
                  <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Comisiones de Venta</span>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-display block">18 seg</span>
                  <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Toma de Comanda</span>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-white font-display block">100%</span>
                  <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Tu Propia Marca</span>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-amber-400 font-display block">Multi-Sede</span>
                  <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Sincronización Total</span>
                </div>
              </div>
            </div>

            {/* Right Column: Floating 3D Interactive Terminal Showcase */}
            <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
              
              {/* Ambient Radial Halo */}
              <div 
                className="absolute w-72 sm:w-96 h-72 sm:h-96 rounded-full blur-[120px] opacity-25 pointer-events-none transition-colors duration-700"
                style={{ backgroundColor: currentHeroProduct.color }}
              />

              {/* Floating Live Metric: Sales increase */}
              <div className="absolute -top-4 -left-4 sm:left-2 z-20 px-3.5 py-2 rounded-2xl bg-[#141414]/95 border border-emerald-500/40 text-white shadow-2xl backdrop-blur-md flex items-center gap-2.5 animate-pulse">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Ventas Directas</span>
                  <span className="text-xs font-black text-white">+148% de Crecimiento</span>
                </div>
              </div>

              {/* Floating Live Dynamic Badge */}
              <div className="absolute top-1/2 -right-4 sm:-right-6 z-20 px-3.5 py-2 rounded-2xl bg-[#141414]/95 border border-amber-500/40 text-white shadow-2xl backdrop-blur-md flex items-center gap-2.5">
                <div 
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-black"
                  style={{ backgroundColor: currentHeroProduct.color }}
                >
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                    {currentHeroProduct.name}
                  </span>
                  <span className="text-xs font-black text-white">
                    {currentHeroProduct.tag}
                  </span>
                </div>
              </div>

              {/* 3D Product Float with Ground Shadow */}
              <div className="relative w-[300px] h-[270px] sm:w-[400px] sm:h-[360px] flex items-center justify-center animate-float">
                <img
                  key={currentHeroProduct.img}
                  src={currentHeroProduct.img}
                  alt={currentHeroProduct.name}
                  className="w-full h-full object-contain drop-shadow-[0_28px_32px_rgba(0,0,0,0.95)] transition-all duration-500 hover:scale-105 cursor-pointer select-none"
                  onClick={() => setHeroProductIndex((prev) => (prev + 1) % HERO_PRODUCTS.length)}
                  title="Haz clic para ver otro plato"
                />
              </div>

              {/* Ground Shadow */}
              <div className="w-48 sm:w-64 h-3 bg-black/80 rounded-[100%] blur-sm -mt-2 pointer-events-none" />

              {/* Interactive Food Switcher Pills */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 p-1 rounded-2xl bg-[#121212]/90 border border-[#262626] backdrop-blur-md z-20">
                {HERO_PRODUCTS.map((prod, idx) => {
                  const isActive = heroProductIndex === idx;
                  return (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => setHeroProductIndex(idx)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-white text-black shadow font-black scale-105'
                          : 'text-gray-400 hover:text-white hover:bg-neutral-800'
                      }`}
                    >
                      {prod.name}
                    </button>
                  );
                })}
              </div>

              {/* Live Status Pill underneath */}
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181818]/60 border border-[#2b2b2b] text-[11px] text-gray-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-mono font-bold">Catálogo Interactivo 3D Integrado</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SIMULADOR INTERACTIVO DE COCINA KDS & POS EN VIVO        */}
      {/* ======================================================== */}
      <section className="py-20 px-4 sm:px-6 bg-[#09090b] border-b border-[#1a1a20] relative overflow-hidden">
        <div className="max-w-6xl mx-auto space-y-10 relative z-10">
          
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-brand-yellow text-xs font-black uppercase tracking-widest shadow-glow">
              <Zap className="w-3.5 h-3.5 text-brand-yellow" />
              <span>Tecnología en Acción</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase font-display text-white tracking-tight">
              PANTALLA DE COCINA (KDS) & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">POS TÁCTIL EN VIVO</span>
            </h2>
            <p className="text-sm text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Prueba la velocidad del sistema. Haz clic en <strong>"Simular Comanda Entrante"</strong> para escuchar la campana sonora de cocina y ver la comanda organizarse automáticamente:
            </p>
          </div>

          {/* Interactive Control Header */}
          <div className="bg-[#121216] border border-[#26262e] rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* View Switcher Tabs */}
            <div className="flex items-center gap-2 bg-[#0c0c0e] p-1.5 rounded-2xl border border-[#22222a] w-full md:w-auto">
              <button
                type="button"
                onClick={() => setSimView('kds')}
                className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
                  simView === 'kds'
                    ? 'bg-brand-yellow text-black shadow-glow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <ChefHat className="w-4 h-4" />
                <span>Pantalla Cocina (KDS)</span>
              </button>

              <button
                type="button"
                onClick={() => setSimView('pos')}
                className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
                  simView === 'pos'
                    ? 'bg-brand-yellow text-black shadow-glow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Printer className="w-4 h-4" />
                <span>Caja & POS Táctil</span>
              </button>

              <button
                type="button"
                onClick={() => setSimView('qr')}
                className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
                  simView === 'qr'
                    ? 'bg-brand-yellow text-black shadow-glow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>Menú QR Comensal</span>
              </button>
            </div>

            {/* Chime and Test Action Button */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button
                type="button"
                onClick={handleSimulateNewOrder}
                className="w-full md:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 text-black font-black text-xs uppercase tracking-wider shadow-glow transition hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Volume2 className="w-4 h-4 stroke-[2.5]" />
                <span>🔔 Simular Comanda Entrante</span>
              </button>
            </div>
          </div>

          {/* Toast Notification for incoming simulated order */}
          {simNotification && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-emerald-300 text-xs font-bold flex items-center justify-between shadow-2xl animate-bounce">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{simNotification}</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono uppercase bg-emerald-900/60 px-2 py-0.5 rounded">
                Campana Sonora 880Hz
              </span>
            </div>
          )}

          {/* SIMULATOR VIEW: KDS SCREEN */}
          {simView === 'kds' && (
            <div className="bg-[#0f0f13] border-2 border-[#202028] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#22222a] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-sm font-black uppercase text-white font-display">
                    Comandera de Cocina Digital • Sede Principal
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#1e1e26] text-gray-400 text-[10px] font-bold">
                    {simOrders.length} Comandas en Cola
                  </span>
                </div>
                <span className="text-xs text-gray-500 font-mono hidden sm:inline">
                  Auto-ordenado por tiempo de espera
                </span>
              </div>

              {/* Grid of Kitchen Order Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {simOrders.map((order) => {
                  const isNew = order.estado === 'Nuevo';
                  const isReady = order.estado === 'Listo';
                  return (
                    <div
                      key={order.id}
                      className={`bg-[#16161c] border-2 rounded-2xl p-5 space-y-4 shadow-xl transition-all ${
                        isNew
                          ? 'border-red-500/60 bg-red-950/10'
                          : isReady
                          ? 'border-emerald-500/60 bg-emerald-950/10'
                          : 'border-brand-yellow/60 bg-amber-950/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base font-black text-white font-mono tracking-wider">
                          #{order.id}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                            isNew
                              ? 'bg-red-500/20 text-red-400 border-red-500/40'
                              : isReady
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          }`}
                        >
                          {order.estado}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-xs font-bold text-gray-400 block flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5 text-gray-500" />
                          <span>{order.mesa}</span>
                        </span>
                        <p className="text-sm font-bold text-white leading-snug">
                          {order.items}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-[#262630]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-500" />
                          <span>Hace {order.minutos} min</span>
                        </span>
                        <span className="font-mono font-black text-brand-yellow">
                          {formatCOP(order.total)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAdvanceSimOrder(order.id)}
                        className={`w-full py-2 px-3 rounded-xl font-black text-xs uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer ${
                          isReady
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow'
                            : 'bg-[#22222c] hover:bg-brand-yellow hover:text-black text-gray-300'
                        }`}
                      >
                        <CheckCheck className="w-4 h-4" />
                        <span>{isReady ? 'Despachar / Entregar' : 'Avanzar Estado'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SIMULATOR VIEW: POS SCREEN */}
          {simView === 'pos' && (
            <div className="bg-[#0f0f13] border-2 border-[#202028] rounded-3xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 shadow-2xl">
              <div className="md:col-span-7 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Terminal POS Táctil
                  </span>
                  <span className="text-xs text-gray-400">• Factura Rápida & Cuentas Divididas</span>
                </div>
                <h3 className="text-2xl font-black uppercase text-white font-display">
                  Cobro Ágil con 1 Clic
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Permite separar cuentas por comensal, propina sugerida legal del 10%, y cobro inmediato con códigos QR de Nequi, Daviplata o datáfono.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  <div className="p-3 rounded-xl bg-[#181820] border border-[#2b2b36] text-center">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Medio</span>
                    <span className="text-xs font-black text-emerald-400">Nequi QR</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#181820] border border-[#2b2b36] text-center">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Medio</span>
                    <span className="text-xs font-black text-red-400">Daviplata</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#181820] border border-[#2b2b36] text-center">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Medio</span>
                    <span className="text-xs font-black text-amber-400">Efectivo</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#181820] border border-[#2b2b36] text-center">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Medio</span>
                    <span className="text-xs font-black text-blue-400">Datáfono</span>
                  </div>
                </div>
              </div>

              {/* Thermal Receipt Mockup */}
              <div className="md:col-span-5 flex justify-center">
                <div className="bg-[#fcfcfc] text-black rounded-2xl p-5 w-full max-w-xs font-mono text-[11px] shadow-2xl border-4 border-[#333] space-y-3">
                  <div className="text-center border-b border-dashed border-gray-400 pb-2">
                    <span className="font-black text-sm block tracking-wider uppercase font-sans">PUNTO G GOURMET</span>
                    <span className="text-[10px] text-gray-600 block">NIT 901.458.789-2 • Cali, Valle</span>
                    <span className="text-[9px] text-gray-500 block">Factura POS Electrónica #F-4589</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>1x Hamburguesa Master</span>
                      <span>$28.900</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>1x Papas Rústicas Especial</span>
                      <span>$10.000</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Propina Sugerida (10%)</span>
                      <span>$3.890</span>
                    </div>
                  </div>
                  <div className="border-t border-dashed border-gray-400 pt-2 flex justify-between font-black text-sm">
                    <span>TOTAL PAGADO:</span>
                    <span className="text-emerald-700">$42.790 COP</span>
                  </div>
                  <div className="text-center text-[9px] text-gray-500 border-t border-gray-200 pt-2">
                    ¡Gracias por tu compra! • Escanea para calificar
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SIMULATOR VIEW: QR EXPERIENCE */}
          {simView === 'qr' && (
            <div className="bg-[#0f0f13] border-2 border-[#202028] rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
              <div className="max-w-md mx-auto space-y-2">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-brand-yellow/15 text-brand-yellow border border-brand-yellow/30">
                  Experiencia del Comensal
                </span>
                <h3 className="text-2xl font-black uppercase text-white font-display">
                  Menú Digital QR en Mesa
                </h3>
                <p className="text-xs text-gray-400">
                  El cliente escanea el código QR de su mesa y pide directamente sin esperar al mesero, reduciendo tiempos de espera en un 40%.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <Link
                  href="/r/punto-g"
                  target="_blank"
                  className="px-6 py-3 rounded-2xl bg-brand-yellow text-black font-black text-xs uppercase tracking-wider shadow-glow hover:scale-105 transition flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Abrir Demo Punto G en Vivo</span>
                </Link>
                <Link
                  href="/r/salchiricurras"
                  target="_blank"
                  className="px-6 py-3 rounded-2xl bg-[#1c1c24] text-white border border-[#333] font-black text-xs uppercase tracking-wider hover:bg-[#282834] transition flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Abrir Demo Salchi Ricurras</span>
                </Link>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ======================================================== */}
      {/* SIMULADOR INTERACTIVO 3D DE MARCA WHITE-LABEL            */}
      {/* ======================================================== */}
      <section id="simulator" className="py-24 px-4 sm:px-6 bg-[#0a0a0a] border-b border-[#181818]">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow text-xs font-black uppercase tracking-wider">
              <Palette className="w-3.5 h-3.5" />
              <span>Simulador Interactivo de Marca</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase font-display text-white">
              CADA RESTAURANTE ES <span className="text-brand-yellow">ÚNICO</span>
            </h2>
            <p className="text-sm text-gray-400 max-w-2xl mx-auto">
              Haz clic en los tipos de restaurante para ver cómo la interfaz, el producto 3D y la paleta de colores se transforman al instante:
            </p>
          </div>

          {/* Interactive Preset Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {BRAND_SIMULATOR_PRESETS.map((preset) => {
              const isSelected = activeBrand.id === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setActiveBrand(preset)}
                  className={`px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'bg-white text-black shadow-lg scale-105'
                      : 'bg-[#151515] text-gray-300 hover:text-white border border-[#272727] hover:border-gray-500'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full shadow-sm"
                    style={{ backgroundColor: preset.color }}
                  />
                  <span>{preset.name.split(' ')[0]} ({preset.category})</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Live Screen Terminal */}
          <div className="bg-[#121212] border-2 border-[#252525] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden transition-all duration-500">
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              {/* Left Brand Details */}
              <div className="md:col-span-7 space-y-4 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border"
                  style={{
                    backgroundColor: `${activeBrand.color}15`,
                    borderColor: `${activeBrand.color}40`,
                    color: activeBrand.color
                  }}
                >
                  <span>Vista Previa del Menú • {activeBrand.category}</span>
                </div>

                <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase font-display tracking-tight">
                  {activeBrand.name}
                </h3>

                <p className="text-sm text-gray-300 font-medium">
                  {activeBrand.slogan}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div className="px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider text-black shadow-md"
                    style={{ backgroundColor: activeBrand.color }}
                  >
                    Ver la Carta
                  </div>
                  <div className="px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#1c1c1c] text-white border border-[#333]">
                    Pedir por WhatsApp
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-6 text-xs text-gray-400 border-t border-[#222]">
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Color personalizado
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Render 3D aislado
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Subdominio propio
                  </span>
                </div>
              </div>

              {/* Right Floating 3D Graphic */}
              <div className="md:col-span-5 flex flex-col items-center justify-center">
                <div className="relative w-[220px] h-[200px] sm:w-[280px] sm:h-[250px] flex items-center justify-center animate-float">
                  <img
                    key={activeBrand.image}
                    src={activeBrand.image}
                    alt={activeBrand.name}
                    className="w-full h-full object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.9)] transition-all duration-500"
                  />
                </div>
                <div className="w-40 sm:w-52 h-2.5 bg-black/80 rounded-[100%] blur-sm -mt-1 pointer-events-none" />
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* RESTAURANTES DEMO EN VIVO                                */}
      {/* ======================================================== */}
      <section id="demos" className="py-24 px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs uppercase font-black tracking-widest text-brand-yellow">
            Casos de Uso Reales
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase font-display text-white">
            EXPLORA RESTAURANTES ACTIVOS
          </h2>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto">
            Cada cliente opera de forma 100% aislada con su propia base de datos, precios, sedes y comanderas. Pruébalos en tiempo real:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {(liveRestaurants.length > 0 ? liveRestaurants : [
            {
              id: 1,
              nombre: 'Punto G Gourmet',
              slug: 'punto-g',
              eslogan: 'Hamburguesas, picadas & parrilla',
              descripcion: 'Restaurante gastronómico con sedes en Cali. Maneja menú digital interactivo, pantalla táctil de cocina (KDS) y control de mesas.',
              colorPrimario: '#ffc928',
              _count: { products: 30 }
            },
            {
              id: 2,
              nombre: 'Salchi Ricurras',
              slug: 'salchiricurras',
              eslogan: 'Salchipapas artesanales & maíz',
              descripcion: 'Salchipapas gigantes, mazorcadas con queso gratinado y combos para compartir con identidad visual roja y pedidos por WhatsApp.',
              colorPrimario: '#E53E3E',
              _count: { products: 15 }
            },
            {
              id: 3,
              nombre: 'Azados Bryan',
              slug: 'bryan',
              eslogan: 'Parrilla al carbón & asados',
              descripcion: 'Asados al carbón con carnes seleccionadas, costillas BBQ, picadas mixtas y carta digital con despacho rápido.',
              colorPrimario: '#D97706',
              _count: { products: 18 }
            }
          ]).map((rest) => {
            const primaryColor = rest.colorPrimario || '#ffc928';
            const initial = rest.nombre ? rest.nombre.charAt(0).toUpperCase() : 'R';
            return (
              <div
                key={rest.id || rest.slug}
                className="bg-[#111] border-2 rounded-3xl p-6 space-y-6 shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
                style={{ borderColor: `${primaryColor}50` }}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-glow text-black"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {initial}
                      </div>
                      <div>
                        <h3 className="text-xl font-black uppercase text-white font-display">
                          {rest.nombre}
                        </h3>
                        <span className="text-xs text-gray-400">
                          {rest.eslogan || 'Menú digital & POS'}
                        </span>
                      </div>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-[10px] font-black uppercase border"
                      style={{
                        backgroundColor: `${primaryColor}20`,
                        color: primaryColor,
                        borderColor: `${primaryColor}50`,
                      }}
                    >
                      En Vivo
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed">
                    {rest.descripcion || 'Restaurante activo con sistema gastronómico multisede, menú QR y comanderas.'}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-bold uppercase tracking-wider">
                  <Link
                    href={`/r/${rest.slug}`}
                    target="_blank"
                    className="p-3 rounded-xl bg-[#1c1c1c] hover:bg-[#282828] text-white border border-[#333] flex items-center justify-center gap-1.5 transition text-center"
                  >
                    <span>Carta</span>
                    <ExternalLink className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                  </Link>
                  <Link
                    href={`/r/${rest.slug}/cocina`}
                    target="_blank"
                    className="p-3 rounded-xl bg-[#1c1c1c] hover:bg-[#282828] text-white border border-[#333] flex items-center justify-center gap-1.5 transition text-center"
                  >
                    <span>Cocina</span>
                    <ChefHat className="w-3.5 h-3.5 text-amber-400" />
                  </Link>
                  <Link
                    href={`/r/${rest.slug}/mesero`}
                    target="_blank"
                    className="p-3 rounded-xl bg-[#1c1c1c] hover:bg-[#282828] text-white border border-[#333] flex items-center justify-center gap-1.5 transition text-center"
                  >
                    <span>Mesero</span>
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ======================================================== */}
      {/* CALCULADORA DE AHORRO / ROI CONTRA APPS TRADICIONALES     */}
      {/* ======================================================== */}
      <section id="calculadora" className="py-24 px-4 sm:px-6 bg-[#0a0a0a] border-y border-[#181818]">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider">
              <Calculator className="w-3.5 h-3.5" />
              <span>Calculadora de Comisiones vs Tarifa Fija</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase font-display text-white">
              ¿CUÁNTO DINERO PIERDES EN <span className="text-emerald-400">COMISIONES?</span>
            </h2>
            <p className="text-sm text-gray-400 max-w-2xl mx-auto">
              Las aplicaciones de delivery cobran en promedio entre 22% y 30% por cada plato que vendes. Comprueba cuánto dinero te ahorras al mes con una plataforma propia:
            </p>
          </div>

          <div className="bg-[#121212] border-2 border-[#252525] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
            
            {/* Slider Control */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                  Tus Ventas Mensuales Estimadas:
                </span>
                <span className="text-2xl font-black text-brand-yellow font-display">
                  {formatCOP(monthlySalesMillion * 1000000)} COP / mes
                </span>
              </div>

              <input
                type="range"
                min="5"
                max="60"
                step="1"
                value={monthlySalesMillion}
                onChange={(e) => setMonthlySalesMillion(Number(e.target.value))}
                className="w-full h-3 bg-[#222] rounded-lg appearance-none cursor-pointer accent-brand-yellow"
              />

              <div className="flex justify-between text-[11px] font-bold text-gray-500">
                <span>$5.000.000 COP</span>
                <span>$30.000.000 COP</span>
                <span>$60.000.000 COP</span>
              </div>
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div className="bg-[#181818] border border-red-500/30 p-5 rounded-2xl text-center space-y-1">
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block">
                  En Apps de Delivery (25%)
                </span>
                <span className="text-2xl font-black text-red-400 font-display block">
                  -{formatCOP(appCommissionLost)}
                </span>
                <span className="text-[10px] text-gray-500">Se lo quedan las apps cada mes</span>
              </div>

              <div className="bg-[#181818] border border-gray-700 p-5 rounded-2xl text-center space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                  GastroNegocios (Plan Pro)
                </span>
                <span className="text-2xl font-black text-white font-display block">
                  $149.000
                </span>
                <span className="text-[10px] text-gray-500">Tarifa fija sin importar cuánto vendas</span>
              </div>

              <div className="bg-emerald-950/40 border-2 border-emerald-500/50 p-5 rounded-2xl text-center space-y-1 shadow-lg">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">
                  Tu Ahorro Neto Mensual
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-display block">
                  +{formatCOP(netMonthlySavings)}
                </span>
                <span className="text-[10px] text-emerald-300/80 font-bold">
                  ¡Ahorras {formatCOP(netYearlySavings)} al año!
                </span>
              </div>

            </div>

            <div className="text-center pt-2">
              <a
                href={whatsappSalesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition hover:scale-105 active:scale-95"
              >
                <DollarSign className="w-4 h-4 stroke-[3]" />
                <span>Quiero Dejar de Pagar Comisiones</span>
              </a>
            </div>

          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* MÓDULOS DE LA PLATAFORMA                                 */}
      {/* ======================================================== */}
      <section id="modulos" className="py-24 px-4 sm:px-6 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-3">
          <span className="text-xs uppercase font-black tracking-widest text-brand-yellow">
            Operación Completa
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase font-display text-white">
            HERRAMIENTAS PARA CADA ROL
          </h2>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto">
            Desde la mesa hasta la cocina: cada miembro de tu equipo tiene una interfaz diseñada a medida:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="bg-[#111] border border-[#242424] p-7 rounded-3xl space-y-4 hover:border-brand-yellow/50 transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/15 text-brand-yellow flex items-center justify-center font-bold">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black uppercase text-white font-display">
              Menú Digital & Delivery
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Catálogo digital con fotos de alta resolución, selecciones de adiciones, salsas y envío automático del pedido a la cocina y a WhatsApp.
            </p>
          </div>

          <div className="bg-[#111] border border-[#242424] p-7 rounded-3xl space-y-4 hover:border-orange-500/50 transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/15 text-orange-400 flex items-center justify-center font-bold">
              <ChefHat className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black uppercase text-white font-display">
              Pantalla de Cocina (KDS)
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Control de comandas en tiempo real para cocineros. Tiempos de preparación cronometrados, alertas sonoras y cambio de estado con un solo toque.
            </p>
          </div>

          <div className="bg-[#111] border border-[#242424] p-7 rounded-3xl space-y-4 hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black uppercase text-white font-display">
              POS Móvil para Meseros
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Comandera táctil en celular o tablet. Asignación de mesas, notas de cliente ("sin cebolla") y división de cuentas por comensal al instante.
            </p>
          </div>

          <div className="bg-[#111] border border-[#242424] p-7 rounded-3xl space-y-4 hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold">
              <Tv className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black uppercase text-white font-display">
              Turnero de Pedidos Listos
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Pantalla para sala de espera o Smart TV. Notifica con campanazo a los clientes cuando su orden está lista para entrega o recogida.
            </p>
          </div>

          <div className="bg-[#111] border border-[#242424] p-7 rounded-3xl space-y-4 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black uppercase text-white font-display">
              Caja, Arqueos & Facturación
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Arqueos de turno de caja (apertura y cierre con reporte de descuadres), control de propinas, impresión de comandas térmicas y métricas financieras.
            </p>
          </div>

          <div className="bg-[#111] border border-[#242424] p-7 rounded-3xl space-y-4 hover:border-yellow-400/50 transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-yellow-400/15 text-brand-yellow flex items-center justify-center font-bold">
              <Palette className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black uppercase text-white font-display">
              Galería 3D & White-Label
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Galería predeterminada con renders 3D de alta gama con fondo transparente para que cada restaurante seleccione su especialidad al registrarse.
            </p>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* PLANES & PRECIOS DE LICENCIAMIENTO                       */}
      {/* ======================================================== */}
      <section id="planes" className="py-24 px-4 sm:px-6 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-3">
          <span className="text-xs uppercase font-black tracking-widest text-brand-yellow">
            Suscripción Transparente
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase font-display text-white">
            PLANES DE LICENCIA A TU MEDIDA
          </h2>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto">
            Sin contratos de permanencia ni porcentajes sobre tus ventas. Tarifa fija mensual:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Plan Básico */}
          <div className="bg-[#111] border border-[#252525] rounded-3xl p-8 space-y-6 flex flex-col justify-between hover:border-gray-600 transition">
            <div className="space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-gray-400">Plan Básico</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">$69.000</span>
                <span className="text-xs text-gray-400 font-bold">/ mes COP</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Ideal para cocinas ocultas o locales pequeños que requieren menú QR y pedidos directos.
              </p>
              <ul className="space-y-3 text-xs text-gray-300 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>1 Sede / Sucursal</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Menú Digital QR ilimitado</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Pedidos directos a WhatsApp</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Hasta 50 platos & bebidas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Panel administrativo básico</span>
                </li>
              </ul>
            </div>

            <a
              href={`https://wa.me/573229088736?text=${encodeURIComponent('Hola, deseo activar el Plan Básico para mi restaurante.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-[#1c1c1c] hover:bg-[#282828] text-white font-black text-xs uppercase tracking-wider text-center border border-[#333] transition block"
            >
              Comenzar con Básico
            </a>
          </div>

          {/* Plan Pro (Recomendado) */}
          <div className="bg-[#141414] border-2 border-brand-yellow rounded-3xl p-8 space-y-6 flex flex-col justify-between relative shadow-[0_0_40px_rgba(255,201,40,0.15)] scale-[1.03]">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-brand-yellow text-black font-black text-[10px] uppercase tracking-widest shadow-glow">
              ★ Más Popular
            </div>

            <div className="space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-brand-yellow">Plan Pro</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">$149.000</span>
                <span className="text-xs text-gray-400 font-bold">/ mes COP</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Para restaurantes consolidados que buscan automatizar cocina, comanderas y turnero.
              </p>
              <ul className="space-y-3 text-xs text-gray-300 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-yellow shrink-0" />
                  <span><strong>Hasta 5 Sedes</strong> integradas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-yellow shrink-0" />
                  <span><strong>Pantalla Cocina (KDS)</strong> en tiempo real</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-yellow shrink-0" />
                  <span><strong>POS Móvil para Meseros</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-yellow shrink-0" />
                  <span>Turnero de Pedidos Listos</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-yellow shrink-0" />
                  <span>Galería 3D y personalización visual</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-yellow shrink-0" />
                  <span>Hasta 250 productos & adicionales</span>
                </li>
              </ul>
            </div>

            <a
              href={`https://wa.me/573229088736?text=${encodeURIComponent('Hola, deseo adquirir el Plan Pro para mi restaurante.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-brand-yellow to-yellow-500 hover:brightness-110 text-black font-black text-xs uppercase tracking-wider text-center shadow-glow transition block"
            >
              Adquirir Plan Pro
            </a>
          </div>

          {/* Plan Enterprise */}
          <div className="bg-[#111] border border-[#252525] rounded-3xl p-8 space-y-6 flex flex-col justify-between hover:border-gray-600 transition">
            <div className="space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-purple-400">Plan Enterprise</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">$299.000</span>
                <span className="text-xs text-gray-400 font-bold">/ mes COP</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Para cadenas gastronómicas, franquicias y marcas con alto volumen de pedidos.
              </p>
              <ul className="space-y-3 text-xs text-gray-300 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span><strong>Sedes Ilimitadas</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span><strong>Base de Datos Monolítica Dedicada</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Dominio web personalizado</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Usuarios y meseros ilimitados</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Soporte prioritario VIP 24/7</span>
                </li>
              </ul>
            </div>

            <a
              href={`https://wa.me/573229088736?text=${encodeURIComponent('Hola, me interesa el Plan Enterprise con base de datos dedicada.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-[#1c1c1c] hover:bg-[#282828] text-white font-black text-xs uppercase tracking-wider text-center border border-[#333] transition block"
            >
              Contactar para Enterprise
            </a>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* PREGUNTAS FRECUENTES (FAQ) CON ACORDEÓN                  */}
      {/* ======================================================== */}
      <section id="faq" className="py-20 px-4 sm:px-6 bg-[#0a0a0a] border-t border-[#181818]">
        <div className="max-w-3xl mx-auto space-y-8">
          
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black uppercase font-display text-white">
              PREGUNTAS FRECUENTES
            </h2>
            <p className="text-xs text-gray-400">Resolvemos todas tus dudas antes de comenzar.</p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: '¿Cobran comisiones por los pedidos que recibo?',
                a: 'No. A diferencia de las aplicaciones de delivery tradicionales que cobran hasta un 30% por cada venta, en nuestra plataforma pagas únicamente tu suscripción fija mensual y el 100% de la venta es tuyo.'
              },
              {
                q: '¿Necesito comprar equipos costosos para cocina o meseros?',
                a: 'No. El sistema funciona en cualquier navegador web moderno. Puedes usar tablets económicas, teléfonos celulares de tus meseros o cualquier computador o Smart TV para la pantalla de cocina.'
              },
              {
                q: '¿Puedo conectar una impresora térmica para imprimir comandas?',
                a: 'Sí. El sistema cuenta con módulo de impresión térmica compatible con impresoras de 80mm y 58mm vía USB, red local o Bluetooth.'
              },
              {
                q: '¿Puedo tener mi propio dominio web (ej: mirestaurante.com)?',
                a: 'Sí. Cada restaurante cuenta con su propia ruta /r/mirestaurante o subdominio y en los planes Pro y Enterprise puedes conectar tu propio dominio personalizado.'
              },
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#121212] border border-[#222] overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-bold text-xs sm:text-sm text-white hover:text-brand-yellow transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-yellow' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 text-xs text-gray-400 leading-relaxed border-t border-[#1c1c1c] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* FOOTER SAAS                                              */}
      {/* ======================================================== */}
      <footer className="pt-16 pb-12 px-4 sm:px-8 border-t border-[#181818] bg-[#050505] text-xs text-gray-400">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 items-start">
            {/* Col 1: Brand */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-yellow text-black flex items-center justify-center font-black text-lg shadow-glow">
                  G
                </div>
                <div>
                  <span className="font-black text-white uppercase text-base tracking-wider block font-display">GastroNegocios Platform</span>
                  <span className="text-xs text-gray-400">Software Gastronómico White-Label & POS para Restaurantes</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 max-w-md leading-relaxed">
                Plataforma integral de pedidos directos, cartas digitales interactivas en 3D, comandera de cocina KDS, facturación térmica ESC/POS y pedidos automatizados por WhatsApp. Sin comisiones abusivas por venta.
              </p>
              <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                <span className="px-3 py-1 rounded-full bg-[#121212] border border-[#242424] text-gray-300 font-bold">
                  ⚡ 0% Comisiones por Pedido
                </span>
                <span className="px-3 py-1 rounded-full bg-[#121212] border border-[#242424] text-gray-300 font-bold">
                  🔒 Multi-Tenant Aislado
                </span>
                <span className="px-3 py-1 rounded-full bg-[#121212] border border-[#242424] text-gray-300 font-bold">
                  🧾 Impresión Térmica ESC/POS
                </span>
              </div>
            </div>

            {/* Col 2: Módulos & Demos */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-xs font-black uppercase text-white tracking-wider font-display">
                Módulos de la Suite
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/r/puntog" className="hover:text-brand-yellow transition flex items-center gap-1.5 text-gray-300">
                    <ChevronRight className="w-3.5 h-3.5 text-brand-yellow" />
                    <span>Demo Restaurante: Punto G</span>
                  </Link>
                </li>
                <li>
                  <Link href="/r/salchiricurras" className="hover:text-brand-yellow transition flex items-center gap-1.5 text-gray-300">
                    <ChevronRight className="w-3.5 h-3.5 text-brand-yellow" />
                    <span>Demo Restaurante: Salchi Ricurras</span>
                  </Link>
                </li>
                <li>
                  <Link href="/r/puntog/cocina" className="hover:text-brand-yellow transition flex items-center gap-1.5 text-gray-300">
                    <ChevronRight className="w-3.5 h-3.5 text-brand-yellow" />
                    <span>Pantalla de Cocina (KDS)</span>
                  </Link>
                </li>
                <li>
                  <Link href="/r/puntog/mesero" className="hover:text-brand-yellow transition flex items-center gap-1.5 text-gray-300">
                    <ChevronRight className="w-3.5 h-3.5 text-brand-yellow" />
                    <span>Comandera Móvil Meseros</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Enlaces y Soporte */}
            <div className="lg:col-span-4 space-y-3">
              <h4 className="text-xs font-black uppercase text-white tracking-wider font-display">
                Comenzar & Soporte
              </h4>
              <p className="text-xs text-gray-400">
                ¿Tienes un restaurante o franquicia y deseas digitalizar tus ventas hoy mismo?
              </p>
              <div className="space-y-2 pt-1">
                <a
                  href={whatsappSalesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-yellow text-black font-black text-xs uppercase tracking-wider shadow-glow hover:scale-[1.02] transition"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Hablar con un Asesor Comercial</span>
                </a>
                <div className="flex items-center justify-between text-xs pt-1 px-1">
                  <Link href="/login" className="text-gray-300 hover:text-white transition">
                    Acceso Clientes / Admin
                  </Link>
                  <Link href="/superadmin" className="text-gray-400 hover:text-brand-yellow transition">
                    Portal Superadmin
                  </Link>
                </div>
              </div>
            </div>

          </div>

          <div className="pt-8 border-t border-[#181818] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-center md:text-left">
            <p className="leading-relaxed font-medium text-gray-300">
              Desarrollado por{' '}
              <a
                href="https://sarriatech.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-brand-yellow font-bold transition-colors underline decoration-brand-yellow/50 underline-offset-2"
              >
                SarriaTech Solutions S.A.S
              </a>{' '}
              Todos los derechos reservados;
            </p>

            <div className="flex items-center gap-4 text-[11px] text-gray-400 font-medium">
              <span>Cali, Colombia</span>
              <span>•</span>
              <span>SaaS Gastronómico de Alta Disponibilidad</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
