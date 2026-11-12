import { prisma } from '@/lib/prisma';

let lastSchemaHealAt = 0;
const HEAL_COOLDOWN_MS = 60_000;

/**
 * Recursively converts any BigInt values returned by Prisma raw queries into standard Numbers
 * so NextResponse.json() never throws "Do not know how to serialize a BigInt".
 */
export function serializeSafe<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return Number(obj) as unknown as T;
  if (obj instanceof Date) return obj.toISOString() as unknown as T;
  if (Array.isArray(obj)) return obj.map((item) => serializeSafe(item)) as unknown as T;
  if (typeof obj === 'object') {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj as Record<string, any>)) {
      out[k] = serializeSafe(v);
    }
    return out as T;
  }
  return obj;
}

async function safeExec(sql: string) {
  try {
    await prisma.$executeRawUnsafe(sql);
  } catch {
    // Ignore if column/table already exists or syntax unsupported
  }
}

/**
 * Ensures critical multi-tenant columns exist and guarantees that EVERY restaurant
 * in `restaurants` has at least one active branch (`Sede Principal`) in `branches`.
 */
export async function ensureRestaurantBranchesAndSchema(force = false): Promise<void> {
  const now = Date.now();
  if (!force && now - lastSchemaHealAt < HEAL_COOLDOWN_MS) {
    return;
  }
  lastSchemaHealAt = now;

  try {
    // 1. Ensure critical columns exist on restaurants, branches, users, customers
    await Promise.all([
      safeExec("ALTER TABLE `restaurants` ADD COLUMN `activo` TINYINT(1) NOT NULL DEFAULT 1;"),
      safeExec("ALTER TABLE `restaurants` ADD COLUMN `estadoLicencia` VARCHAR(191) NOT NULL DEFAULT 'ACTIVA';"),
      safeExec("ALTER TABLE `restaurants` ADD COLUMN `mostrarEnLanding` TINYINT(1) NOT NULL DEFAULT 1;"),
      safeExec("ALTER TABLE `restaurants` ADD COLUMN `fechaVencimiento` DATETIME(3) NULL;"),
      safeExec("ALTER TABLE `restaurants` ADD COLUMN `limiteSedes` INT NOT NULL DEFAULT 3;"),
      safeExec("ALTER TABLE `restaurants` ADD COLUMN `limiteProductos` INT NOT NULL DEFAULT 100;"),
      safeExec("ALTER TABLE `restaurants` ADD COLUMN `limiteUsuarios` INT NOT NULL DEFAULT 10;"),
      safeExec("ALTER TABLE `restaurants` ADD COLUMN `diasGracia` INT NOT NULL DEFAULT 5;"),
      safeExec("ALTER TABLE `restaurants` ADD COLUMN `notasSuperadmin` TEXT NULL;"),
      safeExec("ALTER TABLE `restaurants` ADD COLUMN `modulosActivos` TEXT NULL;"),
      safeExec("ALTER TABLE `branches` ADD COLUMN `restaurantId` INT NULL;"),
      safeExec("ALTER TABLE `branches` ADD COLUMN `activo` TINYINT(1) NOT NULL DEFAULT 1;"),
      safeExec("ALTER TABLE `branches` ADD COLUMN `ciudad` VARCHAR(191) NOT NULL DEFAULT 'Cali';"),
      safeExec("ALTER TABLE `branches` ADD COLUMN `direccion` TEXT NULL;"),
      safeExec("ALTER TABLE `branches` ADD COLUMN `telefono` VARCHAR(191) NULL;"),
      safeExec("ALTER TABLE `users` ADD COLUMN `restaurantId` INT NULL;"),
      safeExec("ALTER TABLE `users` ADD COLUMN `branchId` INT NULL;"),
      safeExec("ALTER TABLE `users` ADD COLUMN `estado` VARCHAR(191) NOT NULL DEFAULT 'Activo';"),
      safeExec("ALTER TABLE `customers` ADD COLUMN `activo` TINYINT(1) NOT NULL DEFAULT 1;"),
      safeExec("ALTER TABLE `restaurant_tables` DROP INDEX `restaurant_tables_numero_key`;"),
      safeExec("ALTER TABLE `restaurant_tables` ADD COLUMN `ubicacion` VARCHAR(191) NOT NULL DEFAULT 'Salón Principal';"),
      safeExec("ALTER TABLE `restaurant_tables` ADD COLUMN `notas` TEXT NULL;"),
    ]);

    // 2. Link any orphan branches (restaurantId IS NULL) to restaurant id = 1 (Punto G)
    await safeExec("UPDATE `branches` SET `restaurantId` = 1 WHERE `restaurantId` IS NULL;");

    // 3. Find all restaurants and ensure each one has at least 1 branch (Sede Principal)
    const restaurants: any[] = await prisma.$queryRawUnsafe(
      "SELECT `id`, `nombre`, `slug`, `direccionCentral`, `telefonoWhatsapp`, `ciudad` FROM `restaurants` ORDER BY `id` ASC;"
    );

    const branches: any[] = await prisma.$queryRawUnsafe(
      "SELECT `id`, `nombre`, `slug`, `restaurantId`, `activo` FROM `branches` ORDER BY `id` ASC;"
    );

    const branchesByRest = new Map<number, any[]>();
    for (const b of branches) {
      const rId = Number(b.restaurantId || 1);
      if (!branchesByRest.has(rId)) {
        branchesByRest.set(rId, []);
      }
      branchesByRest.get(rId)!.push(b);
    }

    for (const rest of restaurants) {
      const rId = Number(rest.id);
      const restBranches = branchesByRest.get(rId) || [];

      if (restBranches.length === 0) {
        const cleanRestSlug = String(rest.slug || `rest-${rId}`)
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, '-')
          .replace(/(^-|-$)/g, '');
        const uniqueBranchSlug = `${cleanRestSlug}-sede-principal-${rId}`;
        const branchName = rest.nombre ? `Sede Principal - ${rest.nombre}` : 'Sede Principal';
        const direccion = rest.direccionCentral || 'Sede Principal';
        const telefono = rest.telefonoWhatsapp || '3000000000';
        const ciudad = rest.ciudad || 'Cali';

        try {
          await prisma.$executeRawUnsafe(
            `INSERT INTO \`branches\` (\`nombre\`, \`slug\`, \`direccion\`, \`telefono\`, \`ciudad\`, \`activo\`, \`restaurantId\`, \`createdAt\`, \`updatedAt\`)
             VALUES (?, ?, ?, ?, ?, 1, ?, NOW(), NOW());`,
            branchName,
            uniqueBranchSlug,
            direccion,
            telefono,
            ciudad,
            rId
          );
        } catch {
          // Fallback if slug somehow collided
          await prisma.$executeRawUnsafe(
            `INSERT INTO \`branches\` (\`nombre\`, \`slug\`, \`direccion\`, \`telefono\`, \`ciudad\`, \`activo\`, \`restaurantId\`, \`createdAt\`, \`updatedAt\`)
             VALUES (?, ?, ?, ?, ?, 1, ?, NOW(), NOW());`,
            branchName,
            `${uniqueBranchSlug}-${Date.now().toString().slice(-4)}`,
            direccion,
            telefono,
            ciudad,
            rId
          ).catch(() => {});
        }
      } else {
        // Ensure at least one branch is active if all were accidentally marked inactive
        const hasActive = restBranches.some((b) => Boolean(b.activo));
        if (!hasActive && restBranches[0]?.id) {
          await prisma.$executeRawUnsafe(
            "UPDATE `branches` SET `activo` = 1 WHERE `id` = ?;",
            Number(restBranches[0].id)
          ).catch(() => {});
        }
      }
    }

    // 4. Link any restaurant users who have branchId IS NULL to their restaurant's first branch
    await safeExec(`
      UPDATE \`users\` u
      INNER JOIN (
        SELECT \`restaurantId\`, MIN(\`id\`) AS firstBranchId
        FROM \`branches\`
        WHERE \`restaurantId\` IS NOT NULL
        GROUP BY \`restaurantId\`
      ) b ON u.\`restaurantId\` = b.\`restaurantId\`
      SET u.\`branchId\` = b.firstBranchId
      WHERE u.\`branchId\` IS NULL AND u.\`rol\` != 'Superadmin';
    `);
  } catch (err) {
    console.warn('Autoheal warning:', err);
  }
}

