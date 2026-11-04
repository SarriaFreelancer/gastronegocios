import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const catId = Number(params.id);
    const { nombre, slug, descripcion, icono, imagen, orden, activo, parentId } = await req.json();

    const data: any = {};
    if (nombre !== undefined && nombre.trim()) data.nombre = nombre.trim();
    if (slug !== undefined && slug.trim()) {
      const cleanSlug = slug.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      if (cleanSlug) {
        // Verificar colisión con otra categoría
        const existing = await prisma.category.findUnique({ where: { slug: cleanSlug } });
        if (!existing || existing.id === catId) {
          data.slug = cleanSlug;
        }
      }
    }
    if (descripcion !== undefined) data.descripcion = descripcion ? descripcion.trim() : null;
    if (icono !== undefined) data.icono = icono || 'Utensils';
    if (imagen !== undefined) data.imagen = imagen && imagen.trim() ? imagen.trim() : 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=900&auto=format&fit=crop';
    if (orden !== undefined) data.orden = Number(orden);
    if (activo !== undefined) data.activo = Boolean(activo);
    if (parentId !== undefined) data.parentId = parentId ? Number(parentId) : null;

    const updated = await prisma.category.update({
      where: { id: catId },
      data,
      include: {
        parent: true,
        children: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    return NextResponse.json({ error: 'Error al actualizar categoría' }, { status: 500 });
  }
}

export const PATCH = PUT;

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
