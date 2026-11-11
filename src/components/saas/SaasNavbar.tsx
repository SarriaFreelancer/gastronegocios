'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  User,
  QrCode,
  ChefHat,
  Receipt,
  Boxes,
  Smartphone,
  Building2,
  BookOpen,
  ShieldCheck,
  MessageCircle,
  Sparkles,
} from 'lucide-react';

const SOLUTIONS_ITEMS = [
  {
    title: 'Carta Digital QR & Domicilios',
    desc: 'Menú interactivo sin comisiones con pedidos directo a cocina y WhatsApp.',
    href: '#demos',
    icon: QrCode,
    badge: '0% Comisión',
  },
  {
    title: 'Pantalla de Cocina (KDS)',
    desc: 'Comandas en tiempo real con alerta sonora, tiempos y estados por estación.',
    href: '#funciones',
    icon: ChefHat,
    badge: 'Tiempo Real',
  },
  {
    title: 'POS Facturación & Cuadre de Caja',
    desc: 'Cobro rápido, división de cuentas por comensal e impresión térmica ESC/POS.',
    href: '#funciones',
    icon: Receipt,
    badge: 'POS Pro',
  },
  {
    title: 'Inventario, Recetas y Escandallos',
    desc: 'Descuento automático de insumos por cada plato vendido y control de costos.',
    href: '#personalizacion',
    icon: Boxes,
    badge: 'ERP',
  },
  {
    title: 'Comandera Móvil para Meseros',
    desc: 'Toma de pedidos en mesa desde celular o tablet con llamado de mesero.',
    href: '#demos',
    icon: Smartphone,
    badge: 'Móvil',
  },
  {
    title: 'Multi-Sede & Marca Blanca',
    desc: 'Administra varias sucursales, colores, plantillas y dominios desde un solo lugar.',
    href: '#personalizacion',
    icon: Building2,
    badge: 'Multi-Tenant',
  },
];

const RESOURCES_ITEMS = [
  {
    title: 'Crear Mi Restaurante Gratis',
    desc: 'Registra tu negocio y activa tu carta digital en menos de 5 minutos.',
    href: '/registro',
    icon: Sparkles,
  },
  {
    title: 'Explorar Restaurantes Demo',
    desc: 'Prueba cómo ven tus clientes el menú de Punto G, Salchi Ricurras y Don Carbón.',
    href: '#demos',
    icon: BookOpen,
  },
  {
    title: 'Acceso Personal / Staff',
    desc: 'Ingresa al panel de Administrador, Cajero, Mesero o Cocina.',
    href: '/login',
    icon: User,
  },
  {
    title: 'Consola Central Superadmin',
    desc: 'Gestión global de restaurantes, licencias y bases de datos SaaS.',
    href: '/superadmin',
    icon: ShieldCheck,
  },
  {
    title: 'Hablar con Soporte Comercial',
    desc: 'Asesoría personalizada por WhatsApp para implementar en tu negocio.',
    href: 'https://wa.me/573215894178?text=Hola%20GastroNegocios,%20quiero%20informaci%C3%B3n%20sobre%20la%20plataforma.',
    icon: MessageCircle,
    external: true,
  },
];

