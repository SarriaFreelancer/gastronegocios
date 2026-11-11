import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveTenantScope } from '@/lib/tenant-security';
import { ensureRestaurantBranchesAndSchema, getOrCreateBranchesForRestaurant, serializeSafe } from '@/lib/db-autoheal';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await ensureRestaurantBranchesAndSchema();

    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get('branchId');
    const restaurantId = searchParams.get('restaurantId');
    const restaurantSlug = searchParams.get('restaurantSlug');

    const where: any = {};
    if (branchId && branchId !== 'all') {
      where.branchId = Number(branchId);
    }

    const allowAll = searchParams.get('allTenants') === 'true';
    if (!allowAll) {
      if (restaurantId && !isNaN(Number(restaurantId))) {
        where.restaurantId = Number(restaurantId);
      } else if (restaurantSlug) {
        const restRows: any[] = await prisma.$queryRawUnsafe(
          "SELECT `id` FROM `restaurants` WHERE LOWER(`slug`) = ? LIMIT 1;",
          restaurantSlug.toLowerCase().trim()
        );
        if (restRows.length > 0) {
          where.restaurantId = Number(restRows[0].id);
        }
      } else {
        try {
          const scope = await resolveTenantScope(req);
          where.restaurantId = scope.restaurantId;
        } catch {
          where.restaurantId = 1;
        }
      }
    }

    try {
      const tables = await prisma.restaurantTable.findMany({
        where,
        include: {
          branch: {
            select: {
              id: true,
              nombre: true,
              slug: true,
            },
          },
          orders: {
            where: {
              estado: {
                notIn: ['Entregado', 'Cancelado'],
              },
            },
            include: {
              items: true,
            },
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { id: 'asc' },
      });

      return NextResponse.json(serializeSafe(tables));
    } catch (queryErr) {
      console.warn('Prisma tables query error, attempting raw SQL fallback:', queryErr);
      let sql = "SELECT * FROM `restaurant_tables`";
      const params: any[] = [];
      const conds: string[] = [];
      if (where.restaurantId) {
        conds.push("`restaurantId` = ?");
        params.push(Number(where.restaurantId));
      }
      if (where.branchId) {
        conds.push("`branchId` = ?");
        params.push(Number(where.branchId));
      }
      if (conds.length > 0) {
        sql += " WHERE " + conds.join(" AND ");
      }
      sql += " ORDER BY `id` ASC;";
      const rawTables: any[] = await prisma.$queryRawUnsafe(sql, ...params);
      return NextResponse.json(
        serializeSafe(
          rawTables.map((t) => ({
            ...t,
            id: Number(t.id),
            capacidad: Number(t.capacidad || 4),
            branch: null,
            orders: [],
          }))
        )
      );
    }
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureRestaurantBranchesAndSchema();

    const body = await req.json();
    const { numero, capacidad, ubicacion, notas, branchId, restaurantId, restaurantSlug } = body;

    const cleanNumero = String(numero || '').trim();
    if (!cleanNumero) {
      return NextResponse.json({ error: 'El nombre o número de mesa es obligatorio' }, { status: 400 });
    }

    // Resolve restaurantId reliably
    let targetRestId = restaurantId ? Number(restaurantId) : 0;
    if ((!targetRestId || isNaN(targetRestId)) && restaurantSlug) {
      const restRows: any[] = await prisma.$queryRawUnsafe(
        "SELECT `id` FROM `restaurants` WHERE LOWER(`slug`) = ? LIMIT 1;",
        String(restaurantSlug).toLowerCase().trim()
      );
      if (restRows.length > 0) {
        targetRestId = Number(restRows[0].id);
      }
    }
    if (!targetRestId || isNaN(targetRestId)) {
      try {
        const scope = await resolveTenantScope(req);
        targetRestId = scope.restaurantId;
      } catch {
        targetRestId = 1;
      }
    }

    // Resolve branchId reliably
    let targetBranchId = branchId && branchId !== 'all' && !isNaN(Number(branchId)) ? Number(branchId) : null;
    if (!targetBranchId) {
      const branches = await getOrCreateBranchesForRestaurant(targetRestId);
      targetBranchId = branches[0]?.id ? Number(branches[0].id) : null;
    }

    // Ensure global unique index on `numero` is dropped so each restaurant can have its own "Mesa 1"
    await prisma.$executeRawUnsafe("ALTER TABLE `restaurant_tables` DROP INDEX `restaurant_tables_numero_key`;").catch(() => {});

    // Check duplicate ONLY within the same restaurant
    const duplicateRows: any[] = await prisma.$queryRawUnsafe(
      "SELECT `id`, `numero` FROM `restaurant_tables` WHERE `restaurantId` = ? AND LOWER(`numero`) = LOWER(?) LIMIT 1;",
      targetRestId,
      cleanNumero
    );

    if (duplicateRows.length > 0) {
      return NextResponse.json(
        { error: `Ya existe la mesa "${cleanNumero}" en este restaurante.` },
        { status: 400 }
      );
    }

    const cap = Number(capacidad) || 4;
    const ubi = String(ubicacion || 'Salón Principal').trim();
    const nts = notas ? String(notas).trim() : null;

    try {
      const table = await prisma.restaurantTable.create({
        data: {
          numero: cleanNumero,
          capacidad: cap,
          ubicacion: ubi,
          notas: nts,
          estado: 'Libre',
          branchId: targetBranchId,
          restaurantId: targetRestId,
        },
        include: {
          branch: true,
        },
      });

      return NextResponse.json(serializeSafe(table), { status: 201 });
    } catch (createErr) {
      console.warn('Prisma table create failed, using raw SQL fallback:', createErr);
      await prisma.$executeRawUnsafe(
        `INSERT INTO \`restaurant_tables\` (\`numero\`, \`capacidad\`, \`ubicacion\`, \`notas\`, \`estado\`, \`branchId\`, \`restaurantId\`, \`createdAt\`, \`updatedAt\`)
         VALUES (?, ?, ?, ?, 'Libre', ?, ?, NOW(), NOW());`,
        cleanNumero,
        cap,
        ubi,
        nts,
        targetBranchId,
        targetRestId
      );

      const createdRows: any[] = await prisma.$queryRawUnsafe(
        "SELECT * FROM `restaurant_tables` WHERE `restaurantId` = ? AND `numero` = ? ORDER BY `id` DESC LIMIT 1;",
        targetRestId,
        cleanNumero
      );

      return NextResponse.json(
        serializeSafe({
          ...(createdRows[0] || {}),
          numero: cleanNumero,
          capacidad: cap,
          ubicacion: ubi,
          estado: 'Libre',
          branchId: targetBranchId,
          restaurantId: targetRestId,
          orders: [],
        }),
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.error('Error creating table:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al crear la mesa en la base de datos' },
      { status: 500 }
    );
  }
}
