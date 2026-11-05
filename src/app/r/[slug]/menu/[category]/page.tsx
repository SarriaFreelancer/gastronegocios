import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { categories as defaultCategories } from '@/data/categories';
import { products as defaultProducts } from '@/data/products';
import { CategoryClientView } from '@/components/menu/CategoryClientView';

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
  const slug = (params.slug || 'punto-g').toLowerCase().trim();
  const categoryParam = params.category;
  const subParam = searchParams?.sub;

  const isPuntoG = slug === 'punto-g' || slug === 'puntog';

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
  });

  if (!restaurant && !isPuntoG) {
    notFound();
  }

  const restaurantId = restaurant?.id || 1;

  // Categorías de este restaurante
  const dbCategories = await prisma.category.findMany({
    where: { restaurantId },
    orderBy: { orden: 'asc' },
  });

  const effectiveCategories =
    dbCategories.length > 0 ? dbCategories : isPuntoG ? defaultCategories : [];

  // Productos de este restaurante
  const dbProducts = await prisma.product.findMany({
    where: { restaurantId, disponibilidad: true },
    include: {
      categoria: { select: { id: true, nombre: true, slug: true } },
      subcategoria: { select: { id: true, nombre: true, slug: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const formattedProducts = dbProducts.map((p) => ({
    ...p,
    categoria: p.categoria.slug,
    categoriaNombre: p.categoria.nombre,
    subcategoria: p.subcategoria?.slug || null,
    subcategoriaNombre: p.subcategoria?.nombre || null,
  }));

  const effectiveProducts =
    formattedProducts.length > 0 ? formattedProducts : isPuntoG ? defaultProducts : [];

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
