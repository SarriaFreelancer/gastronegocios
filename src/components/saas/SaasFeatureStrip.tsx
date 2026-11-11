import React from 'react';
import {
  Zap,
  BarChart3,
  ShieldCheck,
  Headphones,
  Cloud
} from 'lucide-react';

export function SaasFeatureStrip() {
  const features = [
    {
      icon: Zap,
      line1: 'Configuración',
      line2: 'en 5 minutos',
    },
    {
      icon: BarChart3,
      line1: 'Control total',
      line2: 'desde un solo lugar',
    },
    {
      icon: ShieldCheck,
      line1: 'Seguro y',
      line2: 'confiable',
    },
    {
      icon: Headphones,
      line1: 'Soporte',
      line2: 'especializado',
    },
    {
      icon: Cloud,
      line1: 'Funciona en',
      line2: 'todos tus dispositivos',
    },
  ];

  return (
    <div className="max-w-7xl mx-4 xl:mx-auto rounded-2xl border border-[#4E2322]/90 bg-gradient-to-b from-[#1B1113]/95 via-[#120B0D]/95 to-[#0C0709]/98 backdrop-blur-md py-4 px-4 sm:px-6 relative z-20 shadow-[0_14px_40px_rgba(0,0,0,0.9)]">
      {/* Intense bottom crimson-amber neon glow line matching reference */}
      <div className="absolute inset-x-8 bottom-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#F10F1A]/75 to-transparent shadow-[0_0_12px_#F10F1A]" />
      <div className="absolute inset-x-20 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/25 to-transparent" />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-0 lg:divide-x lg:divide-white/15 items-center">
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-3 justify-start lg:justify-center px-2 sm:px-4"
            >
              <Icon className="w-7 h-7 text-[#FA9B23] stroke-[2] shrink-0 drop-shadow-[0_0_10px_rgba(250,155,35,0.45)]" />
              <div className="flex flex-col leading-tight">
                <span className="text-xs sm:text-[13.5px] font-bold text-white">
                  {feat.line1}
                </span>
                <span className="text-[11px] sm:text-xs font-normal text-gray-300">
                  {feat.line2}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
