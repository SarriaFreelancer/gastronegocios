import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureRestaurantBranchesAndSchema } from '@/lib/db-autoheal';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await ensureRestaurantBranchesAndSchema();
    const { id: rawId } = await context.params;
    const id = Number(rawId);

    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    const orders = await prisma.order.findMany({
      where: {
        restaurantId: customer.restaurantId,
        OR: [
          ...(customer.telefono ? [{ telefono: customer.telefono }] : []),
          { cliente: customer.nombre },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    const enriched = {
      ...customer,
      activo: customer.activo !== undefined ? Boolean(customer.activo) : true,
      documentoNumero: customer.documento,
      documentoTipo: 'CC',
      totalConsumido: customer.totalComprado,
      totalVisitas: customer.totalPedidos,
      limiteCredito: 0,
      saldoCredito: 0,
      puntosFidelidad: Math.floor(customer.totalComprado / 1000),
      orders,
    };

    return NextResponse.json(enriched);
  } catch (error: any) {
    console.error('Error fetching customer:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await ensureRestaurantBranchesAndSchema();
    const { id: rawId } = await context.params;
    const id = Number(rawId);
    const body = await req.json();

    if (body.activo !== undefined) {
      await prisma.$executeRawUnsafe(
        "UPDATE `customers` SET `activo` = ?, `updatedAt` = NOW() WHERE `id` = ?;",
        body.activo ? 1 : 0,
        id
      ).catch(() => {});
    }

    try {
      const customer = await prisma.customer.update({
        where: { id },
        data: {
          ...(body.nombre !== undefined && { nombre: body.nombre }),
          ...(body.documento !== undefined || body.documentoNumero !== undefined
            ? { documento: body.documento !== undefined ? body.documento : body.documentoNumero }
            : {}),
          ...(body.telefono !== undefined && { telefono: body.telefono }),
          ...(body.email !== undefined && { email: body.email }),
          ...(body.direccion !== undefined && { direccion: body.direccion }),
          ...(body.ciudad !== undefined && { ciudad: body.ciudad }),
          ...(body.barrio !== undefined && { barrio: body.barrio }),
          ...(body.notas !== undefined || body.observaciones !== undefined
            ? { notas: body.notas !== undefined ? body.notas : body.observaciones }
            : {}),
          ...(body.activo !== undefined && { activo: Boolean(body.activo) }),
        },
      });
      return NextResponse.json(customer);
    } catch {
      const rows: any[] = await prisma.$queryRawUnsafe(
        "SELECT * FROM `customers` WHERE `id` = ? LIMIT 1;",
        id
      );
      return NextResponse.json(rows[0] || { id, ...body });
    }
  } catch (error: any) {
    console.error('Error updating customer:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await context.params;
    const id = Number(rawId);

    await prisma.customer.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Cliente eliminado correctamente' });
  } catch (error: any) {
    console.error('Error deleting customer:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
