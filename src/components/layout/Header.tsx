'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { useCart } from '@/context/CartContext';
import { useTenant } from '@/context/TenantContext';
import { ShoppingBag, Menu, X, PhoneCall, Search } from 'lucide-react';
import { restaurantInfo } from '@/data/restaurant-info';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();
  const { tenant } = useTenant();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (
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

  // Detect if current path is under a tenant route /r/[slug]
  const tenantMatch = pathname.match(/^\/r\/([^\/]+)/);
  const tenantSlug = tenantMatch ? tenantMatch[1] : null;
  const basePrefix = tenantSlug ? `/r/${tenantSlug}` : '';

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
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#080808]/95 backdrop-blur-md border-b border-[#1c1c1c]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo matching reference */}
          <div className="flex-shrink-0">
            <Logo size="md" href={tenantSlug ? `/r/${tenantSlug}` : '/'} />
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
          <div className="flex items-center gap-3">
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
        <div className="md:hidden bg-[#0e0e0e] border-b border-[#222] px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => {
            const active = isLinkActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-bold ${
                  active ? 'bg-brand-yellow text-black' : 'text-gray-300 hover:bg-[#1a1a1a]'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          <div className="pt-2">
            <a
              href={`https://api.whatsapp.com/send?phone=${restaurantInfo.whatsappNumber}&text=${encodeURIComponent(
                '¡Hola Punto G! Quiero ordenar ahora.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-brand-yellow text-black font-black text-xs py-3 rounded-full shadow-glow"
            >
              <PhoneCall className="w-4 h-4 fill-current" />
              ORDENAR AHORA
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
