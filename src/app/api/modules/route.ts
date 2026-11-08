import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export interface ModuleDefinition {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  requiere?: string[];
  activoPorDefecto: boolean;
  categoria: 'operativo' | 'gestion' | 'comercial' | 'analitica';
}

export const SYSTEM_MODULES: ModuleDefinition[] = [
  {
    id: 'pos',
    nombre: 'Ventas y Punto de Venta (POS)',
    descripcion: 'Cobro rápido, comandas de mesas, barra, delivery y medios de pago.',
    icono: 'ShoppingCart',
    activoPorDefecto: true,
    categoria: 'operativo',
  },
  {
    id: 'kds',
    nombre: 'Pantalla de Cocina (KDS)',
    descripcion: 'Comandero en tiempo real para jefes de cocina y líneas de despacho.',
    icono: 'UtensilsCrossed',
    requiere: ['pos'],
    activoPorDefecto: true,
    categoria: 'operativo',
  },
  {
    id: 'mesero',
    nombre: 'Comandero Móvil de Mesero',
    descripcion: 'Toma de pedidos en mesa con sincronización inmediata a cocina y caja.',
    icono: 'TabletSmartphone',
    requiere: ['pos'],
    activoPorDefecto: true,
    categoria: 'operativo',
  },
  {
    id: 'menu_digital',
    nombre: 'Menú Digital QR / Carta Web',
    descripcion: 'Carta interactiva para comensales en mesa o a domicilio con pedidos online.',
    icono: 'QrCode',
    activoPorDefecto: true,
    categoria: 'comercial',
  },
  {
    id: 'insumos',
    nombre: 'Inventario Inteligente de Insumos',
    descripcion: 'Control de materias primas, mermas, stock mínimo, alertas FEFO y Kardex auditado.',
    icono: 'Boxes',
    activoPorDefecto: true,
    categoria: 'gestion',
  },
  {
    id: 'recetas',
    nombre: 'Recetas Técnicas y Costeo (BOM)',
    descripcion: 'Estructura de platos, cálculo de costo unitario, márgenes y descarga automática.',
    icono: 'BookOpenCheck',
    requiere: ['insumos'],
    activoPorDefecto: true,
    categoria: 'gestion',
  },
  {
    id: 'compras',
    nombre: 'Compras y Proveedores',
    descripcion: 'Entradas de almacén, órdenes de compra, cálculo de costo promedio ponderado.',
    icono: 'Truck',
    requiere: ['insumos'],
    activoPorDefecto: true,
    categoria: 'gestion',
  },
  {
    id: 'clientes',
    nombre: 'Clientes y Fidelización',
    descripcion: 'Directorio de clientes, historial de consumo, límites de crédito y puntos.',
    icono: 'Users',
    activoPorDefecto: true,
    categoria: 'comercial',
  },
  {
    id: 'reportes',
    nombre: 'Reportes y Analítica Ejecutiva',
    descripcion: 'Márgenes de ganancia reales, análisis de rotación, alertas operativas y exportación.',
    icono: 'TrendingUp',
    activoPorDefecto: true,
    categoria: 'analitica',
  },
  {
    id: 'facturacion_electronica',
    nombre: 'Facturación Electrónica DIAN / Fiscal',
    descripcion: 'Emisión de facturas fiscales electrónicas y documentos soporte.',
    icono: 'ReceiptText',
    requiere: ['pos'],
    activoPorDefecto: false,
    categoria: 'gestion',
  },
  {
    id: 'delivery',
    nombre: 'Gestión de Domicilios y Despacho',
    descripcion: 'Rastreo de repartidores, tiempos de entrega y direcciones de clientes.',
    icono: 'Bike',
    requiere: ['pos'],
    activoPorDefecto: true,
    categoria: 'operativo',
  },
];

