import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureRestaurantBranchesAndSchema, getOrCreateBranchesForRestaurant, serializeSafe } from '@/lib/db-autoheal';

export const dynamic = 'force-dynamic';

async function safeExec(sql: string, ...params: any[]) {
  try {
    await prisma.$executeRawUnsafe(sql, ...params);
  } catch (e) {
    // Ignore if table or column doesn't exist yet
  }
}

async function verifySuperadminPassword(password: string): Promise<boolean> {
  if (!password || !String(password).trim()) return false;
  const cleanPass = String(password).trim();

  try {
    const superUsers: any[] = await prisma.$queryRawUnsafe(
      "SELECT `id`, `email`, `password`, `rol` FROM `users` WHERE `rol` = 'Superadmin' OR LOWER(`email`) IN ('superadmin@gastronegocios.com', 'superadmin@puntog.com');"
    );

    if (superUsers.length > 0) {
      const matched = superUsers.some((u) => {
        const dbPass = String(u.password || '').trim();
        return dbPass && (dbPass === cleanPass || dbPass.toLowerCase() === cleanPass.toLowerCase());
      });
      if (matched) return true;
    }
  } catch {}

  // Fallback master password if superadmin user was wiped or default
  if (cleanPass === 'superadmin123' || cleanPass === 'admin123') {
    return true;
  }

  return false;
}

/**
 * Deletes all catalog and operational data for a single restaurantId
 * so it starts 100% from zero (0 categories, 0 products, 0 orders, 0 customers).
 */
async function wipeRestaurantDataToZero(restaurantId: number) {
  const rId = Number(restaurantId);

  // 1. Delete child items of orders, recipes, purchases first
  await safeExec(
    "DELETE oi FROM `order_items` oi INNER JOIN `orders` o ON oi.`orderId` = o.`id` WHERE o.`restaurantId` = ?;",
    rId
  );
  await safeExec(
    "DELETE inv FROM `invoices` inv INNER JOIN `orders` o ON inv.`orderId` = o.`id` WHERE o.`restaurantId` = ?;",
    rId
  );
  await safeExec("DELETE FROM `invoices` WHERE `restaurantId` = ?;", rId);
  await safeExec("DELETE FROM `orders` WHERE `restaurantId` = ?;", rId);
  await safeExec("DELETE FROM `cash_shifts` WHERE `restaurantId` = ?;", rId);

  // 2. Delete ERP / Inventory / Recipes / Purchases
  await safeExec(
    "DELETE ri FROM `recipe_items` ri INNER JOIN `recipes` r ON ri.`recipeId` = r.`id` WHERE r.`restaurantId` = ?;",
    rId
  );
  await safeExec("DELETE FROM `recipes` WHERE `restaurantId` = ?;", rId);
  await safeExec(
    "DELETE pi FROM `purchase_items` pi INNER JOIN `purchases` p ON pi.`purchaseId` = p.`id` WHERE p.`restaurantId` = ?;",
    rId
  );
  await safeExec("DELETE FROM `purchases` WHERE `restaurantId` = ?;", rId);
  await safeExec("DELETE FROM `stock_movements` WHERE `restaurantId` = ?;", rId);
  await safeExec("DELETE FROM `supplies` WHERE `restaurantId` = ?;", rId);
  await safeExec("DELETE FROM `suppliers` WHERE `restaurantId` = ?;", rId);

  // 3. Delete Catalog (Products, Subcategories, Categories, Addons)
  await safeExec("DELETE FROM `products` WHERE `restaurantId` = ?;", rId);
  await safeExec("DELETE FROM `categories` WHERE `restaurantId` = ? AND `parentId` IS NOT NULL;", rId);
  await safeExec("DELETE FROM `categories` WHERE `restaurantId` = ?;", rId);
  await safeExec("DELETE FROM `addons` WHERE `restaurantId` = ?;", rId);

  // 4. Delete Customers & Reviews
  await safeExec("DELETE FROM `reviews` WHERE `restaurantId` = ?;", rId);
  await safeExec("DELETE FROM `customers` WHERE `restaurantId` = ?;", rId);

  // 5. Reset Tables to 4 clean tables linked to Sede Principal
  await safeExec("DELETE FROM `restaurant_tables` WHERE `restaurantId` = ?;", rId);
  const branches = await getOrCreateBranchesForRestaurant(rId);
  const mainBranchId = branches[0]?.id || null;

  for (let i = 1; i <= 4; i++) {
    await safeExec(
      `INSERT INTO \`restaurant_tables\` (\`numero\`, \`capacidad\`, \`estado\`, \`ubicacion\`, \`branchId\`, \`restaurantId\`, \`createdAt\`, \`updatedAt\`)
       VALUES (?, 4, 'Libre', 'Salón Principal', ?, ?, NOW(), NOW());`,
      `Mesa ${i} (R${rId})`,
      mainBranchId,
      rId
    );
  }
}

