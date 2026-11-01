import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('categoria');
    const search = searchParams.get('search');

    const where: any = {};
    if (categorySlug && categorySlug !== 'todas') {
      where.categoria = { slug: categorySlug };
    }
    if (search) {
      where.OR = [
        { nombre: { contains: search } },
        { descripcion: { contains: search } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        categoria: {
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
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { nombre, slug, descripcion, precio, imagen, categoriaSlug, etiqueta, disponibilidad } = await req.json();

    if (!nombre || !precio || !categoriaSlug) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const cat = await prisma.category.findUnique({
      where: { slug: categoriaSlug },
    });

    if (!cat) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }

    const finalSlug = (slug || nombre).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const newProd = await prisma.product.create({
      data: {
        nombre,
        slug: `${finalSlug}-${Date.now().toString().slice(-4)}`,
        descripcion: descripcion || '',
        precio: Number(precio),
        imagen: imagen || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=900&auto=format&fit=crop',
        categoriaId: cat.id,
        etiqueta: etiqueta || null,
        disponibilidad: disponibilidad ?? true,
      },
      include: {
        categoria: true,
      },
    });

    return NextResponse.json({
      ...newProd,
      categoria: newProd.categoria.slug,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 });
  }
}
