'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown, ArrowRight, User } from 'lucide-react';

export const SaasNavbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#080303]/95 backdrop-blur-xl border-b border-[#FA9B23]/25 py-2.5 shadow-[0_10px_35px_rgba(0,0,0,0.9)]'
          : 'bg-gradient-to-b from-[#070202]/95 via-[#070202]/75 to-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand Logo with Custom 2D/3D Vector Emblem created from scratch */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative w-13 h-13 flex items-center justify-center shrink-0">
            <svg
              viewBox="0 0 72 72"
              className="w-13 h-13 drop-shadow-[0_4px_12px_rgba(250,155,35,0.45)] group-hover:scale-105 transition-transform"
            >
              <defs>
                <linearGradient id="gnGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF099" />
                  <stop offset="45%" stopColor="#FA9B23" />
                  <stop offset="100%" stopColor="#D96B00" />
                </linearGradient>
                <linearGradient id="gnHatGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#E5E7EB" />
                </linearGradient>
              </defs>
              {/* Ambient warm glow */}
              <circle cx="36" cy="36" r="30" fill="rgba(250,155,35,0.10)" />
              {/* Crossed Fork (Bottom-Right to Top-Left) */}
              <g stroke="url(#gnGoldGrad)" strokeLinecap="round" strokeLinejoin="round">
                <path d="M54 58 L22 26" strokeWidth="4.8" />
                <path d="M15 21 L22 28 M18 17 L25 24 M22 15 L29 22" strokeWidth="2.8" />
              </g>
              {/* Crossed Spoon (Bottom-Left to Top-Right) */}
              <g>
                <path
                  d="M18 58 L50 26"
                  stroke="url(#gnGoldGrad)"
                  strokeWidth="4.8"
                  strokeLinecap="round"
                />
                <ellipse
                  cx="53"
                  cy="23"
                  rx="6.5"
                  ry="4.4"
                  transform="rotate(-45 53 23)"
                  fill="url(#gnGoldGrad)"
                />
              </g>
              {/* 3D Chef Hat */}
              <path
                d="M23 28 C16 27 14 19 20 15 C19 9 27 6 32 10 C35 5 43 6 45 11 C52 9 56 16 51 22 C54 25 51 28 47 28 Z"
                fill="#120705"
                stroke="url(#gnHatGrad)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect
                x="24"
                y="28"
                width="24"
                height="5.5"
                rx="2"
                fill="#120705"
                stroke="url(#gnHatGrad)"
                strokeWidth="2.8"
              />
              <path d="M29 28 V33 M36 28 V33 M43 28 V33" stroke="#FA9B23" strokeWidth="1.6" />
            </svg>
          </div>

          <div className="flex flex-col">
            <div className="relative flex items-center">
              <span className="text-[20px] sm:text-[22px] font-black tracking-tight uppercase leading-none text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                GASTRO<span className="text-[#FA9B23]">NEGOCIOS</span>
              </span>
              <span
                className="ml-1.5 -mt-3 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest text-white shadow-md"
                style={{
                  background: 'linear-gradient(180deg, #FF2A2A 0%, #D90712 100%)',
                  border: '1px solid rgba(255,255,255,0.28)',
                }}
              >
                PLATAFORMA
              </span>
            </div>
            <span className="text-[10.5px] text-stone-300 font-medium tracking-wide mt-0.5">
              Software &amp; POS Gastronómico
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-6 text-[13.5px] font-semibold text-stone-100">
          <a
            href="#funciones"
            className="flex items-center gap-1 hover:text-[#FA9B23] transition-colors"
          >
            <span>Soluciones</span>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
          </a>
          <a href="#personalizacion" className="hover:text-[#FA9B23] transition-colors">
            Plantillas
          </a>
          <a href="#demos" className="hover:text-[#FA9B23] transition-colors">
            Restaurantes Demo
          </a>
          <a href="#precios" className="hover:text-[#FA9B23] transition-colors">
            Planes
          </a>
          <a
            href="#funciones"
            className="flex items-center gap-1 hover:text-[#FA9B23] transition-colors"
          >
            <span>Recursos</span>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#120A07]/90 hover:bg-[#1E110C] border border-[#D4AF37]/50 text-white text-xs font-bold transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
          >
            <User className="w-3.5 h-3.5 text-[#FA9B23]" />
            <span>Acceso Staff</span>
          </Link>

          <Link
            href="/registro"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-white font-extrabold text-xs tracking-wide transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(180deg, #FF2E2E 0%, #D90812 100%)',
              boxShadow: '0 6px 22px rgba(241, 15, 26, 0.55), inset 0 1px 1px rgba(255,255,255,0.35)',
              border: '1px solid rgba(255,110,110,0.45)',
            }}
          >
            <span>Prueba Gratis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Menu Trigger */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/15 text-stone-200 hover:text-white"
          aria-label="Abrir menú"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#0D0504]/98 backdrop-blur-2xl border-b border-[#FA9B23]/25 px-4 pt-4 pb-6 space-y-3">
          <div className="flex flex-col space-y-1 text-sm font-semibold text-stone-200">
            <a
              href="#funciones"
              onClick={() => setMobileOpen(false)}
              className="py-2.5 px-3 rounded-xl hover:bg-white/5"
            >
              Soluciones
            </a>
            <a
              href="#personalizacion"
              onClick={() => setMobileOpen(false)}
              className="py-2.5 px-3 rounded-xl hover:bg-white/5"
            >
              Plantillas
            </a>
            <a
              href="#demos"
              onClick={() => setMobileOpen(false)}
              className="py-2.5 px-3 rounded-xl hover:bg-white/5"
            >
              Restaurantes Demo
            </a>
            <a
              href="#precios"
              onClick={() => setMobileOpen(false)}
              className="py-2.5 px-3 rounded-xl hover:bg-white/5"
            >
              Planes
            </a>
          </div>
          <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2.5">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="py-2.5 px-3 rounded-full bg-white/5 border border-[#D4AF37]/40 text-center text-xs font-bold text-white flex items-center justify-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-[#FA9B23]" />
              <span>Acceso Staff</span>
            </Link>
            <Link
              href="/registro"
              onClick={() => setMobileOpen(false)}
              className="py-2.5 px-3 rounded-full text-center text-xs font-extrabold text-white flex items-center justify-center gap-1"
              style={{
                background: 'linear-gradient(180deg, #FF2E2E 0%, #D90812 100%)',
              }}
            >
              <span>Prueba Gratis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
