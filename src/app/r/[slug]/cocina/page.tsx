'use client';

import React, { Suspense } from 'react';
import CocinaKDSPage from '@/app/cocina/page';

export default function TenantCocinaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070707] flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              Conectando con la cocina KDS de tu restaurante...
            </span>
          </div>
        </div>
      }
    >
      <CocinaKDSPage />
    </Suspense>
  );
}
