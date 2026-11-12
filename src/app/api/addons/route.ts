import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveTenantScope } from '@/lib/tenant-security';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const soloActivos = searchParams.get('activo') === 'true';
    const restaurantIdParam = searchParams.get('restaurantId');
    const restaurantSlugParam = searchParams.get('restaurantSlug');
    const allowAll = searchParams.get('allTenants') === 'true';

    let targetRestaurantId: number | null = null;

    if (restaurantIdParam && restaurantIdParam !== 'all') {
      targetRestaurantId = Number(restaurantIdParam);
    } else if (restaurantSlugParam) {
      const rest = await prisma.restaurant.findFirst({
        where: {
          OR: [{ slug: restaurantSlugParam }, { subdominio: restaurantSlugParam }],
        },
        select: { id: true },
      });
      if (rest) {
        targetRestaurantId = rest.id;
      }
    } else if (!allowAll) {
      const scope = await resolveTenantScope(req);
      targetRestaurantId = scope.restaurantId;
    }

    // Si se especifica un restaurante (o viene resuelto por scope), retornamos estrictamente sus adicionales
    if (targetRestaurantId) {
      const addons = await prisma.productAddon.findMany({
        where: {
          restaurantId: targetRestaurantId,
          ...(soloActivos ? { activo: true } : {}),
        },
        orderBy: [{ categoria: 'asc' }, { precio: 'asc' }],
      });

      return NextResponse.json(addons);
    }

    // Consulta general solo cuando se solicita explícitamente allTenants=true
    const addons = await prisma.productAddon.findMany({
      where: soloActivos ? { activo: true } : {},
      orderBy: [{ categoria: 'asc' }, { precio: 'asc' }],
    });

    return NextResponse.json(addons);
  } catch (error) {
    console.error('Error fetching addons:', error);
    return NextResponse.json({ error: 'Error al consultar adicionales' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nombre, precio, categoria = 'Adiciones', restaurantId = 1 } = body;

    if (!nombre) {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }

    const newAddon = await prisma.productAddon.create({
      data: {
        nombre,
        precio: Number(precio) || 0,
        categoria,
        activo: true,
        restaurantId: Number(restaurantId) || 1,
      },
    });

    return NextResponse.json(newAddon, { status: 201 });
  } catch (error) {
    console.error('Error creating addon:', error);
    return NextResponse.json({ error: 'Error al crear adicional' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, nombre, precio, categoria, activo, restaurantId } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const updated = await prisma.productAddon.update({
      where: { id: Number(id) },
      data: {
        ...(nombre !== undefined && { nombre }),
        ...(precio !== undefined && { precio: Number(precio) }),
        ...(categoria !== undefined && { categoria }),
        ...(activo !== undefined && { activo: Boolean(activo) }),
        ...(restaurantId !== undefined && { restaurantId: Number(restaurantId) }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating addon:', error);
    return NextResponse.json({ error: 'Error al actualizar adicional' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    await prisma.productAddon.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting addon:', error);
    return NextResponse.json({ error: 'Error al eliminar adicional' }, { status: 500 });
  }
}
