const fs = require('fs');

const userData = {
  "categories": [
    {
      "id": "cat-comidas-rapidas",
      "slug": "comidas-rapidas",
      "nombre": "Comidas rápidas",
      "descripcion": "Salchipapas, perros calientes, hamburguesas y antojitos preparados para disfrutar.",
      "subtitulo": "¡Tu máximo placer!",
      "imagen": "https://images.unsplash.com/photo-1585109649139-366815a0d713?q=80&w=1200&auto=format&fit=crop",
      "icono": "burger",
      "orden": 1,
      "parentId": null
    },
    {
      "id": "sub-salchipapas",
      "slug": "salchipapas",
      "nombre": "Salchipapas y especialidades",
      "descripcion": "Papas a la francesa con salchicha, queso y diferentes especialidades.",
      "subtitulo": "Una mezcla de sabor en cada porción",
      "imagen": "https://images.unsplash.com/photo-1585109649139-366815a0d713?q=80&w=1200&auto=format&fit=crop",
      "icono": "fries",
      "orden": 1,
      "parentId": "cat-comidas-rapidas"
    },
    {
      "id": "sub-perros-calientes",
      "slug": "perros-calientes",
      "nombre": "Perros calientes",
      "descripcion": "Pan y salchicha acompañados de salsas y toppings.",
      "subtitulo": "Clásicos con mucho sabor",
      "imagen": "https://images.unsplash.com/photo-1619740455993-9e612b1af08a?q=80&w=1200&auto=format&fit=crop",
      "icono": "hotdog",
      "orden": 2,
      "parentId": "cat-comidas-rapidas"
    },
    {
      "id": "sub-hamburguesas",
      "slug": "hamburguesas",
      "nombre": "Hamburguesas",
      "descripcion": "Hamburguesas de carne Angus con queso, vegetales y diferentes combinaciones.",
      "subtitulo": "El sabor que se disfruta en cada mordisco",
      "imagen": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1200&auto=format&fit=crop",
      "icono": "burger",
      "orden": 3,
      "parentId": "cat-comidas-rapidas"
    },
    {
      "id": "sub-antojitos",
      "slug": "antojitos",
      "nombre": "Antojitos Punto G",
      "descripcion": "Maicitos y butifarras con queso y acompañamientos.",
      "subtitulo": "Para picar y compartir",
      "imagen": "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop",
      "icono": "sparkles",
      "orden": 4,
      "parentId": "cat-comidas-rapidas"
    },
    {
      "id": "cat-parrilla-llanera",
      "slug": "parrilla-llanera",
      "nombre": "Parrilla llanera",
      "descripcion": "Picadas, costillas BBQ, filete de pollo y porciones para compartir.",
      "subtitulo": "Parrilla y sabor para todos",
      "imagen": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1200&auto=format&fit=crop",
      "icono": "flame",
      "orden": 2,
      "parentId": null
    },
    {
      "id": "sub-picadas",
      "slug": "picadas",
      "nombre": "Picadas",
      "descripcion": "Porciones de parrilla en diferentes tamaños para compartir.",
      "subtitulo": "Elige el tamaño ideal",
      "imagen": "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop",
      "icono": "meat",
      "orden": 1,
      "parentId": "cat-parrilla-llanera"
    },
    {
      "id": "sub-costillas",
      "slug": "costillas",
      "nombre": "Costillas BBQ",
      "descripcion": "Costilla BBQ acompañada de papa y ensalada.",
      "subtitulo": "Sabor BBQ para disfrutar",
      "imagen": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?q=80&w=1200&auto=format&fit=crop",
      "icono": "flame",
      "orden": 2,
      "parentId": "cat-parrilla-llanera"
    },
    {
      "id": "sub-pollo",
      "slug": "pollo",
      "nombre": "Filete de pollo",
      "descripcion": "Pollo a la plancha con acompañamientos y opción gratinada.",
      "subtitulo": "Una opción a la parrilla",
      "imagen": "https://images.unsplash.com/photo-1532550907401-a500c9a57435?q=80&w=1200&auto=format&fit=crop",
      "icono": "flame",
      "orden": 3,
      "parentId": "cat-parrilla-llanera"
    },
    {
      "id": "cat-bebidas",
      "slug": "bebidas",
      "nombre": "Bebidas",
      "descripcion": "Jugos, limonadas, gaseosas, agua y bebidas micheladas.",
      "subtitulo": "Acompaña tu comida",
      "imagen": "https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=1200&auto=format&fit=crop",
      "icono": "cup",
      "orden": 3,
      "parentId": null
    },
    {
      "id": "sub-jugos-limonadas",
      "slug": "jugos-limonadas",
      "nombre": "Jugos y limonadas",
      "descripcion": "Jugos naturales, jugos en leche y limonadas.",
      "subtitulo": "Refrescantes y frutales",
      "imagen": "https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=1200&auto=format&fit=crop",
      "icono": "cup",
      "orden": 1,
      "parentId": "cat-bebidas"
    },
    {
      "id": "sub-gaseosas-aguas",
      "slug": "gaseosas-aguas",
      "nombre": "Gaseosas y aguas",
      "descripcion": "Gaseosas en diferentes presentaciones y agua personal.",
      "subtitulo": "Tu bebida de siempre",
      "imagen": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=1200&auto=format&fit=crop",
      "icono": "cup",
      "orden": 2,
      "parentId": "cat-bebidas"
    },
    {
      "id": "sub-cervezas",
      "slug": "cervezas",
      "nombre": "Cervezas y micheladas",
      "descripcion": "Cervezas nacionales y Corona preparadas con michelada, además de soda michelada.",
      "subtitulo": "Para acompañar y compartir",
      "imagen": "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?q=80&w=1200&auto=format&fit=crop",
      "icono": "cup",
      "orden": 3,
      "parentId": "cat-bebidas"
    },
    {
      "id": "sub-cocteles",
      "slug": "cocteles",
      "nombre": "Cócteles de Autor",
      "descripcion": "Mojitos, margaritas y combinaciones exclusivas de la barra.",
      "subtitulo": "Mixología artesanal Punto G",
      "imagen": "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?q=80&w=1200&auto=format&fit=crop",
      "icono": "cup",
      "orden": 4,
      "parentId": "cat-bebidas"
    },
    {
      "id": "sub-sodas",
      "slug": "sodas",
      "nombre": "Sodas Saborizadas",
      "descripcion": "Frutos rojos, maracuyá y albahaca refrescantes.",
      "subtitulo": "Burbujeantes y frutales",
      "imagen": "https://images.unsplash.com/photo-1556881286-fc6915169721?q=80&w=1200&auto=format&fit=crop",
      "icono": "cup",
      "orden": 5,
      "parentId": "cat-bebidas"
    },
    {
      "id": "cat-combos",
      "slug": "combos",
      "nombre": "Combos y Promociones",
      "descripcion": "Las mejores combinaciones con descuento especial.",
      "subtitulo": "Ahorra en grande",
      "imagen": "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop",
      "icono": "sparkles",
      "orden": 4,
      "parentId": null
    },
    {
      "id": "sub-combos-especiales",
      "slug": "combos-especiales",
      "nombre": "Combos Especiales",
      "descripcion": "Combos de hamburguesas, papas y bebidas para compartir.",
      "subtitulo": "Ahorro total",
      "imagen": "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop",
      "icono": "sparkles",
      "orden": 1,
      "parentId": "cat-combos"
    }
  ]
};

