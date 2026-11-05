import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper to escape strings safely for SQL INSERT statements
function escapeSql(val: any): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return isNaN(val) ? '0' : String(val);
  if (typeof val === 'boolean') return val ? '1' : '0';
  if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
  
  const str = String(val)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "''")
    .replace(/\0/g, '\\0')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
  return `'${str}'`;
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = parseInt(params.id);
    if (isNaN(restaurantId)) {
      return NextResponse.json({ error: 'ID de restaurante inválido' }, { status: 400 });
    }

    const body = await req.json();
    const { action, dbHost, dbPort, dbName, dbUser, dbPassword, dbConnectionUrl } = body;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurante no encontrado' }, { status: 404 });
    }

    // ========================================================
    // ACCIÓN: GUARDAR CONFIGURACIÓN DE BASE DE DATOS DEDICADA
    // ========================================================
    if (action === 'save_db_config') {
      const isDedicated = !!(dbHost && dbName);
      const updated = await prisma.restaurant.update({
        where: { id: restaurantId },
        data: {
          databaseType: isDedicated ? 'DEDICATED' : 'SHARED',
          dbHost: dbHost || null,
          dbPort: dbPort ? Number(dbPort) : 3306,
          dbName: dbName || null,
          dbUser: dbUser || null,
          dbPassword: dbPassword || null,
          dbConnectionUrl: dbConnectionUrl || null,
          dbStatus: isDedicated ? 'DEDICADA_ACTIVA' : 'COMPARTIDA',
          migratedAt: isDedicated ? new Date() : null,
        },
      });

      return NextResponse.json({
        success: true,
        message: isDedicated
          ? 'Servidor de base de datos dedicada configurado y activado exitosamente.'
          : 'Restaurante asignado al cluster multi-tenant compartido.',
        restaurant: updated,
      });
    }

    // Retrieve all tenant records from database
    const branches = await prisma.branch.findMany({ where: { restaurantId } });
    const users = await prisma.user.findMany({ where: { restaurantId } });
    const categories = await prisma.category.findMany({ where: { restaurantId } });
    const products = await prisma.product.findMany({ where: { restaurantId } });
    const addons = await prisma.productAddon.findMany({ where: { restaurantId } });
    const tables = await prisma.restaurantTable.findMany({ where: { restaurantId } });
    const orders = await prisma.order.findMany({
      where: { restaurantId },
      include: { items: true },
    });

    // ========================================================
    // ACCIÓN: EXPORTAR BACKUP SNAPSHOT JSON
    // ========================================================
    if (action === 'export_json') {
      return NextResponse.json({
        success: true,
        exportedAt: new Date().toISOString(),
        restaurantSlug: restaurant.slug,
        restaurantName: restaurant.nombre,
        data: {
          restaurant,
          branches,
          users,
          categories,
          products,
          addons,
          tables,
          orders,
        },
      });
    }

    // ========================================================
    // ACCIÓN: GENERAR SCRIPT SQL COMPLETO PARA MONOLÍTICO
    // ========================================================
    if (action === 'export_sql' || !action) {
      const targetDb = dbName || `puntog_${restaurant.slug.replace(/[^a-zA-Z0-9_]/g, '_')}`;
      const now = new Date().toISOString();

      let sql = `-- ==========================================================================\n`;
      sql += `-- SCRIPT DE MIGRACIÓN A BASE DE DATOS MONOLÍTICA DEDICADA\n`;
      sql += `-- Restaurante: ${restaurant.nombre} (ID: ${restaurant.id}, Slug: ${restaurant.slug})\n`;
      sql += `-- Generado: ${now}\n`;
      sql += `-- SaaS Multi-Restaurante -> Servidor Dedicado / Monolítico\n`;
      sql += `-- ==========================================================================\n\n`;

      sql += `CREATE DATABASE IF NOT EXISTS \`${targetDb}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n`;
      sql += `USE \`${targetDb}\`;\n\n`;
      sql += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

      // 1. TABLA RESTAURANTS
      sql += `-- 1. Estructura y datos de Restaurante\n`;
      sql += `DROP TABLE IF EXISTS \`restaurants\`;\n`;
      sql += `CREATE TABLE \`restaurants\` (
  \`id\` INT NOT NULL AUTO_INCREMENT,
  \`nombre\` VARCHAR(191) NOT NULL,
  \`slug\` VARCHAR(191) NOT NULL,
  \`subdominio\` VARCHAR(191) NULL,
  \`dominio\` VARCHAR(191) NULL,
  \`eslogan\` VARCHAR(191) NULL DEFAULT 'Antojos Que Conectan',
  \`descripcion\` TEXT NULL,
  \`logo\` TEXT NULL,
  \`favicon\` TEXT NULL,
  \`bannerHero\` TEXT NULL,
  \`colorPrimario\` VARCHAR(191) NOT NULL DEFAULT '#ffc928',
  \`colorSecundario\` VARCHAR(191) NOT NULL DEFAULT '#E94B24',
  \`colorFondo\` VARCHAR(191) NOT NULL DEFAULT '#080808',
  \`telefonoWhatsapp\` VARCHAR(191) NULL DEFAULT '3229088736',
  \`instagram\` VARCHAR(191) NULL,
  \`direccionCentral\` VARCHAR(191) NULL DEFAULT 'Calle 9 # 45-12, Granada, Cali',
  \`ciudad\` VARCHAR(191) NOT NULL DEFAULT 'Cali',
  \`costoDomicilioBase\` DOUBLE NOT NULL DEFAULT 5000,
  \`propinaSugeridaPct\` DOUBLE NOT NULL DEFAULT 10,
  \`plan\` VARCHAR(191) NOT NULL DEFAULT 'Pro',
  \`activo\` BOOLEAN NOT NULL DEFAULT true,
  \`databaseType\` VARCHAR(191) NOT NULL DEFAULT 'DEDICATED',
  \`dbHost\` VARCHAR(191) NULL,
  \`dbPort\` INT NULL DEFAULT 3306,
  \`dbName\` VARCHAR(191) NULL,
  \`dbUser\` VARCHAR(191) NULL,
  \`dbPassword\` VARCHAR(191) NULL,
  \`dbConnectionUrl\` TEXT NULL,
  \`dbStatus\` VARCHAR(191) NULL DEFAULT 'DEDICADA_ACTIVA',
  \`migratedAt\` DATETIME(3) NULL,
  \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

      sql += `INSERT INTO \`restaurants\` (\`id\`, \`nombre\`, \`slug\`, \`subdominio\`, \`eslogan\`, \`descripcion\`, \`logo\`, \`bannerHero\`, \`colorPrimario\`, \`colorSecundario\`, \`colorFondo\`, \`telefonoWhatsapp\`, \`direccionCentral\`, \`ciudad\`, \`costoDomicilioBase\`, \`propinaSugeridaPct\`, \`plan\`, \`activo\`, \`databaseType\`, \`dbStatus\`, \`migratedAt\`) VALUES (`;
      sql += `${restaurant.id}, ${escapeSql(restaurant.nombre)}, ${escapeSql(restaurant.slug)}, ${escapeSql(restaurant.subdominio)}, ${escapeSql(restaurant.eslogan)}, ${escapeSql(restaurant.descripcion)}, ${escapeSql(restaurant.logo)}, ${escapeSql(restaurant.bannerHero)}, ${escapeSql(restaurant.colorPrimario)}, ${escapeSql(restaurant.colorSecundario)}, ${escapeSql(restaurant.colorFondo)}, ${escapeSql(restaurant.telefonoWhatsapp)}, ${escapeSql(restaurant.direccionCentral)}, ${escapeSql(restaurant.ciudad)}, ${restaurant.costoDomicilioBase}, ${restaurant.propinaSugeridaPct}, ${escapeSql(restaurant.plan)}, ${restaurant.activo ? 1 : 0}, 'DEDICATED', 'DEDICADA_ACTIVA', NOW());\n\n`;

      // 2. TABLA BRANCHES
      sql += `-- 2. Sedes de ${restaurant.nombre}\n`;
      sql += `DROP TABLE IF EXISTS \`branches\`;\n`;
      sql += `CREATE TABLE \`branches\` (
  \`id\` INT NOT NULL AUTO_INCREMENT,
  \`nombre\` VARCHAR(191) NOT NULL,
  \`slug\` VARCHAR(191) NOT NULL,
  \`direccion\` TEXT NULL,
  \`telefono\` VARCHAR(191) NULL,
  \`ciudad\` VARCHAR(191) NOT NULL DEFAULT 'Cali',
  \`activo\` BOOLEAN NOT NULL DEFAULT true,
  \`restaurantId\` INT NULL,
  \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (\`id\`),
  KEY \`branches_restaurantId_idx\` (\`restaurantId\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

      if (branches.length > 0) {
        for (const b of branches) {
          sql += `INSERT INTO \`branches\` (\`id\`, \`nombre\`, \`slug\`, \`direccion\`, \`telefono\`, \`ciudad\`, \`activo\`, \`restaurantId\`) VALUES (${b.id}, ${escapeSql(b.nombre)}, ${escapeSql(b.slug)}, ${escapeSql(b.direccion)}, ${escapeSql(b.telefono)}, ${escapeSql(b.ciudad)}, ${b.activo ? 1 : 0}, ${restaurant.id});\n`;
        }
        sql += `\n`;
      }

      // 3. TABLA USERS
      sql += `-- 3. Usuarios y Personal de ${restaurant.nombre}\n`;
      sql += `DROP TABLE IF EXISTS \`users\`;\n`;
      sql += `CREATE TABLE \`users\` (
  \`id\` INT NOT NULL AUTO_INCREMENT,
  \`nombre\` VARCHAR(191) NOT NULL,
  \`email\` VARCHAR(191) NOT NULL,
  \`password\` VARCHAR(191) NOT NULL DEFAULT 'admin123',
  \`rol\` VARCHAR(191) NOT NULL DEFAULT 'Cajero',
  \`estado\` VARCHAR(191) NOT NULL DEFAULT 'Activo',
  \`branchId\` INT NULL,
  \`restaurantId\` INT NULL,
  \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`users_email_key\` (\`email\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

      if (users.length > 0) {
        for (const u of users) {
          sql += `INSERT INTO \`users\` (\`id\`, \`nombre\`, \`email\`, \`password\`, \`rol\`, \`estado\`, \`branchId\`, \`restaurantId\`) VALUES (${u.id}, ${escapeSql(u.nombre)}, ${escapeSql(u.email)}, ${escapeSql(u.password)}, ${escapeSql(u.rol)}, ${escapeSql(u.estado)}, ${u.branchId || 'NULL'}, ${restaurant.id});\n`;
        }
        sql += `\n`;
      }

      // 4. TABLA CATEGORIES
      sql += `-- 4. Categorías de la Carta\n`;
      sql += `DROP TABLE IF EXISTS \`categories\`;\n`;
      sql += `CREATE TABLE \`categories\` (
  \`id\` INT NOT NULL AUTO_INCREMENT,
  \`nombre\` VARCHAR(191) NOT NULL,
  \`slug\` VARCHAR(191) NOT NULL,
  \`descripcion\` TEXT NULL,
  \`icono\` VARCHAR(191) NOT NULL DEFAULT 'Utensils',
  \`imagen\` TEXT NULL,
  \`orden\` INT NOT NULL DEFAULT 0,
  \`activo\` BOOLEAN NOT NULL DEFAULT true,
  \`parentId\` INT NULL,
  \`restaurantId\` INT NULL,
  \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

      if (categories.length > 0) {
        for (const c of categories) {
          sql += `INSERT INTO \`categories\` (\`id\`, \`nombre\`, \`slug\`, \`descripcion\`, \`icono\`, \`imagen\`, \`orden\`, \`activo\`, \`parentId\`, \`restaurantId\`) VALUES (${c.id}, ${escapeSql(c.nombre)}, ${escapeSql(c.slug)}, ${escapeSql(c.descripcion)}, ${escapeSql(c.icono)}, ${escapeSql(c.imagen)}, ${c.orden}, ${c.activo ? 1 : 0}, ${c.parentId || 'NULL'}, ${restaurant.id});\n`;
        }
        sql += `\n`;
      }

      // 5. TABLA PRODUCTS
      sql += `-- 5. Platos y Productos\n`;
      sql += `DROP TABLE IF EXISTS \`products\`;\n`;
      sql += `CREATE TABLE \`products\` (
  \`id\` INT NOT NULL AUTO_INCREMENT,
  \`nombre\` VARCHAR(191) NOT NULL,
  \`slug\` VARCHAR(191) NOT NULL,
  \`descripcion\` TEXT NULL,
  \`precio\` DOUBLE NOT NULL,
  \`imagen\` TEXT NULL,
  \`categoriaId\` INT NULL,
  \`subcategoriaId\` INT NULL,
  \`etiqueta\` VARCHAR(191) NULL,
  \`disponibilidad\` BOOLEAN NOT NULL DEFAULT true,
  \`stock\` INT NULL DEFAULT 100,
  \`stockMinimo\` INT NULL DEFAULT 5,
  \`controlarStock\` BOOLEAN NOT NULL DEFAULT false,
  \`costo\` DOUBLE NULL,
  \`orden\` INT NOT NULL DEFAULT 0,
  \`restaurantId\` INT NULL,
  \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

      if (products.length > 0) {
        for (const p of products) {
          sql += `INSERT INTO \`products\` (\`id\`, \`nombre\`, \`slug\`, \`descripcion\`, \`precio\`, \`imagen\`, \`categoriaId\`, \`subcategoriaId\`, \`etiqueta\`, \`disponibilidad\`, \`stock\`, \`stockMinimo\`, \`controlarStock\`, \`costo\`, \`orden\`, \`restaurantId\`) VALUES (${p.id}, ${escapeSql(p.nombre)}, ${escapeSql(p.slug)}, ${escapeSql(p.descripcion)}, ${p.precio}, ${escapeSql(p.imagen)}, ${p.categoriaId || 'NULL'}, ${p.subcategoriaId || 'NULL'}, ${escapeSql(p.etiqueta)}, ${p.disponibilidad ? 1 : 0}, ${p.stock || 100}, ${p.stockMinimo || 5}, ${p.controlarStock ? 1 : 0}, ${p.costo || 0}, ${p.orden || 0}, ${restaurant.id});\n`;
        }
        sql += `\n`;
      }

      // 6. TABLA PRODUCT ADDONS
      sql += `-- 6. Adiciones y Toppings\n`;
      sql += `DROP TABLE IF EXISTS \`product_addons\`;\n`;
      sql += `CREATE TABLE \`product_addons\` (
  \`id\` INT NOT NULL AUTO_INCREMENT,
  \`nombre\` VARCHAR(191) NOT NULL,
  \`precio\` DOUBLE NOT NULL,
  \`categoria\` VARCHAR(191) NOT NULL DEFAULT 'Toppings',
  \`activo\` BOOLEAN NOT NULL DEFAULT true,
  \`restaurantId\` INT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

      if (addons.length > 0) {
        for (const a of addons) {
          sql += `INSERT INTO \`product_addons\` (\`id\`, \`nombre\`, \`precio\`, \`categoria\`, \`activo\`, \`restaurantId\`) VALUES (${a.id}, ${escapeSql(a.nombre)}, ${a.precio}, ${escapeSql(a.categoria)}, ${a.activo ? 1 : 0}, ${restaurant.id});\n`;
        }
        sql += `\n`;
      }

      // 7. TABLA RESTAURANT TABLES
      sql += `-- 7. Mesas de Atención\n`;
      sql += `DROP TABLE IF EXISTS \`restaurant_tables\`;\n`;
      sql += `CREATE TABLE \`restaurant_tables\` (
  \`id\` INT NOT NULL AUTO_INCREMENT,
  \`numero\` VARCHAR(191) NOT NULL,
  \`capacidad\` INT NOT NULL DEFAULT 4,
  \`ubicacion\` VARCHAR(191) NOT NULL DEFAULT 'Principal',
  \`estado\` VARCHAR(191) NOT NULL DEFAULT 'Disponible',
  \`branchId\` INT NULL,
  \`restaurantId\` INT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

      if (tables.length > 0) {
        for (const t of tables) {
          sql += `INSERT INTO \`restaurant_tables\` (\`id\`, \`numero\`, \`capacidad\`, \`ubicacion\`, \`estado\`, \`branchId\`, \`restaurantId\`) VALUES (${t.id}, ${escapeSql(t.numero)}, ${t.capacidad}, ${escapeSql(t.ubicacion)}, ${escapeSql(t.estado)}, ${t.branchId || 'NULL'}, ${restaurant.id});\n`;
        }
        sql += `\n`;
      }

      // 8. TABLA ORDERS & ORDER ITEMS
      sql += `-- 8. Pedidos y Comandas\n`;
      sql += `DROP TABLE IF EXISTS \`order_items\`;\n`;
      sql += `DROP TABLE IF EXISTS \`orders\`;\n`;
      sql += `CREATE TABLE \`orders\` (
  \`id\` INT NOT NULL AUTO_INCREMENT,
  \`codigo\` VARCHAR(191) NOT NULL,
  \`cliente\` VARCHAR(191) NOT NULL,
  \`telefono\` VARCHAR(191) NOT NULL,
  \`tipo\` VARCHAR(191) NOT NULL DEFAULT 'domicilio',
  \`numeroMesa\` VARCHAR(191) NULL,
  \`mesaId\` INT NULL,
  \`direccion\` TEXT NULL,
  \`subtotal\` DOUBLE NOT NULL,
  \`costoEnvio\` DOUBLE NOT NULL DEFAULT 0,
  \`propina\` DOUBLE NOT NULL DEFAULT 0,
  \`total\` DOUBLE NOT NULL,
  \`metodoPago\` VARCHAR(191) NOT NULL DEFAULT 'efectivo',
  \`notas\` TEXT NULL,
  \`estado\` VARCHAR(191) NOT NULL DEFAULT 'Pendiente',
  \`branchId\` INT NULL,
  \`restaurantId\` INT NULL,
  \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`orders_codigo_key\` (\`codigo\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

      sql += `CREATE TABLE \`order_items\` (
  \`id\` INT NOT NULL AUTO_INCREMENT,
  \`orderId\` INT NOT NULL,
  \`productId\` INT NULL,
  \`nombre\` VARCHAR(191) NOT NULL,
  \`cantidad\` INT NOT NULL DEFAULT 1,
  \`precio\` DOUBLE NOT NULL,
  \`subtotal\` DOUBLE NOT NULL,
  \`notas\` TEXT NULL,
  \`adicionales\` TEXT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`order_items_orderId_idx\` (\`orderId\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

      if (orders.length > 0) {
        for (const o of orders) {
          sql += `INSERT INTO \`orders\` (\`id\`, \`codigo\`, \`cliente\`, \`telefono\`, \`tipo\`, \`numeroMesa\`, \`mesaId\`, \`direccion\`, \`subtotal\`, \`costoEnvio\`, \`propina\`, \`total\`, \`metodoPago\`, \`notas\`, \`estado\`, \`branchId\`, \`restaurantId\`, \`createdAt\`) VALUES (${o.id}, ${escapeSql(o.codigo)}, ${escapeSql(o.cliente)}, ${escapeSql(o.telefono)}, ${escapeSql(o.tipo)}, ${escapeSql(o.numeroMesa)}, ${o.mesaId || 'NULL'}, ${escapeSql(o.direccion)}, ${o.subtotal}, ${o.costoEnvio}, ${o.propina}, ${o.total}, ${escapeSql(o.metodoPago)}, ${escapeSql(o.notasCliente)}, ${escapeSql(o.estado)}, ${o.branchId || 'NULL'}, ${restaurant.id}, ${escapeSql(o.createdAt)});\n`;

          if (o.items && o.items.length > 0) {
            for (const it of o.items) {
              const itemSubtotal = it.precio * it.cantidad;
              sql += `INSERT INTO \`order_items\` (\`id\`, \`orderId\`, \`productId\`, \`nombre\`, \`cantidad\`, \`precio\`, \`subtotal\`, \`notas\`, \`adicionales\`) VALUES (${it.id}, ${o.id}, ${it.productId || 'NULL'}, ${escapeSql(it.nombre)}, ${it.cantidad}, ${it.precio}, ${itemSubtotal}, ${escapeSql(it.notas)}, ${escapeSql(it.adicionales)});\n`;
            }
          }
        }
        sql += `\n`;
      }

      sql += `SET FOREIGN_KEY_CHECKS = 1;\n\n`;
      sql += `-- MIGRACIÓN MONOLÍTICA COMPLETADA CON ÉXITO\n`;

      return NextResponse.json({
        success: true,
        filename: `migracion_${restaurant.slug}_monolitico.sql`,
        targetDb,
        summary: {
          sedes: branches.length,
          categorias: categories.length,
          productos: products.length,
          pedidos: orders.length,
          mesas: tables.length,
          usuarios: users.length,
        },
        sql,
      });
    }

    return NextResponse.json({ error: 'Acción no soportada' }, { status: 400 });
  } catch (error: any) {
    console.error('Error en migración de BD:', error);
    return NextResponse.json({ error: error.message || 'Error en servidor' }, { status: 500 });
  }
}