export const DEFAULT_MODULES_STATE: Record<string, boolean> = SYSTEM_MODULES.reduce(
  (acc, mod) => {
    acc[mod.id] = mod.activoPorDefecto;
    return acc;
  },
  {} as Record<string, boolean>
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get('restaurantId');
    const restaurantSlug = searchParams.get('restaurantSlug');

    let resolvedRestaurantId: number | null = restaurantId ? Number(restaurantId) : null;
    if (!resolvedRestaurantId && restaurantSlug) {
      const rest = await prisma.restaurant.findUnique({
        where: { slug: restaurantSlug },
        select: { id: true },
      });
      if (rest) resolvedRestaurantId = rest.id;
    }

    if (!resolvedRestaurantId) {
      return NextResponse.json({ error: 'restaurantId es obligatorio' }, { status: 400 });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: resolvedRestaurantId },
      select: {
        id: true,
        nombre: true,
        modulosHabilitados: true,
        aparienciaMenu: true,
        politicaStockNegativo: true,
        diasAnticipacionVencimiento: true,
      },
    });

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurante no encontrado' }, { status: 404 });
    }

    let currentModules = DEFAULT_MODULES_STATE;
    if (restaurant.modulosHabilitados) {
      try {
        currentModules = JSON.parse(restaurant.modulosHabilitados);
      } catch {}
    }

    return NextResponse.json({
      modules: SYSTEM_MODULES,
      enabledModules: currentModules,
      settings: {
        aparienciaMenu: restaurant.aparienciaMenu || 'clasico',
        politicaStockNegativo: restaurant.politicaStockNegativo || 'BLOQUEAR',
        diasAnticipacionVencimiento: restaurant.diasAnticipacionVencimiento || 7,
      },
    });
  } catch (error: any) {
    console.error('Error fetching modules:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      restaurantId,
      enabledModules,
      aparienciaMenu,
      politicaStockNegativo,
      diasAnticipacionVencimiento,
    } = body;

    const restId = Number(restaurantId);

    if (!restId) {
      return NextResponse.json({ error: 'restaurantId es obligatorio' }, { status: 400 });
    }

    const currentSettings = await prisma.restaurant.findUnique({
      where: { id: restId },
    });
    if (!currentSettings) {
      return NextResponse.json({ error: 'Restaurante no encontrado' }, { status: 404 });
    }

    let existingModules: Record<string, boolean> = DEFAULT_MODULES_STATE;
    if (currentSettings.modulosHabilitados) {
      try {
        existingModules = JSON.parse(currentSettings.modulosHabilitados);
      } catch {}
    }

    const newEnabledState = {
      ...existingModules,
      ...(enabledModules || {}),
    };

    const warnings: string[] = [];

    for (const mod of SYSTEM_MODULES) {
      if (mod.requiere && newEnabledState[mod.id]) {
        for (const reqMod of mod.requiere) {
          if (!newEnabledState[reqMod]) {
            const reqDef = SYSTEM_MODULES.find((m) => m.id === reqMod);
            warnings.push(
              `El módulo "${mod.nombre}" requiere que "${reqDef?.nombre || reqMod}" esté activo. Se activó automáticamente.`
            );
            newEnabledState[reqMod] = true;
          }
        }
      }
    }

    const updated = await prisma.restaurant.update({
      where: { id: restId },
      data: {
        modulosHabilitados: JSON.stringify(newEnabledState),
        aparienciaMenu: aparienciaMenu !== undefined ? aparienciaMenu : undefined,
        politicaStockNegativo: politicaStockNegativo !== undefined ? politicaStockNegativo : undefined,
        diasAnticipacionVencimiento:
          diasAnticipacionVencimiento !== undefined ? Number(diasAnticipacionVencimiento) : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      enabledModules: newEnabledState,
      settings: {
        aparienciaMenu: updated.aparienciaMenu,
        politicaStockNegativo: updated.politicaStockNegativo,
        diasAnticipacionVencimiento: updated.diasAnticipacionVencimiento,
      },
      warnings,
      message: 'Configuraciones y módulos actualizados correctamente',
    });
  } catch (error: any) {
    console.error('Error updating modules:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
