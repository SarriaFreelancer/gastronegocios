import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import React from 'react';

interface Props {
  params: { slug: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (params.slug || 'punto-g').toLowerCase().trim();

  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
      select: {
        nombre: true,
        eslogan: true,
        descripcion: true,
        logo: true,
        bannerHero: true,
        favicon: true,
        seoTitulo: true,
        seoDescripcion: true,
        seoKeywords: true,
        seoImagenCompartir: true,
        seoUrlCanonica: true,
        googleSearchConsoleCode: true,
      },
    });

    if (!restaurant) {
      return {
        title: 'Restaurante | Menú & Pedidos Online',
        description: 'Pide en línea en los mejores restaurantes.',
      };
    }

    const title = restaurant.seoTitulo || `${restaurant.nombre} | ${restaurant.eslogan || 'Menú & Domicilios Online'}`;
    const description = restaurant.seoDescripcion || restaurant.descripcion || `Pide tu comida a domicilio en ${restaurant.nombre}. Carta completa y domicilios rápidos.`;
    const shareImage = restaurant.seoImagenCompartir || restaurant.bannerHero || restaurant.logo || '/images/hero-burger.png';
    const canonical = restaurant.seoUrlCanonica || `https://puntog.com/r/${slug}`;
    const keywords = restaurant.seoKeywords
      ? restaurant.seoKeywords.split(',').map((k: string) => k.trim())
      : [restaurant.nombre, 'restaurante', 'domicilios', 'comida rapida', 'menu digital'];

    return {
      title,
      description,
      keywords,
      alternates: {
        canonical,
      },
      icons: {
        icon: restaurant.favicon || '/favicon.ico',
        shortcut: restaurant.favicon || '/favicon.ico',
      },
      openGraph: {
        title,
        description,
        url: canonical,
        siteName: restaurant.nombre,
        images: [
          {
            url: shareImage,
            width: 1200,
            height: 630,
            alt: restaurant.nombre,
          },
        ],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [shareImage],
      },
      verification: restaurant.googleSearchConsoleCode
        ? {
            google: restaurant.googleSearchConsoleCode,
          }
        : undefined,
    };
  } catch (error) {
    return {
      title: 'Restaurante | Menú & Pedidos',
      description: 'Pide tus platos favoritos en línea.',
    };
  }
}

export default async function TenantLayout({ params, children }: Props) {
  const slug = (params.slug || 'punto-g').toLowerCase().trim();

  let schemaJson: any = null;

  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
      include: {
        branches: {
          take: 5,
        },
      },
    });

    if (restaurant) {
      const isExpired = restaurant.fechaVencimiento && new Date(restaurant.fechaVencimiento) < new Date();
      if (!restaurant.activo || restaurant.estadoLicencia === 'SUSPENDIDA' || isExpired) {
        return (
          <div className="min-h-screen bg-[#080808] flex items-center justify-center p-6 text-white font-sans text-center">
            <div className="bg-[#121212] border border-red-500/30 rounded-3xl p-8 max-w-md w-full space-y-5 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-red-600/15 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-black uppercase text-white font-display">
                  Servicio Temporalmente Suspendido
                </h2>
                <p className="text-xs text-gray-400 leading-relaxed">
                  El servicio digital de <strong>{restaurant.nombre}</strong> se encuentra temporalmente inactivo o pendiente de renovación de suscripción.
                </p>
              </div>
              <div className="pt-2">
                <a
                  href={`https://wa.me/57${(restaurant.telefonoWhatsapp || '3229088736').replace(/\D/g, '')}?text=${encodeURIComponent('Hola, quisiera consultar sobre el estado del servicio de ' + restaurant.nombre)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-xs uppercase tracking-wider shadow-glow hover:scale-105 transition"
                >
                  Contactar al Restaurante
                </a>
              </div>
            </div>
          </div>
        );
      }

      const type = restaurant.seoTipoNegocio || 'Restaurant';
      schemaJson = {
        '@context': 'https://schema.org',
        '@type': type,
        name: restaurant.nombre,
        description: restaurant.seoDescripcion || restaurant.descripcion || restaurant.eslogan,
        image: restaurant.seoImagenCompartir || restaurant.bannerHero || restaurant.logo,
        telephone: restaurant.telefonoWhatsapp || undefined,
        address: {
          '@type': 'PostalAddress',
          streetAddress: restaurant.direccionCentral || 'Principal',
          addressLocality: restaurant.ciudad || 'Cali',
          addressCountry: 'CO',
        },
        servesCuisine: restaurant.eslogan || 'Comida Artesanal & Parrilla',
        priceRange: '$$',
        currenciesAccepted: 'COP',
        paymentAccepted: 'Cash, Credit Card, Nequi, Daviplata, PSE',
        openingHours: restaurant.horarioAtencion || 'Mo-Su 12:00-23:30',
        url: restaurant.seoUrlCanonica || `https://puntog.com/r/${slug}`,
        hasMenu: `https://puntog.com/r/${slug}/menu`,
      };
    }
  } catch (e) {
    // Graceful fallback
  }

  return (
    <>
      {schemaJson && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
        />
      )}
      {children}
    </>
  );
}
