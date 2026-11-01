import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { Clock, MapPin, MessageCircle, Shield } from 'lucide-react';
import { restaurantInfo } from '@/data/restaurant-info';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#050505] text-white border-t border-[#1c1c1c] pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-center pb-10 border-b border-[#1f1f1f]">
          {/* Col 1: Brand & Logo */}
          <div className="flex flex-col items-center md:items-start space-y-2">
            <Logo size="lg" />
            <p className="text-xs text-gray-400 text-center md:text-left pt-2 max-w-xs leading-relaxed">
              Comidas rápidas gourmet en Cali. Hamburguesas jugosas, picadas generosas y parrilla con el auténtico sabor de la casa.
            </p>
          </div>

          {/* Col 2: Horarios */}
          <div className="flex items-center gap-3.5 bg-[#0e0e0e] border border-[#222] p-4 rounded-xl">
            <div className="p-2.5 rounded-lg bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/30 flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Horario de Atención:</h4>
              <p className="text-sm font-semibold text-white mt-0.5">{restaurantInfo.schedule}</p>
            </div>
          </div>

          {/* Col 3: Dirección */}
          <div className="flex items-center gap-3.5 bg-[#0e0e0e] border border-[#222] p-4 rounded-xl">
            <div className="p-2.5 rounded-lg bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/30 flex-shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Ubicación:</h4>
              <p className="text-sm font-semibold text-white mt-0.5">{restaurantInfo.address}</p>
              <p className="text-xs text-brand-yellow font-medium">{restaurantInfo.city}</p>
            </div>
          </div>

          {/* Col 4: Redes y WhatsApp CTA */}
          <div className="flex flex-col items-center lg:items-end space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Síguenos en:</span>
              <div className="flex items-center gap-2">
                {/* Facebook */}
                <a
                  href={restaurantInfo.socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#181818] border border-[#2b2b2b] flex items-center justify-center text-gray-300 hover:text-brand-yellow hover:border-brand-yellow transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                {/* Instagram */}
                <a
                  href={restaurantInfo.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#181818] border border-[#2b2b2b] flex items-center justify-center text-gray-300 hover:text-brand-yellow hover:border-brand-yellow transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                {/* TikTok */}
                <a
                  href={restaurantInfo.socials.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#181818] border border-[#2b2b2b] flex items-center justify-center text-gray-300 hover:text-brand-yellow hover:border-brand-yellow transition-colors"
                  aria-label="TikTok"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Pedidos por WhatsApp button */}
            <a
              href={`https://api.whatsapp.com/send?phone=${restaurantInfo.whatsappNumber}&text=${encodeURIComponent(
                '¡Hola Punto G! Quiero hacer un pedido.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-brand-yellow hover:bg-brand-yellowHover text-black font-extrabold text-xs px-5 py-2.5 rounded-full shadow-glow transition-transform hover:scale-105"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Pedidos por WhatsApp ({restaurantInfo.phone})</span>
            </a>
          </div>
        </div>

        {/* Bottom copyright & admin link */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© 2025 Punto G. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <Link 
              href="/admin" 
              className="inline-flex items-center gap-1.5 text-gray-500 hover:text-brand-yellow transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Panel Administrativo</span>
            </Link>
            <p className="flex items-center gap-1">
              Diseñado con <span className="text-red-500">❤️</span> para los amantes de la buena comida.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