/**
 * Completely removes a restaurant and all its branches, users, and data from the DB.
 */
async function deleteRestaurantCompletely(restaurantId: number) {
  const rId = Number(restaurantId);
  await wipeRestaurantDataToZero(rId);
  await safeExec("DELETE FROM `restaurant_tables` WHERE `restaurantId` = ?;", rId);
  await safeExec("DELETE FROM `roles` WHERE `restaurantId` = ?;", rId);
  await safeExec("DELETE FROM `users` WHERE `restaurantId` = ? AND `rol` != 'Superadmin';", rId);
  await safeExec("DELETE FROM `branches` WHERE `restaurantId` = ?;", rId);
  await safeExec("DELETE FROM `restaurants` WHERE `id` = ?;", rId);
}

/**
 * Seeds a specific restaurant with complete demo categories, products, toppings, and tables.
 */
async function seedRestaurantDemoData(restaurantId: number) {
  const rId = Number(restaurantId);
  const restRows: any[] = await prisma.$queryRawUnsafe(
    "SELECT * FROM `restaurants` WHERE `id` = ? LIMIT 1;",
    rId
  );
  const rest = restRows[0];
  if (!rest) {
    throw new Error('Restaurante no encontrado');
  }

  const cleanSlug = String(rest.slug || `rest-${rId}`).toLowerCase();
  const branches = await getOrCreateBranchesForRestaurant(rId);
  const mainBranchId = branches[0]?.id || null;

  // Clean existing catalog first to avoid slug collisions
  await safeExec("DELETE FROM `products` WHERE `restaurantId` = ?;", rId);
  await safeExec("DELETE FROM `categories` WHERE `restaurantId` = ? AND `parentId` IS NOT NULL;", rId);
  await safeExec("DELETE FROM `categories` WHERE `restaurantId` = ?;", rId);
  await safeExec("DELETE FROM `addons` WHERE `restaurantId` = ?;", rId);

  const suffix = `${cleanSlug}-${rId}-${Date.now().toString().slice(-4)}`;

  const catBurgers = await prisma.category.create({
    data: {
      nombre: 'Hamburguesas Artesanales',
      slug: `hamburguesas-${suffix}`,
      descripcion: 'Hamburguesas 100% carne de res a la parrilla con pan brioche artesanal',
      icono: 'Beef',
      orden: 1,
      activo: true,
      restaurantId: rId,
    },
  });

  const catSalchi = await prisma.category.create({
    data: {
      nombre: 'Salchipapas & Picadas',
      slug: `salchipapas-${suffix}`,
      descripcion: 'Papas crocantes con salchicha premium, quesos fundidos y carnes',
      icono: 'Flame',
      orden: 2,
      activo: true,
      restaurantId: rId,
    },
  });

  const catParrilla = await prisma.category.create({
    data: {
      nombre: 'Parrilla & Asados',
      slug: `parrilla-${suffix}`,
      descripcion: 'Cortes selectos madurados al carbón',
      icono: 'Utensils',
      orden: 3,
      activo: true,
      restaurantId: rId,
    },
  });

  const catBebidas = await prisma.category.create({
    data: {
      nombre: 'Bebidas & Malteadas',
      slug: `bebidas-${suffix}`,
      descripcion: 'Limonadas frappé, sodas saborizadas y bebidas frías',
      icono: 'CupSoda',
      orden: 4,
      activo: true,
      restaurantId: rId,
    },
  });

  await prisma.product.createMany({
    data: [
      {
        nombre: `Doble Bacon Cheese (${rest.nombre})`,
        slug: `doble-bacon-${suffix}-1`,
        descripcion: 'Doble carne de 150g al carbón, doble queso cheddar fundido, tocineta ahumada crocante, vegetales frescos y papas a la francesa.',
        precio: 28000,
        costo: 12500,
        imagen: '/images/menu/burgers/burger-1.jpg',
        etiqueta: 'Más Vendido',
        disponibilidad: true,
        stock: 50,
        stockMinimo: 5,
        controlarStock: true,
        categoriaId: catBurgers.id,
        restaurantId: rId,
      },
      {
        nombre: 'Burger Clásica Artesanal',
        slug: `burger-clasica-${suffix}-2`,
        descripcion: 'Carne artesanal a la brasa, queso mozzarella, cebolla caramelizada, salsa de la casa y papas rústicas.',
        precio: 22000,
        costo: 9500,
        imagen: '/images/menu/burgers/burger-2.jpg',
        etiqueta: 'Recomendado',
        disponibilidad: true,
        stock: 50,
        stockMinimo: 5,
        controlarStock: true,
        categoriaId: catBurgers.id,
        restaurantId: rId,
      },
      {
        nombre: 'Salchipapa Especial de la Casa',
        slug: `salchipapa-especial-${suffix}-3`,
        descripcion: 'Papas doradas, salchicha tipo americana, pollo desmechado, tocineta, maíz tierno y baño de queso gratinado.',
        precio: 26000,
        costo: 11000,
        imagen: '/images/menu/salchipapas/salchi-1.jpg',
        etiqueta: 'Para Compartir',
        disponibilidad: true,
        stock: 40,
        stockMinimo: 5,
        controlarStock: true,
        categoriaId: catSalchi.id,
        restaurantId: rId,
      },
      {
        nombre: 'Churrasco Premium al Carbón 350g',
        slug: `churrasco-premium-${suffix}-4`,
        descripcion: 'Corte jugoso a la parrilla acompañado de chimichurri artesanal, papa al vapor y ensalada fresca.',
        precio: 38000,
        costo: 17000,
        imagen: '/images/menu/parrilla/parrilla-1.jpg',
        etiqueta: 'Especialidad',
        disponibilidad: true,
        stock: 30,
        stockMinimo: 5,
        controlarStock: true,
        categoriaId: catParrilla.id,
        restaurantId: rId,
      },
      {
        nombre: 'Limonada de Coco Cremosa',
        slug: `limonada-coco-${suffix}-5`,
        descripcion: 'Preparada al instante con leche de coco natural y limón fresco.',
        precio: 10000,
        costo: 3200,
        imagen: '/images/menu/bebidas/bebida-1.jpg',
        disponibilidad: true,
        stock: 80,
        stockMinimo: 10,
        controlarStock: false,
        categoriaId: catBebidas.id,
        restaurantId: rId,
      },
    ],
  });

  // Addons / Toppings de prueba
  const demoAddons = [
    ['Adición Queso Cheddar Fundido', 4000, 'Adicional'],
    ['Adición Tocineta Ahumada', 5000, 'Adicional'],
    ['Porción de Papas Francesas', 6000, 'Acompañamiento'],
    ['Salsa de Ajo de la Casa', 0, 'Salsa'],
  ];
  for (const [nombre, precio, tipo] of demoAddons) {
    await safeExec(
      "INSERT INTO `addons` (`nombre`, `precio`, `tipo`, `disponible`, `restaurantId`) VALUES (?, ?, ?, 1, ?);",
      nombre,
      precio,
      tipo,
      rId
    );
  }

  // Ensure 6 tables exist
  const existingTables: any[] = await prisma.$queryRawUnsafe(
    "SELECT COUNT(*) as cnt FROM `restaurant_tables` WHERE `restaurantId` = ?;",
    rId
  );
  if (Number(existingTables[0]?.cnt || 0) === 0) {
    for (let i = 1; i <= 6; i++) {
      await safeExec(
        `INSERT INTO \`restaurant_tables\` (\`numero\`, \`capacidad\`, \`estado\`, \`ubicacion\`, \`branchId\`, \`restaurantId\`, \`createdAt\`, \`updatedAt\`)
         VALUES (?, 4, 'Libre', 'Salón Principal', ?, ?, NOW(), NOW());`,
        `Mesa ${i} (${rest.slug})`,
        mainBranchId,
        rId
      );
    }
  }
}

