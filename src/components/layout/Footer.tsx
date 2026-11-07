'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { useTenant } from '@/context/TenantContext';
import { Clock, MapPin, MessageCircle, ShieldCheck, Lock, Mail, Phone, ChevronRight, Sparkles } from 'lucide-react';
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
    <footer className="relative bg-[#060606] text-white border-t border-[#1a1a1a] pt-14 pb-8 overflow-hidden z-20">
      {/* Decorative top ambient glow line */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] opacity-40 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${primaryColor} 0%, transparent 80%)`,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
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
            <div className="pt-1 flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#121212] border border-[#262626] text-[11px] font-bold text-gray-300">
                <Sparkles className="w-3 h-3 text-brand-yellow" />
                <span>Calidad Garantizada</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#121212] border border-[#262626] text-[11px] font-bold text-gray-300">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Preparación Higiénica</span>
              </span>
            </div>
          </div>

          {/* Column 2: Horarios de Atención (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white font-display flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-yellow" />
              <span>Horarios de Atención</span>
            </h4>
            <div className="bg-[#0f0f0f] border border-[#222] p-4 rounded-2xl space-y-2 shadow-lg">
              <p className="text-xs font-semibold text-gray-200 leading-relaxed">
                {restSchedule}
              </p>
              <div className="pt-2 border-t border-[#1f1f1f] flex items-center gap-2 text-[11px] text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Servicio a domicilio y en sala activo</span>
              </div>
            </div>
          </div>

          {/* Column 3: Ubicación y Contacto (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white font-display flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-yellow" />
              <span>Sede & Contacto</span>
            </h4>
            <div className="bg-[#0f0f0f] border border-[#222] p-4 rounded-2xl space-y-2.5 shadow-lg">
              <div>
                <p className="text-xs font-semibold text-gray-200">
                  {restAddress}
                </p>
                <p className="text-[11px] font-bold" style={{ color: primaryColor }}>
                  {restCity}, Colombia
                </p>
              </div>
              {restEmail && (
                <div className="pt-2 border-t border-[#1f1f1f] flex items-center gap-2 text-xs text-gray-400">
                  <Mail className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <span className="truncate">{restEmail}</span>
                </div>
              )}
            </div>
          </div>

          {/* Column 4: Canales y Enlaces Rápidos (2 cols) */}
          <div className="lg:col-span-2 space-y-3 text-center md:text-left">
            <h4 className="text-xs font-black uppercase tracking-wider text-white font-display">
              Atención Directa
            </h4>
            <div className="space-y-2.5">
              <a
                href={`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(
                  `¡Hola ${restName}! Quiero consultar el menú y hacer un pedido.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-glow transition hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: buttonColor,
                  color: buttonTextColor,
                }}
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>WhatsApp</span>
              </a>

              <div className="pt-2 flex flex-col space-y-2 text-xs text-gray-400">
                <Link 
                  href={`/r/${tenantSlug}/menu`} 
                  className="hover:text-white transition flex items-center gap-1.5 justify-center md:justify-start"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-brand-yellow" />
                  <span>Carta Digital</span>
                </Link>
                <Link 
                  href={`/r/${tenantSlug}/rastreo`} 
                  className="hover:text-white transition flex items-center gap-1.5 justify-center md:justify-start"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-brand-yellow" />
                  <span>Rastrear Pedido</span>
                </Link>
                <Link 
                  href="/admin" 
                  className="hover:text-white transition flex items-center gap-1.5 justify-center md:justify-start pt-1 text-[11px] text-gray-500"
                >
                  <Lock className="w-3 h-3 text-gray-500" />
                  <span>Acceso Admin</span>
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Divider & Legals */}
        <div className="pt-8 border-t border-[#1a1a1a] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400 text-center md:text-left">
          <p className="leading-relaxed">
            Desarrollado por SarriaTech Solutions S.A.S Todos los derechos reservados;
          </p>

          <div className="flex items-center gap-3 text-[11px] text-gray-500 font-medium">
            <span>{restName} &copy; {new Date().getFullYear()}</span>
            <span>•</span>
            <span className="text-gray-400">Plataforma Gastronómica Certificada</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
