import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureRestaurantBranchesAndSchema, getOrCreateBranchesForRestaurant } from '@/lib/db-autoheal';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    await ensureRestaurantBranchesAndSchema();

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

    // 1. Resolver restaurante objetivo si se especificó
    let targetRestaurantId: number | null = restaurantId ? Number(restaurantId) : null;
    if (!targetRestaurantId && restaurantSlug) {
      const slugKey = String(restaurantSlug).toLowerCase().trim();
      const variantWithHyphen = slugKey === 'puntog' ? 'punto-g' : slugKey;
      const rest = await prisma.restaurant.findFirst({
        where: {
          OR: [
            { slug: slugKey },
            { subdominio: slugKey },
            { slug: variantWithHyphen },
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

    let users: any[] = [];

    try {
      // CASO 1: El usuario ingresó una dirección de email completa (contiene '@')
      if (input.includes('@')) {
        // A. Buscar coincidencia exacta por email
        const exactUser = await prisma.user.findFirst({
          where: { email: input },
          select: safeUserSelect,
        });

        if (exactUser) {
          users = [exactUser];
        } else {
          // Si no se encontró exacto, buscar en targetRestaurant o global por email
          users = await prisma.user.findMany({
            where: {
              email: { contains: input },
              ...(targetRestaurantId ? { restaurantId: targetRestaurantId } : {}),
            },
            select: safeUserSelect,
            take: 5,
          });
        }
      } else {
        // CASO 2: El usuario ingresó un alias o username (sin '@', ej: 'superadmin', 'admin', 'cocina', 'mesero')
        if (input === 'superadmin') {
          // Búsqueda específica para Superadmin
          users = await prisma.user.findMany({
            where: {
              OR: [
                { email: 'superadmin@gastronegocios.com' },
                { email: 'superadmin@puntog.com' },
                { rol: 'Superadmin' },
              ],
            },
            select: safeUserSelect,
            take: 2,
          });
        } else if (input === 'admin') {
          // Si especificó restaurante, buscar admin de ese restaurante
          if (targetRestaurantId) {
            users = await prisma.user.findMany({
              where: {
                restaurantId: targetRestaurantId,
                rol: 'Administrador',
              },
              select: safeUserSelect,
              take: 2,
            });
          }
          // Si no hay restaurante o no se encontró, buscar admin@puntog.com (NUNCA superadmin)
          if (users.length === 0) {
            users = await prisma.user.findMany({
              where: {
                email: 'admin@puntog.com',
                rol: 'Administrador',
              },
              select: safeUserSelect,
              take: 2,
            });
          }
        } else if (input === 'cocina' || input === 'chef') {
          users = await prisma.user.findMany({
            where: {
              OR: [
                { email: 'cocina@puntog.com' },
                { rol: { in: ['Cocinero', 'Cocina'] }, ...(targetRestaurantId ? { restaurantId: targetRestaurantId } : {}) },
              ],
            },
            select: safeUserSelect,
            take: 2,
          });
        } else if (input === 'mesero') {
          users = await prisma.user.findMany({
            where: {
              OR: [
                { email: 'mesero@puntog.com' },
                { rol: 'Mesero', ...(targetRestaurantId ? { restaurantId: targetRestaurantId } : {}) },
              ],
            },
            select: safeUserSelect,
            take: 2,
          });
        } else if (input === 'cajero') {
          users = await prisma.user.findMany({
            where: {
              OR: [
                { email: 'cajero@puntog.com' },
                { rol: 'Cajero', ...(targetRestaurantId ? { restaurantId: targetRestaurantId } : {}) },
              ],
            },
            select: safeUserSelect,
            take: 2,
          });
        } else {
          // Cualquier otro alias genérico
          users = await prisma.user.findMany({
            where: {
              OR: [
                { email: `${input}@puntog.com` },
                { email: `${input}@gastronegocios.com` },
                { nombre: { contains: input } },
              ],
              ...(targetRestaurantId ? { restaurantId: targetRestaurantId } : {}),
            },
            select: safeUserSelect,
            take: 5,
          });
        }
      }
    } catch (prismaErr: any) {
      console.warn('Prisma query warning in login, attempting resilient raw SQL fallback:', prismaErr?.message);
      try {
        let rawRows: any[] = [];
        if (input.includes('@')) {
          rawRows = await prisma.$queryRawUnsafe(`
            SELECT u.id, u.nombre, u.email, u.password, u.rol, u.estado, u.restaurantId, u.branchId,
                   r.nombre as restNombre, r.slug as restSlug, r.logo as restLogo
            FROM \`users\` u
            LEFT JOIN \`restaurants\` r ON u.restaurantId = r.id
            WHERE LOWER(u.email) = ?
            LIMIT 2;
          `, input);
        } else {
          rawRows = await prisma.$queryRawUnsafe(`
            SELECT u.id, u.nombre, u.email, u.password, u.rol, u.estado, u.restaurantId, u.branchId,
                   r.nombre as restNombre, r.slug as restSlug, r.logo as restLogo
            FROM \`users\` u
            LEFT JOIN \`restaurants\` r ON u.restaurantId = r.id
            WHERE LOWER(u.email) = ? OR LOWER(u.email) = ?
            LIMIT 5;
          `, `${localPart}@puntog.com`, `${localPart}@gastronegocios.com`);
        }

        users = rawRows.map((r) => ({
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

    // 3. Ordenar usuarios para priorizar coincidencia exacta de email
    const sortedUsers = [...users].sort((a, b) => {
      const aExact = (a.email || '').toLowerCase() === input;
      const bExact = (b.email || '').toLowerCase() === input;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    });

    // 4. Encontrar el usuario cuya contraseña coincide
    const matchedUser = sortedUsers.find((u) => {
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

    // 5. Cargar restaurante asociado si falta en la consulta (o vincular a Punto G si es usuario del restaurante principal sin restaurantId asignado)
    let userRestaurant = matchedUser.restaurant;
    let effectiveRestaurantId = matchedUser.restaurantId;

    if (!userRestaurant && matchedUser.rol !== 'Superadmin') {
      try {
        if (effectiveRestaurantId) {
          const dbRest = await prisma.restaurant.findUnique({
            where: { id: effectiveRestaurantId },
            select: { id: true, nombre: true, slug: true, logo: true, subdominio: true },
          });
          if (dbRest) userRestaurant = dbRest;
        }
        // Si sigue sin restaurante pero es un usuario @puntog.com o del restaurante objetivo, vincularlo
        if (!userRestaurant) {
          const fallbackRest = await prisma.restaurant.findFirst({
            where: targetRestaurantId
              ? { id: targetRestaurantId }
              : { OR: [{ slug: 'punto-g' }, { id: 1 }] },
            select: { id: true, nombre: true, slug: true, logo: true, subdominio: true },
          });
          if (fallbackRest) {
            userRestaurant = fallbackRest;
            effectiveRestaurantId = fallbackRest.id;
            // Actualizar en BD para futuras consultas
            await prisma.user.update({
              where: { id: matchedUser.id },
              data: { restaurantId: fallbackRest.id },
            }).catch(() => {});
          }
        }
      } catch (e) {
        // Ignorar si falla
      }
    }

    let effectiveBranchId = matchedUser.branchId;
    let effectiveBranch = matchedUser.branch;

    if (effectiveRestaurantId && matchedUser.rol !== 'Superadmin') {
      try {
        const restBranches = await getOrCreateBranchesForRestaurant(Number(effectiveRestaurantId));
        if (userRestaurant) {
          userRestaurant = { ...userRestaurant, branches: restBranches };
        }
        if (!effectiveBranchId && restBranches.length > 0) {
          effectiveBranchId = restBranches[0].id;
          effectiveBranch = {
            id: restBranches[0].id,
            nombre: restBranches[0].nombre,
            slug: restBranches[0].slug,
          };
          await prisma.$executeRawUnsafe(
            "UPDATE `users` SET `branchId` = ? WHERE `id` = ?;",
            Number(effectiveBranchId),
            Number(matchedUser.id)
          ).catch(() => {});
        }
      } catch {}
    }

    const { password: _, ...safeUser } = {
      ...matchedUser,
      restaurantId: effectiveRestaurantId,
      restaurant: userRestaurant,
      branchId: effectiveBranchId,
      branch: effectiveBranch,
    };

    return NextResponse.json({ success: true, user: safeUser });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
