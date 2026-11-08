import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Obtener perfil completo y direcciones guardadas del cliente
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');
    const telefono = searchParams.get('telefono');
    const restaurantSlug = searchParams.get('restaurantSlug');

    if (!customerId && !telefono) {
      return NextResponse.json(
        { error: 'ID o teléfono de cliente requerido' },
        { status: 400 }
      );
    }

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

    const customer = await prisma.customer.findFirst({
      where: {
        ...(customerId ? { id: Number(customerId) } : {}),
        ...(telefono ? { telefono: String(telefono).replace(/\D/g, '') } : {}),
        ...(targetRestaurantId ? { restaurantId: targetRestaurantId } : {}),
      },
      select: {
        id: true,
        nombre: true,
        telefono: true,
        email: true,
        direccion: true,
        barrio: true,
        ciudad: true,
        notas: true,
        totalPedidos: true,
        totalComprado: true,
        createdAt: true,
      },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, customer });
  } catch (err) {
    console.error('Error obteniendo perfil de cliente:', err);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// PUT: Actualizar información de contacto y direcciones guardadas
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, nombre, telefono, email, direccion, barrio, ciudad, notas } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID de cliente requerido' }, { status: 400 });
    }

    const updated = await prisma.customer.update({
      where: { id: Number(id) },
      data: {
        ...(nombre ? { nombre: String(nombre).trim() } : {}),
        ...(telefono ? { telefono: String(telefono).replace(/\D/g, '') } : {}),
        ...(email !== undefined ? { email: email ? String(email).trim().toLowerCase() : null } : {}),
        ...(direccion !== undefined ? { direccion: direccion ? String(direccion).trim() : null } : {}),
        ...(barrio !== undefined ? { barrio: barrio ? String(barrio).trim() : null } : {}),
        ...(ciudad !== undefined ? { ciudad: String(ciudad).trim() } : {}),
        ...(notas !== undefined ? { notas: notas ? String(notas).trim() : null } : {}),
      },
      select: {
        id: true,
        nombre: true,
        telefono: true,
        email: true,
        direccion: true,
        barrio: true,
        ciudad: true,
        notas: true,
        totalPedidos: true,
        totalComprado: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Dirección y perfil actualizados con éxito',
      customer: updated,
    });
  } catch (err) {
    console.error('Error actualizando perfil de cliente:', err);
    return NextResponse.json({ error: 'Error al actualizar perfil' }, { status: 500 });
  }
}
