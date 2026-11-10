import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { categories as defaultCategories } from '@/data/categories';
import { products as defaultProducts } from '@/data/products';
import { CategoryClientView } from '@/components/menu/CategoryClientView';

export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: {
    category: string;
  };
  searchParams?: {
    sub?: string;
  };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  let cat: any = null;
  try {
    cat = await prisma.category.findFirst({
      where: { slug: params.category, restaurantId: 1 },
    });
  } catch (err) {
    // fallback
  }
  if (!cat) {
    cat = defaultCategories.find((c) => c.slug === params.category);
  }

  if (!cat) {
    return {
      title: 'Categoría no encontrada | Punto G',
    };
  }
  return {
    title: `${cat.nombre} | Menú Punto G Cali`,
    description: `${cat.descripcion || ''} Pide a domicilio o para recoger por WhatsApp.`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const categoryParam = params.category;
  const subParam = searchParams?.sub;
  const restaurantId = 1;

  let restConfig: any = null;
  let effectiveCategories = defaultCategories;
  let effectiveProducts = defaultProducts;

  try {
    restConfig = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { aparienciaMenu: true },
    });

    if (restConfig?.aparienciaMenu === 'lateral') {
      redirect(`/menu?category=${encodeURIComponent(categoryParam)}${subParam ? `&sub=${encodeURIComponent(subParam)}` : ''}`);
    }

    const dbCategories = await prisma.category.findMany({
      where: { restaurantId, activo: true },
      orderBy: { orden: 'asc' },
    });

    if (dbCategories.length > 0) {
      effectiveCategories = dbCategories as any;
    }

    const dbProducts = await prisma.product.findMany({
      where: { restaurantId, disponibilidad: true },
      include: {
        categoria: { select: { id: true, nombre: true, slug: true } },
        subcategoria: { select: { id: true, nombre: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (dbProducts.length > 0) {
      effectiveProducts = dbProducts.map((p) => ({
        ...p,
        categoria: p.categoria?.slug || '',
        categoriaNombre: p.categoria?.nombre || '',
        subcategoria: p.subcategoria?.slug || null,
        subcategoriaNombre: p.subcategoria?.nombre || null,
      })) as any;
    }
  } catch (err) {
    console.error('Error fetching category page data:', err);
  }

  // Buscar categoría coincidente (puede ser categoría principal o subcategoría)
  let category = effectiveCategories.find((c) => c.slug === categoryParam);
  let resolvedSubSlug = subParam;

  if (!category) {
    const subMatch = effectiveCategories.find(
      (c) => c.slug === categoryParam && c.parentId
    );
    if (subMatch) {
      resolvedSubSlug = subMatch.slug;
      category = effectiveCategories.find(
        (c) => c.id === subMatch.parentId || c.slug === subMatch.parentId
      );
    }
  }

  if (!category) {
    const fallback = defaultCategories.find((c) => c.slug === categoryParam);
    if (fallback) {
      return (
        <CategoryClientView
          category={fallback as any}
          products={effectiveProducts as any}
          categoriesList={effectiveCategories}
          initialSubSlug={resolvedSubSlug}
        />
      );
    }
    notFound();
  }

  return (
    <CategoryClientView
      category={category as any}
      products={effectiveProducts as any}
      categoriesList={effectiveCategories}
      initialSubSlug={resolvedSubSlug}
    />
  );
}
