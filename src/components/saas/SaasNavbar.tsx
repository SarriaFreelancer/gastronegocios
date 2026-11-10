'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  UtensilsCrossed,
  ChefHat,
  ChevronDown,
  User,
  ArrowRight,
  Menu,
  X,
  Sparkles,
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
          ? 'bg-[#090B14]/95 backdrop-blur-md border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)] py-3'
          : 'bg-[#090B14]/80 backdrop-blur-sm border-b border-white/5 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-yellow-500 flex items-center justify-center text-black font-black shadow-[0_0_20px_rgba(255,193,7,0.35)] group-hover:scale-105 transition-transform duration-300">
            <UtensilsCrossed className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-wider text-white font-display leading-none">
                GASTRO<span className="text-amber-400">NEGOCIOS</span>
              </span>
              <span className="text-[9px] bg-[#E53E3E] text-white font-black px-1.5 py-0.5 rounded tracking-wider uppercase shadow-[0_0_10px_rgba(229,62,62,0.4)]">
                PLATAFORMA
              </span>
            </div>
            <span className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase mt-0.5">
              Software & POS Gastronómico
            </span>
          </div>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-bold text-gray-300">
          {/* Soluciones Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setSolucionesOpen(true)}
            onMouseLeave={() => setSolucionesOpen(false)}
          >
            <button className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer py-2">
              <span>Soluciones</span>
              <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200" style={{ transform: solucionesOpen ? 'rotate(180deg)' : 'none' }} />
            </button>
            {solucionesOpen && (
              <div className="absolute top-full left-0 w-64 bg-[#111525] border border-white/10 rounded-2xl p-3 shadow-2xl space-y-1 animate-in fade-in slide-in-from-top-2">
                <a href="#modulos" className="block p-2.5 rounded-xl hover:bg-white/5 transition">
                  <div className="text-white font-black text-xs">Punto de Venta POS & Caja</div>
                  <div className="text-[10px] text-gray-400">Facturación rápida, turnos y split de cuentas</div>
                </a>
                <a href="#modulos" className="block p-2.5 rounded-xl hover:bg-white/5 transition">
                  <div className="text-white font-black text-xs">Pantalla de Cocina KDS</div>
                  <div className="text-[10px] text-gray-400">Comandas en tiempo real sin papel</div>
                </a>
                <a href="#modulos" className="block p-2.5 rounded-xl hover:bg-white/5 transition">
                  <div className="text-white font-black text-xs">Menú QR & Domicilios</div>
                  <div className="text-[10px] text-gray-400">0% de comisiones por pedidos</div>
                </a>
                <a href="#multinegocio" className="block p-2.5 rounded-xl hover:bg-white/5 transition">
                  <div className="text-white font-black text-xs">Gestión Multi-Sede</div>
                  <div className="text-[10px] text-gray-400">Control centralizado de sucursales</div>
                </a>
              </div>
            )}
          </div>

          <a href="#personalizador" className="hover:text-white transition-colors">
            Plantillas
          </a>

          <a href="#demos" className="hover:text-white transition-colors">
            Restaurantes Demo
          </a>

          <a href="#planes" className="hover:text-white transition-colors">
            Planes
          </a>

          {/* Recursos Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setRecursosOpen(true)}
            onMouseLeave={() => setRecursosOpen(false)}
          >
            <button className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer py-2">
              <span>Recursos</span>
              <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200" style={{ transform: recursosOpen ? 'rotate(180deg)' : 'none' }} />
            </button>
            {recursosOpen && (
              <div className="absolute top-full left-0 w-56 bg-[#111525] border border-white/10 rounded-2xl p-3 shadow-2xl space-y-1 animate-in fade-in slide-in-from-top-2">
                <a href="#beneficios" className="block p-2 rounded-xl hover:bg-white/5 transition text-white font-bold text-xs">
                  Beneficios y Ahorro
                </a>
                <a href="#faq" className="block p-2 rounded-xl hover:bg-white/5 transition text-white font-bold text-xs">
                  Preguntas Frecuentes
                </a>
                <Link href="/superadmin" className="block p-2 rounded-xl hover:bg-white/5 transition text-amber-400 font-bold text-xs flex items-center justify-between">
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
            className="py-2.5 px-4 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center gap-2 transition hover:scale-105 active:scale-95"
          >
            <User className="w-3.5 h-3.5 text-gray-400" />
            <span>Acceso Staff</span>
          </Link>

          <Link
            href="/registro"
            className="py-2.5 px-5 rounded-full bg-gradient-to-r from-[#E53E3E] to-[#FF4D4D] hover:from-[#d32f2f] hover:to-[#e53935] text-white font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(229,62,62,0.5)] flex items-center gap-1.5 transition hover:scale-105 active:scale-95"
          >
            <span>Prueba Gratis</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
          </Link>
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl text-gray-300 hover:text-white bg-white/5 border border-white/10"
          aria-label="Abrir menú móvil"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* MOBILE DROPDOWN */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#090B14]/98 border-b border-white/10 px-5 py-6 space-y-4 animate-in slide-in-from-top-2">
          <div className="space-y-3 text-sm font-bold text-gray-300">
            <a
              href="#modulos"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 hover:text-white border-b border-white/5"
            >
              Soluciones & Módulos ERP
            </a>
            <a
              href="#personalizador"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 hover:text-white border-b border-white/5"
            >
              Plantillas & Personalizador
            </a>
            <a
              href="#demos"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 hover:text-white border-b border-white/5"
            >
              Restaurantes Demo
            </a>
            <a
              href="#planes"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 hover:text-white border-b border-white/5"
            >
              Planes & Precios
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 hover:text-white border-b border-white/5"
            >
              Preguntas Frecuentes
            </a>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 rounded-xl border border-white/15 bg-white/5 text-white font-bold text-xs flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4 text-gray-400" />
              <span>Acceso Staff</span>
            </Link>
            <Link
              href="/registro"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#E53E3E] to-[#FF4D4D] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(229,62,62,0.5)]"
            >
              <span>Comenzar Prueba Gratis (14 Días)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
