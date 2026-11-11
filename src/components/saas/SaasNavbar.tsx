'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  User,
  ArrowRight,
  Menu,
  X,
  ShieldCheck
} from 'lucide-react';

export function SaasNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [solucionesOpen, setSolucionesOpen] = useState(false);
  const [recursosOpen, setRecursosOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#080506]/95 backdrop-blur-md border-b border-amber-500/15 shadow-[0_10px_30px_rgba(0,0,0,0.9)] py-2.5'
          : 'bg-gradient-to-b from-black/90 via-black/55 to-transparent py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* LOGO (Chef hat + crossed fork/spoon emblem matching reference) */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-11 h-11 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 64 64" className="w-11 h-11 overflow-visible drop-shadow-[0_2px_10px_rgba(250,155,35,0.45)]" fill="none">
              {/* Chef Hat (Crisp white outline at top) */}
              <path
                d="M21 25C16.5 25 13 21.5 13 17C13 13 16 9.8 20 9.2C21.8 5.2 26.2 2.5 32 2.5C37.8 2.5 42.2 5.2 44 9.2C48 9.8 51 13 51 17C51 21.5 47.5 25 43 25H21Z"
                stroke="#FFFFFF"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="rgba(255,255,255,0.08)"
              />
              <path
                d="M22 25V30.5H42V25"
                stroke="#FFFFFF"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line x1="26" y1="21" x2="38" y2="21" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />
              {/* Crossed Fork & Spoon in Intense Golden Amber */}
              <path
                d="M16 57L44 29M20 29L48 57"
                stroke="#FA9B23"
                strokeWidth="4.8"
                strokeLinecap="round"
              />
              <ellipse cx="18" cy="27" rx="4.2" ry="5.5" transform="rotate(-45 18 27)" fill="#FFB82E" />
              <path
                d="M43 24L49 30M40.5 26.5L46.5 32.5"
                stroke="#FFB82E"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="flex flex-col">
            <div className="relative flex items-center pt-1.5">
              <span className="text-[19px] sm:text-[22px] font-black tracking-tight text-white font-display leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                GASTRO<span className="bg-gradient-to-b from-[#FFD24C] via-[#FA9B23] to-[#E8830C] bg-clip-text text-transparent">NEGOCIOS</span>
              </span>
              <span className="absolute -top-2 right-0 text-[8px] bg-gradient-to-r from-[#F10F1A] to-[#C80610] text-white font-black px-1.5 py-[1px] rounded uppercase tracking-wider shadow-[0_2px_10px_rgba(241,15,26,0.75)] border border-red-400/40">
                PLATAFORMA
              </span>
            </div>
            <span className="text-[10.5px] text-gray-200 font-medium tracking-wide mt-0.5">
              Software &amp; POS Gastronómico
            </span>
          </div>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden lg:flex items-center gap-6 text-[13.5px] font-semibold text-gray-100">
          {/* Soluciones Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setSolucionesOpen(true)}
            onMouseLeave={() => setSolucionesOpen(false)}
          >
            <button className="flex items-center gap-1 hover:text-[#FFB82E] transition-colors cursor-pointer py-2">
              <span>Soluciones</span>
              <ChevronDown
                className="w-3.5 h-3.5 text-gray-300 transition-transform duration-200"
                style={{ transform: solucionesOpen ? 'rotate(180deg)' : 'none' }}
              />
            </button>
            {solucionesOpen && (
              <div className="absolute top-full left-0 w-64 bg-[#140D10]/98 border border-white/15 rounded-2xl p-3 shadow-2xl space-y-1 backdrop-blur-xl">
                <a href="#personalizacion" className="block p-2.5 rounded-xl hover:bg-white/10 transition">
                  <div className="text-white font-bold text-xs">Punto de Venta POS &amp; Caja</div>
                  <div className="text-[10px] text-gray-400">Facturación rápida, turnos y arqueos</div>
                </a>
                <a href="#personalizacion" className="block p-2.5 rounded-xl hover:bg-white/10 transition">
                  <div className="text-white font-bold text-xs">Pantalla de Cocina KDS</div>
                  <div className="text-[10px] text-gray-400">Comandas en tiempo real sin papel</div>
                </a>
                <a href="#demos" className="block p-2.5 rounded-xl hover:bg-white/10 transition">
                  <div className="text-white font-bold text-xs">Menú QR &amp; Domicilios</div>
                  <div className="text-[10px] text-gray-400">0% de comisiones por pedidos</div>
                </a>
              </div>
            )}
          </div>

          <a href="#personalizacion" className="hover:text-[#FFB82E] transition-colors">
            Plantillas
          </a>

          <a href="#demos" className="hover:text-[#FFB82E] transition-colors">
            Restaurantes Demo
          </a>

          <a href="#planes" className="hover:text-[#FFB82E] transition-colors">
            Planes
          </a>

          {/* Recursos Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setRecursosOpen(true)}
            onMouseLeave={() => setRecursosOpen(false)}
          >
            <button className="flex items-center gap-1 hover:text-[#FFB82E] transition-colors cursor-pointer py-2">
              <span>Recursos</span>
              <ChevronDown
                className="w-3.5 h-3.5 text-gray-300 transition-transform duration-200"
                style={{ transform: recursosOpen ? 'rotate(180deg)' : 'none' }}
              />
            </button>
            {recursosOpen && (
              <div className="absolute top-full left-0 w-56 bg-[#140D10]/98 border border-white/15 rounded-2xl p-3 shadow-2xl space-y-1 backdrop-blur-xl">
                <a href="#demos" className="block p-2 rounded-xl hover:bg-white/10 transition text-white font-bold text-xs">
                  Ver Demos en Vivo
                </a>
                <Link href="/superadmin" className="block p-2 rounded-xl hover:bg-white/10 transition text-[#FFB82E] font-bold text-xs flex items-center justify-between">
                  <span>Portal Superadmin</span>
                  <ShieldCheck className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* ACTIONS */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/login"
            className="py-2 px-4 rounded-full border border-white/35 bg-black/55 hover:bg-white/10 text-white font-semibold text-xs flex items-center gap-2 transition shadow-md"
          >
            <User className="w-3.5 h-3.5 text-gray-200" />
            <span>Acceso Staff</span>
          </Link>

          <Link
            href="/registro"
            className="py-2 px-5 rounded-full bg-gradient-to-b from-[#FF2A32] via-[#F10F1A] to-[#B8050D] hover:brightness-110 text-white font-bold text-xs shadow-[0_0_24px_rgba(241,15,26,0.75)] border border-red-400/50 flex items-center gap-1.5 transition"
          >
            <span>Prueba Gratis</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </Link>
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl text-gray-200 hover:text-white bg-white/10 border border-white/15"
          aria-label="Abrir menú móvil"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* MOBILE DROPDOWN */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0D080A]/98 border-b border-white/15 px-5 py-6 space-y-4">
          <div className="space-y-3 text-sm font-bold text-gray-200">
            <a href="#personalizacion" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-[#FFB82E] border-b border-white/10">
              Plantillas &amp; Personalización
            </a>
            <a href="#demos" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-[#FFB82E] border-b border-white/10">
              Restaurantes Demo
            </a>
            <a href="#planes" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-[#FFB82E] border-b border-white/10">
              Planes &amp; Precios
            </a>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 rounded-full border border-white/25 bg-white/5 text-white font-bold text-xs flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4 text-gray-200" />
              <span>Acceso Staff</span>
            </Link>
            <Link
              href="/registro"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#F10F1A] to-[#C80610] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(241,15,26,0.75)]"
            >
              <span>Prueba Gratis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
