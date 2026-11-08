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
    const { identifier, password, restaurantSlug, restaurantId } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Teléfono o correo y contraseña requeridos.' },
        { status: 400 }
      );
    }

    // Resolver restaurante
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

    const cleanInput = String(identifier).trim();
    const cleanPhone = cleanInput.replace(/\D/g, '');
    const cleanPass = String(password).trim();
    const hashedPass = hashPassword(cleanPass);

    // Buscar cliente por teléfono o email dentro del restaurante
    const customer = await prisma.customer.findFirst({
      where: {
        restaurantId: targetRestaurantId,
        OR: [
          ...(cleanPhone ? [{ telefono: cleanPhone }] : []),
          { telefono: cleanInput },
          { email: cleanInput.toLowerCase() },
        ],
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'No se encontró ninguna cuenta registrada con estos datos en este restaurante.' },
        { status: 404 }
      );
    }

    if (!customer.password) {
      return NextResponse.json(
        { error: 'Esta cuenta aún no tiene contraseña. Por favor usa la opción "Registrarme" para asignarla.' },
        { status: 400 }
      );
    }

    const passMatch =
      customer.password === hashedPass ||
      customer.password === cleanPass;

    if (!passMatch) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta. Por favor verifica e intenta de nuevo.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `¡Bienvenido de nuevo, ${customer.nombre}!`,
      customer: {
        id: customer.id,
        nombre: customer.nombre,
        telefono: customer.telefono,
        email: customer.email,
        direccion: customer.direccion,
        barrio: customer.barrio,
        ciudad: customer.ciudad,
        totalPedidos: customer.totalPedidos,
        totalComprado: customer.totalComprado,
      },
    });
  } catch (err: any) {
    console.error('Error en login de cliente:', err);
    return NextResponse.json(
      { error: 'Error al iniciar sesión.' },
      { status: 500 }
    );
  }
}
