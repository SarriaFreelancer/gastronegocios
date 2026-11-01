import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { nombre, slug, descripcion, icono, imagen, orden, activo } = await req.json();

    const data: any = {};
    if (nombre !== undefined) data.nombre = nombre;
    if (slug !== undefined) data.slug = slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    if (descripcion !== undefined) data.descripcion = descripcion;
    if (icono !== undefined) data.icono = icono;
    if (imagen !== undefined) data.imagen = imagen;
    if (orden !== undefined) data.orden = Number(orden);
    if (activo !== undefined) data.activo = Boolean(activo);

    const updated = await prisma.category.update({
      where: { id: Number(params.id) },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar categoría' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.category.delete({
      where: { id: Number(params.id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar categoría' }, { status: 500 });
  }
}
