import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: Number(params.id) },
      include: {
        branches: true,
        _count: {
          select: {
            branches: true,
            products: true,
            categories: true,
            orders: true,
            tables: true,
            users: true,
          },
        },
      },
    });

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurante no encontrado' }, { status: 404 });
    }

    return NextResponse.json(restaurant);
  } catch (error) {
    return NextResponse.json({ error: 'Error al consultar restaurante' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const restaurantId = Number(params.id);
    const body = await req.json();

    const data: any = {};
    if (body.nombre !== undefined) data.nombre = body.nombre;
    if (body.eslogan !== undefined) data.eslogan = body.eslogan;
    if (body.descripcion !== undefined) data.descripcion = body.descripcion;
    if (body.logo !== undefined) data.logo = body.logo;
    if (body.bannerHero !== undefined) data.bannerHero = body.bannerHero;
    if (body.colorPrimario !== undefined) data.colorPrimario = body.colorPrimario;
    if (body.colorSecundario !== undefined) data.colorSecundario = body.colorSecundario;
    if (body.colorFondo !== undefined) data.colorFondo = body.colorFondo;
    if (body.telefonoWhatsapp !== undefined) data.telefonoWhatsapp = body.telefonoWhatsapp;
    if (body.instagram !== undefined) data.instagram = body.instagram;
    if (body.direccionCentral !== undefined) data.direccionCentral = body.direccionCentral;
    if (body.ciudad !== undefined) data.ciudad = body.ciudad;
    if (body.costoDomicilioBase !== undefined) data.costoDomicilioBase = Number(body.costoDomicilioBase);
    if (body.propinaSugeridaPct !== undefined) data.propinaSugeridaPct = Number(body.propinaSugeridaPct);
    if (body.plan !== undefined) data.plan = body.plan;
    if (body.activo !== undefined) data.activo = Boolean(body.activo);
    if (body.dominio !== undefined) data.dominio = body.dominio || null;

    const updated = await prisma.restaurant.update({
      where: { id: restaurantId },
      data,
      include: {
        branches: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating restaurant:', error);
    return NextResponse.json({ error: 'Error al actualizar restaurante' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const restaurantId = Number(params.id);
    // Proteger restaurante principal Punto G (id 1)
    if (restaurantId === 1) {
      return NextResponse.json({ error: 'No es posible eliminar el restaurante principal de la plataforma' }, { status: 400 });
    }

    await prisma.restaurant.delete({
      where: { id: restaurantId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar restaurante' }, { status: 500 });
  }
}