/**
 * Ensures a specific restaurant has at least one branch and returns all branches for that restaurant.
 */
export async function getOrCreateBranchesForRestaurant(restaurantId: number): Promise<any[]> {
  try {
    let rows: any[] = await prisma.$queryRawUnsafe(
      "SELECT `id`, `nombre`, `slug`, `direccion`, `telefono`, `ciudad`, `activo`, `restaurantId`, `createdAt`, `updatedAt` FROM `branches` WHERE `restaurantId` = ? ORDER BY `id` ASC;",
      Number(restaurantId)
    );

    if (rows.length === 0) {
      const restRows: any[] = await prisma.$queryRawUnsafe(
        "SELECT `id`, `nombre`, `slug`, `direccionCentral`, `telefonoWhatsapp`, `ciudad` FROM `restaurants` WHERE `id` = ? LIMIT 1;",
        Number(restaurantId)
      );
      const rest = restRows[0];
      const cleanSlug = String(rest?.slug || `rest-${restaurantId}`)
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/(^-|-$)/g, '');
      const branchSlug = `${cleanSlug}-sede-principal-${restaurantId}`;
      const branchName = rest?.nombre ? `Sede Principal - ${rest.nombre}` : 'Sede Principal';
      const direccion = rest?.direccionCentral || 'Sede Principal';
      const telefono = rest?.telefonoWhatsapp || '3000000000';
      const ciudad = rest?.ciudad || 'Cali';

      await prisma.$executeRawUnsafe(
        `INSERT INTO \`branches\` (\`nombre\`, \`slug\`, \`direccion\`, \`telefono\`, \`ciudad\`, \`activo\`, \`restaurantId\`, \`createdAt\`, \`updatedAt\`)
         VALUES (?, ?, ?, ?, ?, 1, ?, NOW(), NOW());`,
        branchName,
        branchSlug,
        direccion,
        telefono,
        ciudad,
        Number(restaurantId)
      ).catch(async () => {
        await prisma.$executeRawUnsafe(
          `INSERT INTO \`branches\` (\`nombre\`, \`slug\`, \`direccion\`, \`telefono\`, \`ciudad\`, \`activo\`, \`restaurantId\`, \`createdAt\`, \`updatedAt\`)
           VALUES (?, ?, ?, ?, ?, 1, ?, NOW(), NOW());`,
          branchName,
          `${branchSlug}-${Date.now().toString().slice(-4)}`,
          direccion,
          telefono,
          ciudad,
          Number(restaurantId)
        ).catch(() => {});
      });

      rows = await prisma.$queryRawUnsafe(
        "SELECT `id`, `nombre`, `slug`, `direccion`, `telefono`, `ciudad`, `activo`, `restaurantId`, `createdAt`, `updatedAt` FROM `branches` WHERE `restaurantId` = ? ORDER BY `id` ASC;",
        Number(restaurantId)
      );
    }

    return rows.map((r) => ({
      ...r,
      id: Number(r.id),
      activo: Boolean(r.activo),
      restaurantId: r.restaurantId ? Number(r.restaurantId) : Number(restaurantId),
    }));
  } catch (e) {
    console.warn('Error in getOrCreateBranchesForRestaurant:', e);
    return [];
  }
}
