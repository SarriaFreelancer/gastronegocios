'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { categories } from '@/data/categories';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { ChevronRight, ChevronDown, Utensils, Sparkles } from 'lucide-react';
import { restaurantInfo } from '@/data/restaurant-info';

interface CategorySidebarProps {
  currentSlug?: string;
  currentSubSlug?: string;
  onSelectCategory?: (categorySlug: string, subcategorySlug?: string) => void;
  showAllOption?: boolean;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  currentSlug,
  currentSubSlug,
  onSelectCategory,
  showAllOption = false,
}) => {
  const pathname = usePathname();

  // Main categories (parentId == null)
  const mainCategories = categories.filter((c) => !c.parentId);

  const isMainCategoryActive = (slug: string) => {
    if (currentSlug) return currentSlug === slug;
    return pathname.includes(`/menu/${slug}`);
  };

  const isSubCategoryActive = (slug: string) => {
    if (currentSubSlug) return currentSubSlug === slug;
    return pathname.includes(`/menu/${slug}`);
  };

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 space-y-6">
      {/* Category Navigation List */}
      <div className="bg-[#101010] border border-[#222] rounded-2xl p-2.5 space-y-2 shadow-xl">
        
        {/* All products button */}
        {showAllOption && (
          <button
            type="button"
            onClick={() => onSelectCategory && onSelectCategory('todos')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 group ${
              currentSlug === 'todos' && !currentSubSlug
                ? 'bg-brand-yellow text-black shadow-glow font-black'
                : 'text-gray-300 hover:bg-[#1a1a1a] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Utensils
                size={18}
                className={
                  currentSlug === 'todos' && !currentSubSlug
                    ? 'text-black'
                    : 'text-gray-400 group-hover:text-brand-yellow transition-colors'
                }
              />
              <span>Todos los Platos</span>
            </div>
            <ChevronRight
              className={`w-4 h-4 transition-transform ${
                currentSlug === 'todos' && !currentSubSlug
                  ? 'text-black stroke-[3]'
                  : 'text-gray-600 group-hover:text-gray-300 group-hover:translate-x-0.5'
              }`}
            />
          </button>
        )}

        {/* Grouped by Main Category and its Subcategories */}
        {mainCategories.map((mainCat) => {
          const subcategories = categories.filter(
            (c) => c.parentId === mainCat.id || c.parentId === mainCat.slug
          );
          const isMainActive = isMainCategoryActive(mainCat.slug);

          return (
            <div key={mainCat.id} className="space-y-1">
              {/* Main Category Header Button */}
              {onSelectCategory ? (
                <button
                  type="button"
                  onClick={() => onSelectCategory(mainCat.slug, undefined)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all duration-200 group text-left ${
                    isMainActive && !currentSubSlug
                      ? 'bg-brand-yellow text-black shadow-glow font-black'
                      : 'text-white hover:bg-[#181818]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CategoryIcon
                      name={mainCat.icono}
                      size={18}
                      className={
                        isMainActive && !currentSubSlug
                          ? 'text-black'
                          : 'text-brand-yellow group-hover:scale-110 transition-transform'
                      }
                    />
                    <span className="uppercase tracking-tight">{mainCat.nombre}</span>
                  </div>
                  {subcategories.length > 0 ? (
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                  )}
                </button>
              ) : (
                <Link
                  href={`/menu/${mainCat.slug}`}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all duration-200 group ${
                    isMainActive && !currentSubSlug
                      ? 'bg-brand-yellow text-black shadow-glow font-black'
                      : 'text-white hover:bg-[#181818]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CategoryIcon
                      name={mainCat.icono}
                      size={18}
                      className={
                        isMainActive && !currentSubSlug
                          ? 'text-black'
                          : 'text-brand-yellow group-hover:scale-110 transition-transform'
                      }
                    />
                    <span className="uppercase tracking-tight">{mainCat.nombre}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                </Link>
              )}

              {/* Subcategories Indented List */}
              {subcategories.length > 0 && (
                <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-[#222] ml-4">
                  {subcategories.map((sub) => {
                    const isSubActive = isSubCategoryActive(sub.slug);

                    if (onSelectCategory) {
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => onSelectCategory(mainCat.slug, sub.slug)}
                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold transition-all text-left ${
                            isSubActive
                              ? 'bg-brand-yellow/20 text-brand-yellow font-black border border-brand-yellow/30'
                              : 'text-gray-400 hover:text-white hover:bg-[#161616]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow/60" />
                            <span>{sub.nombre}</span>
                          </div>
                          {isSubActive && (
                            <span className="w-2 h-2 rounded-full bg-brand-yellow shadow-glow" />
                          )}
                        </button>
                      );
                    }

                    return (
                      <Link
                        key={sub.id}
                        href={`/menu/${sub.slug}`}
                        className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isSubActive
                            ? 'bg-brand-yellow/20 text-brand-yellow font-black border border-brand-yellow/30'
                            : 'text-gray-400 hover:text-white hover:bg-[#161616]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow/60" />
                          <span>{sub.nombre}</span>
                        </div>
                        {isSubActive && (
                          <span className="w-2 h-2 rounded-full bg-brand-yellow shadow-glow" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

      </div>

      {/* Decorative Sidebar Banner */}
      <div className="hidden lg:block relative rounded-2xl bg-gradient-to-br from-[#161616] to-[#0c0c0c] border border-[#272727] p-5 overflow-hidden text-center shadow-lg">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase text-brand-yellow tracking-widest">
            {restaurantInfo.slogan}
          </span>
          <h4 className="text-base font-black text-white uppercase font-display leading-tight">
            ¿EL ANTOJO NO DA ESPERA?
          </h4>
          <p className="text-xs text-gray-400 pt-1 leading-relaxed">
            Pide en línea y recibe en minutos en cualquier punto de Cali.
          </p>
        </div>
      </div>
    </aside>
  );
};
