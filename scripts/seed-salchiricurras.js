const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedSalchiricurras() {
  console.log('Buscando restaurante Salchi Ricurras...');
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: 'salchiricurras' }
  });

  if (!restaurant) {
    console.error('No se encontró el restaurante con slug "salchiricurras"');
    return;
  }

  console.log(`Restaurante encontrado: ${restaurant.nombre} (ID: ${restaurant.id})`);

  // 1. Categorías para Salchi Ricurras
  const categoriesData = [
    {
      nombre: 'Salchipapas Especiales',
      slug: 'salchipapas-especiales',
      descripcion: 'Nuestras famosas salchipapas artesanales con papas seleccionadas, salsas de la casa y carnes premium.',
      imagen: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?q=80&w=900&auto=format&fit=crop',
      icono: 'Flame',
      orden: 1,
      activo: true,
      restaurantId: restaurant.id
    },
    {
      nombre: 'Mazorcadas y Desgranados',
      slug: 'mazorcadas-desgranados',
      descripcion: 'Maíz tierno dulce salteado en mantequilla artesanal con carnes desmechadas y queso fundido.',
      imagen: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?q=80&w=900&auto=format&fit=crop',
      icono: 'Utensils',
      orden: 2,
      activo: true,
      restaurantId: restaurant.id
    },
    {
      nombre: 'Hamburguesas y Perros',
      slug: 'hamburguesas-perros',
      descripcion: 'Burgers artesanales 100% de res y perros calientes con salchicha americana y queso derretido.',
      imagen: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=900&auto=format&fit=crop',
      icono: 'Burger',
      orden: 3,
      activo: true,
      restaurantId: restaurant.id
    },
    {
      nombre: 'Bebidas y Refrescos',
      slug: 'bebidas-refrescos',
      descripcion: 'Gaseosas bien frías, jugos naturales en agua o leche y limonadas especiales.',
      imagen: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=900&auto=format&fit=crop',
      icono: 'GlassWater',
      orden: 4,
      activo: true,
      restaurantId: restaurant.id
    }
  ];

  const createdCategories = [];
  for (const cat of categoriesData) {
    const existing = await prisma.category.findFirst({
      where: { slug: cat.slug, restaurantId: restaurant.id }
    });

    if (existing) {
      createdCategories.push(existing);
      console.log(`Categoría existente: ${cat.nombre}`);
    } else {
      const created = await prisma.category.create({ data: cat });
      createdCategories.push(created);
      console.log(`Categoría creada: ${created.nombre} (ID: ${created.id})`);
    }
  }

  const catMap = {};
  createdCategories.forEach(c => { catMap[c.slug] = c.id; });

  // 2. Productos para Salchi Ricurras
  const productsData = [
    {
      nombre: 'Salchipapa La Ricurra Salvaje',
      slug: 'salchipapa-la-ricurra-salvaje',
      descripcion: 'Papa francesa crujiente y papa criolla, salchicha americana, tocineta ahumada picada, queso costeño rallado, ripio de papa y doble salsa tártara de la casa.',
      precio: 24900,
      imagen: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?q=80&w=900&auto=format&fit=crop',
      categoriaId: catMap['salchipapas-especiales'],
      etiqueta: 'MÁS VENDIDA',
      disponibilidad: true,
      orden: 1,
      restaurantId: restaurant.id
    },
    {
      nombre: 'Salchipapa Mixta Tres Carnes',
      slug: 'salchipapa-mixta-tres-carnes',
      descripcion: 'Porción generosa de papa a la francesa con pollo desmechado, lomo de res en tiras, tocineta, salchicha ranchera y queso mozzarella gratinado.',
      precio: 29900,
      imagen: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?q=80&w=900&auto=format&fit=crop',
      categoriaId: catMap['salchipapas-especiales'],
      etiqueta: 'ESPECIALIDAD',
      disponibilidad: true,
      orden: 2,
      restaurantId: restaurant.id
    },
    {
      nombre: 'Salchipapa Costeña Criolla',
      slug: 'salchipapa-costena-criolla',
      descripcion: 'Papas criollas doradas, butifarra soledeña picada, chorizo antioqueño, cubos de queso costeño frito y abundante suero costeño tradicional.',
      precio: 23500,
      imagen: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?q=80&w=900&auto=format&fit=crop',
      categoriaId: catMap['salchipapas-especiales'],
      etiqueta: 'SABOR TRADICIONAL',
      disponibilidad: true,
      orden: 3,
      restaurantId: restaurant.id
    },
    {
      nombre: 'Mazorcada Especial con Chicharrón',
      slug: 'mazorcada-especial-con-chicharron',
      descripcion: 'Maíz tierno desgranado salteado en mantequilla, trozos crujientes de chicharrón carnudo, pollo en salsa de la casa, ripio de papa y queso fundido.',
      precio: 26500,
      imagen: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?q=80&w=900&auto=format&fit=crop',
      categoriaId: catMap['mazorcadas-desgranados'],
      etiqueta: 'FAVORITO DE LA CASA',
      disponibilidad: true,
      orden: 4,
      restaurantId: restaurant.id
    },
    {
      nombre: 'Desgranado Mixto Gratinado',
      slug: 'desgranado-mixto-gratinado',
      descripcion: 'Maíz tierno dulce con lomo de res, pechuga de pollo, tocineta ahumada crocante, bañado en salsa tártara y abundante queso mozzarella fundido al horno.',
      precio: 27900,
      imagen: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=900&auto=format&fit=crop',
      categoriaId: catMap['mazorcadas-desgranados'],
      etiqueta: 'GRATINADO',
      disponibilidad: true,
      orden: 5,
      restaurantId: restaurant.id
    },
    {
      nombre: 'Hamburguesa Ricurra Doble Carne',
      slug: 'hamburguesa-ricurra-doble-carne',
      descripcion: 'Dos carnes de res de 120g a la parrilla, doble queso cheddar, tocineta ahumada, cebolla crispy, lechuga, tomate y salsa tártara en pan brioche.',
      precio: 22900,
      imagen: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=900&auto=format&fit=crop',
      categoriaId: catMap['hamburguesas-perros'],
      etiqueta: 'DOBLE CARNE',
      disponibilidad: true,
      orden: 6,
      restaurantId: restaurant.id
    },
    {
      nombre: 'Perro Caliente Especial Americano',
      slug: 'perro-caliente-especial-americano',
      descripcion: 'Salchicha americana jumbo, tocineta picada, queso mozzarella fundido, ripio de papa crocante, piña artesanal y salsas de la casa en pan tierno.',
      precio: 16500,
      imagen: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?q=80&w=900&auto=format&fit=crop',
      categoriaId: catMap['hamburguesas-perros'],
      etiqueta: 'CLÁSICO',
      disponibilidad: true,
      orden: 7,
      restaurantId: restaurant.id
    },
    {
      nombre: 'Limonada de Coco Cremosita',
      slug: 'limonada-de-coco-cremosita',
      descripcion: 'Zumo de limón fresco batido con crema de coco de primera calidad, leche condensada y hielo frappé. ¡Ultra refrescante!',
      precio: 9500,
      imagen: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=900&auto=format&fit=crop',
      categoriaId: catMap['bebidas-refrescos'],
      etiqueta: 'REFRESCANTE',
      disponibilidad: true,
      orden: 8,
      restaurantId: restaurant.id
    },
    {
      nombre: 'Gaseosa Postobón 400ml',
      slug: 'gaseosa-postobon-400ml',
      descripcion: 'Elige tu sabor preferido bien frío: Manzana Postobón, Colombiana, Pepsi o Bretaña.',
      precio: 5000,
      imagen: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=900&auto=format&fit=crop',
      categoriaId: catMap['bebidas-refrescos'],
      disponibilidad: true,
      orden: 9,
      restaurantId: restaurant.id
    }
  ];

  for (const prod of productsData) {
    const existing = await prisma.product.findFirst({
      where: { slug: prod.slug, restaurantId: restaurant.id }
    });

    if (existing) {
      console.log(`Producto existente: ${prod.nombre}`);
    } else {
      const created = await prisma.product.create({ data: prod });
      console.log(`Producto creado: ${created.nombre} - $${created.precio} (ID: ${created.id})`);
    }
  }

  // Actualizar también dirección y eslogan atractivos para Salchi Ricurras
  await prisma.restaurant.update({
    where: { id: restaurant.id },
    data: {
      eslogan: 'Las Mejores Salchipapas y Mazorcadas de Cali',
      descripcion: 'Especialistas en salchipapas artesanales cargadas con carnes premium, desgranados de maíz tierno con queso gratinado y combos para compartir con amigos y familia.',
      direccionCentral: 'Av. Roosevelt # 34-18, San Fernando, Cali',
      telefonoWhatsapp: '3229088736',
      horarioAtencion: 'Lunes a Domingo: 4:00 p.m. a 12:30 a.m.',
      textoPromocional: '¡MARTES Y JUEVES DE SALCHIPAPA SALVAJE! 20% OFF A DOMICILIO',
      bannerPromocional: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?q=80&w=900&auto=format&fit=crop',
      tituloHero: 'SALCHI RICURRAS',
      subtituloHero: '¡EL VERDADERO SABOR DE LA CALLE!',
      descripcionHero: 'Papas crujientes doradas al punto exacto, abundantes carnes seleccionadas, quesos derretidos y nuestras salsas secretas.',
      textoBotonHero: 'PEDIR SALCHIPAPAS YA'
    }
  });

  console.log('\n¡Menú de Salchi Ricurras cargado y restaurante actualizado con éxito!');
}

seedSalchiricurras()
  .catch(console.error)
  .finally(() => {
    prisma.$disconnect();
  });
