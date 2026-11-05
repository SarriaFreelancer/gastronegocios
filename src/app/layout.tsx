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
  title: 'Punto G | Antojos Que Conectan | Comidas Rápidas',
  description:
    'Restaurante de comidas rápidas gourmet en Cali: hamburguesas artesanales, picadas, salchipapas, perros calientes, parrillas al carbón, bebidas y cócteles. Haz tu pedido por WhatsApp.',
  keywords: [
    'Punto G',
    'Hamburguesas Cali',
    'Comidas Rápidas',
    'Picadas',
    'Salchipapas',
    'Perros calientes',
    'Parrilladas',
    'Domicilios Cali'
  ],
  authors: [{ name: 'Punto G' }],
  icons: {
    icon: '/favicon.ico',
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
