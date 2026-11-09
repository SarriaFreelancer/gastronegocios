import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import React from 'react';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';

interface Props {
  params: { slug: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const rawSlug = (params.slug || 'punto-g').toLowerCase().trim();
  const slugWithHyphen = rawSlug === 'puntog' ? 'punto-g' : rawSlug;
  const slugWithoutHyphen = rawSlug.replace(/-/g, '');
  const slugAlias = rawSlug === 'puntog' ? 'punto-g' : (rawSlug === 'don-carbon-parrilla' || rawSlug === 'doncarbon') ? 'bryan' : rawSlug;

  try {
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        OR: [
          { slug: rawSlug },
          { slug: slugWithHyphen },
          { slug: slugAlias },
          { subdominio: rawSlug },
          { subdominio: slugWithoutHyphen },
          { subdominio: slugAlias },
        ],
      },
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
        googleAnalyticsId: true,
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
    const canonical = restaurant.seoUrlCanonica || `https://puntog.com/r/${rawSlug}`;
    const keywords = restaurant.seoKeywords
      ? restaurant.seoKeywords.split(',').map((k: string) => k.trim())
      : [restaurant.nombre, 'restaurante', 'domicilios', 'comida rapida', 'menu digital'];

    return {
      title,
      description,
      keywords,
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
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
  const rawSlug = (params.slug || 'punto-g').toLowerCase().trim();
  const slugWithHyphen = rawSlug === 'puntog' ? 'punto-g' : rawSlug;
  const slugWithoutHyphen = rawSlug.replace(/-/g, '');
  const slugAlias = rawSlug === 'puntog' ? 'punto-g' : (rawSlug === 'don-carbon-parrilla' || rawSlug === 'doncarbon') ? 'bryan' : rawSlug;
  const slug = slugWithHyphen;

  let schemaJson: any = null;
  let gaId: string | null = null;

  try {
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        OR: [
          { slug: rawSlug },
          { slug: slugWithHyphen },
          { slug: slugAlias },
          { subdominio: rawSlug },
          { subdominio: slugWithoutHyphen },
          { subdominio: slugAlias },
        ],
      },
      include: {
        branches: {
          where: { activo: true },
          take: 10,
        },
      },
    });

    if (restaurant) {
      gaId = restaurant.googleAnalyticsId || null;
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

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const restaurantUrl = restaurant.seoUrlCanonica || `${baseUrl}/r/${slug}`;
      const menuUrl = `${baseUrl}/r/${slug}/menu`;

      schemaJson = {
        '@context': 'https://schema.org',
        '@type': ['Restaurant', 'FastFoodRestaurant', 'LocalBusiness'],
        '@id': restaurantUrl,
        name: restaurant.nombre,
        description: restaurant.seoDescripcion || restaurant.descripcion || restaurant.eslogan,
        image: restaurant.seoImagenCompartir || restaurant.bannerHero || restaurant.logo || `${baseUrl}/favicon.ico`,
        logo: restaurant.logo || `${baseUrl}/favicon.ico`,
        telephone: restaurant.telefonoWhatsapp ? `+57${restaurant.telefonoWhatsapp.replace(/\D/g, '')}` : '+573229088736',
        address: {
          '@type': 'PostalAddress',
          streetAddress: restaurant.direccionCentral || 'Principal',
          addressLocality: restaurant.ciudad || 'Cali',
          addressRegion: 'Valle del Cauca',
          postalCode: '760001',
          addressCountry: 'CO',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 3.4516,
          longitude: -76.5320,
        },
        servesCuisine: [
          restaurant.eslogan || 'Comida Rápida',
          'Hamburguesas',
          'Parrilla',
          'Salchipapas',
        ],
        priceRange: '$$',
        currenciesAccepted: 'COP',
        paymentAccepted: 'Cash, Credit Card, Nequi, Daviplata, Bancolombia, PSE',
        openingHours: restaurant.horarioAtencion || 'Mo-Su 12:00-23:30',
        url: restaurantUrl,
        hasMenu: menuUrl,
        menu: menuUrl,
        acceptsReservations: 'True',
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          reviewCount: '95',
          bestRating: '5',
          worstRating: '1',
        },
        potentialAction: {
          '@type': 'OrderAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: menuUrl,
            inLanguage: 'es-CO',
            actionPlatform: [
              'http://schema.org/DesktopWebPlatform',
              'http://schema.org/MobileWebPlatform',
              'http://schema.org/IOSPlatform',
              'http://schema.org/AndroidPlatform',
            ],
          },
          deliveryMethod: [
            'http://purl.org/goodrelations/v1#DeliveryModeDirectDownload',
            'http://purl.org/goodrelations/v1#DeliveryModePickUp',
          ],
        },
        ...(restaurant.branches && restaurant.branches.length > 0 ? {
          department: restaurant.branches.map((b) => ({
            '@type': 'Restaurant',
            name: `${restaurant.nombre} - ${b.nombre}`,
            telephone: b.telefono || restaurant.telefonoWhatsapp,
            address: {
              '@type': 'PostalAddress',
              streetAddress: b.direccion || restaurant.direccionCentral,
              addressLocality: b.ciudad || restaurant.ciudad || 'Cali',
              addressCountry: 'CO',
            },
          })),
        } : {}),
      };
    }
  } catch (e) {
    // Graceful fallback
  }

  return (
    <>
      <GoogleAnalytics measurementId={gaId} />
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
