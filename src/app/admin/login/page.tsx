'use client';

import { Suspense } from 'react';
import LoginPage from '@/app/login/page';

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080808] flex items-center justify-center text-white">
          <div className="w-8 h-8 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginPage />
    </Suspense>
  );
}
