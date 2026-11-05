const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- ACTUALIZANDO CATEGORÍAS DE ADICIONALES Y CREANDO ADICIONES PARA SALCHI RICURRAS ---');

  // 1. Reclasificar items existentes de Punto G (restaurantId: 1) que son Adiciones
  const adicionesKeywords = [
    'Tocineta',
    'Queso',
    'Carne',
    'Pollo',
    'Huevo',
    'Salchicha',
    'Champiñones',
  ];

  const allAddons = await prisma.productAddon.findMany();
  let updatedCount = 0;

  for (const addon of allAddons) {
    if (addon.categoria === 'Toppings') {
      const isAdicion = adicionesKeywords.some((kw) =>
        addon.nombre.toLowerCase().includes(kw.toLowerCase())
      );
      if (isAdicion) {
        await prisma.productAddon.update({
          where: { id: addon.id },
          data: { categoria: 'Adiciones' },
        });
        updatedCount++;
      }
    }
  }
  console.log(`Punto G: ${updatedCount} adicionales reclasificados a 'Adiciones'.`);

  // 2. Crear Toppings y Adiciones dedicados para Salchi Ricurras (restaurantId: 2)
  const salchiricurrasAddons = [
    // ADICIONES
    { nombre: 'Queso Costeño Rallado', precio: 3000, categoria: 'Adiciones', activo: true, restaurantId: 2 },
    { nombre: 'Tocineta Ahumada Crispy', precio: 4000, categoria: 'Adiciones', activo: true, restaurantId: 2 },
    { nombre: 'Pollo Desmechado Especial', precio: 5500, categoria: 'Adiciones', activo: true, restaurantId: 2 },
    { nombre: 'Carne Desmechada Criolla', precio: 6500, categoria: 'Adiciones', activo: true, restaurantId: 2 },
    { nombre: 'Salchicha Ranchera Extra', precio: 4000, categoria: 'Adiciones', activo: true, restaurantId: 2 },
    { nombre: 'Huevos de Codorniz (5 uds)', precio: 3000, categoria: 'Adiciones', activo: true, restaurantId: 2 },
    { nombre: 'Queso Cheddar Fundido', precio: 3500, categoria: 'Adiciones', activo: true, restaurantId: 2 },
    { nombre: 'Queso Mozzarella Gratinado', precio: 3500, categoria: 'Adiciones', activo: true, restaurantId: 2 },

    // TOPPINGS
    { nombre: 'Maíz Tierno Dulce', precio: 2500, categoria: 'Toppings', activo: true, restaurantId: 2 },
    { nombre: 'Papas Ripio Crocantes', precio: 2000, categoria: 'Toppings', activo: true, restaurantId: 2 },
    { nombre: 'Piña Caramelizada', precio: 2500, categoria: 'Toppings', activo: true, restaurantId: 2 },
    { nombre: 'Cebolla Crispy Caramelizada', precio: 2500, categoria: 'Toppings', activo: true, restaurantId: 2 },
    { nombre: 'Jalapeños Picantes', precio: 2500, categoria: 'Toppings', activo: true, restaurantId: 2 },
    { nombre: 'Guacamole Rústico', precio: 3500, categoria: 'Toppings', activo: true, restaurantId: 2 },

    // SALSAS
    { nombre: 'Salsa Tártara Especial de la Casa', precio: 1500, categoria: 'Salsas', activo: true, restaurantId: 2 },
    { nombre: 'Salsa de Ajo Criolla', precio: 1500, categoria: 'Salsas', activo: true, restaurantId: 2 },
    { nombre: 'Salsa de Piña Artesanal', precio: 1500, categoria: 'Salsas', activo: true, restaurantId: 2 },
    { nombre: 'Salsa BBQ Ahumada', precio: 1500, categoria: 'Salsas', activo: true, restaurantId: 2 },
    { nombre: 'Salsa Rosada Salchi Ricurras', precio: 1500, categoria: 'Salsas', activo: true, restaurantId: 2 },
    { nombre: 'Salsa Picante Chipotle', precio: 1800, categoria: 'Salsas', activo: true, restaurantId: 2 },

    // ACOMPAÑAMIENTOS
    { nombre: 'Porción Papas Francesas Extra', precio: 5000, categoria: 'Acompañamientos', activo: true, restaurantId: 2 },
    { nombre: 'Porción Papas Criollas Doradas', precio: 6000, categoria: 'Acompañamientos', activo: true, restaurantId: 2 },
    { nombre: 'Porción Patacones con Hogao', precio: 5500, categoria: 'Acompañamientos', activo: true, restaurantId: 2 },
  ];

  // Limpiar si ya existían para el restaurant 2
  await prisma.productAddon.deleteMany({
    where: { restaurantId: 2 },
  });

  for (const addon of salchiricurrasAddons) {
    await prisma.productAddon.create({
      data: addon,
    });
  }

  console.log(`Salchi Ricurras: Creados ${salchiricurrasAddons.length} adicionales (Adiciones, Toppings, Salsas y Acompañamientos).`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
