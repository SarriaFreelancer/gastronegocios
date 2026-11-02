import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const soloActivos = searchParams.get('activo') === 'true';

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
    const { nombre, precio, categoria = 'Toppings' } = body;

    if (!nombre) {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }

    const newAddon = await prisma.productAddon.create({
      data: {
        nombre,
        precio: Number(precio) || 0,
        categoria,
        activo: true,
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
    const { id, nombre, precio, categoria, activo } = body;

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
