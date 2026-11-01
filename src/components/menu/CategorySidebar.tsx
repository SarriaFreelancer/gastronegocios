'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { categories } from '@/data/categories';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { ChevronRight, MessageCircle, Utensils } from 'lucide-react';
import { restaurantInfo } from '@/data/restaurant-info';

interface CategorySidebarProps {
  currentSlug?: string;
  onSelectCategory?: (slug: string) => void;
  showAllOption?: boolean;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  currentSlug,
  onSelectCategory,
  showAllOption = false,
}) => {
  const pathname = usePathname();

  const isCategoryActive = (slug: string) => {
    if (currentSlug) return currentSlug === slug;
    return pathname.includes(`/menu/${slug}`);
  };

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 space-y-6">
      {/* Category Navigation List */}
      <div className="bg-[#101010] border border-[#222] rounded-2xl p-2.5 space-y-1.5 shadow-xl">
        {showAllOption && (
          <button
            type="button"
            onClick={() => onSelectCategory && onSelectCategory('todos')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 group ${
              currentSlug === 'todos'
                ? 'bg-brand-yellow text-black shadow-glow font-black'
                : 'text-gray-300 hover:bg-[#1a1a1a] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Utensils
                size={18}
                className={currentSlug === 'todos' ? 'text-black' : 'text-gray-400 group-hover:text-brand-yellow transition-colors'}
              />
              <span>Todos los Platos</span>
            </div>
            <ChevronRight
              className={`w-4 h-4 transition-transform ${
                currentSlug === 'todos' ? 'text-black stroke-[3]' : 'text-gray-600 group-hover:text-gray-300 group-hover:translate-x-0.5'
              }`}
            />
          </button>
        )}

        {categories.map((cat) => {
          const active = isCategoryActive(cat.slug);

          if (onSelectCategory) {
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.slug)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 group text-left ${
                  active
                    ? 'bg-brand-yellow text-black shadow-glow font-black'
                    : 'text-gray-300 hover:bg-[#1a1a1a] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CategoryIcon
                    name={cat.icono}
                    size={18}
                    className={active ? 'text-black' : 'text-gray-400 group-hover:text-brand-yellow transition-colors'}
                  />
                  <span>{cat.nombre}</span>
                </div>
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    active ? 'text-black stroke-[3]' : 'text-gray-600 group-hover:text-gray-300 group-hover:translate-x-0.5'
                  }`}
                />
              </button>
            );
          }

          return (
            <Link
              key={cat.id}
              href={`/menu/${cat.slug}`}
              className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 group ${
                active
                  ? 'bg-brand-yellow text-black shadow-glow font-black'
                  : 'text-gray-300 hover:bg-[#1a1a1a] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <CategoryIcon
                  name={cat.icono}
                  size={18}
                  className={active ? 'text-black' : 'text-gray-400 group-hover:text-brand-yellow transition-colors'}
                />
                <span>{cat.nombre}</span>
              </div>
              <ChevronRight
                className={`w-4 h-4 transition-transform ${
                  active ? 'text-black stroke-[3]' : 'text-gray-600 group-hover:text-gray-300 group-hover:translate-x-0.5'
                }`}
              />
            </Link>
          );
        })}
      </div>

      {/* Decorative Sidebar Banner: "EL ANTOJO TIENE UN SOLO PUNTO G" */}
      <div className="hidden lg:block relative rounded-2xl bg-gradient-to-br from-[#161616] to-[#0c0c0c] border border-[#272727] p-5 overflow-hidden text-center shadow-lg">
        <div className="space-y-1">
          <p className="text-xs font-black uppercase tracking-wider text-white font-display">
            EL ANTOJO
          </p>
          <p className="text-xs font-black uppercase tracking-wider text-white font-display">
            TIENE UN SOLO
          </p>
          <p className="text-2xl font-black italic text-brand-yellow font-display drop-shadow-md">
            PUNTO G
          </p>
        </div>

        <div className="mt-4 flex justify-center">
          <div className="w-12 h-12 rounded-full bg-brand-yellow/10 border border-brand-yellow/30 flex items-center justify-center text-brand-yellow shadow-glow">
            <CategoryIcon name="burger" size={24} className="text-brand-yellow" />
          </div>
        </div>
      </div>

      {/* WhatsApp Help Box in Sidebar */}
      <div className="bg-[#121212] border border-[#242424] rounded-2xl p-5 text-center space-y-3.5 shadow-lg">
        <div className="w-10 h-10 mx-auto rounded-full bg-brand-whatsapp/20 border border-brand-whatsapp/40 flex items-center justify-center text-brand-whatsapp shadow-[0_0_15px_rgba(37,211,102,0.3)]">
          <MessageCircle className="w-5 h-5 fill-current" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white">¿Necesitas ayuda?</h4>
          <p className="text-xs text-gray-400 mt-1">
            Habla con nuestro asistente virtual y pide directamente.
          </p>
        </div>

        <a
          href={`https://api.whatsapp.com/send?phone=${restaurantInfo.whatsappNumber}&text=${encodeURIComponent(
            '¡Hola Punto G! Necesito ayuda con mi pedido.'
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 bg-brand-yellow hover:bg-brand-yellowHover text-black font-black text-xs py-2.5 px-4 rounded-xl shadow-glow transition-all transform hover:scale-102"
        >
          <MessageCircle className="w-3.5 h-3.5 fill-current" />
          <span>Chatear en WhatsApp</span>
        </a>
      </div>
    </aside>
  );
};
