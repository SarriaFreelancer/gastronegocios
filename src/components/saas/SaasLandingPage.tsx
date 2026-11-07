'use client';

import React from 'react';
import Link from 'next/link';
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
  Users
} from 'lucide-react';

export function SaasLandingPage() {
  const whatsappSalesUrl =
    'https://wa.me/573229088736?text=' +
    encodeURIComponent('¡Hola! Me interesa adquirir la plataforma SaaS para mi restaurante. ¿Podrían brindarme información y demostración?');

  return (
    <div className="min-h-screen bg-[#070707] text-white selection:bg-brand-yellow selection:text-black">
      {/* ======================================================== */}
      {/* HEADER SUPERIOR SAAS                                     */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#1f1f1f] px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-brand-yellow flex items-center justify-center font-black text-black shadow-glow group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-lg font-black tracking-wider text-white font-display flex items-center gap-1.5">
                PUNTO G <span className="text-xs bg-brand-yellow text-black font-black px-1.5 py-0.5 rounded">SAAS</span>
              </span>
              <span className="text-[10px] text-gray-400 block tracking-widest uppercase">
                Software Gastronómico
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs font-bold uppercase tracking-wider text-gray-300">
            <a href="#demos" className="hover:text-brand-yellow transition">
              Restaurantes Demo
            </a>
            <a href="#modulos" className="hover:text-brand-yellow transition">
              Módulos
            </a>
            <a href="#planes" className="hover:text-brand-yellow transition">
              Planes & Precios
            </a>
            <a href="#faq" className="hover:text-gray-400 transition">
              Preguntas
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-black uppercase tracking-wider text-gray-300 hover:text-white bg-[#161616] hover:bg-[#222] border border-[#2b2b2b] rounded-xl transition"
            >
              Ingreso Clientes
            </Link>
            <a
              href={whatsappSalesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-brand-yellow hover:brightness-110 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-glow transition hover:scale-105"
            >
              <MessageCircle className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Hablar con Asesor</span>
            </a>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* HERO PRINCIPAL SAAS                                      */}
      {/* ======================================================== */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 overflow-hidden border-b border-[#181818]">
        {/* Glow de fondo */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-brand-yellow/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow text-xs font-black uppercase tracking-widest shadow-glow animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Plataforma White-Label para Restaurantes Modernos</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase font-display tracking-tight text-white leading-[1.05]">
            El sistema operativo que <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-brand-yellow to-yellow-500">multiplica las ventas</span> de tu restaurante
          </h1>

          <p className="text-base sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Menú digital interactivo con código QR, comanderas móviles para meseros, pantalla táctil de cocina (KDS), turnero de pedidos y panel administrativo. Todo con tu propio nombre, logotipo y colores.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a
              href="#demos"
              className="py-3.5 px-7 rounded-2xl bg-gradient-to-r from-amber-400 via-brand-yellow to-yellow-500 hover:brightness-110 text-black font-black text-sm uppercase tracking-wider transition shadow-glow flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <span>Ver Demos en Vivo</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </a>
            <a
              href={whatsappSalesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3.5 px-7 rounded-2xl bg-[#141414] hover:bg-[#1e1e1e] text-white font-black text-sm uppercase tracking-wider border border-[#2d2d2d] transition flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Solicitar Cotización</span>
            </a>
          </div>

          {/* Badges de confianza */}
          <div className="pt-10 flex flex-wrap items-center justify-center gap-8 text-xs text-gray-400 font-bold uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>0% Comisiones por venta</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Tu propia marca & dominio</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Múltiples sedes integradas</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Soporte y acompañamiento continuo</span>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* RESTAURANTES EN DEMO EN VIVO                              */}
      {/* ======================================================== */}
      <section id="demos" className="py-24 px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs uppercase font-black tracking-widest text-brand-yellow">
            Casos de Uso Reales
          </span>
          <h2 className="text-3xl sm:text-4xl font-black uppercase font-display text-white">
            Explora Restaurantes con Marca Propia
          </h2>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto">
            Cada cliente opera de forma 100% independiente con sus propios colores, productos, precios, sedes y comanderas. Pruébalos en tiempo real:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tarjeta Demo 1: Punto G */}
          <div className="bg-[#111] border-2 border-[#222] hover:border-brand-yellow/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-yellow text-black flex items-center justify-center font-black text-xl shadow-glow">
                  G
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase text-white font-display">
                    Punto G Gourmet
                  </h3>
                  <span className="text-xs text-gray-400">Hamburguesas, picadas & parrilla artesanal</span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-brand-yellow/15 text-brand-yellow border border-brand-yellow/30">
                Cliente Activo
              </span>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Restaurante con 3 sedes en Cali (Granada, Sur y Ciudad Jardín). Maneja menú digital, pedidos a domicilio automáticos y pantalla de cocina.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-bold uppercase tracking-wider">
              <Link
                href="/r/puntog"
                target="_blank"
                className="p-3 rounded-xl bg-[#1c1c1c] hover:bg-[#282828] text-white border border-[#333] flex items-center justify-center gap-1.5 transition text-center"
              >
                <span>Landing & Menú</span>
                <ExternalLink className="w-3.5 h-3.5 text-brand-yellow" />
              </Link>
              <Link
                href="/r/puntog/cocina"
                target="_blank"
                className="p-3 rounded-xl bg-[#1c1c1c] hover:bg-[#282828] text-white border border-[#333] flex items-center justify-center gap-1.5 transition text-center"
              >
                <span>Cocina KDS</span>
                <ChefHat className="w-3.5 h-3.5 text-amber-400" />
              </Link>
              <Link
                href="/r/puntog/mesero"
                target="_blank"
                className="p-3 rounded-xl bg-[#1c1c1c] hover:bg-[#282828] text-white border border-[#333] flex items-center justify-center gap-1.5 transition text-center col-span-2 sm:col-span-1"
              >
                <span>Mesero POS</span>
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              </Link>
            </div>
          </div>

          {/* Tarjeta Demo 2: Salchirricuras */}
          <div className="bg-[#111] border-2 border-[#222] hover:border-orange-500/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-black text-xl shadow-glow">
                  S
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase text-white font-display">
                    Salchirricuras
                  </h3>
                  <span className="text-xs text-gray-400">Salchipapas monstruosas & desgranados</span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-orange-500/15 text-orange-400 border border-orange-500/30">
                Cliente Activo
              </span>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Restaurante especializado con identidad visual independiente, colores propios, catálogo de salchipapas con adiciones especiales y comanda de cocina.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-bold uppercase tracking-wider">
              <Link
                href="/r/salchirricuras"
                target="_blank"
                className="p-3 rounded-xl bg-[#1c1c1c] hover:bg-[#282828] text-white border border-[#333] flex items-center justify-center gap-1.5 transition text-center"
              >
                <span>Landing & Menú</span>
                <ExternalLink className="w-3.5 h-3.5 text-orange-400" />
              </Link>
              <Link
                href="/r/salchirricuras/cocina"
                target="_blank"
                className="p-3 rounded-xl bg-[#1c1c1c] hover:bg-[#282828] text-white border border-[#333] flex items-center justify-center gap-1.5 transition text-center"
              >
                <span>Cocina KDS</span>
                <ChefHat className="w-3.5 h-3.5 text-amber-400" />
              </Link>
              <Link
                href="/r/salchirricuras/mesero"
                target="_blank"
                className="p-3 rounded-xl bg-[#1c1c1c] hover:bg-[#282828] text-white border border-[#333] flex items-center justify-center gap-1.5 transition text-center col-span-2 sm:col-span-1"
              >
                <span>Mesero POS</span>
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* MÓDULOS DE LA PLATAFORMA                                 */}
      {/* ======================================================== */}
      <section id="modulos" className="py-24 px-4 sm:px-6 bg-[#0a0a0a] border-y border-[#181818]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <span className="text-xs uppercase font-black tracking-widest text-brand-yellow">
              Todo en un Solo Lugar
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase font-display text-white">
              Herramientas Diseñadas para tu Operación
            </h2>
            <p className="text-sm text-gray-400 max-w-2xl mx-auto">
              Optimiza cada paso: desde que el cliente abre la carta en su celular hasta que el chef saca el pedido listo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#121212] border border-[#222] p-6 rounded-3xl space-y-4 hover:border-brand-yellow/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/15 text-amber-400 flex items-center justify-center">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black uppercase text-white font-display">
                Menú Digital & Delivery
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Carta con fotos de alta calidad, personalización de toppings, salsas y envío directo del pedido por WhatsApp con geolocalización.
              </p>
            </div>

            <div className="bg-[#121212] border border-[#222] p-6 rounded-3xl space-y-4 hover:border-brand-yellow/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/15 text-orange-400 flex items-center justify-center">
                <ChefHat className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black uppercase text-white font-display">
                Pantalla de Cocina (KDS)
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Control de comandas en tiempo real para chefs. Alertas sonoras, tiempos de preparación y cambio de estado con 1 toque.
              </p>
            </div>

            <div className="bg-[#121212] border border-[#222] p-6 rounded-3xl space-y-4 hover:border-brand-yellow/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black uppercase text-white font-display">
                POS Móvil para Meseros
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Comandera táctil en celular o tablet. Asignación de mesas, adiciones y solicitud de cuenta sin desplazamientos innecesarios.
              </p>
            </div>

            <div className="bg-[#121212] border border-[#222] p-6 rounded-3xl space-y-4 hover:border-brand-yellow/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                <BellRing className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black uppercase text-white font-display">
                Turnero de Pedidos Listos
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Pantalla para sala de espera o barra. Avisa a los clientes cuando su orden está lista para entrega o despacho.
              </p>
            </div>

            <div className="bg-[#121212] border border-[#222] p-6 rounded-3xl space-y-4 hover:border-brand-yellow/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black uppercase text-white font-display">
                Panel Administrativo & Arqueo
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Métricas de ventas, productos más vendidos, arqueo de turnos de caja, inventario y control de múltiples sucursales.
              </p>
            </div>

            <div className="bg-[#121212] border border-[#222] p-6 rounded-3xl space-y-4 hover:border-brand-yellow/40 transition">
              <div className="w-12 h-12 rounded-2xl bg-yellow-400/15 text-yellow-400 flex items-center justify-center">
                <Palette className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black uppercase text-white font-display">
                White-Label 100% Personalizable
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Elige entre 3 plantillas visuales, ajusta tus colores de marca, logotipo, banners y títulos comerciales sin necesidad de programar.
              </p>
            </div>
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
          <h2 className="text-3xl sm:text-4xl font-black uppercase font-display text-white">
            Planes de Licencia a tu Medida
          </h2>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto">
            Sin contratos forzosos ni comisiones por ventas. Paga una suscripción mensual fija y quédate con el 100% de tus ingresos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Plan Básico */}
          <div className="bg-[#111] border border-[#252525] rounded-3xl p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-gray-400">Plan Básico</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">$69.000</span>
                <span className="text-xs text-gray-400 font-bold">/ mes COP</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Ideal para restaurantes emergentes o cocinas ocultas que necesitan un menú QR profesional.
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
                  <span>Hasta 50 productos</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Panel de administración básico</span>
                </li>
              </ul>
            </div>

            <a
              href={`https://wa.me/573229088736?text=${encodeURIComponent('Hola, deseo activar el Plan Básico para mi restaurante.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-[#1c1c1c] hover:bg-[#282828] text-white font-black text-xs uppercase tracking-wider text-center border border-[#333] transition block"
            >
              Comenzar con Básico
            </a>
          </div>

          {/* Plan Pro (Destacado) */}
          <div className="bg-[#141414] border-2 border-brand-yellow rounded-3xl p-8 space-y-6 flex flex-col justify-between relative shadow-2xl scale-[1.02]">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-brand-yellow text-black font-black text-[10px] uppercase tracking-widest shadow-glow">
              Recomendado
            </div>

            <div className="space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-brand-yellow">Plan Pro</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">$149.000</span>
                <span className="text-xs text-gray-400 font-bold">/ mes COP</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Para negocios consolidados que quieren automatizar su cocina, meseros y puntos de venta.
              </p>
              <ul className="space-y-3 text-xs text-gray-300 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-yellow shrink-0" />
                  <span><strong>Hasta 5 Sedes</strong> integradas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-yellow shrink-0" />
                  <span><strong>Pantalla Cocina KDS</strong> en tiempo real</span>
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
                  <span>Personalización White-Label completa</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-yellow shrink-0" />
                  <span>Hasta 250 productos & toppings</span>
                </li>
              </ul>
            </div>

            <a
              href={`https://wa.me/573229088736?text=${encodeURIComponent('Hola, deseo adquirir el Plan Pro para mi restaurante.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-brand-yellow to-yellow-500 hover:brightness-110 text-black font-black text-xs uppercase tracking-wider text-center shadow-glow transition block"
            >
              Adquirir Plan Pro
            </a>
          </div>

          {/* Plan Enterprise */}
          <div className="bg-[#111] border border-[#252525] rounded-3xl p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-gray-400">Plan Enterprise</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">$299.000</span>
                <span className="text-xs text-gray-400 font-bold">/ mes COP</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Cadenas gastronómicas, franquicias o marcas con alto volumen de pedidos y múltiples ciudades.
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
                  <span>Dominio propio personalizado</span>
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
              className="w-full py-3 px-4 rounded-xl bg-[#1c1c1c] hover:bg-[#282828] text-white font-black text-xs uppercase tracking-wider text-center border border-[#333] transition block"
            >
              Contactar para Enterprise
            </a>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* PREGUNTAS FRECUENTES (FAQ)                               */}
      {/* ======================================================== */}
      <section id="faq" className="py-20 px-4 sm:px-6 bg-[#0a0a0a] border-t border-[#181818]">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black uppercase font-display text-white">
              Preguntas Frecuentes
            </h2>
            <p className="text-xs text-gray-400">Resolvemos tus dudas sobre la puesta en marcha de la plataforma.</p>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[#121212] border border-[#222] space-y-2">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <span>¿Cobran comisiones por los pedidos que recibo?</span>
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                No. A diferencia de las aplicaciones de delivery tradicionales que cobran hasta un 30% por cada venta, en nuestra plataforma pagas únicamente tu suscripción fija y el 100% de la venta es tuyo.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#121212] border border-[#222] space-y-2">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <span>¿Necesito comprar equipos costosos para cocina o meseros?</span>
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                No. El sistema funciona en cualquier navegador web moderno. Puedes usar tablets económicas, teléfonos celulares de tus meseros o cualquier computador o Smart TV para la pantalla de cocina.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#121212] border border-[#222] space-y-2">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <span>¿Puedo tener mi propio dominio (ej: mirestaurante.com)?</span>
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Sí. Cada restaurante puede tener su propio subdominio, ruta personalizada (/r/mirestaurante) o conectar su dominio personalizado directamente en el plan Pro o Enterprise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* FOOTER SAAS                                              */}
      {/* ======================================================== */}
      <footer className="py-12 px-4 sm:px-8 border-t border-[#181818] bg-[#060606] text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-brand-yellow text-black flex items-center justify-center font-black text-xs">
              G
            </div>
            <span className="font-black text-white uppercase tracking-wider">Punto G SaaS Platform</span>
            <span>— Todos los derechos reservados &copy; {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-white transition">
              Panel Administrativo
            </Link>
            <a href={whatsappSalesUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
              Soporte & Ventas
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
