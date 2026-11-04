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
    if (body.stock !== undefined) data.stock = body.stock !== null ? Number(body.stock) : null;
    if (body.stockMinimo !== undefined) data.stockMinimo = body.stockMinimo !== null ? Number(body.stockMinimo) : 5;
    if (body.controlarStock !== undefined) data.controlarStock = Boolean(body.controlarStock);
    if (body.costo !== undefined) data.costo = body.costo !== null ? Number(body.costo) : null;

    if (body.categoriaSlug) {
      const cat = await prisma.category.findUnique({
        where: { slug: body.categoriaSlug },
      });
      if (cat) data.categoriaId = cat.id;
    } else if (body.categoriaId !== undefined) {
      data.categoriaId = Number(body.categoriaId);
    }

    if (body.subcategoriaSlug) {
      const sub = await prisma.category.findUnique({
        where: { slug: body.subcategoriaSlug },
      });
      if (sub) data.subcategoriaId = sub.id;
    } else if (body.subcategoriaId !== undefined) {
      data.subcategoriaId = body.subcategoriaId ? Number(body.subcategoriaId) : null;
    }

    const updated = await prisma.product.update({
      where: { id: Number(params.id) },
      data,
      include: {
        categoria: true,
        subcategoria: true,
      },
    });

    return NextResponse.json({
      ...updated,
      categoria: updated.categoria.slug,
      categoriaNombre: updated.categoria.nombre,
      subcategoria: updated.subcategoria?.slug || null,
      subcategoriaNombre: updated.subcategoria?.nombre || null,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar producto' }, { status: 500 });
  }
}

export const PATCH = PUT;

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
