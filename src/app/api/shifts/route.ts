import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const isCurrent = searchParams.get('current') === 'true';
    const branchId = searchParams.get('branchId');
    const restaurantId = searchParams.get('restaurantId');
    const restId = restaurantId ? Number(restaurantId) : undefined;

    const branchFilter: any = {};
    if (branchId && branchId !== 'all') {
      branchFilter.branchId = Number(branchId);
    }
    if (restId) {
      branchFilter.restaurantId = restId;
    }

    if (isCurrent) {
      // Find currently active open shift (matching branch or general, and restaurant)
      const openShiftWhere: any = {
        estado: 'Abierto',
        ...(restId ? { restaurantId: restId } : {}),
        ...(branchId && branchId !== 'all'
          ? { OR: [{ branchId: Number(branchId) }, { branchId: null }] }
          : {}),
      };

      let shift = await prisma.cashShift.findFirst({
        where: openShiftWhere,
        include: { egresos: { orderBy: { createdAt: 'desc' } }, branch: true },
        orderBy: { createdAt: 'desc' },
      });

      if (!shift) {
        // Return latest closed shift if none open
        shift = await prisma.cashShift.findFirst({
          where: branchFilter,
          include: { egresos: { orderBy: { createdAt: 'desc' } }, branch: true },
          orderBy: { createdAt: 'desc' },
        });
      }

      if (!shift) {
        return NextResponse.json({ shift: null });
      }

      // If open, calculate real-time stats from orders since shift opening
      if (shift.estado === 'Abierto') {
        const orderWhere: any = {
          createdAt: { gte: shift.createdAt },
          estado: { not: 'Cancelado' },
        };
        if (shift.branchId) {
          orderWhere.branchId = shift.branchId;
        }

        const orders = await prisma.order.findMany({
          where: orderWhere,
        });

        let efectivo = 0;
        let transfer = 0;
        let datafono = 0;
        let propinas = 0;

        for (const o of orders) {
          propinas += o.propina || 0;
          const pMethod = (o.metodoPago || '').toLowerCase();
          if (pMethod.includes('efectivo')) {
            efectivo += o.total;
          } else if (pMethod.includes('nequi') || pMethod.includes('daviplata') || pMethod.includes('transfer')) {
            transfer += o.total;
          } else {
            datafono += o.total;
          }
        }

        const totalEgresos = shift.egresos.reduce((sum, e) => sum + e.monto, 0);
        const totalVentas = efectivo + transfer + datafono;
        const totalEfectivoEsperado = shift.baseInicial + efectivo - totalEgresos;

        return NextResponse.json({
          shift: {
            ...shift,
            ventasEfectivo: efectivo,
            ventasTransfer: transfer,
            ventasDatafono: datafono,
            propinasTotal: propinas,
            totalVentas,
            totalEgresos,
            totalEfectivoEsperado,
          },
        });
      }

      return NextResponse.json({ shift });
    }

    // Return list of all shifts
    const shifts = await prisma.cashShift.findMany({
      where: branchFilter,
      include: {
        egresos: true,
        branch: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    return NextResponse.json(shifts);
  } catch (error) {
    console.error('Error in cash shift GET:', error);
    return NextResponse.json({ error: 'Error al consultar caja' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cajero = 'Admin', baseInicial = 0, notas = '', branchId, restaurantId, forceClosePrevious = false } = body;
    const restId = restaurantId ? Number(restaurantId) : 1;

    // Check if an open shift already exists for this branch and restaurant
    const openShiftWhere: any = { estado: 'Abierto', restaurantId: restId };
    if (branchId && branchId !== 'all') {
      openShiftWhere.branchId = Number(branchId);
    }

    const openShift = await prisma.cashShift.findFirst({
      where: openShiftWhere,
    });

    if (openShift) {
      if (forceClosePrevious) {
        // Cerrar turno previo forzado
        await prisma.cashShift.update({
          where: { id: openShift.id },
          data: {
            estado: 'Cerrado',
            cerradoEn: new Date(),
            efectivoReal: openShift.baseInicial,
            diferencia: 0,
            notas: (openShift.notas ? openShift.notas + ' | ' : '') + 'Cierre forzado al abrir nuevo turno',
          },
        });
      } else {
        return NextResponse.json(
          { 
            error: 'Ya existe un turno de caja abierto para esta sede. Ciérralo antes de abrir uno nuevo.',
            openShiftId: openShift.id,
            canForceClose: true,
          },
          { status: 400 }
        );
      }
    }

    const newShift = await prisma.cashShift.create({
      data: {
        cajero,
        baseInicial: Number(baseInicial) || 0,
        estado: 'Abierto',
        notas,
        branchId: branchId && branchId !== 'all' ? Number(branchId) : null,
        restaurantId: restId,
      },
      include: { egresos: true, branch: true },
    });

    return NextResponse.json(newShift, { status: 201 });
  } catch (error) {
    console.error('Error creating cash shift:', error);
    return NextResponse.json({ error: 'Error al abrir turno de caja' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, efectivoReal, notas } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID de turno requerido' }, { status: 400 });
    }

    const shift = await prisma.cashShift.findUnique({
      where: { id: Number(id) },
      include: { egresos: true },
    });

    if (!shift) {
      return NextResponse.json({ error: 'Turno no encontrado' }, { status: 404 });
    }

    // Calculate totals from orders during this shift
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: shift.createdAt },
        estado: { not: 'Cancelado' },
      },
    });

    let efectivo = 0;
    let transfer = 0;
    let datafono = 0;
    let propinas = 0;

    for (const o of orders) {
      propinas += o.propina || 0;
      const pMethod = (o.metodoPago || '').toLowerCase();
      if (pMethod.includes('efectivo')) {
        efectivo += o.total;
      } else if (pMethod.includes('nequi') || pMethod.includes('daviplata') || pMethod.includes('transfer')) {
        transfer += o.total;
      } else {
        datafono += o.total;
      }
    }

    const totalEgresos = shift.egresos.reduce((sum, e) => sum + e.monto, 0);
    const totalVentas = efectivo + transfer + datafono;
    const totalEsperado = shift.baseInicial + efectivo - totalEgresos;
    const real = Number(efectivoReal) || 0;
    const diferencia = real - totalEsperado;

    const closed = await prisma.cashShift.update({
      where: { id: Number(id) },
      data: {
        ventasEfectivo: efectivo,
        ventasTransfer: transfer,
        ventasDatafono: datafono,
        propinasTotal: propinas,
        totalVentas,
        totalEgresos,
        efectivoReal: real,
        diferencia,
        estado: 'Cerrado',
        cerradoEn: new Date(),
        notas: notas !== undefined ? notas : shift.notas,
      },
      include: { egresos: true },
    });

    return NextResponse.json(closed);
  } catch (error) {
    console.error('Error closing cash shift:', error);
    return NextResponse.json({ error: 'Error al cerrar turno de caja' }, { status: 500 });
  }
}
