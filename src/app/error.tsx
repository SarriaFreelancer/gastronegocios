'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function ErrorBoundaryPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('GastroNegocios Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#080303] text-white flex flex-col justify-between relative overflow-hidden font-sans">
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 30%, rgba(229, 9, 20, 0.18) 0%, transparent 70%), linear-gradient(180deg, #0D0404 0%, #070202 100%)',
        }}
      />

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full rounded-3xl bg-gradient-to-b from-[#170907]/95 to-[#0D0504]/95 border border-[#FA9B23]/30 p-8 sm:p-10 text-center shadow-[0_25px_70px_rgba(0,0,0,0.9)] space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#E50914]/15 border border-[#E50914]/40 flex items-center justify-center mx-auto text-[#FA9B23]">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#FA9B23]">
              GastroNegocios • Control de Errores
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Ocurrió un inconveniente temporal
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              No pudimos completar la carga de esta vista en este momento. Puedes reintentar la operación o volver al inicio de la plataforma.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-white font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all hover:scale-105 cursor-pointer"
              style={{
                background: 'linear-gradient(180deg, #FF2A2A 0%, #D80812 100%)',
              }}
            >
              <RefreshCw className="w-4 h-4 text-[#FFE169]" />
              <span>Reintentar Ahora</span>
            </button>

            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#1C0D09] hover:bg-[#27120C] border border-[#FA9B23]/45 text-[#FFE169] font-extrabold text-xs uppercase tracking-wider transition-all"
            >
              <Home className="w-4 h-4" />
              <span>Ir al Inicio</span>
            </Link>
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-5 text-center text-xs text-stone-400 border-t border-white/10 bg-[#050202]/80">
        <p>
          © {new Date().getFullYear()} <strong className="text-white">GastroNegocios</strong> • Desarrollado por{' '}
          <a
            href="https://www.sarriatech.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#FFE169] hover:text-[#FA9B23] font-extrabold underline"
          >
            SarriaTech Solutions S.A.S
          </a>
        </p>
      </footer>
    </div>
  );
}
