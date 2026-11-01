import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { respuesta, publicado } = await req.json();

    const data: any = {};
    if (respuesta !== undefined) data.respuesta = respuesta;
    if (publicado !== undefined) data.publicado = Boolean(publicado);

    const updated = await prisma.review.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar comentario' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.review.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar comentario' }, { status: 500 });
  }
}
