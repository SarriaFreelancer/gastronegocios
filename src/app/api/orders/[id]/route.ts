import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const rawId = decodeURIComponent(params.id || '').trim();
    const cleanId = rawId.replace(/^#+/, '').trim();
    const isNum = !isNaN(Number(cleanId));
    const normalizedPg = cleanId.startsWith('PG-')
      ? cleanId
      : cleanId.startsWith('PG')
      ? `PG-${cleanId.slice(2)}`
      : `PG-${cleanId}`;

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(isNum ? [{ id: Number(cleanId) }] : []),
          { codigo: rawId },
          { codigo: cleanId },
          { codigo: normalizedPg },
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
    const body = await req.json();
    const { estado, repartidor, repartidorTel, metodoPago } = body;

    const isNum = !isNaN(Number(params.id));
    let orderToUpdateId: number;

    if (isNum) {
      orderToUpdateId = Number(params.id);
    } else {
      const found = await prisma.order.findUnique({ where: { codigo: params.id } });
      if (!found) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
      orderToUpdateId = found.id;
    }

    const dataToUpdate: any = {};
    if (estado !== undefined) dataToUpdate.estado = estado;
    if (repartidor !== undefined) dataToUpdate.repartidor = repartidor;
    if (repartidorTel !== undefined) dataToUpdate.repartidorTel = repartidorTel;
    if (metodoPago !== undefined) dataToUpdate.metodoPago = metodoPago;

    const updated = await prisma.order.update({
      where: { id: orderToUpdateId },
      data: dataToUpdate,
      include: {
        items: true,
        mesa: true,
      },
    });

    // If order is finished or cancelled and attached to a table, check if any other active orders exist on that table
    if (estado && ['Entregado', 'Cancelado'].includes(estado)) {
      let targetMesaId = updated.mesaId;
      if (!targetMesaId && updated.numeroMesa) {
        const found = await prisma.restaurantTable.findUnique({
          where: { numero: updated.numeroMesa },
        });
        if (found) targetMesaId = found.id;
      }

      if (targetMesaId) {
        const activeCount = await prisma.order.count({
          where: {
            OR: [
              { mesaId: targetMesaId },
              ...(updated.numeroMesa ? [{ numeroMesa: updated.numeroMesa }] : []),
            ],
            estado: { notIn: ['Entregado', 'Cancelado'] },
          },
        });
        if (activeCount === 0) {
          await prisma.restaurantTable.update({
            where: { id: targetMesaId },
            data: { estado: 'Libre' },
          });
        }
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar pedido' }, { status: 500 });
  }
}

export const PUT = PATCH;