export const SaasNavbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSolutionsOpen, setMobileSolutionsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'soluciones' | 'recursos' | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      ref={navRef}
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
              <circle cx="36" cy="36" r="30" fill="rgba(250,155,35,0.10)" />
              <g stroke="url(#gnGoldGrad)" strokeLinecap="round" strokeLinejoin="round">
                <path d="M54 58 L22 26" strokeWidth="4.8" />
                <path d="M15 21 L22 28 M18 17 L25 24 M22 15 L29 22" strokeWidth="2.8" />
              </g>
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

        {/* Desktop Nav Links with Interactive Dropdowns */}
        <nav className="hidden lg:flex items-center gap-6 text-[13.5px] font-semibold text-stone-100">
          {/* Soluciones Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setOpenDropdown('soluciones')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'soluciones' ? null : 'soluciones')}
              className={`flex items-center gap-1.5 py-2 transition-colors cursor-pointer ${
                openDropdown === 'soluciones' ? 'text-[#FA9B23]' : 'hover:text-[#FA9B23]'
              }`}
            >
              <span>Soluciones</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  openDropdown === 'soluciones' ? 'rotate-180 text-[#FA9B23]' : 'text-stone-400'
                }`}
              />
            </button>

            {openDropdown === 'soluciones' && (
              <div className="absolute left-0 top-full pt-2 w-[560px] z-50">
                <div className="bg-[#110806]/98 backdrop-blur-2xl border border-[#FA9B23]/35 rounded-3xl p-4 shadow-[0_25px_70px_rgba(0,0,0,0.95)]">
                  <div className="flex items-center justify-between px-2 pb-3 mb-2 border-b border-white/10">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#FA9B23]">
                      Ecosistema Todo-en-Uno para Restaurantes
                    </span>
                    <Link
                      href="/registro"
                      onClick={() => setOpenDropdown(null)}
                      className="text-[11px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1"
                    >
                      <span>Probar 14 días gratis</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {SOLUTIONS_ITEMS.map((item) => {
                      const Icon = item.icon;
                      return (
                        <a
                          key={item.title}
                          href={item.href}
                          onClick={() => setOpenDropdown(null)}
                          className="group flex items-start gap-3 p-3 rounded-2xl hover:bg-white/[0.06] border border-transparent hover:border-[#FA9B23]/25 transition-all"
                        >
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FA9B23]/20 to-[#E53E3E]/20 border border-[#FA9B23]/30 flex items-center justify-center shrink-0 text-[#FA9B23] group-hover:scale-105 transition-transform">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-extrabold text-white group-hover:text-[#FA9B23] transition-colors">
                                {item.title}
                              </span>
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-[#FA9B23]/15 text-[#FA9B23]">
                                {item.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-400 leading-snug font-normal">
                              {item.desc}
                            </p>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          <a href="#personalizacion" className="hover:text-[#FA9B23] transition-colors">
            Plantillas
          </a>
          <a href="#demos" className="hover:text-[#FA9B23] transition-colors">
            Restaurantes Demo
          </a>
          <a href="#precios" className="hover:text-[#FA9B23] transition-colors">
            Planes
          </a>

          {/* Recursos Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setOpenDropdown('recursos')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'recursos' ? null : 'recursos')}
              className={`flex items-center gap-1.5 py-2 transition-colors cursor-pointer ${
                openDropdown === 'recursos' ? 'text-[#FA9B23]' : 'hover:text-[#FA9B23]'
              }`}
            >
              <span>Recursos</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  openDropdown === 'recursos' ? 'rotate-180 text-[#FA9B23]' : 'text-stone-400'
                }`}
              />
            </button>

            {openDropdown === 'recursos' && (
              <div className="absolute right-0 top-full pt-2 w-80 z-50">
                <div className="bg-[#110806]/98 backdrop-blur-2xl border border-[#FA9B23]/35 rounded-3xl p-3 shadow-[0_25px_70px_rgba(0,0,0,0.95)] space-y-1">
                  {RESOURCES_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.title}
                        href={item.href}
                        target={item.external ? '_blank' : undefined}
                        rel={item.external ? 'noopener noreferrer' : undefined}
                        onClick={() => setOpenDropdown(null)}
                        className="group flex items-start gap-3 p-2.5 rounded-2xl hover:bg-white/[0.06] border border-transparent hover:border-[#FA9B23]/25 transition-all"
                      >
                        <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[#FA9B23]">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-extrabold text-white group-hover:text-[#FA9B23] transition-colors">
                            {item.title}
                          </div>
                          <p className="text-[10.5px] text-stone-400 leading-snug font-normal">
                            {item.desc}
                          </p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
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
        <div className="lg:hidden bg-[#0D0504]/98 backdrop-blur-2xl border-b border-[#FA9B23]/25 px-4 pt-4 pb-6 space-y-3 max-h-[85vh] overflow-y-auto">
          <div className="flex flex-col space-y-1 text-sm font-semibold text-stone-200">
            <button
              type="button"
              onClick={() => setMobileSolutionsOpen(!mobileSolutionsOpen)}
              className="py-2.5 px-3 rounded-xl hover:bg-white/5 flex items-center justify-between text-left"
            >
              <span>Soluciones</span>
              <ChevronDown
                className={`w-4 h-4 text-[#FA9B23] transition-transform ${
                  mobileSolutionsOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {mobileSolutionsOpen && (
              <div className="pl-3 pr-1 py-1.5 space-y-1.5 border-l-2 border-[#FA9B23]/40 ml-3">
                {SOLUTIONS_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.title}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07]"
                    >
                      <Icon className="w-4 h-4 text-[#FA9B23] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-white">{item.title}</div>
                        <div className="text-[10px] text-stone-400 font-normal">{item.desc}</div>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}

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
