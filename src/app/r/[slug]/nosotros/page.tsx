'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTenant } from '@/context/TenantContext';
import { Sparkles, Flame, Heart, Award, ArrowRight, Clock, MapPin, ShieldCheck, Utensils } from 'lucide-react';

export default function TenantNosotrosPage() {
  const params = useParams();
  const slug = ((params?.slug as string) || 'punto-g').toLowerCase().trim();

  const { restaurant } = useTenant();
  const restaurantName = restaurant?.nombre || 'Restaurante';
  const primaryColor = restaurant?.colorPrimario || '#EAA622';
  const buttonColor = restaurant?.colorBoton || primaryColor;
  const buttonTextColor = restaurant?.colorBotonTexto || '#000000';
  const slogan = restaurant?.eslogan || 'Pasión y Sabor Artesanal';
  const description = restaurant?.descripcion || 'Preparamos los mejores platos y recetas de la casa con ingredientes frescos y dedicación.';
  const heroImage = restaurant?.bannerHero || restaurant?.imagenHero || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop';

  const values = [
    {
      icon: Flame,
      title: 'Sabor Auténtico',
      desc: 'Nuestras recetas se elaboran al momento con sazón propia, garantizando un sabor inconfundible y fresco.',
    },
    {
      icon: Award,
      title: 'Ingredientes de Primera',
      desc: 'Seleccionamos carnes de calidad, vegetales frescos y panes artesanales horneados para cada preparación.',
    },
    {
      icon: Sparkles,
      title: 'Experiencia Gastronómica',
      desc: `En ${restaurantName} combinamos porciones generosas, presentación impecable y una atención dedicada a cada cliente.`,
    },
    {
      icon: Heart,
      title: 'Amor por el Detalle',
      desc: 'Cuidamos cada plato desde la cocina hasta tu mesa o tu casa para que lo disfrutes en su punto exacto.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#080808] pt-24 pb-16">
      
      {/* Hero Banner */}
      <div className="relative border-b border-[#202020] py-16 mb-12 overflow-hidden">
        {/* Ambient glow with tenant color */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-60 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: primaryColor }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 relative z-10">
          <div 
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-xs font-bold uppercase tracking-wider"
            style={{ 
              backgroundColor: `${primaryColor}15`, 
              borderColor: `${primaryColor}40`, 
              color: primaryColor 
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nuestra Historia & Filosofía</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase text-white font-display tracking-tight">
            LA PASIÓN DETRÁS DE{' '}
            <span className="italic" style={{ color: primaryColor }}>
              {restaurantName}
            </span>
          </h1>

          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <span 
              className="text-xs font-bold uppercase tracking-widest font-mono"
              style={{ color: primaryColor }}
            >
              // NUESTRA ESENCIA
            </span>

            <h2 className="text-3xl sm:text-4xl font-black text-white font-display uppercase tracking-tight">
              MÁS QUE COMIDA,{' '}
              <span style={{ color: primaryColor }}>
                UNA EXPERIENCIA INOLVIDABLE
              </span>
            </h2>

            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              En <strong className="text-white">{restaurantName}</strong> entendemos que disfrutar de una buena comida es un ritual especial. Por eso preparamos cada receta con recetas exclusivas, ingredientes frescos y las salsas que nos caracterizan.
            </p>

            <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
              Ya sea visitando nuestras sedes o pidiendo a domicilio, cuidamos cada segundo del proceso para que la temperatura, crocancia y sabor lleguen a ti intactos.
            </p>

            <div className="pt-2">
              <Link
                href={`/r/${slug}/menu`}
                className="inline-flex items-center gap-2 px-7 py-3.5 font-black text-xs uppercase tracking-wider rounded-full shadow-lg transition transform hover:scale-105"
                style={{ backgroundColor: buttonColor, color: buttonTextColor }}
              >
                <span>Explorar la Carta</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-[#222] shadow-2xl">
            <div 
              className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 pointer-events-none" 
            />
            <Image
              src={heroImage}
              alt={`Ambiente y Sabor ${restaurantName}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute bottom-6 left-6 z-20">
              <span 
                className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow"
                style={{ backgroundColor: primaryColor, color: buttonTextColor }}
              >
                {slogan}
              </span>
            </div>
          </div>
        </div>

        {/* Values Grid */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-white uppercase font-display">
              LO QUE NOS DEFINE EN{' '}
              <span style={{ color: primaryColor }}>{restaurantName.toUpperCase()}</span>
            </h3>
            <p className="text-xs sm:text-sm text-gray-400">Nuestros pilares fundamentales en cada despacho</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => {
              const IconComp = v.icon;
              return (
                <div
                  key={i}
                  className="bg-[#121212] border border-[#222] hover:border-white/30 rounded-3xl p-6 space-y-3 transition-all group"
                >
                  <div 
                    className="w-12 h-12 rounded-2xl border flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ 
                      backgroundColor: `${primaryColor}15`, 
                      borderColor: `${primaryColor}40`, 
                      color: primaryColor 
                    }}
                  >
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-white uppercase">{v.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Commitment Banner */}
        <div 
          className="rounded-3xl p-8 sm:p-12 border text-center space-y-4 shadow-2xl relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}15 0%, #141414 50%, #0d0d0d 100%)`,
            borderColor: `${primaryColor}40`,
          }}
        >
          <div className="relative z-10 space-y-3 max-w-2xl mx-auto">
            <h3 className="text-2xl sm:text-4xl font-black text-white uppercase font-display">
              ¿Listo para comprobarlo?
            </h3>
            <p className="text-sm text-gray-300">
              Pide tus platos favoritos en línea y disfruta de la mejor comida rápida gourmet directamente en tu mesa o puerta.
            </p>
            <div className="pt-2">
              <Link
                href={`/r/${slug}/menu`}
                className="inline-flex items-center gap-2 px-8 py-4 font-black text-xs uppercase tracking-wider rounded-full shadow-lg transition transform hover:scale-105"
                style={{ backgroundColor: buttonColor, color: buttonTextColor }}
              >
                <Utensils className="w-4 h-4" />
                <span>Hacer un Pedido Ahora</span>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
