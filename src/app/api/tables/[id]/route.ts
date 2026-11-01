import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { numero, capacidad, ubicacion, estado, notas, action } = await req.json();

    const data: any = {};
    if (numero !== undefined) data.numero = numero;
    if (capacidad !== undefined) data.capacidad = Number(capacidad);
    if (ubicacion !== undefined) data.ubicacion = ubicacion;
    if (estado !== undefined) data.estado = estado;
    if (notas !== undefined) data.notas = notas;

    if (action === 'liberar') {
      data.estado = 'Libre';
      // Mark active table orders as Entregado
      await prisma.order.updateMany({
        where: {
          mesaId: params.id,
          estado: { notIn: ['Entregado', 'Cancelado'] },
        },
        data: { estado: 'Entregado' },
      });
    }

    const updated = await prisma.restaurantTable.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar mesa' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.restaurantTable.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar mesa' }, { status: 500 });
  }
}