// Cocktails & Combos to preserve
const existingPreservedProducts = [
  {
    "id": "prod-coctel-mojito",
    "nombre": "Mojito Clásico Cubano",
    "slug": "mojito-clasico-cubano",
    "descripcion": "Ron blanco, hierbabuena fresca macerada, zumo de limón, azúcar y soda helada.",
    "precio": 22000,
    "imagen": "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?q=80&w=1200&auto=format&fit=crop",
    "categoria": "bebidas",
    "subcategoria": "cocteles",
    "etiqueta": "CÓCTEL",
    "disponibilidad": true,
    "destacado": false,
    "orden": 1,
    "ingredientes": ["Ron blanco", "Hierbabuena", "Limón", "Soda"]
  },
  {
    "id": "prod-coctel-margarita",
    "nombre": "Margarita Punto G",
    "slug": "margarita-punto-g",
    "descripcion": "Tequila reposado, triple sec, zumo de limón fresco y escarchado con sal marina.",
    "precio": 24000,
    "imagen": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1200&auto=format&fit=crop",
    "categoria": "bebidas",
    "subcategoria": "cocteles",
    "etiqueta": "CÓCTEL",
    "disponibilidad": true,
    "destacado": false,
    "orden": 2,
    "ingredientes": ["Tequila reposado", "Triple sec", "Zumo de limón", "Sal marina"]
  },
  {
    "id": "prod-soda-frutos-rojos",
    "nombre": "Soda Artesanal Frutos Rojos",
    "slug": "soda-artesanal-frutos-rojos",
    "descripcion": "Fresas, moras y arándanos macerados con hierbabuena y soda bien helada.",
    "precio": 14000,
    "imagen": "https://images.unsplash.com/photo-1556881286-fc6915169721?q=80&w=1200&auto=format&fit=crop",
    "categoria": "bebidas",
    "subcategoria": "sodas",
    "etiqueta": "RECOMENDADO",
    "disponibilidad": true,
    "destacado": false,
    "orden": 1,
    "ingredientes": ["Frutos rojos", "Hierbabuena", "Soda"]
  },
  {
    "id": "prod-combo-punto-g",
    "nombre": "Combo Punto G (Hamburguesa + Papas + Gaseosa)",
    "slug": "combo-punto-g",
    "descripcion": "Hamburguesa clásica de la casa, porción de papas a la francesa crocantes y gaseosa helada.",
    "precio": 35000,
    "imagen": "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop",
    "categoria": "combos",
    "subcategoria": "combos-especiales",
    "etiqueta": "MÁS VENDIDO",
    "disponibilidad": true,
    "destacado": true,
    "orden": 1,
    "ingredientes": ["Hamburguesa", "Papas a la francesa", "Gaseosa"]
  }
];

const newProductsList = require('./user-products.json');

// Merge products without duplicate slugs
const productMap = new Map();
newProductsList.products.forEach(p => productMap.set(p.slug, p));
existingPreservedProducts.forEach(p => {
  if (!productMap.has(p.slug)) productMap.set(p.slug, p);
});

const mergedData = {
  categories: userData.categories,
  products: Array.from(productMap.values()),
  addons: newProductsList.addons
};

fs.writeFileSync('scripts/seed-data.json', JSON.stringify(mergedData, null, 2), 'utf8');
console.log(`✅ seed-data.json generado con ${mergedData.categories.length} categorías, ${mergedData.products.length} productos y ${mergedData.addons.length} adicionales.`);
