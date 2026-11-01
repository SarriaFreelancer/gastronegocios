import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { categories } from '@/data/categories';

export const CategorySection: React.FC = () => {
  return (
    <section className="relative py-12 sm:py-16 bg-[#080808]">
      {/* Decorative yellow gradient divider */}
      <div 
        className="w-full h-2 sm:h-3 mb-8 opacity-90"
        style={{
          background: 'radial-gradient(ellipse at center, #FFC928 0%, rgba(255, 201, 40, 0.7) 50%, transparent 95%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title with horizontal yellow flanking lines */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 mb-8 sm:mb-10">
          <div className="h-[2px] w-12 sm:w-28 bg-gradient-to-r from-transparent via-brand-yellow to-brand-yellow" />
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase text-brand-yellow font-display tracking-widest text-center">
            NUESTRAS CATEGORÍAS
          </h2>
          <div className="h-[2px] w-12 sm:w-28 bg-gradient-to-l from-transparent via-brand-yellow to-brand-yellow" />
        </div>

        {/* 9 Cards with high-res crisp photography */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3 sm:gap-3.5">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/menu/${cat.slug}`}
              className="group relative flex flex-col items-center bg-[#111111] hover:bg-[#161616] border border-[#242424] hover:border-brand-yellow/70 rounded-2xl p-3 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_10px_25px_rgba(255,201,40,0.25)]"
            >
              {/* Photo */}
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-black mb-3 border border-[#202020]">
                <Image
                  src={cat.imagen}
                  alt={cat.nombre}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 20vw, 130px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Yellow Icon Badge Overlay */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-brand-yellow text-black flex items-center justify-center shadow-glow border border-yellow-300 transform group-hover:scale-110 transition-transform">
                  <CategoryIcon name={cat.icono} size={15} className="text-black" />
                </div>
              </div>

              {/* Name */}
              <h3 className="text-xs font-bold text-white group-hover:text-brand-yellow transition-colors leading-tight line-clamp-2">
                {cat.nombre}
              </h3>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};
