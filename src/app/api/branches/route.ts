import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const soloActivas = searchParams.get('activo') === 'true';
    const restaurantId = searchParams.get('restaurantId');
    const restaurantSlug = searchParams.get('restaurantSlug');

    const where: any = {};
    if (soloActivas) where.activo = true;
    if (restaurantId && restaurantId !== 'all') {
      where.restaurantId = Number(restaurantId);
    } else if (restaurantSlug) {
      where.restaurant = { slug: restaurantSlug };
    }

    const branches = await prisma.branch.findMany({
      where,
      include: {
        restaurant: {
          select: { id: true, nombre: true, slug: true },
        },
        _count: {
          select: {
            users: true,
            tables: true,
            orders: true,
            shifts: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    return NextResponse.json(branches);
  } catch (error) {
    console.error('Error fetching branches:', error);
    return NextResponse.json({ error: 'Error al consultar sedes' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nombre, slug, direccion, telefono, ciudad = 'Cali', activo = true, restaurantId = 1 } = body;

    if (!nombre) {
      return NextResponse.json({ error: 'El nombre de la sede es obligatorio' }, { status: 400 });
    }

    const finalSlug = (slug || nombre)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const branch = await prisma.branch.create({
      data: {
        nombre,
        slug: finalSlug,
        direccion: direccion || null,
        telefono: telefono || null,
        ciudad,
        activo: Boolean(activo),
        restaurantId: restaurantId ? Number(restaurantId) : 1,
      },
    });

    return NextResponse.json(branch, { status: 201 });
  } catch (error: any) {
    console.error('Error creating branch:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe una sede con ese identificador (slug)' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error al crear sede' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, nombre, slug, direccion, telefono, ciudad, activo } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID de sede requerido' }, { status: 400 });
    }

    const updated = await prisma.branch.update({
      where: { id: Number(id) },
      data: {
        ...(nombre !== undefined && { nombre }),
        ...(slug !== undefined && { slug }),
        ...(direccion !== undefined && { direccion }),
        ...(telefono !== undefined && { telefono }),
        ...(ciudad !== undefined && { ciudad }),
        ...(activo !== undefined && { activo: Boolean(activo) }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating branch:', error);
    return NextResponse.json({ error: 'Error al actualizar sede' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    await prisma.branch.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting branch:', error);
    return NextResponse.json({ error: 'Error al eliminar sede' }, { status: 500 });
  }
}
