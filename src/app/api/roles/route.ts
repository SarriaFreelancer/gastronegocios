import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { STANDARD_MODULES, STANDARD_ROLES } from '@/lib/constants-roles';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get('restaurantId');
    const restaurantSlug = searchParams.get('restaurantSlug');

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

    let roles = await prisma.role.findMany({
      where: { restaurantId: resolvedRestaurantId },
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (roles.length === 0) {
      for (const standardRole of STANDARD_ROLES) {
        await prisma.role.create({
          data: {
            restaurantId: resolvedRestaurantId,
            nombre: standardRole.nombre,
            descripcion: standardRole.descripcion,
            permisos: JSON.stringify(standardRole.permisos),
          },
        });
      }

      roles = await prisma.role.findMany({
        where: { restaurantId: resolvedRestaurantId },
        include: {
          _count: { select: { users: true } },
        },
        orderBy: { createdAt: 'asc' },
      });
    }

    const parsedRoles = roles.map((r) => {
      let pObj = {};
      try {
        pObj = JSON.parse(r.permisos);
      } catch {}
      return {
        ...r,
        permisos: pObj,
        esSistema: STANDARD_ROLES.some((s) => s.nombre === r.nombre),
      };
    });

    return NextResponse.json(parsedRoles);
  } catch (error: any) {
    console.error('Error fetching roles:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { restaurantId, nombre, descripcion, permisos } = body;
    const restId = Number(restaurantId);

    if (!restId || !nombre) {
      return NextResponse.json(
        { error: 'restaurantId y nombre son obligatorios' },
        { status: 400 }
      );
    }

    const existingRole = await prisma.role.findFirst({
      where: { restaurantId: restId, nombre },
    });
    if (existingRole) {
      return NextResponse.json(
        { error: `Ya existe un rol con el nombre "${nombre}"` },
        { status: 400 }
      );
    }

    const role = await prisma.role.create({
      data: {
        restaurantId: restId,
        nombre,
        descripcion: descripcion || null,
        permisos: typeof permisos === 'string' ? permisos : JSON.stringify(permisos || {}),
      },
    });

    return NextResponse.json(role, { status: 201 });
  } catch (error: any) {
    console.error('Error creating role:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
