import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { categories as defaultCategories } from '@/data/categories';
import { products as defaultProducts } from '@/data/products';
import { SidebarMenu } from '@/components/menu/SidebarMenu';
import { TenantMenuGeneralContent } from '@/components/menu/TenantMenuGeneralContent';

export const dynamic = 'force-dynamic';

interface TenantMenuPageProps {
  params: {
    slug: string;
  };
  searchParams?: {
    category?: string;
    sub?: string;
    layout?: string;
  };
}

export default async function TenantMenuGeneralPage({
  params,
  searchParams,
}: TenantMenuPageProps) {
  const rawSlug = (params.slug || 'punto-g').toLowerCase().trim();
  const slugWithHyphen = rawSlug === 'puntog' ? 'punto-g' : rawSlug;
  const slugAlias = rawSlug === 'puntog' ? 'punto-g' : (rawSlug === 'don-carbon-parrilla' || rawSlug === 'doncarbon') ? 'bryan' : rawSlug;
  const slug = slugWithHyphen;
  const isPuntoG = slugWithHyphen === 'punto-g';

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
      select: {
        id: true,
        nombre: true,
        slug: true,
        aparienciaMenu: true,
        colorPrimario: true,
        colorBoton: true,
        colorBotonTexto: true,
        descripcion: true,
        eslogan: true,
        telefonoWhatsapp: true,
        direccionCentral: true,
        ciudad: true,
        horarioAtencion: true,
        logo: true,
      },
    });

    if (!restaurant && !isPuntoG) {
      notFound();
    }

    const restaurantId = restaurant?.id || 1;

    // Categories for this restaurant
    const dbCategories = await prisma.category.findMany({
      where: { restaurantId, activo: true },
      orderBy: { orden: 'asc' },
    });
    if (dbCategories.length > 0) {
      effectiveCategories = dbCategories as any;
    }

    // Products for this restaurant
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
    console.error('Error fetching tenant menu:', err);
    if (!isPuntoG && !restaurant) {
      notFound();
    }
  }

  const restaurantId = restaurant?.id || 1;
  const restaurantName = restaurant?.nombre || (isPuntoG ? 'PUNTO G' : 'Restaurante');

  const isLateral =
    restaurant?.aparienciaMenu === 'lateral' ||
    searchParams?.layout === 'lateral';

  if (isLateral) {
    return (
      <div className="pt-20">
        <SidebarMenu
          categories={effectiveCategories}
          products={effectiveProducts}
          restaurantName={restaurantName}
          slug={restaurant?.slug || slug}
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
      <TenantMenuGeneralContent
        initialCategories={effectiveCategories}
        initialProducts={effectiveProducts}
        initialRestaurant={restaurant}
      />
    </Suspense>
  );
}
