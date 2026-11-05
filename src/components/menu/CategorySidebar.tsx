'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { categories as defaultCategories } from '@/data/categories';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { ChevronRight, ChevronDown, Utensils } from 'lucide-react';
import { restaurantInfo } from '@/data/restaurant-info';
import { useTenant } from '@/context/TenantContext';

interface CategorySidebarProps {
  currentSlug?: string;
  currentSubSlug?: string;
  onSelectCategory?: (categorySlug: string, subcategorySlug?: string) => void;
  showAllOption?: boolean;
  categoriesList?: any[];
  tenantSlug?: string;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  currentSlug,
  currentSubSlug,
  onSelectCategory,
  showAllOption = false,
  categoriesList,
  tenantSlug,
}) => {
  const pathname = usePathname();
  const { restaurant } = useTenant();
  const primaryColor = restaurant?.colorPrimario || '#EAA622';
  const buttonColor = restaurant?.colorBoton || primaryColor;
  const buttonTextColor = restaurant?.colorBotonTexto || '#000000';
  const slogan = restaurant?.eslogan || restaurantInfo.slogan;

  // Active categories only
  const activeList = (categoriesList && categoriesList.length > 0 ? categoriesList : defaultCategories).filter(
    (c) => c.activo !== false
  );

  // Main categories (parentId == null and activo !== false)
  const mainCategories = activeList.filter((c) => !c.parentId);

  const isMainCategoryActive = (slug: string) => {
    if (currentSlug) return currentSlug === slug;
    return pathname.includes(`/menu/${slug}`);
  };

  const isSubCategoryActive = (slug: string) => {
    if (currentSubSlug) return currentSubSlug === slug;
    return pathname.includes(`/menu/${slug}`);
  };

  const getMenuUrl = (catSlug: string) => {
    if (tenantSlug && tenantSlug !== 'punto-g' && tenantSlug !== 'puntog') {
      return `/r/${tenantSlug}/menu/${catSlug}`;
    }
    return `/menu/${catSlug}`;
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
                ? 'shadow-glow font-black'
                : 'text-gray-300 hover:bg-[#1a1a1a] hover:text-white'
            }`}
            style={
              currentSlug === 'todos' && !currentSubSlug
                ? { backgroundColor: buttonColor, color: buttonTextColor }
                : {}
            }
          >
            <div className="flex items-center gap-3">
              <Utensils
                size={18}
                className={
                  currentSlug === 'todos' && !currentSubSlug
                    ? 'text-current'
                    : 'text-gray-400 group-hover:text-tenant-primary transition-colors'
                }
              />
              <span>Todos los Platos</span>
            </div>
            <ChevronRight
              className={`w-4 h-4 transition-transform ${
                currentSlug === 'todos' && !currentSubSlug
                  ? 'text-current stroke-[3]'
                  : 'text-gray-600 group-hover:text-gray-300 group-hover:translate-x-0.5'
              }`}
            />
          </button>
        )}

        {/* Grouped by Main Category and its Subcategories */}
        {mainCategories.map((mainCat) => {
          const subcategories = activeList.filter(
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
                      ? 'shadow-glow font-black'
                      : 'text-white hover:bg-[#181818]'
                  }`}
                  style={
                    isMainActive && !currentSubSlug
                      ? { backgroundColor: buttonColor, color: buttonTextColor }
                      : {}
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <span style={!isMainActive || currentSubSlug ? { color: primaryColor } : {}}>
                      <CategoryIcon
                        name={mainCat.icono}
                        size={18}
                        className={
                          isMainActive && !currentSubSlug
                            ? 'text-current'
                            : 'group-hover:scale-110 transition-transform'
                        }
                      />
                    </span>
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
                  href={getMenuUrl(mainCat.slug)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all duration-200 group ${
                    isMainActive && !currentSubSlug
                      ? 'shadow-glow font-black'
                      : 'text-white hover:bg-[#181818]'
                  }`}
                  style={
                    isMainActive && !currentSubSlug
                      ? { backgroundColor: buttonColor, color: buttonTextColor }
                      : {}
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <span style={!isMainActive || currentSubSlug ? { color: primaryColor } : {}}>
                      <CategoryIcon
                        name={mainCat.icono}
                        size={18}
                        className={
                          isMainActive && !currentSubSlug
                            ? 'text-current'
                            : 'group-hover:scale-110 transition-transform'
                        }
                      />
                    </span>
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
                              ? 'font-black border'
                              : 'text-gray-400 hover:text-white hover:bg-[#161616]'
                          }`}
                          style={
                            isSubActive
                              ? {
                                  backgroundColor: `${primaryColor}25`,
                                  color: primaryColor,
                                  borderColor: `${primaryColor}50`,
                                }
                              : {}
                          }
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: isSubActive ? primaryColor : `${primaryColor}80` }}
                            />
                            <span>{sub.nombre}</span>
                          </div>
                          {isSubActive && (
                            <span
                              className="w-2 h-2 rounded-full shadow-glow"
                              style={{ backgroundColor: primaryColor }}
                            />
                          )}
                        </button>
                      );
                    }

                    return (
                      <Link
                        key={sub.id}
                        href={getMenuUrl(sub.slug)}
                        className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isSubActive
                            ? 'font-black border'
                            : 'text-gray-400 hover:text-white hover:bg-[#161616]'
                        }`}
                        style={
                          isSubActive
                            ? {
                                backgroundColor: `${primaryColor}25`,
                                color: primaryColor,
                                borderColor: `${primaryColor}50`,
                              }
                            : {}
                        }
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: isSubActive ? primaryColor : `${primaryColor}80` }}
                          />
                          <span>{sub.nombre}</span>
                        </div>
                        {isSubActive && (
                          <span
                            className="w-2 h-2 rounded-full shadow-glow"
                            style={{ backgroundColor: primaryColor }}
                          />
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
          <span
            className="text-[10px] font-black uppercase tracking-widest block"
            style={{ color: primaryColor }}
          >
            {slogan}
          </span>
          <h4 className="text-base font-black text-white uppercase font-display leading-tight">
            ¿EL ANTOJO NO DA ESPERA?
          </h4>
          <p className="text-xs text-gray-400 pt-1 leading-relaxed">
            Pide en línea y recibe en minutos con la mejor atención.
          </p>
        </div>
      </div>
    </aside>
  );
};
