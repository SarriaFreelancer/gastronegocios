import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@/types';
import { CategoryIcon } from '@/components/ui/CategoryIcon';

interface CategoryCardProps {
  category: Category;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <Link
      href={`/menu/${category.slug}`}
      className="group relative flex flex-col items-center bg-[#101010] hover:bg-[#151515] border border-[#222] hover:border-brand-yellow/60 rounded-2xl p-3 sm:p-4 text-center transition-all duration-300 hover:shadow-[0_8px_25px_rgba(255,201,40,0.18)] hover:-translate-y-1.5"
    >
      {/* Food Photo Container */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-black mb-3 border border-[#1e1e1e]">
        <Image
          src={category.imagen}
          alt={category.nombre}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 150px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* Yellow Icon Badge Overlay */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-brand-yellow text-black flex items-center justify-center shadow-glow border border-yellow-300 transform group-hover:scale-110 transition-transform">
          <CategoryIcon name={category.icono} size={15} className="text-black" />
        </div>
      </div>

      {/* Category Name */}
      <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-brand-yellow transition-colors leading-tight line-clamp-2">
        {category.nombre}
      </h3>
    </Link>
  );
};
