import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveTenantScope } from '@/lib/tenant-security';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('categoria');
    const subcategorySlug = searchParams.get('subcategoria');
    const search = searchParams.get('search');
    const restaurantId = searchParams.get('restaurantId');
    const restaurantSlug = searchParams.get('restaurantSlug');

    const where: any = {};

    // Aislamiento Multi-Tenant Estricto
    const allowAll = searchParams.get('allTenants') === 'true';
    if (!allowAll) {
      const scope = await resolveTenantScope(req);
      where.restaurantId = scope.restaurantId;
    }

    if (subcategorySlug && subcategorySlug !== 'todas') {
      where.OR = [
        { subcategoria: { slug: subcategorySlug } },
        { categoria: { slug: subcategorySlug } },
      ];
    } else if (categorySlug && categorySlug !== 'todas') {
      where.OR = [
        { categoria: { slug: categorySlug } },
        { categoria: { parent: { slug: categorySlug } } },
      ];
    }

    if (search) {
      const searchCondition = [
        { nombre: { contains: search } },
        { descripcion: { contains: search } },
      ];
      if (where.OR) {
        where.AND = [
          { OR: where.OR },
          { OR: searchCondition },
        ];
        delete where.OR;
      } else {
        where.OR = searchCondition;
      }
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        categoria: {
          select: { id: true, nombre: true, slug: true, parentId: true },
        },
        subcategoria: {
          select: { id: true, nombre: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Format for frontend
    const formatted = products.map((p) => ({
      ...p,
      categoria: p.categoria.slug,
      categoriaNombre: p.categoria.nombre,
      categoriaId: p.categoriaId,
      subcategoriaId: p.subcategoriaId,
      subcategoria: p.subcategoria?.slug || null,
      subcategoriaNombre: p.subcategoria?.nombre || null,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { 
      nombre, 
      slug, 
      descripcion, 
      precio, 
      imagen, 
      categoriaSlug, 
      categoriaId,
      subcategoriaSlug,
      subcategoriaId,
      etiqueta, 
      disponibilidad,
      stock,
      stockMinimo,
      controlarStock,
      costo,
      restaurantId = 1,
    } = await req.json();

    if (!nombre || !precio) {
      return NextResponse.json({ error: 'Nombre y precio son obligatorios' }, { status: 400 });
    }

    let finalCategoriaId: number | null = categoriaId ? Number(categoriaId) : null;
    if (!finalCategoriaId && categoriaSlug) {
      const cat = await prisma.category.findUnique({
        where: { slug: categoriaSlug },
      });
      if (cat) finalCategoriaId = cat.id;
    }

    if (!finalCategoriaId) {
      return NextResponse.json({ error: 'Categoría no válida' }, { status: 400 });
    }

    let finalSubcategoriaId: number | null = subcategoriaId ? Number(subcategoriaId) : null;
    if (!finalSubcategoriaId && subcategoriaSlug) {
      const sub = await prisma.category.findUnique({
        where: { slug: subcategoriaSlug },
      });
      if (sub) finalSubcategoriaId = sub.id;
    }

    const finalSlug = (slug || nombre).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const newProd = await prisma.product.create({
      data: {
        nombre,
        slug: `${finalSlug}-${Date.now().toString().slice(-4)}`,
        descripcion: descripcion || '',
        precio: Number(precio),
        imagen: imagen || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=900&auto=format&fit=crop',
        categoriaId: finalCategoriaId,
        subcategoriaId: finalSubcategoriaId,
        etiqueta: etiqueta || null,
        disponibilidad: disponibilidad ?? true,
        stock: stock !== undefined && stock !== null ? Number(stock) : null,
        stockMinimo: stockMinimo !== undefined && stockMinimo !== null ? Number(stockMinimo) : 5,
        controlarStock: Boolean(controlarStock),
        costo: costo !== undefined && costo !== null ? Number(costo) : null,
        restaurantId: restaurantId ? Number(restaurantId) : 1,
      },
      include: {
        categoria: true,
        subcategoria: true,
      },
    });

    return NextResponse.json({
      ...newProd,
      categoria: newProd.categoria.slug,
      categoriaNombre: newProd.categoria.nombre,
      subcategoria: newProd.subcategoria?.slug || null,
      subcategoriaNombre: newProd.subcategoria?.nombre || null,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 });
  }
}
