import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get('restaurantId');
    const restaurantSlug = searchParams.get('restaurantSlug');
    const supplyId = searchParams.get('supplyId');
    const tipoMovimiento = searchParams.get('tipoMovimiento');
    const branchId = searchParams.get('branchId');
    const esNegativo = searchParams.get('esNegativo');
    const desde = searchParams.get('desde');
    const hasta = searchParams.get('hasta');

    let resolvedRestaurantId: number | null = restaurantId ? Number(restaurantId) : null;
    if (!resolvedRestaurantId && restaurantSlug) {
      const rest = await prisma.restaurant.findUnique({ where: { slug: restaurantSlug } });
      if (rest) resolvedRestaurantId = rest.id;
    }

    if (!resolvedRestaurantId) {
      return NextResponse.json({ error: 'restaurantId o restaurantSlug es obligatorio' }, { status: 400 });
    }

    const where: any = {
      restaurantId: resolvedRestaurantId,
    };

    if (supplyId && supplyId !== 'all') {
      where.supplyId = Number(supplyId);
    }

    if (tipoMovimiento && tipoMovimiento !== 'todos') {
      where.tipoMovimiento = tipoMovimiento;
    }

    if (branchId && branchId !== 'all') {
      where.branchId = Number(branchId);
    }

    if (esNegativo === 'true') {
      where.esNegativo = true;
    }

    if (desde || hasta) {
      where.createdAt = {};
      if (desde) {
        const d = new Date(desde);
        d.setHours(0, 0, 0, 0);
        where.createdAt.gte = d;
      }
      if (hasta) {
        const h = new Date(hasta);
        h.setHours(23, 59, 59, 999);
        where.createdAt.lte = h;
      }
    }

    const movements = await prisma.inventoryMovement.findMany({
      where,
      include: {
        supply: {
          select: { id: true, nombre: true, codigoInterno: true, unidadMedida: true },
        },
        branch: {
          select: { id: true, nombre: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json(movements);
  } catch (error) {
    console.error('Error fetching kardex movements:', error);
    return NextResponse.json({ error: 'Error al consultar kardex' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      supplyId,
      tipoMovimiento, // AJUSTE_POSITIVO, AJUSTE_NEGATIVO, MERMA, DESPERDICIO, CORRECCION
      cantidad,
      motivo,
      referencia,
      autorizadoPor,
      usuarioResponsable = 'Admin',
      restaurantId,
    } = body;

    const numSupplyId = Number(supplyId);
    const numCantidad = Number(cantidad);

    if (!numSupplyId || isNaN(numCantidad) || numCantidad <= 0) {
      return NextResponse.json({ error: 'Materia prima y cantidad válida (>0) son requeridas' }, { status: 400 });
    }

    if (!tipoMovimiento) {
      return NextResponse.json({ error: 'El tipo de movimiento es obligatorio' }, { status: 400 });
    }

    const supply = await prisma.supply.findUnique({
      where: { id: numSupplyId },
    });

    if (!supply) {
      return NextResponse.json({ error: 'Materia prima no encontrada' }, { status: 404 });
    }

    const isExit = ['AJUSTE_NEGATIVO', 'MERMA', 'DESPERDICIO', 'SALIDA_PREPARACION'].includes(tipoMovimiento);
    const currentStock = supply.stockActual || 0;
    const stockResultante = isExit ? currentStock - numCantidad : currentStock + numCantidad;
    const isNegative = stockResultante < 0;

    // Transacción atómica: Registrar en Kardex y actualizar stock de Supply
    const result = await prisma.$transaction(async (tx) => {
      await tx.supply.update({
        where: { id: numSupplyId },
        data: {
          stockActual: stockResultante,
          estado: stockResultante <= 0 ? 'Agotado' : 'Activo',
        },
      });

      const movement = await tx.inventoryMovement.create({
        data: {
          supplyId: numSupplyId,
          tipoMovimiento,
          cantidad: numCantidad,
          unidad: supply.unidadMedida,
          stockAnterior: currentStock,
          stockResultante,
          costoUnitario: supply.costoUnitario || 0,
          costoTotal: numCantidad * (supply.costoUnitario || 0),
          esNegativo: isNegative,
          autorizadoPor: autorizadoPor || null,
          motivo: motivo || `Ajuste manual de tipo ${tipoMovimiento}`,
          referencia: referencia || 'AJUSTE-MANUAL',
          usuarioResponsable,
          restaurantId: restaurantId ? Number(restaurantId) : supply.restaurantId,
          branchId: supply.branchId,
        },
        include: {
          supply: true,
        },
      });

      return movement;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating manual adjustment:', error);
    return NextResponse.json({ error: 'Error al registrar ajuste en kardex' }, { status: 500 });
  }
}
