import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveTenantScope } from '@/lib/tenant-security';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get('restaurantId');
    const branchId = searchParams.get('branchId');
    const orderId = searchParams.get('orderId');
    const desde = searchParams.get('desde');
    const hasta = searchParams.get('hasta');
    const search = searchParams.get('search');
    const esDividida = searchParams.get('esDividida');
    const metodoPago = searchParams.get('metodoPago');

    const where: any = {};

    // Aislamiento Multi-Tenant Estricto
    const allowAll = searchParams.get('allTenants') === 'true';
    if (!allowAll) {
      const scope = await resolveTenantScope(req);
      where.restaurantId = scope.restaurantId;
    }

    if (branchId && branchId !== 'all') where.branchId = Number(branchId);
    if (orderId) where.orderId = Number(orderId);

    if (esDividida !== null && esDividida !== undefined && esDividida !== '') {
      where.esDividida = esDividida === 'true';
    }

    if (metodoPago && metodoPago !== 'todos') {
      where.metodoPago = { contains: metodoPago };
    }

    if (search) {
      const q = search.trim();
      where.OR = [
        { numeroFactura: { contains: q } },
        { cliente: { contains: q } },
        { numeroMesa: { contains: q } },
        { order: { codigo: { contains: q } } },
      ];
    }

    if (desde && hasta) {
      try {
        const partsDesde = desde.split('-').map(Number);
        const partsHasta = hasta.split('-').map(Number);
        if (partsDesde.length === 3 && partsHasta.length === 3) {
          const start = new Date(partsDesde[0], partsDesde[1] - 1, partsDesde[2], 0, 0, 0, 0);
          const end = new Date(partsHasta[0], partsHasta[1] - 1, partsHasta[2], 23, 59, 59, 999);
          where.createdAt = {
            gte: start,
            lte: end,
          };
        }
      } catch (e) {
        console.error('Error parseando fechas en facturas:', e);
      }
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            codigo: true,
            cliente: true,
            tipo: true,
            numeroMesa: true,
            estado: true,
            cuentaDividida: true,
            numFacturas: true,
          },
        },
        branch: {
          select: { id: true, nombre: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    // Totales calculados
    const totalFacturado = invoices.reduce((acc, inv) => acc + inv.total, 0);
    const totalPropinas = invoices.reduce((acc, inv) => acc + inv.propina, 0);
    const totalSubtotales = invoices.reduce((acc, inv) => acc + inv.subtotal, 0);

    return NextResponse.json({
      invoices,
      metrics: {
        totalFacturas: invoices.length,
        totalFacturado,
        totalPropinas,
        totalSubtotales,
      },
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Error al consultar facturas' }, { status: 500 });
  }
}
