'use client';

import React from 'react';
import { SaasNavbar } from './SaasNavbar';
import { SaasHero } from './SaasHero';
import { SaasFeatureStrip } from './SaasFeatureStrip';
import { SaasDemoRestaurants } from './SaasDemoRestaurants';
import { SaasCustomizationSection } from './SaasCustomizationSection';
import { SaasPricingSection } from './SaasPricingSection';
import { SaasTrustBanner } from './SaasTrustBanner';
import { SaasFooter } from './SaasFooter';

/** Glossy 3D crimson-red ribbon wave matching the reference artwork */
function RedWave({ flip = false }: { flip?: boolean }) {
  return (
    <div
      className={`relative h-14 sm:h-20 -my-7 sm:-my-10 pointer-events-none z-0 ${
        flip ? 'scale-x-[-1]' : ''
      }`}
      aria-hidden
    >
      <svg className="w-full h-full overflow-visible" viewBox="0 0 1440 120" preserveAspectRatio="none">
        <defs>
          <linearGradient id="redwave-deep" x1="0" x2="1">
            <stop offset="0%" stopColor="#4A0206" stopOpacity="0.3" />
            <stop offset="30%" stopColor="#B8060E" stopOpacity="0.92" />
            <stop offset="70%" stopColor="#F10F1A" stopOpacity="0.98" />
            <stop offset="100%" stopColor="#7A0308" stopOpacity="0.65" />
          </linearGradient>
          <linearGradient id="redwave-highlight" x1="0" x2="1">
            <stop offset="0%" stopColor="#FF6B72" stopOpacity="0" />
            <stop offset="50%" stopColor="#FF4D55" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#FF6B72" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Main glossy crimson ribbon */}
        <path
          d="M0,92 C340,124 720,16 1080,48 C1260,64 1380,26 1440,6 L1440,48 C1380,68 1260,104 1080,90 C720,62 340,144 0,116 Z"
          fill="url(#redwave-deep)"
        />
        {/* Specular highlight edge */}
        <path
          d="M0,92 C340,124 720,16 1080,48 C1260,64 1380,26 1440,6"
          fill="none"
          stroke="url(#redwave-highlight)"
          strokeWidth="2.5"
        />
      </svg>
    </div>
  );
}

export function SaasLandingPage() {
  return (
    <div className="relative min-h-screen bg-[#070405] text-white selection:bg-[#F10F1A] selection:text-white font-sans antialiased overflow-x-hidden">
      {/* Warm high-saturation restaurant bokeh ambience background */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center opacity-80 saturate-150 contrast-110 pointer-events-none"
        style={{ backgroundImage: "url('/images/assets/restaurant-bg.jpg')" }}
        aria-hidden
      />
      {/* Rich warm dark vignette that preserves the golden bokeh & crimson glows */}
      <div
        className="fixed inset-0 z-0 bg-gradient-to-b from-black/20 via-[#0E0708]/55 to-[#080405]/88 pointer-events-none"
        aria-hidden
      />

      <div className="relative z-10">
        <SaasNavbar />

        <main>
          {/* 1. Hero Section (With Gourmet Burger, Fries, 3D iPhone App Mockup & 0% Comisiones Seal) */}
          <SaasHero />

          {/* 2. 5-Feature Horizontal Strip */}
          <SaasFeatureStrip />

          {/* 3. Demo Restaurants Carousel (3 Illustrated Cards: Punto G, Salchi Ricurras, Don Carbón) */}
          <SaasDemoRestaurants />

          <RedWave />

          {/* 4. Personalización Total (Tilted Brand Card + Bright Laptop Dashboard + 4 Mini Websites) */}
          <SaasCustomizationSection />

          {/* 5. Planes Flexibles (Left Header + Arrow + 3 Cards) */}
          <SaasPricingSection />

          <RedWave flip />

          {/* 6. Bottom Trust & CTA Banner */}
          <SaasTrustBanner />
        </main>

        {/* 7. Footer Corporativo con Créditos de SarriaTech Solutions S.A.S */}
        <SaasFooter />
      </div>
    </div>
  );
}

export default SaasLandingPage;
