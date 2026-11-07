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
  CheckCircle2
} from 'lucide-react';
import { restaurantInfo } from '@/data/restaurant-info';

export const Footer: React.FC = () => {
  const pathname = usePathname();
  const { tenant } = useTenant();

  // Excluir de páginas que tienen su propio layout o interfaces operativas de pantalla completa
  if (
    pathname === '/' ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/superadmin') ||
    pathname.startsWith('/login') ||
    pathname.includes('/cocina') ||
    pathname.includes('/mesero') ||
    pathname.includes('/entregas') ||
    pathname.includes('/pedidos-listos') ||
    pathname.includes('/turnero')
  ) {
    return null;
  }

  const rawPhone = (tenant?.telefonoWhatsapp || restaurantInfo.whatsappNumber).replace(/\D/g, '');
  const cleanPhone = rawPhone.length === 10 ? `57${rawPhone}` : rawPhone;
  const restName = tenant?.nombre || 'Punto G';
  const restDesc = tenant?.descripcion || 'Comidas rápidas gourmet. Hamburguesas artesanales, picadas generosas y parrilla con el auténtico sabor de la casa.';
  const restSchedule = tenant?.horarioAtencion || restaurantInfo.schedule;
  const restAddress = tenant?.direccionCentral || restaurantInfo.address;
  const restCity = tenant?.ciudad || restaurantInfo.city;
  const restEmail = tenant?.email || 'contacto@puntog.com';
  const tenantSlug = tenant?.slug || 'puntog';
  const primaryColor = tenant?.colorPrimario || '#ffc928';
  const buttonColor = tenant?.colorBoton || primaryColor;
  const buttonTextColor = tenant?.colorBotonTexto || '#000000';

  return (
    <footer className="relative bg-[#060606] text-white border-t border-[#1a1a1a] pt-16 pb-10 overflow-hidden z-20">
      {/* Decorative top ambient glow line */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] opacity-70 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${primaryColor} 0%, transparent 75%)`,
        }}
      />
      
      {/* Ambient background blur */}
      <div 
        className="absolute top-0 right-1/4 w-96 h-96 rounded-full blur-[140px] opacity-10 pointer-events-none"
        style={{ backgroundColor: primaryColor }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Guarantee & Trust Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-10 border-b border-[#181818]">
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#0d0d0d] border border-[#1f1f1f]">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${primaryColor}18`, color: primaryColor }}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-black uppercase text-white tracking-wide">Recetas Artesanales</h5>
              <p className="text-[11px] text-gray-400">Ingredientes frescos y de primera calidad</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#0d0d0d] border border-[#1f1f1f]">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-black uppercase text-white tracking-wide">Empaques Térmicos</h5>
              <p className="text-[11px] text-gray-400">Tu comida caliente y 100% protegida</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#0d0d0d] border border-[#1f1f1f]">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-black uppercase text-white tracking-wide">Entrega Rápida</h5>
              <p className="text-[11px] text-gray-400">Rastreo en tiempo real de tu pedido</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#0d0d0d] border border-[#1f1f1f]">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-black uppercase text-white tracking-wide">Pagos Sin Comisiones</h5>
              <p className="text-[11px] text-gray-400">Nequi, Daviplata, Efectivo y Tarjetas</p>
            </div>
          </div>
        </div>

        {/* Main 4-Column Grid: Spacious, cleanly aligned, no text collisions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Column 1: Brand & Bio (4 cols) */}
          <div className="lg:col-span-4 space-y-4 text-center md:text-left">
            <div className="flex justify-center md:justify-start">
              <Logo size="lg" />
            </div>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-sm mx-auto md:mx-0">
              {restDesc}
            </p>
            
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs">
              <a
                href={`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(
                  `¡Hola ${restName}! Quiero hacer una consulta.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141414] border border-[#282828] text-gray-300 hover:text-white hover:border-[#444] transition"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold text-xs">WhatsApp Directo</span>
              </a>
              {tenant?.instagram && (
                <a
                  href={tenant.instagram.startsWith('http') ? tenant.instagram : `https://instagram.com/${tenant.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#141414] border border-[#282828] text-gray-300 hover:text-white hover:border-[#444] transition"
                >
                  <span className="font-semibold text-xs">Instagram</span>
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Horarios de Atención (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white font-display flex items-center gap-2">
              <Clock className="w-4 h-4" style={{ color: primaryColor }} />
              <span>Horarios de Atención</span>
            </h4>
            <div className="bg-[#0f0f0f] border border-[#222] p-4 sm:p-5 rounded-2xl space-y-3 shadow-lg">
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Servicio Activo Hoy</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-medium">
                {restSchedule}
              </p>
              <div className="pt-2 border-t border-[#1c1c1c] text-[11px] text-gray-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Atendemos domicilios y pedidos en mesa</span>
              </div>
            </div>
          </div>

          {/* Column 3: Ubicación y Contacto (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white font-display flex items-center gap-2">
              <MapPin className="w-4 h-4" style={{ color: primaryColor }} />
              <span>Sede & Cobertura</span>
            </h4>
            <div className="bg-[#0f0f0f] border border-[#222] p-4 sm:p-5 rounded-2xl space-y-3 shadow-lg">
              <div>
                <p className="text-xs font-semibold text-gray-200">
                  {restAddress}
                </p>
                <p className="text-[11px] font-bold" style={{ color: primaryColor }}>
                  {restCity}, Colombia
                </p>
              </div>

              {restEmail && (
                <div className="pt-2 border-t border-[#1c1c1c] flex items-center gap-2 text-xs text-gray-400 truncate">
                  <Mail className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <span className="truncate">{restEmail}</span>
                </div>
              )}

              {rawPhone && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Phone className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <span>+{cleanPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Column 4: Canales y Enlaces Rápidos (2 cols) */}
          <div className="lg:col-span-2 space-y-3 text-center md:text-left">
            <h4 className="text-xs font-black uppercase tracking-wider text-white font-display">
              Navegación
            </h4>
            <div className="space-y-2">
              <Link 
                href={`/r/${tenantSlug}/menu`} 
                className="w-full inline-flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#121212] border border-[#222] hover:border-white/30 text-xs font-bold text-gray-300 hover:text-white transition group"
              >
                <span>Carta Digital</span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition" />
              </Link>
              
              <Link 
                href={`/r/${tenantSlug}/rastreo`} 
                className="w-full inline-flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#121212] border border-[#222] hover:border-white/30 text-xs font-bold text-gray-300 hover:text-white transition group"
              >
                <span>Rastrear Pedido</span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition" />
              </Link>

              <Link 
                href="/admin" 
                className="w-full inline-flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#121212] border border-[#222] hover:border-white/30 text-xs font-bold text-gray-400 hover:text-gray-200 transition group"
              >
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-gray-500" />
                  <span>Acceso Admin</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-white transition" />
              </Link>
            </div>

            {/* CTA Pedir por WhatsApp */}
            <div className="pt-2">
              <a
                href={`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(
                  `¡Hola ${restName}! Quiero consultar el menú y hacer un pedido.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider shadow-glow transition hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: buttonColor,
                  color: buttonTextColor,
                }}
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Pedir por WhatsApp</span>
              </a>
            </div>
          </div>

        </div>

        {/* Métodos de Pago & Sellos de Seguridad */}
        <div className="pt-8 border-t border-[#161616] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mr-1 flex items-center gap-1.5">
              <Banknote className="w-3.5 h-3.5 text-gray-400" />
              <span>Métodos de Pago:</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#141414] border border-[#282828] text-[11px] font-extrabold text-purple-400">
              Nequi
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#141414] border border-[#282828] text-[11px] font-extrabold text-rose-400">
              Daviplata
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#141414] border border-[#282828] text-[11px] font-extrabold text-amber-300">
              Bancolombia
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#141414] border border-[#282828] text-[11px] font-extrabold text-emerald-400">
              Efectivo
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#141414] border border-[#282828] text-[11px] font-extrabold text-sky-400">
              Tarjetas Débito / Crédito
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

        {/* Bottom Copyright Divider & Legals */}
        <div className="pt-6 border-t border-[#161616] text-center">
          <p className="text-xs text-gray-400 leading-relaxed font-medium">
            Desarrollado por SarriaTech Solutions S.A.S Todos los derechos reservados;
          </p>
        </div>
      </div>
    </footer>
  );
};