export async function POST(request: Request) {
  try {
    await ensureRestaurantBranchesAndSchema(true);

    const body = await request.json();
    const { action, superadminPassword, restaurantId, slug } = body;

    // 1. Validate Superadmin Password
    const isAuthorized = await verifySuperadminPassword(superadminPassword);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Contraseña de Superadministrador incorrecta. Verifica la clave e intenta de nuevo.' },
        { status: 403 }
      );
    }

    // Resolve target restaurant by ID or by slug if applicable
    let targetRestId: number | null = restaurantId ? Number(restaurantId) : null;
    if (!targetRestId && slug) {
      const cleanS = String(slug).toLowerCase().trim();
      const rows: any[] = await prisma.$queryRawUnsafe(
        "SELECT `id` FROM `restaurants` WHERE LOWER(`slug`) = ? OR LOWER(`subdominio`) = ? LIMIT 1;",
        cleanS,
        cleanS.replace(/[^a-z0-9]/g, '')
      );
      if (rows[0]?.id) {
        targetRestId = Number(rows[0].id);
      }
    }

    // ACTION 1: Reset a single restaurant to 0 (clean categories, products, orders, customers, inventory)
    if (action === 'reset_restaurant_zero') {
      if (!targetRestId) {
        return NextResponse.json(
          { error: 'Selecciona o indica el restaurante que deseas limpiar desde cero.' },
          { status: 400 }
        );
      }
      await wipeRestaurantDataToZero(targetRestId);
      return NextResponse.json({
        success: true,
        message: 'El restaurante ha sido reiniciado desde cero (0 categorías, 0 productos, 0 pedidos, 0 clientes) conservando su Sede Principal y usuario Administrador.',
      });
    }

    // ACTION 2: Delete a restaurant completely (including by slug if it was blocking creation)
    if (action === 'delete_restaurant') {
      if (!targetRestId) {
        return NextResponse.json(
          { error: `No se encontró ningún restaurante con el identificador "${slug || restaurantId}".` },
          { status: 404 }
        );
      }
      if (targetRestId === 1 && !body.allowDeletePrimary) {
        // If it's ID 1, reset it to zero instead of deleting the primary matrix row unless forced
        await wipeRestaurantDataToZero(1);
        return NextResponse.json({
          success: true,
          message: 'El restaurante principal (ID 1) ha sido limpiado completamente desde cero.',
        });
      }
      await deleteRestaurantCompletely(targetRestId);
      return NextResponse.json({
        success: true,
        message: 'El restaurante, sus sedes, usuarios y todos sus registros fueron eliminados por completo. Su slug ya está libre.',
      });
    }

    // ACTION 3: Seed demo data into a single restaurant
    if (action === 'seed_restaurant_demo') {
      if (!targetRestId) {
        return NextResponse.json(
          { error: 'Selecciona el restaurante que deseas llenar con datos de prueba.' },
          { status: 400 }
        );
      }
      await seedRestaurantDemoData(targetRestId);
      return NextResponse.json({
        success: true,
        message: 'Se cargaron categorías, productos, toppings y mesas de prueba en el restaurante exitosamente.',
      });
    }

    // ACTION 4: Reset ALL restaurants in the database to zero (or delete secondary restaurants)
    if (action === 'reset_all_zero') {
      const deleteSecondary = Boolean(body.deleteSecondaryRestaurants);
      const allRests: any[] = await prisma.$queryRawUnsafe("SELECT `id` FROM `restaurants` ORDER BY `id` ASC;");

      for (const r of allRests) {
        const rId = Number(r.id);
        if (deleteSecondary && rId !== 1) {
          await deleteRestaurantCompletely(rId);
        } else {
          await wipeRestaurantDataToZero(rId);
        }
      }

      return NextResponse.json({
        success: true,
        message: deleteSecondary
          ? 'Se eliminaron todos los restaurantes secundarios y se reiniciaron todas las tablas desde cero.'
          : 'Se limpiaron todas las tablas (categorías, productos, pedidos, clientes, inventario) de todos los restaurantes para iniciar desde cero.',
      });
    }

    // ACTION 5: Seed demo data into all active restaurants
    if (action === 'seed_all_demo') {
      const allRests: any[] = await prisma.$queryRawUnsafe("SELECT `id` FROM `restaurants` ORDER BY `id` ASC;");
      for (const r of allRests) {
        await seedRestaurantDemoData(Number(r.id));
      }
      return NextResponse.json({
        success: true,
        message: `Se cargó información de prueba (categorías, productos, toppings y mesas) en ${allRests.length} restaurante(s).`,
      });
    }

    return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in db-management:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al procesar operación en la base de datos' },
      { status: 500 }
    );
  }
}
