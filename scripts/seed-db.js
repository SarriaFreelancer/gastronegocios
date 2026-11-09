const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function ensureDatabaseColumns() {
  try {
    const existingCols = await prisma.$queryRawUnsafe(`
      SELECT TABLE_NAME, COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE();
    `);

    const colMap = new Set(existingCols.map(c => `${c.TABLE_NAME.toLowerCase()}.${c.COLUMN_NAME.toLowerCase()}`));

    const checkAndAdd = async (table, column, def) => {
      const key = `${table.toLowerCase()}.${column.toLowerCase()}`;
      if (!colMap.has(key)) {
        console.log(`Auto-healing: Agregando columna faltante '${column}' a la tabla '${table}'...`);
        try {
          await prisma.$queryRawUnsafe(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${def};`);
          colMap.add(key);
        } catch (addErr) {
          console.warn(`Nota auto-healing (${table}.${column}):`, addErr.message);
        }
      }
    };

    await checkAndAdd('restaurants', 'mostrarEnLanding', 'TINYINT(1) NOT NULL DEFAULT 1');
    await checkAndAdd('users', 'permisos', 'TEXT NULL');
    await checkAndAdd('users', 'roleId', 'INT NULL');
    await checkAndAdd('products', 'stockMinimo', 'INT NULL DEFAULT 5');
    await checkAndAdd('products', 'controlarStock', 'TINYINT(1) NOT NULL DEFAULT 0');
    await checkAndAdd('products', 'costo', 'DOUBLE NULL');
    await checkAndAdd('products', 'codigoBarras', 'VARCHAR(191) NULL');
    await checkAndAdd('products', 'sku', 'VARCHAR(191) NULL');
    await checkAndAdd('orders', 'repartidor', 'VARCHAR(191) NULL');
    await checkAndAdd('orders', 'repartidorTel', 'VARCHAR(191) NULL');
    await checkAndAdd('orders', 'customerId', 'INT NULL');
    await checkAndAdd('orders', 'cuentaDividida', 'TINYINT(1) NOT NULL DEFAULT 0');
    await checkAndAdd('orders', 'numFacturas', 'INT NOT NULL DEFAULT 1');
    await checkAndAdd('restaurant_tables', 'llamandoMesero', 'TINYINT(1) NOT NULL DEFAULT 0');
    await checkAndAdd('restaurant_tables', 'llamadoEn', 'DATETIME(3) NULL');
    await checkAndAdd('restaurant_tables', 'solicitudCuenta', 'TINYINT(1) NOT NULL DEFAULT 0');
    await checkAndAdd('restaurant_tables', 'solicitudCuentaEn', 'DATETIME(3) NULL');
    await checkAndAdd('restaurant_tables', 'metodoPagoCuenta', 'VARCHAR(191) NULL');

    // Desbloquear migraciones fallidas en _prisma_migrations si existen
    try {
      await prisma.$queryRawUnsafe(`
        UPDATE _prisma_migrations 
        SET finished_at = NOW(), applied_steps_count = 1 
        WHERE finished_at IS NULL;
      `);
    } catch (migErr) {
      // Ignorar si no existe la tabla
    }

    // Insertar Superadmin de GastroNegocios directamente por SQL preventivo
    try {
      await prisma.$queryRawUnsafe(`
        INSERT INTO \`users\` (\`nombre\`, \`email\`, \`password\`, \`rol\`, \`permisos\`, \`estado\`, \`createdAt\`, \`updatedAt\`)
        VALUES ('Super Administrador', 'superadmin@gastronegocios.com', 'admin123', 'Superadmin', '["*"]', 'Activo', NOW(3), NOW(3))
        ON DUPLICATE KEY UPDATE \`rol\` = 'Superadmin', \`permisos\` = '["*"]', \`estado\` = 'Activo';
      `);
      console.log(' ✅ Superadmin GastroNegocios asegurado en Base de Datos.');
    } catch (rawUserErr) {
      console.warn('Nota creando superadmin inicial:', rawUserErr.message);
    }
  } catch (err) {
    console.warn('Advertencia en verificación preventiva de columnas:', err.message);
  }
}

async function main() {
  console.log('🚀 Iniciando sincronización y carga inicial de base de datos GastroNegocios / Punto G...');
  await ensureDatabaseColumns();

  // =========================================================================
  // 0. RESTAURANTES EN LA PLATAFORMA (TENANTS)
  // =========================================================================
  console.log('🏪 Sincronizando restaurantes de la plataforma...');

  // 0.1 Restaurante Principal: Punto G
  const puntoG = await prisma.restaurant.upsert({
    where: { slug: 'punto-g' },
    update: {
      nombre: 'Punto G',
      subdominio: 'puntog',
      eslogan: 'PUNTO G TU MÁXIMO PLACER',
      descripcion: 'Comidas rápidas gourmet. Hamburguesas artesanales, picadas generosas y carnes a la parrilla con el auténtico sabor de la casa.',
      colorPrimario: '#ffc928',
      colorSecundario: '#E94B24',
      colorBoton: '#ffc928',
      colorBotonTexto: '#000000',
      telefonoWhatsapp: '3229088736',
      direccionCentral: 'Calle 9 # 45-12, Barrio Granada, Cali',
      ciudad: 'Cali',
      costoDomicilioBase: 5000,
      propinaSugeridaPct: 10,
      plan: 'Enterprise',
      activo: true,
      mostrarEnLanding: true,
      horarioAtencion: 'Lunes a Domingo: 12:00 m. a 11:30 p.m.',
    },
    create: {
      nombre: 'Punto G',
      slug: 'punto-g',
      subdominio: 'puntog',
      eslogan: 'PUNTO G TU MÁXIMO PLACER',
      descripcion: 'Comidas rápidas gourmet. Hamburguesas artesanales, picadas generosas y carnes a la parrilla con el auténtico sabor de la casa.',
      colorPrimario: '#ffc928',
      colorSecundario: '#E94B24',
      colorBoton: '#ffc928',
      colorBotonTexto: '#000000',
      telefonoWhatsapp: '3229088736',
      direccionCentral: 'Calle 9 # 45-12, Barrio Granada, Cali',
      ciudad: 'Cali',
      costoDomicilioBase: 5000,
      propinaSugeridaPct: 10,
      plan: 'Enterprise',
      activo: true,
      mostrarEnLanding: true,
      horarioAtencion: 'Lunes a Domingo: 12:00 m. a 11:30 p.m.',
    },
  });
  console.log(` ✅ Restaurante listo: ${puntoG.nombre} (ID: ${puntoG.id}, Slug: ${puntoG.slug})`);

  // 0.2 Restaurante Demo 2: Salchi Ricurras
  const salchi = await prisma.restaurant.upsert({
    where: { slug: 'salchiricurras' },
    update: {
      nombre: 'Salchi Ricurras',
      subdominio: 'salchiricurras',
      eslogan: 'Las Mejores Salchipapas y Mazorcadas de la Ciudad',
      descripcion: 'Salchipapas gigantes, mazorcadas con queso gratinado y combos para compartir con identidad visual roja y pedidos por WhatsApp.',
      colorPrimario: '#E53E3E',
      colorSecundario: '#ffc928',
      colorBoton: '#E53E3E',
      colorBotonTexto: '#ffffff',
      telefonoWhatsapp: '3158901234',
      direccionCentral: 'Carrera 15 # 52-20, Cali',
      ciudad: 'Cali',
      costoDomicilioBase: 4500,
      propinaSugeridaPct: 10,
      plan: 'Pro',
      activo: true,
      mostrarEnLanding: true,
      horarioAtencion: 'Martes a Domingo: 4:00 p.m. a 12:00 a.m.',
    },
    create: {
      nombre: 'Salchi Ricurras',
      slug: 'salchiricurras',
      subdominio: 'salchiricurras',
      eslogan: 'Las Mejores Salchipapas y Mazorcadas de la Ciudad',
      descripcion: 'Salchipapas gigantes, mazorcadas con queso gratinado y combos para compartir con identidad visual roja y pedidos por WhatsApp.',
      colorPrimario: '#E53E3E',
      colorSecundario: '#ffc928',
      colorBoton: '#E53E3E',
      colorBotonTexto: '#ffffff',
      telefonoWhatsapp: '3158901234',
      direccionCentral: 'Carrera 15 # 52-20, Cali',
      ciudad: 'Cali',
      costoDomicilioBase: 4500,
      propinaSugeridaPct: 10,
      plan: 'Pro',
      activo: true,
      mostrarEnLanding: true,
      horarioAtencion: 'Martes a Domingo: 4:00 p.m. a 12:00 a.m.',
    },
  });
  console.log(` ✅ Restaurante listo: ${salchi.nombre} (ID: ${salchi.id}, Slug: ${salchi.slug})`);

  // 0.3 Restaurante Demo 3: Azados Bryan
  const bryan = await prisma.restaurant.upsert({
    where: { slug: 'bryan' },
    update: {
      nombre: 'Azados Bryan',
      subdominio: 'bryan',
      eslogan: 'Parrilla al carbón & asados tradicionales',
      descripcion: 'Asados al carbón con carnes seleccionadas, costillas BBQ, picadas mixtas y carta digital con despacho rápido.',
      colorPrimario: '#D97706',
      colorSecundario: '#B45309',
      colorBoton: '#D97706',
      colorBotonTexto: '#ffffff',
      telefonoWhatsapp: '3104567890',
      direccionCentral: 'Av. Roosevelt # 34-18, Cali',
      ciudad: 'Cali',
      costoDomicilioBase: 5000,
      propinaSugeridaPct: 10,
      plan: 'Pro',
      activo: true,
      mostrarEnLanding: true,
      horarioAtencion: 'Lunes a Domingo: 11:30 a.m. a 10:30 p.m.',
    },
    create: {
      nombre: 'Azados Bryan',
      slug: 'bryan',
      subdominio: 'bryan',
      eslogan: 'Parrilla al carbón & asados tradicionales',
      descripcion: 'Asados al carbón con carnes seleccionadas, costillas BBQ, picadas mixtas y carta digital con despacho rápido.',
      colorPrimario: '#D97706',
      colorSecundario: '#B45309',
      colorBoton: '#D97706',
      colorBotonTexto: '#ffffff',
      telefonoWhatsapp: '3104567890',
      direccionCentral: 'Av. Roosevelt # 34-18, Cali',
      ciudad: 'Cali',
      costoDomicilioBase: 5000,
      propinaSugeridaPct: 10,
      plan: 'Pro',
      activo: true,
      mostrarEnLanding: true,
      horarioAtencion: 'Lunes a Domingo: 11:30 a.m. a 10:30 p.m.',
    },
  });
  console.log(` ✅ Restaurante listo: ${bryan.nombre} (ID: ${bryan.id}, Slug: ${bryan.slug})`);

  // =========================================================================
  // 1. SEDES (BRANCHES)
  // =========================================================================
  console.log('🏢 Sincronizando sedes de cada negocio...');
  const branchesData = [
    {
      nombre: 'Sede Granada (Principal)',
      slug: 'granada',
      direccion: 'Calle 9 # 45-12, Barrio Granada',
      telefono: '3229088736',
      ciudad: 'Cali',
      activo: true,
      restaurantId: puntoG.id,
    },
    {
      nombre: 'Sede Ciudad Jardín',
      slug: 'ciudad-jardin',
      direccion: 'Av. San Joaquín # 14-80, Ciudad Jardín',
      telefono: '3104567890',
      ciudad: 'Cali',
      activo: true,
      restaurantId: puntoG.id,
    },
    {
      nombre: 'Sede San Antonio',
      slug: 'san-antonio',
      direccion: 'Carrera 10 # 3-45, San Antonio',
      telefono: '3159876543',
      ciudad: 'Cali',
      activo: true,
      restaurantId: puntoG.id,
    },
    {
      nombre: 'Sede Salchi Ricurras Principal',
      slug: 'salchi-principal',
      direccion: 'Carrera 15 # 52-20, Cali',
      telefono: '3158901234',
      ciudad: 'Cali',
      activo: true,
      restaurantId: salchi.id,
    },
    {
      nombre: 'Sede Azados Bryan Roosevelt',
      slug: 'bryan-principal',
      direccion: 'Av. Roosevelt # 34-18, Cali',
      telefono: '3104567890',
      ciudad: 'Cali',
      activo: true,
      restaurantId: bryan.id,
    },
  ];

  const branchMap = {};
  for (const b of branchesData) {
    const branch = await prisma.branch.upsert({
      where: { slug: b.slug },
      update: {
        nombre: b.nombre,
        direccion: b.direccion,
        telefono: b.telefono,
        ciudad: b.ciudad,
        activo: b.activo,
        restaurantId: b.restaurantId,
      },
      create: b,
    });
    branchMap[b.slug] = branch.id;
    console.log(` ✅ Sede lista: ${branch.nombre} (ID: ${branch.id}, Restaurante: ${b.restaurantId})`);
  }

  const granadaId = branchMap['granada'];
  const jardinId = branchMap['ciudad-jardin'];
  const salchiBranchId = branchMap['salchi-principal'];
  const bryanBranchId = branchMap['bryan-principal'];

  // =========================================================================
  // 2. USUARIOS POR DEFECTO (SUPERADMIN & STAFF AISLADO)
  // =========================================================================
  console.log('👤 Sincronizando usuarios esenciales (Superadmin, Administradores, Cajeros, Cocina)...');
  const defaultUsers = [
    {
      nombre: 'Super Administrador GastroNegocios',
      email: 'superadmin@gastronegocios.com',
      password: 'admin123',
      rol: 'Superadmin',
      estado: 'Activo',
      permisos: JSON.stringify(['*']),
      branchId: null,
      restaurantId: null, // Acceso global plataforma
    },
    {
      nombre: 'Super Administrador Punto G',
      email: 'superadmin@puntog.com',
      password: 'admin123',
      rol: 'Superadmin',
      estado: 'Activo',
      permisos: JSON.stringify(['*']),
      branchId: null,
      restaurantId: null,
    },
    {
      nombre: 'Administrador Punto G',
      email: 'admin@puntog.com',
      password: 'admin123',
      rol: 'Administrador',
      estado: 'Activo',
      branchId: granadaId,
      restaurantId: puntoG.id,
    },
    {
      nombre: 'Administrador Ciudad Jardín',
      email: 'admin.jardin@puntog.com',
      password: 'admin123',
      rol: 'Administrador',
      estado: 'Activo',
      branchId: jardinId,
      restaurantId: puntoG.id,
    },
    {
      nombre: 'Cajero Principal Punto G',
      email: 'cajero@puntog.com',
      password: 'admin123',
      rol: 'Cajero',
      estado: 'Activo',
      branchId: granadaId,
      restaurantId: puntoG.id,
    },
    {
      nombre: 'Chef Cocina Punto G',
      email: 'cocina@puntog.com',
      password: 'cocina123',
      rol: 'Cocinero',
      estado: 'Activo',
      branchId: granadaId,
      restaurantId: puntoG.id,
    },
    {
      nombre: 'Mesero Punto G',
      email: 'mesero@puntog.com',
      password: 'mesero123',
      rol: 'Mesero',
      estado: 'Activo',
      branchId: granadaId,
      restaurantId: puntoG.id,
    },
    // Usuarios Salchi Ricurras
    {
      nombre: 'Administrador Salchi Ricurras',
      email: 'admin@salchiricuras.com',
      password: 'admin123',
      rol: 'Administrador',
      estado: 'Activo',
      branchId: salchiBranchId,
      restaurantId: salchi.id,
    },
    {
      nombre: 'Chef Cocina Salchi Ricurras',
      email: 'cocina@salchiricuras.com',
      password: 'cocina123',
      rol: 'Cocinero',
      estado: 'Activo',
      branchId: salchiBranchId,
      restaurantId: salchi.id,
    },
    // Usuarios Azados Bryan
    {
      nombre: 'Administrador Azados Bryan',
      email: 'admin@bryan.com',
      password: 'admin123',
      rol: 'Administrador',
      estado: 'Activo',
      branchId: bryanBranchId,
      restaurantId: bryan.id,
    },
    {
      nombre: 'Chef Cocina Azados Bryan',
      email: 'cocina@bryan.com',
      password: 'cocina123',
      rol: 'Cocinero',
      estado: 'Activo',
      branchId: bryanBranchId,
      restaurantId: bryan.id,
    },
  ];

  for (const u of defaultUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        rol: u.rol,
        estado: u.estado,
        branchId: u.branchId,
        restaurantId: u.restaurantId,
      },
      create: u,
    });
    console.log(` ✅ Usuario: ${u.nombre} (${u.email}) [Rol: ${u.rol}, RestId: ${u.restaurantId || 'Global'}]`);
  }

  // =========================================================================
  // 3. CARGAR CATEGORÍAS (PUNTO G + SALCHI RICURRAS + AZADOS BRYAN)
  // =========================================================================
  console.log('📂 Sincronizando categorías y subcategorías...');
  const seedDataPath = path.join(__dirname, 'seed-data.json');
  let seedData = { categories: [], products: [] };
  if (fs.existsSync(seedDataPath)) {
    seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));
  }

  const categoryMap = {}; // slug -> id
  const rawCategories = seedData.categories || [];

  // Paso 3.1: Categorías Principales Punto G (sin parentId)
  const mainCategories = rawCategories.filter((c) => !c.parentId);
  for (const mc of mainCategories) {
    const cat = await prisma.category.upsert({
      where: { slug: mc.slug },
      update: {
        nombre: mc.nombre,
        descripcion: mc.descripcion,
        icono: mc.icono || 'Utensils',
        imagen: mc.imagen,
        orden: mc.orden || 0,
        activo: true,
        parentId: null,
        restaurantId: puntoG.id,
      },
      create: {
        slug: mc.slug,
        nombre: mc.nombre,
        descripcion: mc.descripcion,
        icono: mc.icono || 'Utensils',
        imagen: mc.imagen,
        orden: mc.orden || 0,
        activo: true,
        parentId: null,
        restaurantId: puntoG.id,
      },
    });
    categoryMap[mc.slug] = cat.id;
    if (mc.id) categoryMap[mc.id] = cat.id;
  }

  // Paso 3.2: Subcategorías Punto G (con parentId)
  const subCategories = rawCategories.filter((c) => !c.parentId);
  for (const sc of subCategories) {
    let parentDbId = null;
    const parentRef = sc.parentId;
    if (categoryMap[parentRef]) {
      parentDbId = categoryMap[parentRef];
    } else {
      const foundParent = rawCategories.find((c) => c.id === parentRef || c.slug === parentRef);
      if (foundParent && categoryMap[foundParent.slug]) {
        parentDbId = categoryMap[foundParent.slug];
      }
    }

    const sub = await prisma.category.upsert({
      where: { slug: sc.slug },
      update: {
        nombre: sc.nombre,
        descripcion: sc.descripcion,
        icono: sc.icono || 'Utensils',
        imagen: sc.imagen,
        orden: sc.orden || 0,
        activo: true,
        parentId: parentDbId,
        restaurantId: puntoG.id,
      },
      create: {
        slug: sc.slug,
        nombre: sc.nombre,
        descripcion: sc.descripcion,
        icono: sc.icono || 'Utensils',
        imagen: sc.imagen,
        orden: sc.orden || 0,
        activo: true,
        parentId: parentDbId,
        restaurantId: puntoG.id,
      },
    });
    categoryMap[sc.slug] = sub.id;
    if (sc.id) categoryMap[sc.id] = sub.id;
  }

  // Paso 3.3: Categorías Salchi Ricurras
  const salchiCategories = [
    { slug: 'salchipapas-clasicas-sr', nombre: 'Salchipapas Clásicas', icono: 'Utensils', orden: 1, restaurantId: salchi.id },
    { slug: 'salchipapas-especiales-sr', nombre: 'Salchipapas Especiales', icono: 'Flame', orden: 2, restaurantId: salchi.id },
    { slug: 'mazorcadas-sr', nombre: 'Mazorcadas', icono: 'Sparkles', orden: 3, restaurantId: salchi.id },
    { slug: 'bebidas-sr', nombre: 'Bebidas & Gaseosas', icono: 'GlassWater', orden: 4, restaurantId: salchi.id },
  ];
  for (const sc of salchiCategories) {
    const c = await prisma.category.upsert({
      where: { slug: sc.slug },
      update: { nombre: sc.nombre, icono: sc.icono, orden: sc.orden, activo: true, restaurantId: sc.restaurantId },
      create: { slug: sc.slug, nombre: sc.nombre, icono: sc.icono, orden: sc.orden, activo: true, restaurantId: sc.restaurantId },
    });
    categoryMap[sc.slug] = c.id;
  }

  // Paso 3.4: Categorías Azados Bryan
  const bryanCategories = [
    { slug: 'carnes-carbon-ab', nombre: 'Carnes al Carbón', icono: 'Flame', orden: 1, restaurantId: bryan.id },
    { slug: 'costillas-picadas-ab', nombre: 'Costillas & Picadas', icono: 'Utensils', orden: 2, restaurantId: bryan.id },
    { slug: 'acompanamientos-ab', nombre: 'Acompañamientos', icono: 'Sparkles', orden: 3, restaurantId: bryan.id },
    { slug: 'bebidas-ab', nombre: 'Bebidas & Cervezas', icono: 'Beer', orden: 4, restaurantId: bryan.id },
  ];
  for (const bc of bryanCategories) {
    const c = await prisma.category.upsert({
      where: { slug: bc.slug },
      update: { nombre: bc.nombre, icono: bc.icono, orden: bc.orden, activo: true, restaurantId: bc.restaurantId },
      create: { slug: bc.slug, nombre: bc.nombre, icono: bc.icono, orden: bc.orden, activo: true, restaurantId: bc.restaurantId },
    });
    categoryMap[bc.slug] = c.id;
  }
  console.log(` ✅ Categorías sincronizadas para Punto G, Salchi Ricurras y Azados Bryan.`);

  // =========================================================================
  // 4. PRODUCTOS (CATÁLOGO COMPLETO POR RESTAURANTE)
  // =========================================================================
  console.log('🍔 Sincronizando catálogo completo de productos...');
  const rawProducts = seedData.products || [];
  let productsCount = 0;

  // 4.1 Productos de Punto G
  for (const p of rawProducts) {
    const catDbId = categoryMap[p.categoria] || categoryMap['comidas-rapidas'] || Object.values(categoryMap)[0];
    const subcatDbId = p.subcategoria ? (categoryMap[p.subcategoria] || null) : null;

    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        nombre: p.nombre,
        descripcion: p.descripcion || '',
        precio: Number(p.precio) || 0,
        imagen: p.imagen || '',
        categoriaId: catDbId,
        subcategoriaId: subcatDbId,
        etiqueta: p.etiqueta || null,
        disponibilidad: p.disponibilidad !== false,
        orden: p.orden || 0,
        restaurantId: puntoG.id,
      },
      create: {
        slug: p.slug,
        nombre: p.nombre,
        descripcion: p.descripcion || '',
        precio: Number(p.precio) || 0,
        imagen: p.imagen || '',
        categoriaId: catDbId,
        subcategoriaId: subcatDbId,
        etiqueta: p.etiqueta || null,
        disponibilidad: p.disponibilidad !== false,
        orden: p.orden || 0,
        restaurantId: puntoG.id,
      },
    });
    productsCount++;
  }

  // 4.2 Productos de Salchi Ricurras
  const salchiProducts = [
    {
      slug: 'salchipapa-sencilla-sr',
      nombre: 'Salchipapa Clásica Sencilla',
      descripcion: 'Papas a la francesa crocantes con salchicha manguera dorada, salsas de la casa y ripio.',
      precio: 16000,
      imagen: '/images/salchipapa-gourmet.png',
      categoriaId: categoryMap['salchipapas-clasicas-sr'],
      etiqueta: 'Clásico',
      restaurantId: salchi.id,
    },
    {
      slug: 'salchipapa-ricurra-salvaje',
      nombre: 'Salchipapa Ricurra Salvaje',
      descripcion: 'Papas amarillas y criollas, salchicha americana, tocineta ahumada, pollo desmechado, maíz tierno y queso fundido.',
      precio: 28500,
      imagen: '/images/salchipapa-gourmet.png',
      categoriaId: categoryMap['salchipapas-especiales-sr'],
      etiqueta: 'Más Pedido',
      restaurantId: salchi.id,
    },
    {
      slug: 'salchipapa-costena-especial',
      nombre: 'Salchipapa Costeña con Suero',
      descripcion: 'Papas crocantes, abundante queso costeño rallado, butifarra dorada y suero costeño artesanal.',
      precio: 25000,
      imagen: '/images/salchipapa-gourmet.png',
      categoriaId: categoryMap['salchipapas-especiales-sr'],
      etiqueta: 'Favorito',
      restaurantId: salchi.id,
    },
    {
      slug: 'mazorcada-mixta-queso',
      nombre: 'Mazorcada Mixta Especial',
      descripcion: 'Desgranado de maíz dulce tierno, pollo en cubos, carne de res, tocineta crocante y gratín de doble queso mozzarella.',
      precio: 24000,
      imagen: '/images/salchipapa-gourmet.png',
      categoriaId: categoryMap['mazorcadas-sr'],
      etiqueta: 'Recomendado',
      restaurantId: salchi.id,
    },
    {
      slug: 'postobon-manzana-400ml-sr',
      nombre: 'Gaseosa Postobón Manzana 400ml',
      descripcion: 'Botella individual fría.',
      precio: 4500,
      imagen: '/images/coca-cola.png',
      categoriaId: categoryMap['bebidas-sr'],
      restaurantId: salchi.id,
    },
    {
      slug: 'coca-cola-400ml-sr',
      nombre: 'Coca-Cola 400ml Original',
      descripcion: 'Botella individual bien helada.',
      precio: 5000,
      imagen: '/images/coca-cola.png',
      categoriaId: categoryMap['bebidas-sr'],
      restaurantId: salchi.id,
    },
  ];

  for (const sp of salchiProducts) {
    await prisma.product.upsert({
      where: { slug: sp.slug },
      update: {
        nombre: sp.nombre,
        descripcion: sp.descripcion,
        precio: sp.precio,
        imagen: sp.imagen,
        categoriaId: sp.categoriaId,
        etiqueta: sp.etiqueta || null,
        disponibilidad: true,
        restaurantId: sp.restaurantId,
      },
      create: {
        slug: sp.slug,
        nombre: sp.nombre,
        descripcion: sp.descripcion,
        precio: sp.precio,
        imagen: sp.imagen,
        categoriaId: sp.categoriaId,
        etiqueta: sp.etiqueta || null,
        disponibilidad: true,
        restaurantId: sp.restaurantId,
      },
    });
    productsCount++;
  }

  // 4.3 Productos de Azados Bryan
  const bryanProducts = [
    {
      slug: 'churrasco-brasa-350g',
      nombre: 'Churrasco a la Brasa 350g',
      descripcion: 'Corte fino de res asado al término deseado con chimichurri casero, papas a la francesa y ensalada.',
      precio: 36000,
      imagen: '/images/carne-parrilla.png',
      categoriaId: categoryMap['carnes-carbon-ab'],
      etiqueta: 'Corte Premium',
      restaurantId: bryan.id,
    },
    {
      slug: 'costillas-bbq-carbon',
      nombre: 'Costillas BBQ al Carbón',
      descripcion: 'Costillas tiernas de cerdo bañadas en salsa BBQ ahumada artesanal, acompañadas de papas criollas doradas.',
      precio: 34000,
      imagen: '/images/carne-parrilla.png',
      categoriaId: categoryMap['costillas-picadas-ab'],
      etiqueta: 'Especialidad',
      restaurantId: bryan.id,
    },
    {
      slug: 'picada-tradicional-dos',
      nombre: 'Picada Mixta Tradicional (Para 2)',
      descripcion: 'Carne de res, pechuga de pollo, cerdo, chicharrón crocante, papa criolla, patacones y arepa.',
      precio: 42000,
      imagen: '/images/carne-parrilla.png',
      categoriaId: categoryMap['costillas-picadas-ab'],
      etiqueta: 'Para Compartir',
      restaurantId: bryan.id,
    },
    {
      slug: 'pechuga-gratinada-carbon',
      nombre: 'Pechuga Gratinada al Carbón',
      descripcion: 'Filete de pechuga jugosa al carbón cubierta de queso mozzarella fundido y champiñones salteados.',
      precio: 29000,
      imagen: '/images/carne-parrilla.png',
      categoriaId: categoryMap['carnes-carbon-ab'],
      restaurantId: bryan.id,
    },
    {
      slug: 'cerveza-corona-ab',
      nombre: 'Cerveza Corona Extra 355ml',
      descripcion: 'Cerveza helada servida con limón.',
      precio: 9000,
      imagen: '/images/coca-cola.png',
      categoriaId: categoryMap['bebidas-ab'],
      restaurantId: bryan.id,
    },
    {
      slug: 'jugo-natural-ab',
      nombre: 'Jugo Natural en Agua o Leche',
      descripcion: 'Mango, Maracuyá, Mora o Lulo recién preparado.',
      precio: 7000,
      imagen: '/images/coca-cola.png',
      categoriaId: categoryMap['bebidas-ab'],
      restaurantId: bryan.id,
    },
  ];

  for (const bp of bryanProducts) {
    await prisma.product.upsert({
      where: { slug: bp.slug },
      update: {
        nombre: bp.nombre,
        descripcion: bp.descripcion,
        precio: bp.precio,
        imagen: bp.imagen,
        categoriaId: bp.categoriaId,
        etiqueta: bp.etiqueta || null,
        disponibilidad: true,
        restaurantId: bp.restaurantId,
      },
      create: {
        slug: bp.slug,
        nombre: bp.nombre,
        descripcion: bp.descripcion,
        precio: bp.precio,
        imagen: bp.imagen,
        categoriaId: bp.categoriaId,
        etiqueta: bp.etiqueta || null,
        disponibilidad: true,
        restaurantId: bp.restaurantId,
      },
    });
    productsCount++;
  }

  console.log(` ✅ ${productsCount} productos sincronizados y asignados a sus respectivos restaurantes.`);

  // =========================================================================
  // 5. TOPPINGS Y ADICIONALES (PRODUCT ADDONS)
  // =========================================================================
  console.log('🥓 Sincronizando toppings, salsas y adicionales...');
  const addonsData = [
    { nombre: 'Tocineta Crujiente Extra', precio: 4500, categoria: 'Toppings', restaurantId: puntoG.id },
    { nombre: 'Queso Fundido Mozzarella', precio: 3500, categoria: 'Toppings', restaurantId: puntoG.id },
    { nombre: 'Queso Costeño Rallado', precio: 3000, categoria: 'Toppings', restaurantId: puntoG.id },
    { nombre: 'Queso Cheddar Artesanal', precio: 3500, categoria: 'Toppings', restaurantId: puntoG.id },
    { nombre: 'Huevo Frito a la Plancha', precio: 2500, categoria: 'Toppings', restaurantId: puntoG.id },
    { nombre: 'Cebolla Caramelizada', precio: 2500, categoria: 'Toppings', restaurantId: puntoG.id },
    { nombre: 'Champiñones Salteados al Ajillo', precio: 4000, categoria: 'Toppings', restaurantId: puntoG.id },
    { nombre: 'Guacamole Rústico', precio: 3800, categoria: 'Toppings', restaurantId: puntoG.id },
    { nombre: 'Jalapeños Picantes', precio: 2500, categoria: 'Toppings', restaurantId: puntoG.id },
    { nombre: 'Carne de Res Artesanal 150g', precio: 8500, categoria: 'Toppings', restaurantId: puntoG.id },
    { nombre: 'Salchicha Americana Ahumada', precio: 4500, categoria: 'Toppings', restaurantId: puntoG.id },
    { nombre: 'Papas Ralladas Ripio Crocantes', precio: 2000, categoria: 'Toppings', restaurantId: puntoG.id },
    { nombre: 'Salsa Tártara Especial de la Casa', precio: 1500, categoria: 'Salsas', restaurantId: puntoG.id },
    { nombre: 'Salsa BBQ Ahumada Artesanal', precio: 1500, categoria: 'Salsas', restaurantId: puntoG.id },
    { nombre: 'Salsa de Ajo Criolla', precio: 1500, categoria: 'Salsas', restaurantId: puntoG.id },
    { nombre: 'Salsa Punto G Picante Fuego', precio: 1800, categoria: 'Salsas', restaurantId: puntoG.id },
    { nombre: 'Porción Papas a la Francesa', precio: 6000, categoria: 'Acompañamientos', restaurantId: puntoG.id },
    { nombre: 'Porción Papas Criollas Doradas', precio: 6500, categoria: 'Acompañamientos', restaurantId: puntoG.id },
    { nombre: 'Porción Yuca Crocante con Suero', precio: 7000, categoria: 'Acompañamientos', restaurantId: puntoG.id },
    { nombre: 'Aros de Cebolla Apanados (6 uds)', precio: 6500, categoria: 'Acompañamientos', restaurantId: puntoG.id },
  ];

  for (const ad of addonsData) {
    const existing = await prisma.productAddon.findFirst({
      where: { nombre: ad.nombre },
    });
    if (existing) {
      await prisma.productAddon.update({
        where: { id: existing.id },
        data: { precio: ad.precio, categoria: ad.categoria, activo: true, restaurantId: ad.restaurantId },
      });
    } else {
      await prisma.productAddon.create({
        data: {
          nombre: ad.nombre,
          precio: ad.precio,
          categoria: ad.categoria,
          activo: true,
          restaurantId: ad.restaurantId,
        },
      });
    }
  }
  console.log(` ✅ ${addonsData.length} toppings y salsas sincronizados.`);

  // =========================================================================
  // 6. MESAS Y BARRAS (RESTAURANT TABLES)
  // =========================================================================
  console.log('🍽️ Sincronizando mesas y barras de atención...');
  const tablesData = [
    // Mesas Punto G
    { numero: 'Mesa 1', capacidad: 4, ubicacion: 'Salón Principal', branchId: granadaId, restaurantId: puntoG.id },
    { numero: 'Mesa 2', capacidad: 4, ubicacion: 'Salón Principal', branchId: granadaId, restaurantId: puntoG.id },
    { numero: 'Mesa 3', capacidad: 6, ubicacion: 'Salón Principal', branchId: granadaId, restaurantId: puntoG.id },
    { numero: 'Mesa 4', capacidad: 4, ubicacion: 'Salón Principal', branchId: granadaId, restaurantId: puntoG.id },
    { numero: 'Mesa 5', capacidad: 2, ubicacion: 'Terraza Exterior', branchId: granadaId, restaurantId: puntoG.id },
    { numero: 'Mesa 6', capacidad: 4, ubicacion: 'Terraza Exterior', branchId: granadaId, restaurantId: puntoG.id },
    { numero: 'Mesa 7', capacidad: 8, ubicacion: 'Terraza Exterior', branchId: granadaId, restaurantId: puntoG.id },
    { numero: 'Mesa 8', capacidad: 4, ubicacion: 'Zona VIP', branchId: granadaId, restaurantId: puntoG.id },
    { numero: 'Barra 1', capacidad: 2, ubicacion: 'Barra Bar', branchId: granadaId, restaurantId: puntoG.id },
    { numero: 'Barra 2', capacidad: 2, ubicacion: 'Barra Bar', branchId: granadaId, restaurantId: puntoG.id },
    { numero: 'Barra 3', capacidad: 3, ubicacion: 'Barra Bar', branchId: granadaId, restaurantId: puntoG.id },
    { numero: 'VIP 1', capacidad: 10, ubicacion: 'Zona VIP', branchId: granadaId, restaurantId: puntoG.id },

    // Mesas Salchi Ricurras
    { numero: 'Mesa SR-1', capacidad: 4, ubicacion: 'Salón Salchi', branchId: salchiBranchId, restaurantId: salchi.id },
    { numero: 'Mesa SR-2', capacidad: 4, ubicacion: 'Salón Salchi', branchId: salchiBranchId, restaurantId: salchi.id },
    { numero: 'Mesa SR-3', capacidad: 6, ubicacion: 'Terraza Salchi', branchId: salchiBranchId, restaurantId: salchi.id },
    { numero: 'Mesa SR-4', capacidad: 4, ubicacion: 'Terraza Salchi', branchId: salchiBranchId, restaurantId: salchi.id },

    // Mesas Azados Bryan
    { numero: 'Mesa AB-1', capacidad: 4, ubicacion: 'Salón Parrilla', branchId: bryanBranchId, restaurantId: bryan.id },
    { numero: 'Mesa AB-2', capacidad: 6, ubicacion: 'Salón Parrilla', branchId: bryanBranchId, restaurantId: bryan.id },
    { numero: 'Mesa AB-3', capacidad: 4, ubicacion: 'Terraza Parrilla', branchId: bryanBranchId, restaurantId: bryan.id },
    { numero: 'Mesa AB-4', capacidad: 8, ubicacion: 'Zona Campestre', branchId: bryanBranchId, restaurantId: bryan.id },
  ];

  for (const t of tablesData) {
    await prisma.restaurantTable.upsert({
      where: { numero: t.numero },
      update: {
        capacidad: t.capacidad,
        ubicacion: t.ubicacion,
        branchId: t.branchId,
        restaurantId: t.restaurantId,
      },
      create: {
        numero: t.numero,
        capacidad: t.capacidad,
        ubicacion: t.ubicacion,
        branchId: t.branchId,
        restaurantId: t.restaurantId,
        estado: 'Libre',
      },
    });
  }
  console.log(` ✅ ${tablesData.length} mesas y barras listas.`);

  // =========================================================================
  // 7. RESTAURANT CONFIG (CONFIGURACIÓN GLOBAL)
  // =========================================================================
  console.log('⚙️ Sincronizando configuración de restaurante...');
  const existingConfig = await prisma.restaurantConfig.findFirst();
  if (existingConfig) {
    await prisma.restaurantConfig.update({
      where: { id: existingConfig.id },
      data: {
        nombre: 'PUNTO G',
        eslogan: 'PUNTO G TU MÁXIMO PLACER',
        telefonoWhatsapp: '3229088736',
        direccion: 'Calle 9 # 45-12, Barrio Granada, Cali',
        horario: 'Lunes a Domingo: 12:00 m. a 11:30 p.m.',
      },
    });
  } else {
    await prisma.restaurantConfig.create({
      data: {
        nombre: 'PUNTO G',
        eslogan: 'PUNTO G TU MÁXIMO PLACER',
        telefonoWhatsapp: '3229088736',
        direccion: 'Calle 9 # 45-12, Barrio Granada, Cali',
        horario: 'Lunes a Domingo: 12:00 m. a 11:30 p.m.',
        costoDomicilioBase: 5000,
        propinaSugeridaPct: 10,
        urlBaseSitio: 'https://puntog.sarriatech.tech',
      },
    });
  }
  console.log(' ✅ Configuración general de Punto G actualizada con eslogan "PUNTO G TU MÁXIMO PLACER".');

  console.log('\n🎉 ¡SINCRONIZACIÓN COMPLETA! Punto G, Salchi Ricurras y Azados Bryan listos en la Base de Datos.');
}

main()
  .catch((e) => {
    console.error('⚠️ Advertencia ejecutando seed-db:', e.message || e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
