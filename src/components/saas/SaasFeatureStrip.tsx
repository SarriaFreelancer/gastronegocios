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
      title: 'Configuración en 5 minutos',
      color: 'text-amber-400',
    },
    {
      icon: BarChart3,
      title: 'Control total desde un solo lugar',
      color: 'text-orange-400',
    },
    {
      icon: ShieldCheck,
      title: 'Seguro y confiable',
      color: 'text-emerald-400',
    },
    {
      icon: Headphones,
      title: 'Soporte especializado',
      color: 'text-purple-400',
    },
    {
      icon: Cloud,
      title: 'Funciona en todos tus dispositivos',
      color: 'text-blue-400',
    },
  ];

  return (
    <div className="border-y border-white/10 bg-[#0C0F1C]/90 backdrop-blur-md py-6 px-4 sm:px-6 relative z-20">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-4 items-center justify-between">
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-3 justify-center sm:justify-start group"
            >
              <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Icon className={`w-4 h-4 ${feat.color}`} />
              </div>
              <span className="text-xs sm:text-xs font-bold text-gray-200 leading-tight">
                {feat.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
