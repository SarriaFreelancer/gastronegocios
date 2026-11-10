import React, { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { categories as defaultCategories } from '@/data/categories';
import { products as defaultProducts } from '@/data/products';
import { SidebarMenu } from '@/components/menu/SidebarMenu';
import { MenuGeneralContent } from '@/components/menu/MenuGeneralContent';

export const dynamic = 'force-dynamic';

export default async function MenuGeneralPage({
  searchParams,
}: {
  searchParams?: { category?: string; sub?: string; layout?: string };
}) {
  let restaurant: any = null;
  let effectiveCategories = defaultCategories;
  let effectiveProducts = defaultProducts;

  try {
    restaurant = await prisma.restaurant.findUnique({
      where: { id: 1 },
      select: {
        id: true,
        nombre: true,
        slug: true,
        aparienciaMenu: true,
        colorPrimario: true,
        colorBoton: true,
        colorBotonTexto: true,
      },
    });

    const dbCategories = await prisma.category.findMany({
      where: { restaurantId: 1, activo: true },
      orderBy: { orden: 'asc' },
    });

    if (dbCategories.length > 0) {
      effectiveCategories = dbCategories as any;
    }

    const dbProducts = await prisma.product.findMany({
      where: { restaurantId: 1, disponibilidad: true },
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
    console.error('Error loading menu from database, falling back to default static menu:', err);
  }

  const isLateral =
    restaurant?.aparienciaMenu === 'lateral' ||
    searchParams?.layout === 'lateral';

  if (isLateral) {
    return (
      <div className="pt-20">
        <SidebarMenu
          categories={effectiveCategories}
          products={effectiveProducts}
          restaurantName={restaurant?.nombre || 'PUNTO G'}
          slug={restaurant?.slug || 'punto-g'}
        />
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080808] flex items-center justify-center text-white">
          <div className="w-8 h-8 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <MenuGeneralContent
        initialCategories={effectiveCategories}
        initialProducts={effectiveProducts}
        initialRestaurant={restaurant}
      />
    </Suspense>
  );
}
