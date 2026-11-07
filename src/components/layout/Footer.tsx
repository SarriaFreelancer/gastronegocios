'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { useTenant } from '@/context/TenantContext';
import { Clock, MapPin, MessageCircle, Shield, ChefHat, Lock } from 'lucide-react';
import { restaurantInfo } from '@/data/restaurant-info';

export const Footer: React.FC = () => {
  const pathname = usePathname();
  const { tenant } = useTenant();

  if (
    pathname === '/' ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/superadmin') ||
    pathname.startsWith('/login') ||
    pathname.includes('/cocina') ||
    pathname.includes('/mesero') ||
    pathname.includes('/entregas') ||
    pathname.includes('/pedidos-listos') ||
    pathname.includes('/turnero')
  ) {
    return null;
  }

  const rawPhone = (tenant?.telefonoWhatsapp || restaurantInfo.whatsappNumber).replace(/\D/g, '');
  const cleanPhone = rawPhone.length === 10 ? `57${rawPhone}` : rawPhone;
  const restName = tenant?.nombre || 'Punto G';
  const restDesc = tenant?.descripcion || 'Comidas rápidas gourmet. Hamburguesas artesanales, picadas generosas y parrilla con el auténtico sabor de la casa.';
  const restSchedule = tenant?.horarioAtencion || restaurantInfo.schedule;
  const restAddress = tenant?.direccionCentral || restaurantInfo.address;
  const restCity = tenant?.ciudad || restaurantInfo.city;

  return (
    <footer className="bg-[#050505] text-white border-t border-[#1c1c1c] pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-center pb-10 border-b border-[#1f1f1f]">
          {/* Col 1: Brand & Logo */}
          <div className="flex flex-col items-center md:items-start space-y-2">
            <Logo size="lg" />
            <p className="text-xs text-gray-400 text-center md:text-left pt-2 max-w-xs leading-relaxed">
              {restDesc}
            </p>
          </div>

          {/* Col 2: Horarios */}
          <div className="flex items-center gap-3.5 bg-[#0e0e0e] border border-[#222] p-4 rounded-xl">
            <div
              className="p-2.5 rounded-lg border flex-shrink-0"
              style={{
                backgroundColor: `${tenant?.colorPrimario || '#ffc928'}15`,
                borderColor: `${tenant?.colorPrimario || '#ffc928'}40`,
                color: tenant?.colorPrimario || '#ffc928',
              }}
            >
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Horario de Atención:</h4>
              <p className="text-sm font-semibold text-white mt-0.5">{restSchedule}</p>
            </div>
          </div>

          {/* Col 3: Dirección */}
          <div className="flex items-center gap-3.5 bg-[#0e0e0e] border border-[#222] p-4 rounded-xl">
            <div
              className="p-2.5 rounded-lg border flex-shrink-0"
              style={{
                backgroundColor: `${tenant?.colorPrimario || '#ffc928'}15`,
                borderColor: `${tenant?.colorPrimario || '#ffc928'}40`,
                color: tenant?.colorPrimario || '#ffc928',
              }}
            >
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Ubicación:</h4>
              <p className="text-sm font-semibold text-white mt-0.5">{restAddress}</p>
              <p className="text-xs font-medium" style={{ color: tenant?.colorPrimario || '#ffc928' }}>
                {restCity}
              </p>
            </div>
          </div>

          {/* Col 4: Redes y WhatsApp CTA */}
          <div className="flex flex-col items-center lg:items-end space-y-3">
            <a
              href={`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(
                `¡Hola ${restName}! Quiero información de pedidos.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-wider shadow-glow flex items-center gap-2 transition hover:scale-105 active:scale-95"
              style={{
                backgroundColor: tenant?.colorBoton || tenant?.colorPrimario || '#ffc928',
                color: tenant?.colorBotonTexto || '#000000',
              }}
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>WhatsApp Oficial</span>
            </a>
          </div>
        </div>

        {/* Bottom copyright & links */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} <strong className="text-gray-300">{restName}</strong>. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            <Link href={tenant?.slug ? `/r/${tenant.slug}/admin` : '/admin'} className="hover:text-gray-300 transition flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" />
              <span>Panel Administrativo</span>
            </Link>
            <Link href={tenant?.slug ? `/r/${tenant.slug}/rastreo` : '/rastreo'} className="hover:text-gray-300 transition">
              Rastrear Pedido
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
