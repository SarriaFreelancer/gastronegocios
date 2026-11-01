import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { Sparkles, Flame, Heart, Award, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Nosotros | Punto G Cali',
  description: 'Conoce la historia, pasión y calidad gastronómica detrás de Punto G. Antojos Que Conectan en Cali.',
};

export default function NosotrosPage() {
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
            <span>Nuestra Historia</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase text-white font-display tracking-tight">
            SOMOS <span className="text-brand-yellow italic">PUNTO G</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 font-bold max-w-xl mx-auto">
            "ANTOJOS QUE CONECTAN"
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black uppercase text-white font-display tracking-wide">
              LA PASIÓN POR LA AUTÉNTICA COMIDA RÁPIDA
            </h2>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              En <strong className="text-brand-yellow">PUNTO G</strong> nacimos con una misión clara: romper con las comidas rápidas aburridas e industriales. Queríamos que cada hamburguesa, picada y salchipapa fuera una verdadera explosión de sabor, con carne 100% real, tocineta crujiente, quesos derretidos y salsas artesanales creadas en nuestra propia cocina.
            </p>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              Nos inspiramos en la energía urbana, la buena música, las reuniones entre amigos y el placer de comer sin culpas. Por eso nuestro lema es <em>Antojos que conectan</em>: porque la comida deliciosa tiene el poder de unir a las personas.
            </p>

            <div className="pt-2">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 bg-brand-yellow hover:bg-brand-yellowHover text-black font-black text-xs sm:text-sm uppercase px-7 py-3.5 rounded-full shadow-glow transition-all"
              >
                <span>EXPLORAR LA CARTA</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Image Composition */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden border-2 border-[#2b2b2b] shadow-2xl bg-[#121212]">
              <Image
                src="https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=900&auto=format&fit=crop"
                alt="Cocina y Hamburguesas Punto G"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 500px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                <div>
                  <span className="text-brand-yellow font-display text-2xl font-black">
                    CALIDAD Y FRESCURA 100%
                  </span>
                  <p className="text-xs text-gray-300">
                    Cali, Valle del Cauca.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pillars / Values Grid */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black uppercase text-brand-yellow font-display">
              NUESTROS PILARES
            </h3>
            <p className="text-xs sm:text-sm text-gray-400">
              Lo que nos hace diferentes y únicos en cada plato.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div
                key={i}
                className="bg-[#121212] border border-[#242424] hover:border-brand-yellow/50 rounded-2xl p-6 text-center space-y-3 transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-2xl bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow flex items-center justify-center mx-auto shadow-glow">
                  <v.icon className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-black text-white font-display uppercase">
                  {v.title}
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
