'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { useTenant } from '@/context/TenantContext';
import { 
  Clock, 
  MapPin, 
  MessageCircle, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Phone, 
  ChevronRight, 
  Sparkles,
  Truck,
  CreditCard,
  Banknote,
  ExternalLink,
  CheckCircle2,
  ShoppingBag,
  User,
  Star,
  Navigation,
  Flame,
  ArrowUpRight
} from 'lucide-react';
import { restaurantInfo } from '@/data/restaurant-info';

export const Footer: React.FC = () => {
  const pathname = usePathname();
  const { tenant } = useTenant();

  // Excluir de páginas operativas o que tienen su propio layout de pantalla completa
  if (
    pathname === '/' ||
    pathname.startsWith('/registro') ||
    pathname.includes('/registro') ||
    pathname.startsWith('/admin') ||
    pathname.includes('/admin') ||
    pathname.startsWith('/superadmin') ||
    pathname.includes('/superadmin') ||
    pathname.startsWith('/login') ||
    pathname.includes('/login') ||
    pathname.includes('/cocina') ||
    pathname.includes('/mesero') ||
    pathname.includes('/entregas') ||
    pathname.includes('/pedidos-listos') ||
    pathname.includes('/turnero')
  ) {
    return null;
  }

  const tenantMatch = pathname.match(/^\/r\/([^\/]+)/);
  const pathSlug = tenantMatch ? tenantMatch[1] : null;
  const isPuntoG = !pathSlug || pathSlug === 'punto-g' || pathSlug === 'puntog';
  const defaultName = isPuntoG
    ? 'Punto G'
    : (pathSlug ? pathSlug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Restaurante');

  const rawPhone = (tenant?.telefonoWhatsapp || restaurantInfo.whatsappNumber).replace(/\D/g, '');
  const cleanPhone = rawPhone.length === 10 ? `57${rawPhone}` : rawPhone;
  const restName = tenant?.nombre || defaultName;
  const restDesc = tenant?.descripcion || tenant?.eslogan || 'Comidas rápidas gourmet. Hamburguesas artesanales, picadas generosas y carnes a la parrilla con el auténtico sabor de la casa.';
  const restSchedule = tenant?.horarioAtencion || restaurantInfo.schedule;
  const restAddress = tenant?.direccionCentral || restaurantInfo.address;
  const restCity = tenant?.ciudad || restaurantInfo.city;
  const restEmail = tenant?.email || 'contacto@puntog.com';
  const tenantSlug = tenant?.slug || pathSlug || 'puntog';
  const primaryColor = tenant?.colorPrimario || '#ffc928';
  const buttonColor = tenant?.colorBoton || primaryColor;
  const buttonTextColor = tenant?.colorBotonTexto || '#000000';

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${restAddress}, ${restCity}, Colombia`
  )}`;

  return (
    <footer className="relative bg-[#060607] text-white border-t border-[#1a1a1e] pt-12 sm:pt-16 pb-28 sm:pb-14 overflow-hidden z-20">
      
      {/* Decorative top ambient glow line */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 max-w-4xl h-[2px] opacity-80 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${primaryColor} 0%, transparent 75%)`,
        }}
      />
      
      {/* Ambient background blur */}
      <div 
        className="absolute top-0 right-1/4 w-80 sm:w-96 h-80 sm:h-96 rounded-full blur-[140px] opacity-10 pointer-events-none"
        style={{ backgroundColor: primaryColor }}
      />
      <div 
        className="absolute bottom-10 left-10 w-72 h-72 rounded-full blur-[160px] opacity-5 pointer-events-none"
        style={{ backgroundColor: primaryColor }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        
        {/* ======================================================== */}
        {/* 1. TOP CALL TO ACTION CARD (CONVERSIÓN DIRECTA)         */}
        {/* ======================================================== */}
        <div className="relative rounded-3xl bg-gradient-to-b from-[#141416] to-[#0c0c0e] border border-[#242428] p-6 sm:p-8 lg:p-10 shadow-2xl overflow-hidden">
          <div 
            className="absolute -right-16 -top-16 w-52 h-52 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: primaryColor }}
          />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-left">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow/10 border border-brand-yellow/30 text-[11px] font-black uppercase tracking-wider text-brand-yellow">
                <Flame className="w-3.5 h-3.5" />
                <span>¿Con antojo del mejor sabor?</span>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white font-display tracking-tight">
                Pide en línea en minutos en {restName}
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                Elige tus platos favoritos, personalízalos con tus adiciones y recibe tu comida caliente y recién hecha en tu mesa o domicilio.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto shrink-0">
              <Link
                href={`/r/${tenantSlug}/menu`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer text-center"
                style={{ backgroundColor: buttonColor, color: buttonTextColor }}
              >
                <ShoppingBag className="w-4 h-4 fill-current" />
                <span>Ver Carta & Pedir</span>
              </Link>

              <a
                href={`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(
                  `¡Hola ${restName}! Quiero consultar el menú del día y hacer un pedido.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-[#1a1a1e] hover:bg-[#25252a] text-white border border-[#2e2e34] hover:border-emerald-500/50 text-xs font-bold transition-all shadow-md active:scale-95"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Pedir por WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. VALUE PROPOSITIONS & TRUST BADGES (RESPONSIVE 2X2)   */}
        {/* ======================================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pb-6 border-b border-[#18181c]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-3.5 p-3 sm:p-4 rounded-2xl bg-[#0d0d0f] border border-[#1d1d22]">
            <div 
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${primaryColor}18`, color: primaryColor }}
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h5 className="text-[11px] sm:text-xs font-black uppercase text-white tracking-wide">Recetas de la Casa</h5>
              <p className="text-[10px] sm:text-[11px] text-gray-400">Ingredientes frescos y de primera</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-3.5 p-3 sm:p-4 rounded-2xl bg-[#0d0d0f] border border-[#1d1d22]">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h5 className="text-[11px] sm:text-xs font-black uppercase text-white tracking-wide">Empaques Térmicos</h5>
              <p className="text-[10px] sm:text-[11px] text-gray-400">Tu comida caliente y sellada</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-3.5 p-3 sm:p-4 rounded-2xl bg-[#0d0d0f] border border-[#1d1d22]">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h5 className="text-[11px] sm:text-xs font-black uppercase text-white tracking-wide">Entrega Rápida</h5>
              <p className="text-[10px] sm:text-[11px] text-gray-400">Rastreo en vivo de tu orden</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-3.5 p-3 sm:p-4 rounded-2xl bg-[#0d0d0f] border border-[#1d1d22]">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h5 className="text-[11px] sm:text-xs font-black uppercase text-white tracking-wide">Múltiples Pagos</h5>
              <p className="text-[10px] sm:text-[11px] text-gray-400">Nequi, Daviplata, Efectivo y Más</p>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. MAIN 4-COLUMN RESPONSIVE GRID                         */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 items-start">
          
          {/* Column 1: Brand & Contact Channels (4 cols) */}
          <div className="lg:col-span-4 space-y-4 text-left">
            <div className="flex items-center gap-3">
              <Logo size="md" href={`/r/${tenantSlug}`} />
            </div>

            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-sm">
              {restDesc}
            </p>
            
            <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
              <a
                href={`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(
                  `¡Hola ${restName}! Quiero hacer una consulta.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#141416] border border-[#28282e] text-gray-300 hover:text-white hover:border-[#444] transition"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold text-xs">WhatsApp Directo</span>
              </a>

              {tenant?.instagram && (
                <a
                  href={tenant.instagram.startsWith('http') ? tenant.instagram : `https://instagram.com/${tenant.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#141416] border border-[#28282e] text-gray-300 hover:text-white hover:border-[#444] transition"
                >
                  <span className="font-semibold text-xs">Instagram</span>
                </a>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Plataforma operativa en tiempo real</span>
            </div>
          </div>

          {/* Column 2: Horarios de Atención (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white font-display flex items-center gap-2">
              <Clock className="w-4 h-4" style={{ color: primaryColor }} />
              <span>Horarios de Atención</span>
            </h4>

            <div className="bg-[#0e0e11] border border-[#202026] p-4 sm:p-5 rounded-2xl space-y-3 shadow-md">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                  <span>Abierto Hoy</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#1c1c22] text-gray-300 border border-[#2c2c34]">
                  Servicio Activo
                </span>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed font-medium">
                {restSchedule}
              </p>

              <div className="pt-2 border-t border-[#1a1a20] text-[11px] text-gray-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Atendemos domicilios, para llevar y mesas</span>
              </div>
            </div>
          </div>

          {/* Column 3: Sede & Ubicación en Mapa (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white font-display flex items-center gap-2">
              <MapPin className="w-4 h-4" style={{ color: primaryColor }} />
              <span>Sede & Cobertura</span>
            </h4>

            <div className="bg-[#0e0e11] border border-[#202026] p-4 sm:p-5 rounded-2xl space-y-3 shadow-md">
              <div>
                <p className="text-xs font-bold text-gray-200">
                  {restAddress}
                </p>
                <p className="text-[11px] font-extrabold mt-0.5" style={{ color: primaryColor }}>
                  {restCity}, Colombia
                </p>
              </div>

              {/* Botón directo a Google Maps */}
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-between px-3 py-2 rounded-xl bg-[#16161a] hover:bg-[#202026] border border-[#2a2a32] text-xs font-bold text-gray-200 hover:text-white transition group"
              >
                <span className="flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-brand-yellow" style={{ color: primaryColor }} />
                  <span>Abrir en Google Maps</span>
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition" />
              </a>

              {rawPhone && (
                <div className="pt-2 border-t border-[#1a1a20] flex items-center gap-2 text-xs text-gray-400">
                  <Phone className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <a href={`tel:+${cleanPhone}`} className="hover:text-white transition">
                    +{cleanPhone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Column 4: Navegación Rápida & Acceso (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white font-display">
              Enlaces Rápidos
            </h4>

            <div className="space-y-1.5 text-xs font-semibold">
              <Link 
                href={`/r/${tenantSlug}/menu`} 
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#141418] text-gray-300 hover:text-white transition group"
              >
                <span>Carta Digital</span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-white transition" />
              </Link>
              
              <Link 
                href={`/r/${tenantSlug}/rastreo`} 
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#141418] text-gray-300 hover:text-white transition group"
              >
                <span>Rastrear Pedido</span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-white transition" />
              </Link>

              <Link 
                href={`/r/${tenantSlug}/login`} 
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#141418] text-gray-300 hover:text-white transition group"
              >
                <span className="flex items-center gap-1.5">
                  <User className="w-3 h-3 text-brand-yellow" style={{ color: primaryColor }} />
                  <span>Mi Cuenta</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-white transition" />
              </Link>

              <Link 
                href={`/r/${tenantSlug}/calificar`} 
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#141418] text-gray-300 hover:text-white transition group"
              >
                <span className="flex items-center gap-1.5">
                  <Star className="w-3 h-3 text-amber-400" />
                  <span>Calificanos</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-white transition" />
              </Link>

              <Link 
                href={pathSlug ? `/r/${pathSlug}/login?tab=staff` : "/login"} 
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#141418] text-gray-500 hover:text-gray-300 transition group text-[11px]"
              >
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-gray-600" />
                  <span>Acceso Staff</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-700 group-hover:text-gray-400 transition" />
              </Link>
            </div>
          </div>

        </div>

        {/* ======================================================== */}
        {/* 4. MÉTODOS DE PAGO Y SELLOS DE SEGURIDAD                 */}
        {/* ======================================================== */}
        <div className="pt-6 sm:pt-8 border-t border-[#18181c] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mr-1 flex items-center gap-1.5">
              <Banknote className="w-3.5 h-3.5 text-gray-400" />
              <span>Medios de Pago:</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#141418] border border-[#272730] text-[11px] font-extrabold text-[#d843ff]">
              Nequi
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#141418] border border-[#272730] text-[11px] font-extrabold text-[#ff4b4b]">
              Daviplata
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#141418] border border-[#272730] text-[11px] font-extrabold text-[#ffd233]">
              Bancolombia
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#141418] border border-[#272730] text-[11px] font-extrabold text-[#36d399]">
              Efectivo
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#141418] border border-[#272730] text-[11px] font-extrabold text-[#38bdf8]">
              Tarjetas Débito / Crédito
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#141418] border border-[#272730] text-[11px] font-extrabold text-gray-300">
              PSE
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-gray-400 font-medium">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Transacciones Seguras</span>
            </span>
            <span>•</span>
            <span>{restName} &copy; {new Date().getFullYear()}</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 5. LEGAL COPYRIGHT & DESARROLLADOR SARRIA TECH          */}
        {/* ======================================================== */}
        <div className="pt-6 border-t border-[#18181c] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs text-gray-400 font-medium">
          <p className="leading-relaxed">
            Desarrollado por{' '}
            <a
              href="https://sarriatech.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-brand-yellow font-black transition-colors underline decoration-brand-yellow/50 underline-offset-2"
            >
              SarriaTech Solutions S.A.S
            </a>{' '}
            Todos los derechos reservados;
          </p>

          <p className="text-[11px] text-gray-500">
            Punto G SaaS Gastronómico • Cali, Colombia 🇨🇴
          </p>
        </div>

      </div>
    </footer>
  );
};
