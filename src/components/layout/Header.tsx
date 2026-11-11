'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { useCart } from '@/context/CartContext';
import { useTenant } from '@/context/TenantContext';
import { ShoppingBag, Menu, X, PhoneCall, Search, User } from 'lucide-react';
import { restaurantInfo } from '@/data/restaurant-info';
import { CustomerPortalModal } from '@/components/cart/CustomerPortalModal';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { totalItems, setIsCartOpen, currentCustomer } = useCart();
  const { tenant, isLoading } = useTenant();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [customerPortalOpen, setCustomerPortalOpen] = useState(false);

  const isLegacyClientRoute = /^\/(menu|promociones|rastreo|nosotros|contacto|checkout|calificar|pedido)(\/|$)/.test(pathname);
  const isTenantClientRoute =
    /^\/r\/[^\/]+(\/(menu|promociones|rastreo|nosotros|contacto|checkout|calificar|pedido)(\/.*)?)?$/.test(pathname) &&
    !pathname.includes('/admin') &&
    !pathname.includes('/login') &&
    !pathname.includes('/cocina') &&
    !pathname.includes('/mesero') &&
    !pathname.includes('/entregas') &&
    !pathname.includes('/pedidos-listos') &&
    !pathname.includes('/turnero');

  if (!isTenantClientRoute && !isLegacyClientRoute) {
    return null;
  }

  // If on a /r/[slug] route and the tenant finished loading but does not exist or is suspended, hide header so the 404/unavailable card displays cleanly
  if (isTenantClientRoute && !isLoading && (!tenant || tenant.activo === false)) {
    return null;
  }

  // Detect if current path is under a tenant route /r/[slug]
  const tenantMatch = pathname.match(/^\/r\/([^\/]+)/);
  const tenantSlug = tenantMatch ? tenantMatch[1] : null;
  const isPuntoG = !tenantSlug || tenantSlug === 'punto-g' || tenantSlug === 'puntog';
  const basePrefix = tenantSlug ? `/r/${tenantSlug}` : '';

  const slugFallbackName = tenantSlug && !isPuntoG
    ? tenantSlug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'Punto G';

  const resolvedTenant = tenant || (tenantSlug ? {
    id: 0,
    nombre: slugFallbackName,
    slug: tenantSlug,
    colorPrimario: '#ffc928',
    colorFondo: '#080808',
    activo: true,
  } as any : null);

  const navLinks = [
    { name: 'Inicio', href: tenantSlug ? `/r/${tenantSlug}` : '/' },
    { name: 'Menú', href: `${basePrefix}/menu` },
    { name: 'Promociones', href: `${basePrefix}/promociones` },
    { name: 'Rastrear Pedido', href: `${basePrefix}/rastreo` },
    { name: 'Nosotros', href: `${basePrefix}/nosotros` },
    { name: 'Contacto', href: `${basePrefix}/contacto` },
  ];

  const isLinkActive = (href: string) => {
    if (href === '/' || (tenantSlug && href === `/r/${tenantSlug}`)) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#080808]/95 backdrop-blur-md border-b border-[#1c1c1c]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo matching reference */}
          <div className="flex-shrink-0">
            <Logo size="md" href={tenantSlug ? `/r/${tenantSlug}` : '/'} restaurant={resolvedTenant} />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-7 sm:space-x-9">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              const primaryColor = tenant?.colorPrimario || '#ffc928';
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative py-1 text-xs sm:text-sm font-semibold transition-colors ${
                    active
                      ? 'font-bold'
                      : 'text-gray-300 hover:text-white'
                  }`}
                  style={active ? { color: primaryColor } : {}}
                >
                  {link.name}
                  {active && (
                    <span
                      className="absolute -bottom-1.5 left-0 right-0 h-[2.5px] rounded-full shadow-glow"
                      style={{ backgroundColor: primaryColor }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Customer Account Trigger */}
            <button
              onClick={() => setCustomerPortalOpen(true)}
              className="p-2 sm:px-3 sm:py-2 rounded-full bg-[#181818] border border-[#2b2b2b] text-white hover:text-brand-yellow transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title={currentCustomer ? `Cuenta de ${currentCustomer.nombre}` : 'Mi Cuenta / Mis Pedidos'}
            >
              <User className="w-4 h-4" style={{ color: tenant?.colorPrimario || '#ffc928' }} />
              <span className="hidden sm:inline">
                {currentCustomer ? currentCustomer.nombre.split(' ')[0] : 'Mi Cuenta'}
              </span>
            </button>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 sm:p-2.5 rounded-full bg-[#181818] border border-[#2b2b2b] text-white hover:text-brand-yellow transition-colors"
              aria-label="Ver carrito"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              {totalItems > 0 && (
                <span
                  className="absolute -top-1 -right-1 text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-glow"
                  style={{ backgroundColor: tenant?.colorPrimario || '#ffc928' }}
                >
                  {totalItems}
                </span>
              )}
            </button>

            {/* ORDENAR AHORA button */}
            {(() => {
              const rawPhone = (tenant?.telefonoWhatsapp || restaurantInfo.whatsappNumber).replace(/\D/g, '');
              const cleanPhone = rawPhone.length === 10 ? `57${rawPhone}` : rawPhone;
              const restName = tenant?.nombre || 'Punto G';
              const btnBg = tenant?.colorBoton || tenant?.colorPrimario || '#ffc928';
              const btnText = tenant?.colorBotonTexto || '#000000';

              return (
                <a
                  href={`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(
                    `¡Hola ${restName}! Quiero ordenar ahora.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-2 font-black text-xs px-5 py-2.5 rounded-full shadow-glow transition-transform hover:scale-105 active:scale-95"
                  style={{ backgroundColor: btnBg, color: btnText }}
                >
                  <PhoneCall className="w-3.5 h-3.5 fill-current" />
                  <span>ORDENAR AHORA</span>
                </a>
              );
            })()}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white bg-[#181818] border border-[#282828]"
              aria-label="Menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 md:hidden animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-40 md:hidden bg-[#0e0e0e]/98 backdrop-blur-xl border-b border-[#222] px-4 pt-3 pb-5 space-y-2 shadow-2xl">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              const primaryColor = tenant?.colorPrimario || '#ffc928';
              const btnText = tenant?.colorBotonTexto || '#000000';
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-bold transition-colors"
                  style={
                    active
                      ? { backgroundColor: primaryColor, color: btnText }
                      : { color: '#d1d5db' }
                  }
                >
                  {link.name}
                </Link>
              );
            })}
            <div className="pt-2 space-y-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setCustomerPortalOpen(true);
                }}
                className="w-full py-2.5 px-3 rounded-lg text-xs font-bold text-gray-200 bg-[#1c1c1c] border border-[#2d2d2d] flex items-center justify-center gap-2 transition"
              >
                <User className="w-4 h-4 text-brand-yellow" style={{ color: tenant?.colorPrimario || '#ffc928' }} />
                <span>{currentCustomer ? `Mi Cuenta (${currentCustomer.nombre})` : 'Iniciar Sesión / Registrarme'}</span>
              </button>
              {(() => {
                const rawPhone = (tenant?.telefonoWhatsapp || restaurantInfo.whatsappNumber).replace(/\D/g, '');
                const cleanPhone = rawPhone.length === 10 ? `57${rawPhone}` : rawPhone;
                const restName = tenant?.nombre || 'Restaurante';
                const btnBg = tenant?.colorBoton || tenant?.colorPrimario || '#ffc928';
                const btnText = tenant?.colorBotonTexto || '#000000';

                return (
                  <a
                    href={`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(
                      `¡Hola ${restName}! Quiero ordenar ahora.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 font-black text-xs py-3 rounded-full shadow-lg"
                    style={{ backgroundColor: btnBg, color: btnText }}
                  >
                    <PhoneCall className="w-4 h-4 fill-current" />
                    ORDENAR AHORA
                  </a>
                );
              })()}
            </div>
          </div>
        </>
      )}
    </header>

    {/* Customer Portal Modal (Rendered outside header to prevent stacking context or navbar clipping) */}
    <CustomerPortalModal
      isOpen={customerPortalOpen}
      onClose={() => setCustomerPortalOpen(false)}
    />
  </>
  );
};
