import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const isCurrent = searchParams.get('current') === 'true';

    if (isCurrent) {
      // Find currently active open shift
      let shift = await prisma.cashShift.findFirst({
        where: { estado: 'Abierto' },
        include: { egresos: { orderBy: { createdAt: 'desc' } } },
        orderBy: { createdAt: 'desc' },
      });

      if (!shift) {
        // Return latest closed shift if none open
        shift = await prisma.cashShift.findFirst({
          include: { egresos: { orderBy: { createdAt: 'desc' } } },
          orderBy: { createdAt: 'desc' },
        });
      }

      if (!shift) {
        return NextResponse.json({ shift: null });
      }

      // If open, calculate real-time stats from orders since shift opening
      if (shift.estado === 'Abierto') {
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
      include: {
        egresos: true,
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
    const { cajero = 'Admin', baseInicial = 0, notas = '' } = body;

    // Check if an open shift already exists
    const openShift = await prisma.cashShift.findFirst({
      where: { estado: 'Abierto' },
    });

    if (openShift) {
      return NextResponse.json(
        { error: 'Ya existe un turno de caja abierto. Ciérralo antes de abrir uno nuevo.' },
        { status: 400 }
      );
    }

    const newShift = await prisma.cashShift.create({
      data: {
        cajero,
        baseInicial: Number(baseInicial) || 0,
        estado: 'Abierto',
        notas,
      },
      include: { egresos: true },
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
