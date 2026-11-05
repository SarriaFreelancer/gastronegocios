'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { Sparkles, Flame, Heart, Award, ArrowRight } from 'lucide-react';

export default function TenantNosotrosPage() {
  const params = useParams();
  const slug = ((params?.slug as string) || 'punto-g').toLowerCase().trim();
  const [restaurantName, setRestaurantName] = useState<string>('Punto G');

  useEffect(() => {
    fetch(`/api/restaurants?slug=${slug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.restaurant?.nombre) {
          setRestaurantName(data.restaurant.nombre);
        }
      })
      .catch(() => {});
  }, [slug]);

  const values = [
    {
      icon: Flame,
      title: 'Sabor al Carbón',
      desc: 'Nuestras carnes y recetas pasan por procesos de marinado y cocción a la brasa que garantizan el auténtico sabor ahumado.',
    },
    {
      icon: Award,
      title: 'Ingredientes Premium',
      desc: 'Pan artesanal horneado a diario, vegetales frescos del campo y quesos de origen seleccionado sin conservantes artificiales.',
    },
    {
      icon: Sparkles,
      title: 'Espíritu Urbano',
      desc: 'Una marca divertida, atrevida y moderna hecha para los verdaderos amantes del buen comer y los momentos compartidos.',
    },
    {
      icon: Heart,
      title: 'Pasión por el Detalle',
      desc: 'Cada plato sale de cocina con la proporción ideal de ingredientes, salsas generosas y temperatura perfecta.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#080808] pt-24 pb-16">
      
      {/* Hero */}
      <div className="relative bg-gradient-to-r from-[#0c0c0c] via-[#141414] to-[#080808] border-b border-[#202020] py-16 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nuestra Historia & Filosofía</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase text-white font-display tracking-tight">
            LA PASIÓN DETRÁS DE <span className="text-brand-yellow italic">{restaurantName}</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Nacimos con una sola obsesión: elevar las comidas rápidas a su máxima expresión gourmet. Sabores que sorprenden, porciones generosas y una vibra inigualable.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <span className="text-xs font-bold text-brand-yellow uppercase tracking-widest font-mono">
              // DESDE EL PRIMER DÍA
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white font-display uppercase tracking-tight">
              MÁS QUE COMIDA RÁPIDA, <span className="text-brand-yellow">UNA EXPERIENCIA</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              En {restaurantName} entendemos que comer rico no es solo saciar el hambre, sino un ritual de disfrute. Por eso diseñamos cada receta desde cero: carnes 100% de res seleccionada con molienda propia, tocineta ahumada crujiente, salsas de la casa y un pan brioche suave que abraza cada bocado.
            </p>
            <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
              Ya sea en nuestras sedes o pidiendo a domicilio, cuidamos cada segundo del proceso para que la temperatura, crocancia y sabor lleguen a ti intactos.
            </p>
            <div className="pt-2">
              <Link
                href={`/r/${slug}/menu`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-yellow text-black font-black text-xs uppercase tracking-wider rounded-full shadow-glow hover:bg-yellow-400 transition"
              >
                <span>Explorar la Carta</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-[#222] shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=900&auto=format&fit=crop"
              alt={`Ambiente y Sabor ${restaurantName}`}
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Pillars / Values Grid */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-white uppercase font-display">
              NUESTROS PILARES DE <span className="text-brand-yellow">CALIDAD</span>
            </h3>
            <p className="text-xs sm:text-sm text-gray-400">Lo que hace única cada preparación en nuestra cocina.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <div
                  key={i}
                  className="bg-[#121212] border border-[#222] rounded-3xl p-6 space-y-3 hover:border-brand-yellow/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-2xl bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-black text-white uppercase font-display">{v.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
