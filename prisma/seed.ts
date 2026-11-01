import { PrismaClient } from '@prisma/client';
import { categories as initialCategories } from '../src/data/categories';
import { products as initialProducts } from '../src/data/products';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting MySQL seeding for Punto G...');

  // 1. Seed Config
  await prisma.restaurantConfig.upsert({
    where: { id: 'config-default' },
    update: {},
    create: {
      id: 'config-default',
      nombre: 'PUNTO G',
      eslogan: 'ANTOJOS QUE CONECTAN',
      telefonoWhatsapp: '3229088736',
      direccion: 'Calle 9 # 45-12, Barrio Granada, Cali',
      horario: 'Lunes a Domingo: 12:00 m. a 11:30 p.m.',
      costoDomicilioBase: 5000,
      propinaSugeridaPct: 10,
      urlBaseSitio: 'http://localhost:3005',
    },
  });

  // 2. Seed Users
  const users = [
    {
      id: 'usr-1',
      nombre: 'David Sarria',
      email: 'admin@puntog.com',
      password: 'admin123',
      rol: 'Administrador',
      estado: 'Activo',
    },
    {
      id: 'usr-2',
      nombre: 'Carlos Gómez',
      email: 'carlos.caja@puntog.com',
      password: 'admin123',
      rol: 'Cajero',
      estado: 'Activo',
    },
    {
      id: 'usr-3',
      nombre: 'María Rodríguez',
      email: 'maria.cocina@puntog.com',
      password: 'admin123',
      rol: 'Cocinero',
      estado: 'Activo',
    },
    {
      id: 'usr-4',
      nombre: 'Andrés Mesero',
      email: 'andres.mesas@puntog.com',
      password: 'admin123',
      rol: 'Mesero',
      estado: 'Activo',
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        nombre: u.nombre,
        rol: u.rol,
        estado: u.estado,
      },
      create: u,
    });
  }
  console.log('✅ Users seeded');

  // 3. Seed Categories
  const categoryMap = new Map<string, string>(); // slug -> id
  for (const cat of initialCategories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        nombre: cat.nombre,
        descripcion: cat.descripcion,
        icono: cat.icono,
        imagen: cat.imagen,
        orden: cat.orden,
        activo: true,
      },
      create: {
        nombre: cat.nombre,
        slug: cat.slug,
        descripcion: cat.descripcion,
        icono: cat.icono,
        imagen: cat.imagen,
        orden: cat.orden,
        activo: true,
      },
    });
    categoryMap.set(cat.slug, created.id);
  }
  console.log(`✅ ${categoryMap.size} Categories seeded`);

  // 4. Seed Products
  for (const prod of initialProducts) {
    const categoriaId = categoryMap.get(prod.categoria);
    if (!categoriaId) continue;

    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {
        nombre: prod.nombre,
        descripcion: prod.descripcion,
        precio: prod.precio,
        imagen: prod.imagen,
        categoriaId: categoriaId,
        etiqueta: prod.etiqueta || null,
        disponibilidad: prod.disponibilidad ?? true,
      },
      create: {
        id: prod.id,
        nombre: prod.nombre,
        slug: prod.slug,
        descripcion: prod.descripcion,
        precio: prod.precio,
        imagen: prod.imagen,
        categoriaId: categoriaId,
        etiqueta: prod.etiqueta || null,
        disponibilidad: prod.disponibilidad ?? true,
      },
    });
  }
  console.log(`✅ Products seeded`);

  // 5. Seed Restaurant Tables (Mesas)
  const tables = [
    { numero: 'Mesa 1', capacidad: 4, ubicacion: 'Salón Principal', estado: 'Ocupada' },
    { numero: 'Mesa 2', capacidad: 2, ubicacion: 'Salón Principal', estado: 'Libre' },
    { numero: 'Mesa 3', capacidad: 4, ubicacion: 'Terraza', estado: 'Ocupada' },
    { numero: 'Mesa 4', capacidad: 6, ubicacion: 'Terraza', estado: 'Libre' },
    { numero: 'Mesa 5', capacidad: 4, ubicacion: 'Salón VIP', estado: 'Libre' },
    { numero: 'Mesa 6', capacidad: 8, ubicacion: 'Salón Principal', estado: 'Libre' },
    { numero: 'Barra 1', capacidad: 2, ubicacion: 'Barra', estado: 'Libre' },
    { numero: 'Barra 2', capacidad: 2, ubicacion: 'Barra', estado: 'Libre' },
  ];

  const tableMap = new Map<string, string>();
  for (const t of tables) {
    const table = await prisma.restaurantTable.upsert({
      where: { numero: t.numero },
      update: {
        capacidad: t.capacidad,
        ubicacion: t.ubicacion,
        estado: t.estado,
      },
      create: t,
    });
    tableMap.set(t.numero, table.id);
  }
  console.log('✅ Tables seeded');

  // 6. Seed Orders (with dates for filters, tip, table, pickup, delivery)
  const ordersData = [
    {
      codigo: 'PG-1045',
      cliente: 'Juan Camilo Pérez',
      telefono: '312 456 7890',
      tipo: 'domicilio',
      direccion: 'Calle 14 # 85-30, Apto 402, El Limonar',
      barrio: 'El Limonar',
      subtotal: 58000,
      propina: 5000,
      costoEnvio: 5000,
      total: 68000,
      estado: 'Pendiente',
      metodoPago: 'Nequi',
      notasCliente: 'La hamburguesa bien asada por favor, sin cebolla.',
      createdAt: new Date(),
      items: [
        { nombre: 'G Clásica Artesanal', precio: 22000, cantidad: 2, notas: 'Sin cebolla' },
        { nombre: 'Soda Artesanal Frutos Rojos', precio: 14000, cantidad: 1 },
      ],
    },
    {
      codigo: 'PG-1044',
      cliente: 'Familia Ramírez',
      telefono: '315 889 4433',
      tipo: 'mesa',
      mesaId: tableMap.get('Mesa 1'),
      numeroMesa: 'Mesa 1',
      subtotal: 78000,
      propina: 7800,
      costoEnvio: 0,
      total: 85800,
      estado: 'En Preparación',
      metodoPago: 'Datáfono',
      notasCliente: 'Servir con salsas de ajo y piña extra.',
      createdAt: new Date(Date.now() - 25 * 60 * 1000), // 25 min ago
      items: [
        { nombre: 'Picada Criolla Punto G', precio: 58000, cantidad: 1, notas: 'Bien tostada' },
        { nombre: 'Jugo de Lulo Valluno', precio: 10000, cantidad: 2 },
      ],
    },
    {
      codigo: 'PG-1043',
      cliente: 'Andrés & Sofía',
      telefono: '310 998 1122',
      tipo: 'mesa',
      mesaId: tableMap.get('Mesa 3'),
      numeroMesa: 'Mesa 3',
      subtotal: 56000,
      propina: 5600,
      costoEnvio: 0,
      total: 61600,
      estado: 'En Preparación',
      metodoPago: 'Efectivo',
      notasCliente: 'Mesa con reserva previa.',
      createdAt: new Date(Date.now() - 40 * 60 * 1000),
      items: [
        { nombre: 'Doble Placer Burger', precio: 28000, cantidad: 2 },
      ],
    },
    {
      codigo: 'PG-1042',
      cliente: 'Carolina Méndez',
      telefono: '317 334 5566',
      tipo: 'recoger',
      subtotal: 29000,
      propina: 3000,
      costoEnvio: 0,
      total: 32000,
      estado: 'Listo',
      metodoPago: 'Daviplata',
      notasCliente: 'Pasa a recoger en moto en 15 minutos.',
      createdAt: new Date(Date.now() - 55 * 60 * 1000),
      items: [
        { nombre: 'Bacon Crispy Burger', precio: 26000, cantidad: 1 },
        { nombre: 'Coca-Cola 400ml', precio: 6000, cantidad: 1 },
      ],
    },
    {
      codigo: 'PG-1041',
      cliente: 'Mateo Osorio',
      telefono: '316 777 8899',
      tipo: 'domicilio',
      direccion: 'Carrera 66 # 10-45, Ciudad Jardín',
      barrio: 'Ciudad Jardín',
      subtotal: 64000,
      propina: 6000,
      costoEnvio: 6000,
      total: 76000,
      estado: 'Despachado',
      metodoPago: 'Nequi',
      notasCliente: 'Portería torre 2.',
      createdAt: new Date(Date.now() - 80 * 60 * 1000),
      items: [
        { nombre: 'Monster G Burger', precio: 34000, cantidad: 1 },
        { nombre: 'Perro Especial Punto G', precio: 20000, cantidad: 1 },
        { nombre: 'Limonada de Coco', precio: 10000, cantidad: 1 },
      ],
    },
    {
      codigo: 'PG-1040',
      cliente: 'Laura Gómez',
      telefono: '320 123 4567',
      tipo: 'domicilio',
      direccion: 'Avenida 6 Norte # 24N-12, Granada',
      barrio: 'Granada',
      subtotal: 45000,
      propina: 4500,
      costoEnvio: 4000,
      total: 53500,
      estado: 'Entregado',
      metodoPago: 'Efectivo',
      notasCliente: 'Dejar en recepción.',
      createdAt: new Date(Date.now() - 140 * 60 * 1000),
      items: [
        { nombre: 'Salchipapa Monstruo Punto G', precio: 35000, cantidad: 1 },
        { nombre: 'Jugo de Maracuyá', precio: 10000, cantidad: 1 },
      ],
    },
  ];

  for (const o of ordersData) {
    const existing = await prisma.order.findUnique({ where: { codigo: o.codigo } });
    if (!existing) {
      await prisma.order.create({
        data: {
          codigo: o.codigo,
          cliente: o.cliente,
          telefono: o.telefono,
          tipo: o.tipo,
          mesaId: o.mesaId,
          numeroMesa: o.numeroMesa,
          direccion: o.direccion,
          barrio: o.barrio,
          subtotal: o.subtotal,
          propina: o.propina,
          costoEnvio: o.costoEnvio,
          total: o.total,
          estado: o.estado,
          metodoPago: o.metodoPago,
          notasCliente: o.notasCliente,
          createdAt: o.createdAt,
          items: {
            create: o.items.map((i: any) => ({
              nombre: i.nombre,
              precio: i.precio,
              cantidad: i.cantidad,
              notas: i.notas || null,
            })),
          },
        },
      });
    }
  }
  console.log('✅ Orders seeded');

  // 7. Seed Reviews
  const reviews = [
    {
      clienteNombre: 'Valentina Restrepo',
      calificacion: 5,
      tipoVisita: 'En Sitio / Mesa',
      mesaNumero: 'Mesa 1',
      comentario: '¡La mejor hamburguesa artesanal de Cali! La carne es jugosísima, el pan brioche insuperable y la salsa especial de la casa conecta con todo. 10/10.',
      respuesta: '¡Muchas gracias Valentina! Te esperamos pronto para probar la Monster G.',
      publicado: true,
    },
    {
      clienteNombre: 'Felipe Morales',
      calificacion: 5,
      tipoVisita: 'Domicilio',
      comentario: 'Pedí por WhatsApp y llegó caliente y en menos de 35 minutos. Las papas estaban súper crujientes. ¡Recomendadísimo Punto G!',
      respuesta: '¡Esa es nuestra promesa Felipe! Siempre crocante y a tiempo.',
      publicado: true,
    },
    {
      clienteNombre: 'Camila Duarte',
      calificacion: 5,
      tipoVisita: 'En Sitio / Mesa',
      mesaNumero: 'Mesa 3',
      comentario: 'El ambiente del restaurante, la música y el servicio por código QR es comodísimo. Pedimos directo a la mesa sin esperar.',
      publicado: true,
    },
  ];

  for (const r of reviews) {
    await prisma.review.create({
      data: r,
    });
  }
  console.log('✅ Reviews seeded');
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
