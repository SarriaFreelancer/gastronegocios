import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { categories as defaultCategories } from '@/data/categories';
import { products as defaultProducts } from '@/data/products';
import { CategoryClientView } from '@/components/menu/CategoryClientView';

export const dynamic = 'force-dynamic';

interface TenantCategoryDetailPageProps {
  params: {
    slug: string;
    category: string;
  };
  searchParams?: {
    sub?: string;
  };
}

export default async function TenantCategoryDetailPage({
  params,
  searchParams,
}: TenantCategoryDetailPageProps) {
  const rawSlug = (params.slug || 'punto-g').toLowerCase().trim();
  const slugWithHyphen = rawSlug === 'puntog' ? 'punto-g' : rawSlug;
  const slugAlias = rawSlug === 'puntog' ? 'punto-g' : (rawSlug === 'don-carbon-parrilla' || rawSlug === 'doncarbon') ? 'bryan' : rawSlug;
  const slug = slugWithHyphen;
  const isPuntoG = slugWithHyphen === 'punto-g';

  const categoryParam = params.category;
  const subParam = searchParams?.sub;

  let restaurant: any = null;
  let effectiveCategories = isPuntoG ? defaultCategories : [];
  let effectiveProducts = isPuntoG ? defaultProducts : [];

  try {
    restaurant = await prisma.restaurant.findFirst({
      where: {
        OR: [
          { slug: rawSlug },
          { slug: slugWithHyphen },
          { slug: slugAlias },
          { subdominio: rawSlug },
          { subdominio: slugAlias },
        ],
      },
    });

    if (!restaurant && !isPuntoG) {
      notFound();
    }

    // Si el restaurante configuró menú lateral, redirigir al menú lateral con la categoría seleccionada
    if (restaurant?.aparienciaMenu === 'lateral') {
      redirect(`/r/${slugWithHyphen}/menu?category=${encodeURIComponent(categoryParam)}${subParam ? `&sub=${encodeURIComponent(subParam)}` : ''}`);
    }

    const restaurantId = restaurant?.id || 1;

    // Categorías de este restaurante
    const dbCategories = await prisma.category.findMany({
      where: { restaurantId },
      orderBy: { orden: 'asc' },
    });
    if (dbCategories.length > 0) {
      effectiveCategories = dbCategories as any;
    }

    // Productos de este restaurante
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
    console.error('Error in tenant category detail page:', err);
    if (!restaurant && !isPuntoG) {
      notFound();
    }
  }

  // Buscar categoría coincidente
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
    if (isPuntoG) {
      const fallback = defaultCategories.find((c) => c.slug === categoryParam);
      if (fallback) {
        return (
          <CategoryClientView
            category={fallback as any}
            products={effectiveProducts as any}
            categoriesList={effectiveCategories}
            tenantSlug={slug}
            initialSubSlug={resolvedSubSlug}
          />
        );
      }
    }
    notFound();
  }

  return (
    <CategoryClientView
      category={category as any}
      products={effectiveProducts as any}
      categoriesList={effectiveCategories}
      tenantSlug={slug}
      initialSubSlug={resolvedSubSlug}
    />
  );
}
