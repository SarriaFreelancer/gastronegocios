'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { categories as defaultCategories } from '@/data/categories';
import { ArrowRight, Sparkles } from 'lucide-react';

export const CategorySection: React.FC = () => {
  const pathname = usePathname();
  const match = pathname ? pathname.match(/^\/r\/([^\/]+)/) : null;
  const tenantSlug = match ? match[1] : 'punto-g';
  const basePrefix = match ? `/r/${match[1]}` : '';
  const [categoriesList, setCategoriesList] = useState<any[]>(defaultCategories);

  // Fetch real categories from database scoped to current tenant
  useEffect(() => {
    fetch(`/api/categories?restaurantSlug=${tenantSlug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategoriesList(data);
        }
      })
      .catch(() => {});
  }, [tenantSlug]);

  // Only active main categories (parentId == null and activo !== false)
  const mainCategories = categoriesList.filter((c) => !c.parentId && c.activo !== false);

  return (
    <section className="relative py-14 sm:py-20 bg-[#080808] overflow-hidden">
      {/* Decorative ambient yellow glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-brand-yellow/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Decorative yellow gradient divider */}
      <div 
        className="w-full h-2 sm:h-3 mb-10 opacity-90"
        style={{
          background: 'radial-gradient(ellipse at center, #FFC928 0%, rgba(255, 201, 40, 0.7) 50%, transparent 95%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center space-y-3 mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow text-xs font-black uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Grandes Secciones del Menú</span>
          </div>

          <div className="flex items-center justify-center gap-3 sm:gap-6">
            <div className="h-[2px] w-12 sm:w-28 bg-gradient-to-r from-transparent via-brand-yellow to-brand-yellow" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase text-white font-display tracking-wider text-center">
              NUESTRAS <span className="text-brand-yellow italic">CATEGORÍAS</span>
            </h2>
            <div className="h-[2px] w-12 sm:w-28 bg-gradient-to-l from-transparent via-brand-yellow to-brand-yellow" />
          </div>

          <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto">
            Explora nuestra carta completa organizada en las principales especialidades de la casa.
          </p>
        </div>

        {/* Big, Vibrant, Eye-Catching Category Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
          {mainCategories.map((cat) => {
            // Solo subcategorías activas vinculadas a esta categoría principal
            const subs = categoriesList.filter(
              (c) =>
                (c.parentId === cat.id || c.parentId === cat.slug) &&
                c.activo !== false
            );
            const subsPreview = subs.map((s) => s.nombre.split(' ')[0]).join(' • ');

            return (
              <Link
                key={cat.slug}
                href={basePrefix ? `${basePrefix}/menu/${cat.slug}` : `/menu/${cat.slug}`}
                className="group relative flex flex-col justify-end h-[360px] sm:h-[400px] rounded-3xl overflow-hidden border-2 border-[#222] hover:border-brand-yellow transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_45px_rgba(255,201,40,0.3)] bg-[#111]"
              >
                {/* Background Food Photography */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src={cat.imagen}
                    alt={cat.nombre}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  {/* Multistage gradient overlay for readability & cinematic depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20 group-hover:via-black/50 transition-colors duration-500" />
                </div>

                {/* Top Badge: Icon + Subcategories Count */}
                <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-brand-yellow text-black flex items-center justify-center shadow-glow border border-yellow-300 transform group-hover:scale-110 transition-transform duration-300">
                    <CategoryIcon name={cat.icono} size={24} className="text-black stroke-[2.5]" />
                  </div>

                  <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-black text-brand-yellow uppercase tracking-wider">
                    {subs.length > 0 ? `${subs.length} Variedades` : 'Especial'}
                  </span>
                </div>

                {/* Bottom Content Area */}
                <div className="relative z-10 p-5 sm:p-6 space-y-2.5">
                  {/* Subcategories tags list */}
                  {subsPreview && (
                    <p className="text-[10px] sm:text-[11px] font-black uppercase text-brand-yellow tracking-widest line-clamp-1 drop-shadow">
                      {subsPreview}
                    </p>
                  )}

                  {/* Category Name */}
                  <h3 className="text-xl sm:text-2xl font-black uppercase text-white font-display tracking-tight group-hover:text-brand-yellow transition-colors leading-tight drop-shadow-md">
                    {cat.nombre}
                  </h3>

                  {/* Brief Description */}
                  <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                    {cat.descripcion}
                  </p>

                  {/* CTA Button Link */}
                  <div className="pt-2 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-brand-yellow group-hover:text-white transition-colors">
                    <span>Ver Menú</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
};
