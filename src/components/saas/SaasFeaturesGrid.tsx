'use client';

import React from 'react';
import {
  Monitor,
  ChefHat,
  QrCode,
  Layers,
  Scale,
  Smartphone,
  Receipt,
  Users,
  Bike,
  Printer,
  BarChart3,
  Building2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface FeatureItem {
  icon: any;
  title: string;
  badge: string;
  description: string;
  highlight: string;
  color: string;
}

const FEATURES: FeatureItem[] = [
  {
    icon: Monitor,
    title: 'POS & TPV Táctil Ultrarrápido',
    badge: 'Caja & Ventas',
    description: 'Facturación ágil en segundos, cobros combinados (efectivo, datáfono, transferencias Nequi/Daviplata) y división de cuentas por comensal.',
    highlight: 'Cierre ciego y arqueo automático',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: ChefHat,
    title: 'Pantalla de Cocina KDS Digital',
    badge: 'Producción',
    description: 'Elimina el papel térmico en cocina. Tiempos cronometrados por plato, alertas sonoras de nuevas comandas y estados en tiempo real.',
    highlight: '-35% en tiempos de preparación',
    color: 'from-red-500 to-rose-600',
  },
  {
    icon: QrCode,
    title: 'Menú Digital QR & Auto-Pedido',
    badge: 'Experiencia',
    description: 'Tus clientes escanean el QR desde la mesa, exploran fotos 3D y platos destacados, seleccionan adicionales y piden directamente.',
    highlight: '0% comisiones a terceros',
    color: 'from-orange-500 to-amber-500',
  },
  {
    icon: Layers,
    title: 'Inventario Inteligente & Mermas',
    badge: 'Control',
    description: 'Descuento automático de existencias por cada plato vendido. Alertas preventivas antes de que se agoten tus insumos clave.',
    highlight: 'Cero pérdidas por descuadre',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Scale,
    title: 'Escandallos & Costeo de Recetas',
    badge: 'Rentabilidad',
    description: 'Calcula el costo exacto de cada gramo e ingrediente de tus recetas. Conoce tu margen bruto y fija precios con rigor científico.',
    highlight: 'Margen y utilidad en tiempo real',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    icon: Smartphone,
    title: 'Comandera Móvil para Meseros',
    badge: 'Servicio',
    description: 'Tu equipo toma comandas desde cualquier celular o tablet. El pedido llega instantáneamente a la pantalla de cocina o barra.',
    highlight: 'Mesas liberadas un 40% más rápido',
    color: 'from-purple-500 to-violet-500',
  },
  {
    icon: Receipt,
    title: 'Control de Cajas, Turnos & Gastos',
    badge: 'Finanzas',
    description: 'Auditoría de aperturas, retiros de caja menor, pagos a proveedores y cierres de turno con desglose por método de pago.',
    highlight: 'Reporte diario enviado a tu email',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: Users,
    title: 'CRM & Fidelización de Clientes',
    badge: 'Marketing',
    description: 'Historial de consumo por cliente, platos favoritos, fechas de cumpleaños y sistema de puntos para incentivar la recompra.',
    highlight: '+28% en frecuencia de visita',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    icon: Bike,
    title: 'Módulo Delivery & WhatsApp',
    badge: 'Despachos',
    description: 'Recibe pedidos a domicilio directamente por WhatsApp o web propia sin intermediarios ni pagar el 30% a apps de domicilios.',
    highlight: 'Ahorro millonario en comisiones',
    color: 'from-green-500 to-emerald-600',
  },
  {
    icon: Printer,
    title: 'Impresión Térmica ESC/POS & Factura',
    badge: 'Hardware',
    description: 'Compatible con impresoras de 58mm y 80mm por Bluetooth, USB o Red Ethernet. Pre-cuentas, comandas y tickets de venta.',
    highlight: 'Conexión universal plug-and-play',
    color: 'from-slate-400 to-gray-500',
  },
  {
    icon: BarChart3,
    title: 'Business Intelligence & Métricas',
    badge: 'Estrategia',
    description: 'Gráficos interactivos de horas pico, productos más vendidos, rotación de mesas y desempeño del personal.',
    highlight: 'Decisiones basadas en datos reales',
    color: 'from-violet-500 to-purple-600',
  },
  {
    icon: Building2,
    title: 'Multi-Restaurante & Franquicias',
    badge: 'Expansión',
    description: 'Administra múltiples marcas o sucursales con una sola cuenta. Cambia de restaurante al instante con seguridad aislada.',
    highlight: 'Escalabilidad sin límites',
    color: 'from-amber-400 to-orange-600',
  },
];

export function SaasFeaturesGrid() {
  return (
    <section id="funcionalidades" className="relative py-24 bg-[#0A0C14] text-white overflow-hidden border-t border-white/5">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-red-600/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E53E3E] text-white text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(229,62,62,0.4)] mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Suite Gastronómica Completa</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] font-display">
            Todo lo que tu restaurante necesita, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-400">
              en una sola plataforma
            </span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-gray-300 font-normal">
            Diseñado exclusivamente para el sector gastronómico: restaurantes, gastrobares, cadenas de comidas rápidas y dark kitchens.
          </p>
        </div>

        {/* 12 Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="group relative rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/15 p-6 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-2xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} p-0.5 shadow-md flex items-center justify-center`}
                    >
                      <div className="w-full h-full bg-[#0C0F1A] rounded-[10px] flex items-center justify-center group-hover:bg-transparent transition-colors">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors font-display">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-normal mb-4">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1">
                    ✓ {item.highlight}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA bar */}
        <div className="mt-12 text-center">
          <Link
            href="/registro"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm transition shadow-lg"
          >
            <span>Crear mi restaurante y probar todas las funciones</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </Link>
        </div>

      </div>
    </section>
  );
}
