import type { Metadata } from 'next';
import './globals.css';
import { TenantProvider } from '@/context/TenantContext';
import { CartProvider } from '@/context/CartContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { CartToast } from '@/components/cart/CartToast';
import { TableServiceBar } from '@/components/menu/TableServiceBar';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { PwaProvider } from '@/components/pwa/PwaProvider';

function getSafeAppUrl(): URL {
  let raw = (process.env.NEXT_PUBLIC_APP_URL || 'https://gastronegocios.sarriatech.tech').trim();
  raw = raw.replace(/^["']|["']$/g, '');
  if (!raw) {
    raw = 'https://gastronegocios.sarriatech.tech';
  } else if (!raw.startsWith('http://') && !raw.startsWith('https://')) {
    raw = `https://${raw}`;
  }
  try {
    return new URL(raw);
  } catch {
    return new URL('https://gastronegocios.sarriatech.tech');
  }
}

const safeAppUrl = getSafeAppUrl();
const appUrl = safeAppUrl.origin;

export const metadata: Metadata = {
  metadataBase: safeAppUrl,
  title: {
    default: 'GastroNegocios | Plataforma y Software Integral para Restaurantes',
    template: '%s | GastroNegocios',
  },
  description:
    'Sistema integral y plataforma de software gastronómico para restaurantes: menú digital QR interactivo, punto de venta (POS), comandas de cocina KDS, pedidos por WhatsApp y gestión multi-sede con 0% de comisiones.',
  keywords: [
    'GastroNegocios',
    'Software para restaurantes',
    'Carta digital QR',
    'Comandera meseros',
    'Sistema POS restaurante',
    'Pantalla de cocina KDS',
    'Pedidos WhatsApp restaurante',
    'Restaurantes Colombia',
    'Restaurantes Cali',
  ],
  authors: [{ name: 'GastroNegocios' }],
  creator: 'SarriaTech Solutions S.A.S',
  publisher: 'GastroNegocios',
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
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
  openGraph: {
    title: 'GastroNegocios | Plataforma y Software Integral para Restaurantes',
    description:
      'Sistema operativo moderno para restaurantes: carta QR, punto de venta (POS), comandas de cocina KDS y facturación con 0% de comisiones.',
    url: appUrl,
    siteName: 'GastroNegocios',
    locale: 'es_CO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GastroNegocios | Plataforma y Software para Restaurantes',
    description: 'Menú digital interactivo, POS, comandas KDS y pedidos automáticos sin comisiones.',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'GastroNegociosVerificationKey',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'GastroNegocios',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web, Android, iOS, Windows, macOS',
  url: appUrl,
  description:
    'Plataforma SaaS integral para restaurantes, cafeterías y gastrobares: cartas digitales interactivas, punto de venta POS, pantallas de cocina KDS y pedidos por WhatsApp.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'COP',
    description: 'Prueba gratuita de 14 días sin comisiones por pedido.',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '128',
    reviewCount: '128',
  },
  publisher: {
    '@type': 'Organization',
    name: 'SarriaTech Solutions S.A.S',
    url: appUrl,
    logo: `${appUrl}/favicon.ico`,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="min-h-screen bg-[#080808] text-white flex flex-col antialiased selection:bg-brand-yellow selection:text-black">
        <GoogleAnalytics />
        <TenantProvider>
          <PwaProvider>
            <CartProvider>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
              <CartDrawer />
              <CartToast />
              <TableServiceBar />
            </CartProvider>
          </PwaProvider>
        </TenantProvider>
      </body>
    </html>
  );
}
