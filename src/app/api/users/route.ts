import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get('restaurantId');
    const restaurantSlug = searchParams.get('restaurantSlug');

    const where: any = {};
    if (restaurantId && restaurantId !== 'all') {
      where.restaurantId = Number(restaurantId);
    } else if (restaurantSlug) {
      where.restaurant = { slug: restaurantSlug };
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        nombre: true,
        email: true,
        password: true,
        rol: true,
        estado: true,
        branchId: true,
        restaurantId: true,
        branch: {
          select: {
            id: true,
            nombre: true,
            slug: true,
          },
        },
        restaurant: {
          select: {
            id: true,
            nombre: true,
            slug: true,
          },
        },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { nombre, email, password, rol, estado, branchId, restaurantId } = await req.json();

    if (!nombre || !email || !password) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (exists) {
      return NextResponse.json({ error: 'El correo ya se encuentra registrado' }, { status: 400 });
    }

    const newUser = await prisma.user.create({
      data: {
        nombre,
        email: email.trim().toLowerCase(),
        password: String(password).trim(),
        rol: rol || 'Cajero',
        estado: estado || 'Activo',
        branchId: branchId ? Number(branchId) : null,
        restaurantId: restaurantId ? Number(restaurantId) : null,
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        password: true,
        rol: true,
        estado: true,
        branchId: true,
        restaurantId: true,
        branch: {
          select: {
            id: true,
            nombre: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 });
  }
}
