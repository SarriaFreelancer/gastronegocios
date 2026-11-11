import React from 'react';
import Link from 'next/link';
import { Compass, Home, Rocket, LogIn, ArrowLeft, ShieldAlert } from 'lucide-react';

export const metadata = {
  title: 'Página no encontrada (404) | GastroNegocios',
  description: 'La página o ruta solicitada no existe o fue trasladada dentro de la plataforma GastroNegocios.',
};

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#080303] text-white flex flex-col justify-between relative overflow-hidden font-sans selection:bg-[#E50914] selection:text-white">
      {/* Warm ambient background glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 50% 20%, rgba(229, 9, 20, 0.18) 0%, transparent 70%),
            radial-gradient(ellipse 60% 45% at 80% 75%, rgba(250, 155, 35, 0.14) 0%, transparent 70%),
            linear-gradient(180deg, #0D0404 0%, #070202 100%)
          `,
        }}
      />

      {/* Top Navigation Bar */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex items-center justify-between px-5 py-3 rounded-2xl bg-[#140705]/90 border border-[#D4AF37]/30 backdrop-blur-xl shadow-xl">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FA9B23]/25 to-[#E50914]/25 border border-[#FA9B23]/50 flex items-center justify-center shadow-md">
              <svg viewBox="0 0 44 44" className="w-6 h-6" fill="none">
                <path d="M13 33 L29 17" stroke="#FA9B23" strokeWidth="2.8" strokeLinecap="round" />
                <path d="M31 33 L15 17" stroke="#FA9B23" strokeWidth="2.8" strokeLinecap="round" />
                <path
                  d="M22 7 C17 7 15 10.5 15.5 13.5 C12.5 14 11 16.5 12.5 19 C13.5 20.5 15 21 16.5 21.5 L27.5 21.5 C29 21 30.5 20.5 31.5 19 C33 16.5 31.5 14 28.5 13.5 C29 10.5 27 7 22 7 Z"
                  fill="#FFFFFF"
                />
              </svg>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                GASTRO<span className="text-[#FA9B23]">NEGOCIOS</span>
              </span>
              <span className="text-[9px] uppercase tracking-[0.22em] text-stone-400 font-semibold mt-0.5">
                Plataforma Gastronómica
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="px-4 py-2 rounded-full text-xs font-bold text-stone-200 hover:text-white border border-white/15 hover:border-[#FA9B23]/50 transition-all"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/registro"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-extrabold text-white shadow-lg transition-transform hover:scale-105"
              style={{
                background: 'linear-gradient(180deg, #FF2828 0%, #D90712 100%)',
              }}
            >
              <Rocket className="w-3.5 h-3.5 text-[#FFE169]" />
              <span>Crear Restaurante</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main 404 Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-xl w-full rounded-3xl bg-gradient-to-b from-[#170907]/95 to-[#0D0504]/95 border border-[#FA9B23]/30 p-8 sm:p-10 text-center shadow-[0_25px_70px_rgba(0,0,0,0.9)] space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E50914]/15 border border-[#E50914]/40 text-[#FFE169] text-xs font-extrabold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-[#E50914]" />
            <span>Error 404 • Ruta No Encontrada</span>
          </div>

          {/* 3D Gold 404 Typography */}
          <div className="relative py-2">
            <div
              className="text-7xl sm:text-8xl font-black tracking-tighter leading-none text-transparent bg-clip-text select-none drop-shadow-[0_10px_30px_rgba(250,155,35,0.3)]"
              style={{
                backgroundImage: 'linear-gradient(180deg, #FFE169 0%, #FA9B23 55%, #E50914 100%)',
              }}
            >
              404
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Esta página o restaurante no existe
            </h1>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
              El enlace que intentaste abrir no se encuentra disponible, cambió de dirección o aún no ha sido registrado en{' '}
              <strong className="text-[#FA9B23]">GastroNegocios</strong>.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-lg transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(180deg, #FF2A2A 0%, #D80812 100%)',
                boxShadow: '0 10px 25px rgba(229, 9, 20, 0.5)',
              }}
            >
              <Home className="w-4 h-4 text-[#FFE169]" />
              <span>Ir al Inicio de GastroNegocios</span>
            </Link>

            <Link
              href="/registro"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#1C0D09] hover:bg-[#27120C] border border-[#FA9B23]/45 text-[#FFE169] font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all"
            >
              <Rocket className="w-4 h-4" />
              <span>Registrar Mi Restaurante</span>
            </Link>
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-center gap-4 text-xs text-stone-400">
            <Link href="/login" className="inline-flex items-center gap-1.5 hover:text-[#FA9B23] transition-colors font-semibold">
              <LogIn className="w-3.5 h-3.5" />
              <span>Acceso Personal / Admin</span>
            </Link>
            <span>•</span>
            <Link href="/r/punto-g" className="inline-flex items-center gap-1.5 hover:text-[#FA9B23] transition-colors font-semibold">
              <Compass className="w-3.5 h-3.5" />
              <span>Ver Restaurante Demo</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer credit */}
      <footer className="relative z-10 py-6 text-center text-xs text-stone-400 border-t border-white/10 bg-[#050202]/80">
        <p>
          © {new Date().getFullYear()} <strong className="text-white">GastroNegocios</strong> • Desarrollado por{' '}
          <a
            href="https://www.sarriatech.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#FFE169] hover:text-[#FA9B23] font-extrabold underline decoration-[#FA9B23]/50 underline-offset-4"
          >
            SarriaTech Solutions S.A.S
          </a>{' '}
          (www.sarriatech.tech)
        </p>
      </footer>
    </div>
  );
}
