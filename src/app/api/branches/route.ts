import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureRestaurantBranchesAndSchema, getOrCreateBranchesForRestaurant, serializeSafe } from '@/lib/db-autoheal';

export const dynamic = 'force-dynamic';

// GET /api/branches
export async function GET(request: Request) {
  try {
    await ensureRestaurantBranchesAndSchema();

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const restaurantIdParam = searchParams.get('restaurantId');
    const restaurantSlug = searchParams.get('restaurantSlug') || searchParams.get('slug');

    let targetRestId: number | null = restaurantIdParam ? Number(restaurantIdParam) : null;

    if (!targetRestId && restaurantSlug) {
      try {
        const cleanSlug = restaurantSlug.toLowerCase().trim();
        const restRows: any[] = await prisma.$queryRawUnsafe(
          "SELECT `id` FROM `restaurants` WHERE `slug` = ? OR `subdominio` = ? LIMIT 1;",
          cleanSlug,
          cleanSlug
        );
        if (restRows[0]?.id) {
          targetRestId = Number(restRows[0].id);
        }
      } catch {}
    }

    // Ensure the requested restaurant always has at least its default Sede Principal
    if (targetRestId) {
      await getOrCreateBranchesForRestaurant(targetRestId);
    }

    try {
      const whereClause: any = {};
      if (activeOnly) {
        whereClause.activo = true;
      }
      if (targetRestId) {
        whereClause.restaurantId = targetRestId;
      }

      const branches = await prisma.branch.findMany({
        where: whereClause,
        orderBy: { id: 'asc' },
        include: {
          _count: {
            select: {
              orders: true,
              tables: true,
              users: true,
            },
          },
        },
      });

      if (branches.length === 0 && targetRestId) {
        const healed = await getOrCreateBranchesForRestaurant(targetRestId);
        return NextResponse.json(healed);
      }

      return NextResponse.json(branches);
    } catch (prismaErr) {
      // Resilient raw SQL fallback
      let sql = "SELECT `id`, `nombre`, `slug`, `direccion`, `telefono`, `ciudad`, `activo`, `restaurantId`, `createdAt`, `updatedAt` FROM `branches` WHERE 1=1";
      const params: any[] = [];
      if (targetRestId) {
        sql += " AND `restaurantId` = ?";
        params.push(targetRestId);
      }
      if (activeOnly) {
        sql += " AND `activo` = 1";
      }
      sql += " ORDER BY `id` ASC;";

      const rows: any[] = await prisma.$queryRawUnsafe(sql, ...params);
      const formatted = rows.map((r) => ({
        ...r,
        id: Number(r.id),
        activo: Boolean(r.activo),
        restaurantId: r.restaurantId ? Number(r.restaurantId) : targetRestId,
        _count: { orders: 0, tables: 0, users: 0 },
      }));
      return NextResponse.json(serializeSafe(formatted));
    }
  } catch (error) {
    console.error('Error fetching branches:', error);
    return NextResponse.json({ error: 'Error al obtener sedes' }, { status: 500 });
  }
}

