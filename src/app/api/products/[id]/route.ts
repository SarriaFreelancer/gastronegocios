import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const data: any = {};

    if (body.nombre !== undefined) data.nombre = body.nombre;
    if (body.descripcion !== undefined) data.descripcion = body.descripcion;
    if (body.precio !== undefined) data.precio = Number(body.precio);
    if (body.imagen !== undefined) data.imagen = body.imagen;
    if (body.etiqueta !== undefined) data.etiqueta = body.etiqueta || null;
    if (body.disponibilidad !== undefined) data.disponibilidad = Boolean(body.disponibilidad);

    if (body.categoriaSlug) {
      const cat = await prisma.category.findUnique({
        where: { slug: body.categoriaSlug },
      });
      if (cat) data.categoriaId = cat.id;
    }

    const updated = await prisma.product.update({
      where: { id: Number(params.id) },
      data,
      include: {
        categoria: true,
      },
    });

    return NextResponse.json({
      ...updated,
      categoria: updated.categoria.slug,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar producto' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.product.delete({
      where: { id: Number(params.id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar producto' }, { status: 500 });
  }
}
