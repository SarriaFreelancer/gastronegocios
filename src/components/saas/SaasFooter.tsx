'use client';

import React from 'react';
import Link from 'next/link';
import {
  UtensilsCrossed,
  ChefHat,
  MessageCircle,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Flame,
  Globe
} from 'lucide-react';

export function SaasFooter() {
  const whatsappSalesUrl =
    'https://wa.me/573215894178?text=' +
    encodeURIComponent(
      'Hola GastroNegocios, me gustaría recibir más información y asesoría para mi restaurante.'
    );

  return (
    <footer className="relative bg-[#05070D] text-white pt-16 pb-12 border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/5">
          
          {/* Brand Column (Col 1-5) */}
          <div className="lg:col-span-5 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E53E3E] to-[#DD6B20] flex items-center justify-center shadow-lg shadow-red-500/30">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-tight text-white font-display">
                  GASTRONEGOCIOS
                </span>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest -mt-1">
                  Software & POS Gastronómico
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-gray-400 max-w-sm leading-relaxed font-normal">
              La plataforma SaaS definitiva para la gestión, pedidos, cocina y finanzas de restaurantes, gastrobares y franquicias en Colombia y Latinoamérica.
            </p>

            <div className="flex flex-wrap gap-2 pt-2 text-[11px] text-gray-300">
              <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                ⚡ 0% Comisiones
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                🔒 Multi-Tenant Aislado
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                🧾 Impresión Térmica ESC/POS
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                ☁️ 99.9% Uptime
              </span>
            </div>
          </div>

          {/* Solutions Column (Col 6-8) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-black uppercase text-white tracking-wider font-display">
              Módulos del Sistema
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/r/puntog" className="hover:text-amber-400 transition flex items-center gap-1.5 text-gray-300">
                  <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                  <span>Demo: Punto G Gourmet</span>
                </Link>
              </li>
              <li>
                <Link href="/r/salchiricurras" className="hover:text-amber-400 transition flex items-center gap-1.5 text-gray-300">
                  <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                  <span>Demo: Salchi Ricurras</span>
                </Link>
              </li>
              <li>
                <Link href="/r/puntog/cocina" className="hover:text-amber-400 transition flex items-center gap-1.5 text-gray-300">
                  <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pantalla de Cocina (KDS)</span>
                </Link>
              </li>
              <li>
                <Link href="/r/puntog/mesero" className="hover:text-amber-400 transition flex items-center gap-1.5 text-gray-300">
                  <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                  <span>Comandera Móvil Meseros</span>
                </Link>
              </li>
              <li>
                <Link href="#funcionalidades" className="hover:text-amber-400 transition flex items-center gap-1.5 text-gray-300">
                  <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                  <span>Escandallos y Recetas</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* CTA & Support Column (Col 9-12) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-black uppercase text-white tracking-wider font-display">
              Comenzar & Soporte
            </h4>
            <p className="text-xs text-gray-400">
              ¿Quieres digitalizar tu restaurante hoy mismo o necesitas asesoría personalizada?
            </p>

            <div className="space-y-2 pt-1">
              <a
                href={whatsappSalesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-[#E53E3E] hover:bg-[#D42B2B] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-red-500/30 hover:scale-[1.02] transition"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Hablar con un Asesor Comercial</span>
              </a>

              <div className="flex items-center justify-between text-xs pt-1 px-1">
                <Link href="/login" className="text-gray-300 hover:text-white transition">
                  Acceso Personal / Staff
                </Link>
                <Link href="/superadmin" className="text-gray-400 hover:text-amber-400 transition">
                  Portal Superadmin
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Credits & Legal */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-center md:text-left text-gray-300">
          <p className="leading-relaxed">
            Desarrollado por{' '}
            <a
              href="https://www.sarriatech.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FA9B23] hover:text-amber-300 font-black transition-colors underline decoration-[#FA9B23]/60 underline-offset-4"
            >
              SarriaTech Solutions S.A.S
            </a>{' '}
            —{' '}
            <a
              href="https://www.sarriatech.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-[#FA9B23] font-bold transition-colors inline-flex items-center gap-1"
            >
              <span>www.sarriatech.tech</span>
              <ExternalLink className="w-3 h-3 text-[#FA9B23]" />
            </a>{' '}
            © {new Date().getFullYear()} Todos los derechos reservados.
          </p>

          <div className="flex items-center gap-4 text-[11px] text-gray-400 font-medium">
            <span>Cali, Colombia</span>
            <span>•</span>
            <span>SaaS Gastronómico de Alta Disponibilidad</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
