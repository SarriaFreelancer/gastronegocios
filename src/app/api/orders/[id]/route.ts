import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: params.id },
          { codigo: params.id },
        ],
      },
      include: {
        items: true,
        mesa: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Error al consultar pedido' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { estado } = await req.json();

    if (!estado) {
      return NextResponse.json({ error: 'Estado requerido' }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: { estado },
      include: {
        items: true,
        mesa: true,
      },
    });

    // If order is finished or cancelled and attached to a table, check if any other active orders exist on that table
    if (['Entregado', 'Cancelado'].includes(estado) && updated.mesaId) {
      const activeCount = await prisma.order.count({
        where: {
          mesaId: updated.mesaId,
          estado: { notIn: ['Entregado', 'Cancelado'] },
        },
      });
      if (activeCount === 0) {
        await prisma.restaurantTable.update({
          where: { id: updated.mesaId },
          data: { estado: 'Libre' },
        });
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar pedido' }, { status: 500 });
  }
}
