const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanCategories() {
  console.log('1. Migrating products from duplicates...');

  // Move products from cat 12 (platos-fuertes) and subcat 5 (parrillas) to cat 15 (parrilla-llanera)
  await prisma.product.updateMany({
    where: { id: 18 }, // Parrillada Mixta
    data: { categoriaId: 15, subcategoriaId: 2 } // picadas
  });
  await prisma.product.updateMany({
    where: { id: 19 }, // Churrasco al Carbón 350g
    data: { categoriaId: 15, subcategoriaId: 2 } // picadas
  });
  await prisma.product.updateMany({
    where: { id: 20 }, // Pechuga Gratinada a la Brasa
    data: { categoriaId: 15, subcategoriaId: 18 } // pollo
  });
  await prisma.product.updateMany({
    where: { id: 21 }, // Costillas BBQ Ahumadas
    data: { categoriaId: 15, subcategoriaId: 17 } // costillas
  });

  // Products 22 and 23 were picadas but had categoriaId: 11
  await prisma.product.updateMany({
    where: { id: { in: [22, 23] } },
    data: { categoriaId: 15, subcategoriaId: 2 }
  });

  // Reassign drinks from duplicate subcategories 8 and 13
  await prisma.product.updateMany({
    where: { subcategoriaId: 8 },
    data: { subcategoriaId: 19 } // jugos-limonadas
  });
  await prisma.product.updateMany({
    where: { subcategoriaId: 13 },
    data: { subcategoriaId: 20 } // gaseosas-aguas
  });

  // Any remaining products with categoriaId: 12 move to 15
  await prisma.product.updateMany({
    where: { categoriaId: 12 },
    data: { categoriaId: 15 }
  });

  // Any remaining products with subcategoriaId: 5 move to 2
  await prisma.product.updateMany({
    where: { subcategoriaId: 5 },
    data: { subcategoriaId: 2 }
  });

  console.log('2. Deleting obsolete subcategories and categories...');
  // Delete subcategories 5, 8, 13
  await prisma.category.deleteMany({
    where: { id: { in: [5, 8, 13] } }
  });

  // Delete category 12 (platos-fuertes)
  await prisma.category.deleteMany({
    where: { id: 12 }
  });

  console.log('3. Updating main category names & descriptions to match exactly...');
  // Cat 11: Comidas rápidas
  await prisma.category.update({
    where: { id: 11 },
    data: {
      nombre: 'Comidas rápidas',
      descripcion: 'Salchipapas, perros calientes, hamburguesas y antojitos preparados para disfrutar.',
      icono: 'burger',
      imagen: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?q=80&w=1200&auto=format&fit=crop',
      orden: 1,
      activo: true
    }
  });

  // Cat 15: Parrilla llanera
  await prisma.category.update({
    where: { id: 15 },
    data: {
      nombre: 'Parrilla llanera',
      descripcion: 'Picadas, costillas BBQ, filete de pollo y porciones para compartir.',
      icono: 'flame',
      imagen: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1200&auto=format&fit=crop',
      orden: 2,
      activo: true
    }
  });

  // Cat 6: Bebidas
  await prisma.category.update({
    where: { id: 6 },
    data: {
      nombre: 'Bebidas',
      descripcion: 'Jugos, limonadas, gaseosas, agua y bebidas micheladas.',
      icono: 'cup',
      imagen: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=1200&auto=format&fit=crop',
      orden: 3,
      activo: true
    }
  });

  // Cat 10: Combos y Promociones
  await prisma.category.update({
    where: { id: 10 },
    data: {
      nombre: 'Combos y Promociones',
      descripcion: 'Las mejores combinaciones con descuento especial.',
      icono: 'sparkles',
      imagen: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop',
      orden: 4,
      activo: true
    }
  });

  // Check if Porciones exists under cat 15
  const porcionesCheck = await prisma.category.findFirst({
    where: { slug: 'porciones', restaurantId: 1 }
  });
  if (!porcionesCheck) {
    await prisma.category.create({
      data: {
        slug: 'porciones',
        nombre: 'Porciones',
        descripcion: 'Acompañamientos y porciones adicionales para tus platos.',
        icono: 'meat',
        imagen: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop',
        orden: 4,
        parentId: 15,
        restaurantId: 1,
        activo: true
      }
    });
  }

  console.log('4. Verification: listing categories now...');
  const finalCats = await prisma.category.findMany({
    where: { restaurantId: 1 },
    include: {
      children: { select: { id: true, nombre: true, slug: true, icono: true } }
    },
    orderBy: { orden: 'asc' }
  });

  const main = finalCats.filter(c => !c.parentId);
  console.log('Final Main Categories for Restaurant 1:');
  main.forEach(m => {
    console.log(`- [${m.id}] ${m.nombre} (${m.slug}) -> Subcategories:`, m.children.map(c => `${c.nombre} (${c.slug})`).join(', '));
  });
}

cleanCategories()
  .catch(err => console.error(err))
  .finally(() => prisma.$disconnect());
