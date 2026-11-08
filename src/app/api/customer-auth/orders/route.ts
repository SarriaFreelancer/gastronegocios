import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');
    const telefono = searchParams.get('telefono');
    const restaurantSlug = searchParams.get('restaurantSlug');

    if (!customerId && !telefono) {
      return NextResponse.json(
        { error: 'customerId o teléfono requeridos para consultar pedidos.' },
        { status: 400 }
      );
    }

    // Resolver restaurante
    let targetRestaurantId: number | null = null;
    if (restaurantSlug) {
      const rest = await prisma.restaurant.findFirst({
        where: {
          OR: [
            { slug: String(restaurantSlug).toLowerCase().trim() },
            { subdominio: String(restaurantSlug).toLowerCase().trim() },
          ],
        },
        select: { id: true },
      });
      if (rest) targetRestaurantId = rest.id;
    }

    const cleanPhone = telefono ? String(telefono).replace(/\D/g, '') : null;

    // Condición de búsqueda
    const whereCondition: any = {
      ...(targetRestaurantId ? { restaurantId: targetRestaurantId } : {}),
      OR: [
        ...(customerId ? [{ customerId: Number(customerId) }] : []),
        ...(cleanPhone ? [{ telefono: cleanPhone }, { telefono: telefono }] : []),
      ],
    };

    const orders = await prisma.order.findMany({
      where: whereCondition,
      include: {
        items: true,
        invoices: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Calcular productos más habituales / frecuentes
    const productFrequencyMap = new Map<string, { nombre: string; precio: number; cantidadTotal: number; pedidosCount: number }>();

    orders.forEach((ord) => {
      ord.items.forEach((item) => {
        const key = item.nombre.toLowerCase().trim();
        const existing = productFrequencyMap.get(key);
        if (existing) {
          existing.cantidadTotal += item.cantidad;
          existing.pedidosCount += 1;
        } else {
          productFrequencyMap.set(key, {
            nombre: item.nombre,
            precio: item.precio,
            cantidadTotal: item.cantidad,
            pedidosCount: 1,
          });
        }
      });
    });

    const habitualProducts = Array.from(productFrequencyMap.values())
      .sort((a, b) => b.pedidosCount - a.pedidosCount)
      .slice(0, 6);

    return NextResponse.json({
      success: true,
      totalOrders: orders.length,
      orders,
      habitualProducts,
    });
  } catch (err: any) {
    console.error('Error al consultar historial de pedidos del cliente:', err);
    return NextResponse.json(
      { error: 'Error al consultar historial de pedidos.' },
      { status: 500 }
    );
  }
}