// POST /api/branches
export async function POST(request: Request) {
  try {
    await ensureRestaurantBranchesAndSchema();

    const body = await request.json();
    const { nombre, slug, direccion, telefono, ciudad, activo, restaurantId } = body;

    if (!nombre || !String(nombre).trim()) {
      return NextResponse.json({ error: 'El nombre de la sede es obligatorio' }, { status: 400 });
    }

    const targetRestId = restaurantId ? Number(restaurantId) : 1;
    const baseSlug = (slug || nombre)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if baseSlug already exists globally in `branches` (since Branch.slug is @unique)
    let finalSlug = baseSlug || `sede-${targetRestId}`;
    try {
      const existingRows: any[] = await prisma.$queryRawUnsafe(
        "SELECT `id` FROM `branches` WHERE `slug` = ? LIMIT 1;",
        finalSlug
      );
      if (existingRows.length > 0) {
        finalSlug = `${finalSlug}-${targetRestId}-${Date.now().toString().slice(-4)}`;
      }
    } catch {
      finalSlug = `${finalSlug}-${targetRestId}-${Date.now().toString().slice(-4)}`;
    }

    const cleanNombre = String(nombre).trim();
    const cleanDireccion = direccion ? String(direccion).trim() : null;
    const cleanTelefono = telefono ? String(telefono).trim() : null;
    const cleanCiudad = ciudad ? String(ciudad).trim() : 'Cali';
    const isActivo = activo !== undefined ? Boolean(activo) : true;

    try {
      const newBranch = await prisma.branch.create({
        data: {
          nombre: cleanNombre,
          slug: finalSlug,
          direccion: cleanDireccion,
          telefono: cleanTelefono,
          ciudad: cleanCiudad,
          activo: isActivo,
          restaurantId: targetRestId,
        },
      });
      return NextResponse.json(newBranch, { status: 201 });
    } catch (createErr) {
      // Raw SQL fallback so creating a branch never fails
      const fallbackSlug = `${baseSlug}-${targetRestId}-${Date.now().toString().slice(-4)}`;
      await prisma.$executeRawUnsafe(
        `INSERT INTO \`branches\` (\`nombre\`, \`slug\`, \`direccion\`, \`telefono\`, \`ciudad\`, \`activo\`, \`restaurantId\`, \`createdAt\`, \`updatedAt\`)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW());`,
        cleanNombre,
        fallbackSlug,
        cleanDireccion,
        cleanTelefono,
        cleanCiudad,
        isActivo ? 1 : 0,
        targetRestId
      );

      const insertedRows: any[] = await prisma.$queryRawUnsafe(
        "SELECT * FROM `branches` WHERE `slug` = ? ORDER BY `id` DESC LIMIT 1;",
        fallbackSlug
      );
      const created = insertedRows[0] || {
        id: Date.now(),
        nombre: cleanNombre,
        slug: fallbackSlug,
        direccion: cleanDireccion,
        telefono: cleanTelefono,
        ciudad: cleanCiudad,
        activo: isActivo,
        restaurantId: targetRestId,
      };
      return NextResponse.json(
        {
          ...created,
          id: Number(created.id),
          activo: Boolean(created.activo),
          restaurantId: Number(created.restaurantId || targetRestId),
        },
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.error('Error creating branch:', error);
    return NextResponse.json({ error: 'Error al crear la sede' }, { status: 500 });
  }
}

// PUT /api/branches
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, nombre, slug, direccion, telefono, ciudad, activo } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID de sede requerido' }, { status: 400 });
    }

    try {
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
    } catch {
      // Raw SQL fallback
      await prisma.$executeRawUnsafe(
        `UPDATE \`branches\`
         SET \`nombre\` = COALESCE(?, \`nombre\`),
             \`direccion\` = COALESCE(?, \`direccion\`),
             \`telefono\` = COALESCE(?, \`telefono\`),
             \`ciudad\` = COALESCE(?, \`ciudad\`),
             \`activo\` = COALESCE(?, \`activo\`),
             \`updatedAt\` = NOW()
         WHERE \`id\` = ?;`,
        nombre ?? null,
        direccion ?? null,
        telefono ?? null,
        ciudad ?? null,
        activo !== undefined ? (activo ? 1 : 0) : null,
        Number(id)
      );
      const rows: any[] = await prisma.$queryRawUnsafe(
        "SELECT * FROM `branches` WHERE `id` = ? LIMIT 1;",
        Number(id)
      );
      return NextResponse.json(rows[0] || { id: Number(id), nombre, direccion, telefono, ciudad, activo });
    }
  } catch (error) {
    console.error('Error updating branch:', error);
    return NextResponse.json({ error: 'Error al actualizar la sede' }, { status: 500 });
  }
}

// DELETE /api/branches?id=X
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID de sede requerido' }, { status: 400 });
    }

    // Prevent deleting the last remaining branch of a restaurant
    try {
      const branchRows: any[] = await prisma.$queryRawUnsafe(
        "SELECT `id`, `restaurantId` FROM `branches` WHERE `id` = ? LIMIT 1;",
        Number(id)
      );
      if (branchRows[0]?.restaurantId) {
        const countRows: any[] = await prisma.$queryRawUnsafe(
          "SELECT COUNT(*) as cnt FROM `branches` WHERE `restaurantId` = ?;",
          Number(branchRows[0].restaurantId)
        );
        const totalBranches = Number(countRows[0]?.cnt || 0);
        if (totalBranches <= 1) {
          return NextResponse.json(
            { error: 'No puedes eliminar la única sede del restaurante. Todo restaurante debe tener al menos su Sede Principal.' },
            { status: 400 }
          );
        }
      }
    } catch {}

    await prisma.branch.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting branch:', error);
    return NextResponse.json({ error: 'Error al eliminar la sede' }, { status: 500 });
  }
}
