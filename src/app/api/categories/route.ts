import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const soloPrincipales = searchParams.get('principales') === 'true';
    const soloSubcategorias = searchParams.get('subcategorias') === 'true';
    const parentIdParam = searchParams.get('parentId');
    const includeAll = searchParams.get('all') === 'true';

    const where: any = {};
    if (soloPrincipales) {
      where.parentId = null;
    } else if (soloSubcategorias) {
      where.parentId = { not: null };
    } else if (parentIdParam) {
      where.parentId = Number(parentIdParam);
    }

    // Si no es consulta administrativa (all=true), solo mostrar categorías activas
    // y para subcategorías, su categoría padre también debe estar activa
    if (!includeAll) {
      where.activo = true;
      where.OR = [
        { parentId: null },
        { parent: { activo: true } },
      ];
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        parent: {
          select: { id: true, nombre: true, slug: true },
        },
        children: {
          orderBy: { orden: 'asc' },
          include: {
            _count: {
              select: { subProducts: true, products: true },
            },
          },
        },
        _count: {
          select: { products: true, subProducts: true, children: true },
        },
      },
      orderBy: { orden: 'asc' },
    });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener categorías' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { nombre, slug, descripcion, icono, imagen, orden, activo, parentId } = await req.json();

    if (!nombre) {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }

    const finalSlug = (slug || nombre).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const newCat = await prisma.category.create({
      data: {
        nombre,
        slug: finalSlug,
        descripcion: descripcion || null,
        icono: icono || 'Utensils',
        imagen: imagen || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=900&auto=format&fit=crop',
        orden: Number(orden) || 0,
        activo: activo ?? true,
        parentId: parentId ? Number(parentId) : null,
      },
      include: {
        parent: true,
        children: true,
      },
    });

    return NextResponse.json(newCat, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Error al crear la categoría' }, { status: 500 });
  }
}
