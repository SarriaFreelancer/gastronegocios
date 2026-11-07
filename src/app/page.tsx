import React from 'react';
import { SaasLandingPage } from '@/components/saas/SaasLandingPage';

export const metadata = {
  title: 'GastroNegocios | Plataforma y Software Integral para Restaurantes',
  description: 'Sistema Operativo Gastronómico: Carta digital interactiva QR, comandas en tiempo real (KDS), POS y facturación, panel para meseros y pedidos por WhatsApp sin comisiones.',
};

export default function RootHomePage() {
  return <SaasLandingPage />;
}
