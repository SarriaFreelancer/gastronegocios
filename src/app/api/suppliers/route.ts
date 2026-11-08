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
        { nit: { contains: search } },
        { contacto: { contains: search } },
      ];
    }

    const suppliers = await prisma.supplier.findMany({
      where,
      include: {
        _count: {
          select: { purchases: true },
        },
      },
      orderBy: { nombre: 'asc' },
    });

    return NextResponse.json(suppliers);
  } catch (error: any) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      restaurantId,
      nombre,
      nitOIdentificacion,
      nit,
      contacto,
      telefono,
      email,
      direccion,
      ciudad,
      categoria,
    } = body;

    const restId = Number(restaurantId);

    if (!restId || !nombre) {
      return NextResponse.json(
        { error: 'restaurantId y nombre son obligatorios' },
        { status: 400 }
      );
    }

    const supplier = await prisma.supplier.create({
      data: {
        restaurantId: restId,
        nombre,
        nit: nit || nitOIdentificacion || null,
        contacto: contacto || null,
        telefono: telefono || null,
        email: email || null,
        direccion: direccion || null,
        ciudad: ciudad || 'Cali',
        categoria: categoria || 'General',
      },
    });

    return NextResponse.json(supplier, { status: 201 });
  } catch (error: any) {
    console.error('Error creating supplier:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
