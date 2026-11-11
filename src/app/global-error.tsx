'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#080303] text-white flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full rounded-3xl bg-[#140705] border border-[#FA9B23]/30 p-8 text-center space-y-5 shadow-2xl">
          <div className="text-lg font-extrabold tracking-tight text-white">
            GASTRO<span className="text-[#FA9B23]">NEGOCIOS</span>
          </div>
          <h1 className="text-2xl font-black text-white">Error inesperado del sistema</h1>
          <p className="text-xs text-stone-300 leading-relaxed">
            Ha ocurrido un error al procesar la solicitud. Por favor intenta recargar la página.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="px-5 py-2.5 rounded-full bg-[#E50914] text-white font-extrabold text-xs uppercase tracking-wider cursor-pointer"
            >
              Reintentar
            </button>
            <a
              href="/"
              className="px-5 py-2.5 rounded-full border border-[#FA9B23]/40 text-[#FFE169] font-extrabold text-xs uppercase tracking-wider"
            >
              Ir al Inicio
            </a>
          </div>
          <p className="text-[11px] text-stone-400 pt-3 border-t border-white/10">
            Desarrollado por{' '}
            <a href="https://www.sarriatech.tech" className="text-[#FA9B23] font-bold underline">
              SarriaTech Solutions S.A.S
            </a>
          </p>
        </div>
      </body>
    </html>
  );
}
