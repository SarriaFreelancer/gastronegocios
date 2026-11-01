import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Flame, ArrowRight } from 'lucide-react';

export const ParrillaSection: React.FC = () => {
  return (
    <section className="relative py-12 sm:py-16 bg-[#090909] border-t border-[#1a1a1a] overflow-hidden">
      {/* Background warm fire glow */}
      <div className="absolute inset-0 bg-radial-gradient from-[#e94b24]/15 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Banner with clean high-res sizzling grill photo */}
        <div className="relative rounded-3xl overflow-hidden border border-[#2b2b2b] shadow-2xl bg-[#121212] group">
          <div className="relative w-full h-64 sm:h-80 md:h-96">
            <Image
              src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1400&auto=format&fit=crop"
              alt="Carnes y Pollo a la Parrilla Punto G"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 1024px) 100vw, 1200px"
            />
            {/* Dark gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/80 flex items-center p-6 sm:p-12">
              <div className="max-w-xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/20 border border-brand-orange/40 text-brand-orange text-xs font-bold uppercase tracking-wider">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>Al Carbón & A la Brasa</span>
                </div>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-white font-display tracking-tight leading-tight">
                  EL SABOR DE LA{' '}
                  <span className="text-brand-yellow italic drop-shadow-[0_4px_20px_rgba(255,201,40,0.5)]">
                    PARRILLA
                  </span>{' '}
                  EN CADA BOCADO
                </h2>

                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                  Cortes jugosos, asados al término perfecto con chimichurri casero, papas al vapor y ese auténtico toque ahumado.
                </p>

                <div className="pt-2">
                  <Link
                    href="/menu/parrillas"
                    className="inline-flex items-center gap-2 bg-brand-yellow hover:bg-brand-yellowHover text-black font-black text-xs sm:text-sm px-7 py-3.5 rounded-full shadow-glow transition-all transform hover:scale-105"
                  >
                    <span>EXPLORAR PARRILLAS</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
