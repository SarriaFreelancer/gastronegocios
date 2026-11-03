const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando sincronización y carga inicial de base de datos Punto G...');

  // 1. SEDES (BRANCHES)
  console.log('🏢 Sincronizando sedes del negocio...');
  const branchesData = [
    {
      nombre: 'Sede Granada (Principal)',
      slug: 'granada',
      direccion: 'Calle 9 # 45-12, Barrio Granada',
      telefono: '3229088736',
      ciudad: 'Cali',
      activo: true,
    },
    {
      nombre: 'Sede Ciudad Jardín',
      slug: 'ciudad-jardin',
      direccion: 'Av. San Joaquín # 14-80, Ciudad Jardín',
      telefono: '3104567890',
      ciudad: 'Cali',
      activo: true,
    },
    {
      nombre: 'Sede San Antonio',
      slug: 'san-antonio',
      direccion: 'Carrera 10 # 3-45, San Antonio',
      telefono: '3159876543',
      ciudad: 'Cali',
      activo: true,
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
      },
      create: b,
    });
    branchMap[b.slug] = branch.id;
    console.log(` ✅ Sede lista: ${branch.nombre} (ID: ${branch.id})`);
  }

  const granadaId = branchMap['granada'];
  const jardinId = branchMap['ciudad-jardin'];

  // 2. USUARIOS POR DEFECTO
  console.log('👤 Sincronizando usuarios esenciales (Superadmin, Administradores, Cajeros, Cocina)...');
  const defaultUsers = [
    {
      nombre: 'Super Administrador',
      email: 'superadmin@puntog.com',
      password: 'admin123',
      rol: 'Superadmin',
      estado: 'Activo',
      branchId: null, // Acceso global a todas las sedes
    },
    {
      nombre: 'Administrador Granada',
      email: 'admin@puntog.com',
      password: 'admin123',
      rol: 'Administrador',
      estado: 'Activo',
      branchId: granadaId,
    },
    {
      nombre: 'Administrador Ciudad Jardín',
      email: 'admin.jardin@puntog.com',
      password: 'admin123',
      rol: 'Administrador',
      estado: 'Activo',
      branchId: jardinId,
    },
    {
      nombre: 'Cajero Principal',
      email: 'cajero@puntog.com',
      password: 'admin123',
      rol: 'Cajero',
      estado: 'Activo',
      branchId: granadaId,
    },
    {
      nombre: 'Chef Cocina Principal',
      email: 'cocina@puntog.com',
      password: 'cocina123',
      rol: 'Cocinero',
      estado: 'Activo',
      branchId: granadaId,
    },
    {
      nombre: 'Mesero Principal',
      email: 'mesero@puntog.com',
      password: 'mesero123',
      rol: 'Mesero',
      estado: 'Activo',
      branchId: granadaId,
    },
  ];

  for (const u of defaultUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        rol: u.rol,
        estado: u.estado,
        branchId: u.branchId,
      },
      create: u,
    });
    console.log(` ✅ Usuario: ${u.nombre} (${u.email}) [Rol: ${u.rol}, Sede: ${u.branchId ? u.branchId : 'Global/Todas'}]`);
  }

  // 3. CARGAR CATEGORÍAS Y SUBCATEGORÍAS
  console.log('📂 Sincronizando categorías y subcategorías...');
  const seedDataPath = path.join(__dirname, 'seed-data.json');
  let seedData = { categories: [], products: [] };
  if (fs.existsSync(seedDataPath)) {
    seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));
  }

  const categoryMap = {}; // slug -> id
  const rawCategories = seedData.categories || [];

  // Paso 3.1: Categorías Principales (sin parentId)
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
      },
    });
    categoryMap[mc.slug] = cat.id;
    if (mc.id) categoryMap[mc.id] = cat.id;
  }

  // Paso 3.2: Subcategorías (con parentId)
  const subCategories = rawCategories.filter((c) => !!c.parentId);
  for (const sc of subCategories) {
    // Buscar parentId correspondiente
    let parentDbId = null;
    const parentRef = sc.parentId;
    if (categoryMap[parentRef]) {
      parentDbId = categoryMap[parentRef];
    } else {
      // Intentar encontrar categoría padre por id o slug
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
      },
    });
    categoryMap[sc.slug] = sub.id;
    if (sc.id) categoryMap[sc.id] = sub.id;
  }
  console.log(` ✅ ${rawCategories.length} categorías y subcategorías sincronizadas.`);

  // 4. PRODUCTOS
  console.log('🍔 Sincronizando catálogo completo de productos...');
  const rawProducts = seedData.products || [];
  let productsCount = 0;

  for (const p of rawProducts) {
    const catDbId = categoryMap[p.categoria] || categoryMap['comidas-rapidas'] || 1;
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
      },
    });
    productsCount++;
  }
  console.log(` ✅ ${productsCount} productos sincronizados en la base de datos.`);

  // 5. TOPPINGS Y ADICIONALES (PRODUCT ADDONS)
  console.log('🥓 Sincronizando toppings, salsas y adicionales...');
  const addonsData = [
    { nombre: 'Tocineta Crujiente Extra', precio: 4500, categoria: 'Toppings' },
    { nombre: 'Queso Fundido Mozzarella', precio: 3500, categoria: 'Toppings' },
    { nombre: 'Queso Costeño Rallado', precio: 3000, categoria: 'Toppings' },
    { nombre: 'Queso Cheddar Artesanal', precio: 3500, categoria: 'Toppings' },
    { nombre: 'Huevo Frito a la Plancha', precio: 2500, categoria: 'Toppings' },
    { nombre: 'Cebolla Caramelizada', precio: 2500, categoria: 'Toppings' },
    { nombre: 'Champiñones Salteados al Ajillo', precio: 4000, categoria: 'Toppings' },
    { nombre: 'Guacamole Rústico', precio: 3800, categoria: 'Toppings' },
    { nombre: 'Jalapeños Picantes', precio: 2500, categoria: 'Toppings' },
    { nombre: 'Carne de Res Artesanal 150g', precio: 8500, categoria: 'Toppings' },
    { nombre: 'Salchicha Americana Ahumada', precio: 4500, categoria: 'Toppings' },
    { nombre: 'Papas Ralladas Ripio Crocantes', precio: 2000, categoria: 'Toppings' },
    { nombre: 'Salsa Tártara Especial de la Casa', precio: 1500, categoria: 'Salsas' },
    { nombre: 'Salsa BBQ Ahumada Artesanal', precio: 1500, categoria: 'Salsas' },
    { nombre: 'Salsa de Ajo Criolla', precio: 1500, categoria: 'Salsas' },
    { nombre: 'Salsa Punto G Picante Fuego', precio: 1800, categoria: 'Salsas' },
    { nombre: 'Porción Papas a la Francesa', precio: 6000, categoria: 'Acompañamientos' },
    { nombre: 'Porción Papas Criollas Doradas', precio: 6500, categoria: 'Acompañamientos' },
    { nombre: 'Porción Yuca Crocante con Suero', precio: 7000, categoria: 'Acompañamientos' },
    { nombre: 'Aros de Cebolla Apanados (6 uds)', precio: 6500, categoria: 'Acompañamientos' },
  ];

  for (const ad of addonsData) {
    const existing = await prisma.productAddon.findFirst({
      where: { nombre: ad.nombre },
    });
    if (existing) {
      await prisma.productAddon.update({
        where: { id: existing.id },
        data: { precio: ad.precio, categoria: ad.categoria, activo: true },
      });
    } else {
      await prisma.productAddon.create({
        data: {
          nombre: ad.nombre,
          precio: ad.precio,
          categoria: ad.categoria,
          activo: true,
        },
      });
    }
  }
  console.log(` ✅ ${addonsData.length} toppings y salsas sincronizados.`);

  // 6. MESAS Y BARRAS (RESTAURANT TABLES)
  console.log('🍽️ Sincronizando mesas, barras y zonas de atención...');
  const tablesData = [
    { numero: 'Mesa 1', capacidad: 4, ubicacion: 'Salón Principal', branchId: granadaId },
    { numero: 'Mesa 2', capacidad: 4, ubicacion: 'Salón Principal', branchId: granadaId },
    { numero: 'Mesa 3', capacidad: 6, ubicacion: 'Salón Principal', branchId: granadaId },
    { numero: 'Mesa 4', capacidad: 4, ubicacion: 'Salón Principal', branchId: granadaId },
    { numero: 'Mesa 5', capacidad: 2, ubicacion: 'Terraza Exterior', branchId: granadaId },
    { numero: 'Mesa 6', capacidad: 4, ubicacion: 'Terraza Exterior', branchId: granadaId },
    { numero: 'Mesa 7', capacidad: 8, ubicacion: 'Terraza Exterior', branchId: granadaId },
    { numero: 'Mesa 8', capacidad: 4, ubicacion: 'Zona VIP', branchId: granadaId },
    { numero: 'Barra 1', capacidad: 2, ubicacion: 'Barra Bar', branchId: granadaId },
    { numero: 'Barra 2', capacidad: 2, ubicacion: 'Barra Bar', branchId: granadaId },
    { numero: 'Barra 3', capacidad: 3, ubicacion: 'Barra Bar', branchId: granadaId },
    { numero: 'VIP 1', capacidad: 10, ubicacion: 'Zona VIP', branchId: granadaId },
  ];

  for (const t of tablesData) {
    await prisma.restaurantTable.upsert({
      where: { numero: t.numero },
      update: {
        capacidad: t.capacidad,
        ubicacion: t.ubicacion,
        branchId: t.branchId,
      },
      create: {
        numero: t.numero,
        capacidad: t.capacidad,
        ubicacion: t.ubicacion,
        branchId: t.branchId,
        estado: 'Libre',
      },
    });
  }
  console.log(` ✅ ${tablesData.length} mesas y barras listas.`);

  // 7. RESTAURANT CONFIG
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

  console.log('\n🎉 ¡SINCRONIZACIÓN COMPLETA! Todos los datos están listos en la Base de Datos.');
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando seed-db:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
