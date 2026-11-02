'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, Menu, X, PhoneCall, Search } from 'lucide-react';
import { restaurantInfo } from '@/data/restaurant-info';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (pathname.startsWith('/cocina') || pathname.startsWith('/login')) {
    return null;
  }

  const navLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Menú', href: '/menu' },
    { name: 'Promociones', href: '/promociones' },
    { name: 'Rastrear Pedido', href: '/rastreo' },
    { name: 'Nosotros', href: '/nosotros' },
    { name: 'Contacto', href: '/contacto' },
  ];

  const isLinkActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#080808]/95 backdrop-blur-md border-b border-[#1c1c1c]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo matching reference */}
          <div className="flex-shrink-0">
            <Logo size="md" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-7 sm:space-x-9">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative py-1 text-xs sm:text-sm font-semibold transition-colors ${
                    active
                      ? 'text-brand-yellow font-bold'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {link.name}
                  {active && (
                    <span className="absolute -bottom-1.5 left-0 right-0 h-[2.5px] bg-brand-yellow rounded-full shadow-glow" />
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
                <span className="absolute -top-1 -right-1 bg-brand-yellow text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-glow">
                  {totalItems}
                </span>
              )}
            </button>

            {/* ORDENAR AHORA yellow button */}
            <a
              href={`https://api.whatsapp.com/send?phone=${restaurantInfo.whatsappNumber}&text=${encodeURIComponent(
                '¡Hola Punto G! Quiero ordenar ahora.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 bg-brand-yellow hover:bg-brand-yellowHover text-black font-black text-xs px-5 py-2.5 rounded-full shadow-glow transition-transform hover:scale-105 active:scale-95"
            >
              <PhoneCall className="w-3.5 h-3.5 fill-current" />
              <span>ORDENAR AHORA</span>
            </a>

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
