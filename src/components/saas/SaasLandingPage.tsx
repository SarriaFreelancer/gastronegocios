'use client';

import React from 'react';
import { SaasNavbar } from './SaasNavbar';
import { SaasHero } from './SaasHero';
import { SaasFeatureStrip } from './SaasFeatureStrip';
import { SaasDemoRestaurants } from './SaasDemoRestaurants';
import { SaasCustomizationSection } from './SaasCustomizationSection';
import { SaasFeaturesGrid } from './SaasFeaturesGrid';
import { SaasMultiBusinessSection } from './SaasMultiBusinessSection';
import { SaasPricingSection } from './SaasPricingSection';
import { SaasTrustBanner } from './SaasTrustBanner';
import { SaasFooter } from './SaasFooter';

export function SaasLandingPage() {
  return (
    <div className="min-h-screen bg-[#07090F] text-white selection:bg-[#E53E3E] selection:text-white font-sans antialiased">
      {/* Top Sticky Navigation */}
      <SaasNavbar />

      <main>
        {/* Section 1: Hero Section (Matches Reference Image) */}
        <SaasHero />

        {/* Section 2: 5-Feature Trust Strip (Matches Reference Image) */}
        <SaasFeatureStrip />

        {/* Section 3: Demo Restaurants Carousel (Matches Reference Image) */}
        <SaasDemoRestaurants />

        {/* Section 4: Brand Customization & Laptop Dashboard (Matches Reference Image) */}
        <SaasCustomizationSection />

        {/* Section 5: Features Grid (12 Core Modules) */}
        <SaasFeaturesGrid />

        {/* Section 6: Multi-Branch & Franchise Ecosystem */}
        <SaasMultiBusinessSection />

        {/* Section 7: Pricing Section (Matches Reference Image) */}
        <SaasPricingSection />

        {/* Section 8: Trust Banner Strip (Matches Reference Image) */}
        <SaasTrustBanner />
      </main>

      {/* Footer */}
      <SaasFooter />
    </div>
  );
}

export default SaasLandingPage;
