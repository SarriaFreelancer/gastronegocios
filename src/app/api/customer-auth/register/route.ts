import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password.trim()).digest('hex');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nombre, telefono, email, direccion, barrio, ciudad, password, restaurantSlug, restaurantId } = body;

    if (!nombre || !telefono || !password) {
      return NextResponse.json(
        { error: 'Nombre, teléfono y contraseña son requeridos para el registro.' },
        { status: 400 }
      );
    }

    // Resolver ID de restaurante
    let targetRestaurantId: number | null = restaurantId ? Number(restaurantId) : null;
    if (!targetRestaurantId && restaurantSlug) {
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

    if (!targetRestaurantId) {
      const firstRest = await prisma.restaurant.findFirst({ select: { id: true } });
      if (firstRest) targetRestaurantId = firstRest.id;
    }

    if (!targetRestaurantId) {
      return NextResponse.json({ error: 'Restaurante no encontrado.' }, { status: 404 });
    }

    const cleanPhone = String(telefono).replace(/\D/g, '');
    const cleanEmail = email ? String(email).trim().toLowerCase() : null;
    const cleanPass = hashPassword(password);

    // Buscar si ya existe un cliente con este teléfono en el restaurante
    const existing = await prisma.customer.findFirst({
      where: {
        restaurantId: targetRestaurantId,
        OR: [
          { telefono: cleanPhone },
          ...(cleanEmail ? [{ email: cleanEmail }] : []),
        ],
      },
    });

    let customer;

    if (existing) {
      if (existing.password) {
        return NextResponse.json(
          { error: 'Ya existe una cuenta con este teléfono o correo. Por favor inicia sesión.' },
          { status: 409 }
        );
      }

      // Si existía sin contraseña (creado por un pedido anterior), actualizamos su cuenta
      customer = await prisma.customer.update({
        where: { id: existing.id },
        data: {
          nombre: nombre.trim(),
          telefono: cleanPhone,
          email: cleanEmail || existing.email,
          direccion: direccion?.trim() || existing.direccion,
          barrio: barrio?.trim() || existing.barrio,
          ciudad: ciudad?.trim() || existing.ciudad || 'Cali',
          password: cleanPass,
          activo: true,
        },
      });
    } else {
      // Crear nuevo cliente
      customer = await prisma.customer.create({
        data: {
          nombre: nombre.trim(),
          telefono: cleanPhone,
          email: cleanEmail,
          direccion: direccion?.trim() || null,
          barrio: barrio?.trim() || null,
          ciudad: ciudad?.trim() || 'Cali',
          password: cleanPass,
          restaurantId: targetRestaurantId,
          activo: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: '¡Registro exitoso! Ya puedes ver tu historial y facturas.',
      customer: {
        id: customer.id,
        nombre: customer.nombre,
        telefono: customer.telefono,
        email: customer.email,
        direccion: customer.direccion,
        barrio: customer.barrio,
        ciudad: customer.ciudad,
        totalPedidos: customer.totalPedidos,
      },
    });
  } catch (err: any) {
    console.error('Error en registro de cliente:', err);
    return NextResponse.json(
      { error: 'Ocurrió un error al procesar el registro.' },
      { status: 500 }
    );
  }
}
