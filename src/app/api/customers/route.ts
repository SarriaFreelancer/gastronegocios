import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get('restaurantId');
    const restaurantSlug = searchParams.get('restaurantSlug');
    const search = searchParams.get('search');

    let resolvedRestaurantId: number | null = restaurantId ? Number(restaurantId) : null;
    if (!resolvedRestaurantId && restaurantSlug) {
      const rest = await prisma.restaurant.findUnique({
        where: { slug: restaurantSlug },
        select: { id: true },
      });
      if (rest) resolvedRestaurantId = rest.id;
    }

    if (!resolvedRestaurantId) {
      return NextResponse.json({ error: 'restaurantId es obligatorio' }, { status: 400 });
    }

    const where: any = { restaurantId: resolvedRestaurantId };
    if (search) {
      where.OR = [
        { nombre: { contains: search } },
        { documento: { contains: search } },
        { telefono: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { totalComprado: 'desc' },
      take: 100,
    });

    const enriched = customers.map((c) => ({
      ...c,
      documentoNumero: c.documento,
      documentoTipo: 'CC',
      totalConsumido: c.totalComprado,
      totalVisitas: c.totalPedidos,
      limiteCredito: 0,
      saldoCredito: 0,
      puntosFidelidad: Math.floor(c.totalComprado / 1000),
      _count: { orders: c.totalPedidos },
    }));

    return NextResponse.json(enriched);
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      restaurantId,
      nombre,
      documentoNumero,
      documento,
      telefono,
      email,
      direccion,
      ciudad,
      barrio,
      observaciones,
      notas,
    } = body;

    const restId = Number(restaurantId);

    if (!restId || !nombre) {
      return NextResponse.json(
        { error: 'restaurantId y nombre son obligatorios' },
        { status: 400 }
      );
    }

    const doc = documento || documentoNumero || null;

    if (doc) {
      const existing = await prisma.customer.findFirst({
        where: { restaurantId: restId, documento: doc },
      });
      if (existing) {
        return NextResponse.json(
          { error: `Ya existe un cliente con documento ${doc}` },
          { status: 400 }
        );
      }
    }

    const customer = await prisma.customer.create({
      data: {
        restaurantId: restId,
        nombre,
        documento: doc,
        telefono: telefono || null,
        email: email || null,
        direccion: direccion || null,
        ciudad: ciudad || 'Cali',
        barrio: barrio || null,
        notas: notas || observaciones || null,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error: any) {
    console.error('Error creating customer:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
