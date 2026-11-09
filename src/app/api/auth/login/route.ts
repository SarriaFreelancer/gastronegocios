import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, restaurantSlug, restaurantId } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email o usuario y contraseña requeridos' },
        { status: 400 }
      );
    }

    const input = String(email).trim().toLowerCase();
    const cleanPass = String(password).trim();
    const localPart = input.includes('@') ? input.split('@')[0] : input;

    // 1. Resolve target restaurant if provided
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

    const safeUserSelect = {
      id: true,
      nombre: true,
      email: true,
      password: true,
      rol: true,
      estado: true,
      restaurantId: true,
      branchId: true,
      branch: {
        select: { id: true, nombre: true, slug: true },
      },
      restaurant: {
        select: { id: true, nombre: true, slug: true, logo: true, subdominio: true },
      },
    };

    // 2. If target restaurant is specified, prioritize matching its users
    let users: any[] = [];
    try {
      if (targetRestaurantId) {
        users = await prisma.user.findMany({
          where: {
            restaurantId: targetRestaurantId,
            OR: [
              { email: input },
              { email: { startsWith: `${input}@` } },
              { email: { contains: input } },
              { email: { startsWith: `${localPart}@` } },
              { nombre: { contains: input } },
              { nombre: { contains: localPart } },
              ...(localPart === 'admin' ? [{ rol: { in: ['Administrador', 'Superadmin'] } }] : []),
            ],
          },
          select: safeUserSelect,
        });
      }

      // If no users found within target restaurant, search globally
      if (users.length === 0) {
        const searchConditions: any[] = [
          { email: input },
          { email: { startsWith: `${input}@` } },
          { email: { contains: input } },
          { email: { startsWith: `${localPart}@` } },
          { nombre: { contains: input } },
          { nombre: { contains: localPart } },
        ];

        if (!input.includes('@')) {
          searchConditions.push({ email: `${input}@gastronegocios.com` });
          searchConditions.push({ email: `${input}@puntog.com` });
        }

        users = await prisma.user.findMany({
          where: {
            OR: searchConditions,
          },
          select: safeUserSelect,
        });
      }
    } catch (prismaErr: any) {
      console.warn('Prisma query warning in login, attempting resilient raw SQL fallback:', prismaErr?.message);
      try {
        const rawRows: any[] = await prisma.$queryRawUnsafe(`
          SELECT u.id, u.nombre, u.email, u.password, u.rol, u.estado, u.restaurantId, u.branchId,
                 r.nombre as restNombre, r.slug as restSlug, r.logo as restLogo
          FROM \`users\` u
          LEFT JOIN \`restaurants\` r ON u.restaurantId = r.id
          WHERE LOWER(u.email) = ? OR LOWER(u.email) = ? OR LOWER(u.email) LIKE ?
          LIMIT 5;
        `, input, `${localPart}@gastronegocios.com`, `%${localPart}%`);

        users = rawRows.map(r => ({
          id: r.id,
          nombre: r.nombre,
          email: r.email,
          password: r.password,
          rol: r.rol,
          estado: r.estado || 'Activo',
          restaurantId: r.restaurantId,
          branchId: r.branchId,
          restaurant: r.restNombre ? { id: r.restaurantId, nombre: r.restNombre, slug: r.restSlug, logo: r.restLogo } : null,
        }));
      } catch (rawErr: any) {
        console.error('Raw query fallback error:', rawErr);
        throw rawErr;
      }
    }

    // 3. Find the user whose password matches (exact, trimmed, or case-insensitive)
    const matchedUser = users.find((u) => {
      if (!u.password) return false;
      const dbPass = u.password.trim();
      return (
        u.password === password ||
        dbPass === cleanPass ||
        dbPass.toLowerCase() === cleanPass.toLowerCase()
      );
    });

    if (!matchedUser) {
      return NextResponse.json(
        { error: 'Credenciales inválidas. Verifica tu correo y contraseña.' },
        { status: 401 }
      );
    }

    if (matchedUser.estado !== 'Activo') {
      return NextResponse.json(
        { error: 'Usuario inactivo. Contacta al administrador.' },
        { status: 403 }
      );
    }

    const { password: _, ...safeUser } = matchedUser;
    return NextResponse.json({ success: true, user: safeUser });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
