import React from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { CategorySection } from '@/components/home/CategorySection';
import { FeaturedProductsSection } from '@/components/home/FeaturedProductsSection';
import { PromotionBanner } from '@/components/home/PromotionBanner';
import { ParrillaSection } from '@/components/home/ParrillaSection';
import { VirtualAssistantSection } from '@/components/home/VirtualAssistantSection';

export default function HomePage() {
  return (
    <div className="bg-[#080808] min-h-screen text-white space-y-0">
      {/* 1. Hero Principal */}
      <HeroSection />

      {/* 2. NUESTRAS CATEGORÍAS */}
      <CategorySection />

      {/* 3. PRODUCTOS DESTACADOS */}
      <FeaturedProductsSection />

      {/* 4. COMBOS QUE NO TE PUEDES PERDER */}
      <PromotionBanner />

      {/* 5. EL SABOR DE LA PARRILLA EN CADA BOCADO */}
      <ParrillaSection />

      {/* 6. ¿YA SE TE ANTOJÓ? (Asistente Virtual & WhatsApp) */}
      <VirtualAssistantSection />
    </div>
  );
}
