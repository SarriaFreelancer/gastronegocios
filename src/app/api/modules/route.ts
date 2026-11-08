import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SYSTEM_MODULES, DEFAULT_MODULES_STATE } from '@/lib/constants-modules';

export const dynamic = 'force-dynamic';

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
