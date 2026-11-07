import type { Metadata } from 'next';
import './globals.css';
import { TenantProvider } from '@/context/TenantContext';
import { CartProvider } from '@/context/CartContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { CartToast } from '@/components/cart/CartToast';
import { TableServiceBar } from '@/components/menu/TableServiceBar';

export const metadata: Metadata = {
  title: 'GastroNegocios | Plataforma y Software Integral para Restaurantes',
  description:
    'Sistema integral y plataforma de software gastronómico para restaurantes: menú digital QR interactivo, punto de venta (POS), comandas de cocina KDS, pedidos por WhatsApp y gestión multi-sede con 0% de comisiones.',
  keywords: [
    'GastroNegocios',
    'Software para restaurantes',
    'Carta digital QR',
    'Comandera meseros',
    'Sistema POS restaurante',
    'Pantalla de cocina KDS',
    'Pedidos WhatsApp restaurante'
  ],
  authors: [{ name: 'GastroNegocios' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark scroll-smooth">
      <body className="min-h-screen bg-[#080808] text-white flex flex-col antialiased selection:bg-brand-yellow selection:text-black">
        <TenantProvider>
          <CartProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <CartDrawer />
            <CartToast />
            <TableServiceBar />
          </CartProvider>
        </TenantProvider>
      </body>
    </html>
  );
}
