import React from 'react';
import { SaasLandingPage } from '@/components/saas/SaasLandingPage';

export const metadata = {
  title: 'Punto G SaaS | Plataforma de Software Gastronómico para Restaurantes',
  description: 'Sistema integral para restaurantes: cartas digitales interactivas, comandas en tiempo real, facturación electrónica y control administrativo.',
};

export default function RootHomePage() {
  return <SaasLandingPage />;
}
