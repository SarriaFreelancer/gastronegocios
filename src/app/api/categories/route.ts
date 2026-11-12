import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveTenantScope } from '@/lib/tenant-security';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const soloPrincipales = searchParams.get('principales') === 'true';
    const soloSubcategorias = searchParams.get('subcategorias') === 'true';
    const parentIdParam = searchParams.get('parentId');
    const includeAll = searchParams.get('all') === 'true';
    const restaurantId = searchParams.get('restaurantId');
    const restaurantSlug = searchParams.get('restaurantSlug');
    const allowAllTenants = searchParams.get('allTenants') === 'true';

    const where: any = {};

    if (restaurantId && restaurantId !== 'all') {
      where.restaurantId = Number(restaurantId);
    } else if (restaurantSlug) {
      where.restaurant = { OR: [{ slug: restaurantSlug }, { subdominio: restaurantSlug }] };
    } else if (!allowAllTenants) {
      const scope = await resolveTenantScope(req);
      where.restaurantId = scope.restaurantId;
    }
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
    const { nombre, slug, descripcion, icono, imagen, orden, activo, parentId, restaurantId = 1 } = await req.json();

    if (!nombre || !nombre.trim()) {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }

    // Normalizar slug eliminando tildes y caracteres especiales
    const rawSlug = (slug && slug.trim() ? slug : nombre)
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const baseSlug = rawSlug || 'categoria';

    // Garantizar que el slug sea único en la base de datos para evitar errores 500
    let finalSlug = baseSlug;
    let counter = 1;
    while (await prisma.category.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Validar si parentId existe realmente
    let validParentId: number | null = null;
    if (parentId && !isNaN(Number(parentId))) {
      const parentCheck = await prisma.category.findUnique({ where: { id: Number(parentId) } });
      if (parentCheck) validParentId = Number(parentId);
    }

    const newCat = await prisma.category.create({
      data: {
        nombre: nombre.trim(),
        slug: finalSlug,
        descripcion: descripcion ? descripcion.trim() : null,
        icono: icono || 'Utensils',
        imagen: imagen && imagen.trim() ? imagen.trim() : 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=900&auto=format&fit=crop',
        orden: Number(orden) || 0,
        activo: activo !== undefined ? Boolean(activo) : true,
        parentId: validParentId,
        restaurantId: restaurantId ? Number(restaurantId) : 1,
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
