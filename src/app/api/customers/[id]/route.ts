import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);

    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    // Fetch orders associated by telephone or customer name
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

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const body = await req.json();

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        nombre: body.nombre,
        documento: body.documento !== undefined ? body.documento : body.documentoNumero,
        telefono: body.telefono,
        email: body.email,
        direccion: body.direccion,
        ciudad: body.ciudad,
        notas: body.notas !== undefined ? body.notas : body.observaciones,
        activo: body.activo !== undefined ? Boolean(body.activo) : undefined,
      },
    });

    return NextResponse.json(customer);
  } catch (error: any) {
    console.error('Error updating customer:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);

    await prisma.customer.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Cliente eliminado correctamente' });
  } catch (error: any) {
    console.error('Error deleting customer:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
