import { Category } from '@/types';

export const categories: Category[] = [
  // ==========================================
  // 1. CATEGORÍAS PRINCIPALES (PADRES)
  // ==========================================
  {
    id: 'cat-comidas-rapidas',
    slug: 'comidas-rapidas',
    nombre: 'Comidas Rápidas',
    descripcion: 'Hamburguesas artesanales, perros calientes, salchipapas y picadas con el auténtico sabor Punto G.',
    subtitulo: 'El corazón de nuestro menú urbano y gastronómico.',
    imagen: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=900&auto=format&fit=crop',
    icono: 'burger',
    orden: 1,
    parentId: null,
  },
  {
    id: 'cat-platos-fuertes',
    slug: 'platos-fuertes',
    nombre: 'Platos Fuertes & Parrilla',
    descripcion: 'Cortes premium asados al carbón con ese toque ahumado que despierta los sentidos.',
    subtitulo: 'Carnes jugosas preparadas al término perfecto.',
    imagen: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=900&auto=format&fit=crop',
    icono: 'flame',
    orden: 2,
    parentId: null,
  },
  {
    id: 'cat-bebidas',
    slug: 'bebidas',
    nombre: 'Bebidas',
    descripcion: 'Gaseosas heladas, cócteles de autor, jugos 100% naturales y sodas saborizadas.',
    subtitulo: 'Refrescantes y listas para calmar tu sed al instante.',
    imagen: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=900&auto=format&fit=crop',
    icono: 'cup',
    orden: 3,
    parentId: null,
  },
  {
    id: 'cat-combos',
    slug: 'combos',
    nombre: 'Combos y Promociones',
    descripcion: 'Las mejores combinaciones de hamburguesas, papas, picadas y bebidas con descuento especial.',
    subtitulo: 'Ahorra en grande con los combos más pedidos de Punto G.',
    imagen: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=900&auto=format&fit=crop',
    icono: 'sparkles',
    orden: 4,
    parentId: null,
  },

  // ==========================================
  // 2. SUBCATEGORÍAS DE COMIDAS RÁPIDAS
  // ==========================================
  {
    id: 'sub-hamburguesas',
    slug: 'hamburguesas',
    nombre: 'Hamburguesas Artesanales',
    descripcion: 'Carne 100% de res seleccionada, pan brioche sellado con mantequilla, tocineta crujiente y quesos fundidos.',
    subtitulo: 'Desde las clásicas hasta las más atrevidas. Todas con el mejor sabor.',
    imagen: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=900&auto=format&fit=crop',
    icono: 'burger',
    orden: 1,
    parentId: 'cat-comidas-rapidas',
  },
  {
    id: 'sub-perros-calientes',
    slug: 'perros-calientes',
    nombre: 'Perros Calientes',
    descripcion: 'Salchicha tipo americana o suiza, queso gratinado, tocineta y salsas exclusivas de la casa.',
    subtitulo: 'Con pan suave al vapor, papas ripio crujientes y combinaciones irresistibles.',
    imagen: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?q=80&w=900&auto=format&fit=crop',
    icono: 'hotdog',
    orden: 2,
    parentId: 'cat-comidas-rapidas',
  },
  {
    id: 'sub-salchipapas',
    slug: 'salchipapas',
    nombre: 'Salchipapas',
    descripcion: 'Papas doradas y crujientes con las mejores salchichas, queso costeño/mozzarella fundido y salsas especiales.',
    subtitulo: 'La combinación perfecta de crocancia, abundancia y sabor inigualable.',
    imagen: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?q=80&w=900&auto=format&fit=crop',
    icono: 'fries',
    orden: 3,
    parentId: 'cat-comidas-rapidas',
  },
  {
    id: 'sub-picadas',
    slug: 'picadas',
    nombre: 'Picadas',
    descripcion: 'Para compartir entre amigos y familia, llenas de carnes, costilla, chorizo artesanal, papas criollas y sabor criollo.',
    subtitulo: 'Generosas, variadas y con el auténtico toque artesanal de la casa.',
    imagen: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=900&auto=format&fit=crop',
    icono: 'meat',
    orden: 4,
    parentId: 'cat-comidas-rapidas',
  },

  // ==========================================
  // 3. SUBCATEGORÍAS DE PLATOS FUERTES & PARRILLA
  // ==========================================
  {
    id: 'sub-parrillas',
    slug: 'parrillas',
    nombre: 'Parrillas al Carbón',
    descripcion: 'Cortes seleccionados asados al carbón con ese toque ahumado que despierta los sentidos.',
    subtitulo: 'El sabor de la parrilla en cada bocado, jugosas y en su punto exacto.',
    imagen: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=900&auto=format&fit=crop',
    icono: 'flame',
    orden: 1,
    parentId: 'cat-platos-fuertes',
  },

  // ==========================================
  // 4. SUBCATEGORÍAS DE BEBIDAS
  // ==========================================
  {
    id: 'sub-gaseosas',
    slug: 'gaseosas',
    nombre: 'Gaseosas',
    descripcion: 'Gaseosas bien frías, Coca-Cola, Colombiana, Postobón Manzana y Quatro.',
    subtitulo: 'Refrescantes y burbujeantes listas para acompañar tu comida.',
    imagen: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=900&auto=format&fit=crop',
    icono: 'cup',
    orden: 1,
    parentId: 'cat-bebidas',
  },
  {
    id: 'sub-cocteles',
    slug: 'cocteles',
    nombre: 'Cócteles',
    descripcion: 'Mezclas vibrantes, refrescantes y con licores de primera calidad para celebrar.',
    subtitulo: 'Colores, aromas y sabores únicos preparados por nuestros bartenders.',
    imagen: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=900&auto=format&fit=crop',
    icono: 'cocktail',
    orden: 2,
    parentId: 'cat-bebidas',
  },
  {
    id: 'sub-jugos-naturales',
    slug: 'jugos-naturales',
    nombre: 'Jugos Naturales',
    descripcion: 'Frutas 100% naturales en agua o en leche: mango, maracuyá, fresa, lulo y mora.',
    subtitulo: 'Frescura frutal y nutrición pura en cada vaso.',
    imagen: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=900&auto=format&fit=crop',
    icono: 'glass',
    orden: 3,
    parentId: 'cat-bebidas',
  },
  {
    id: 'sub-sodas',
    slug: 'sodas',
    nombre: 'Sodas Saborizadas',
    descripcion: 'Sodas artesanales infusionadas con frutos rojos, maracuyá, menta y hierbabuena.',
    subtitulo: 'Burbujas chispeantes con un estallido frutal irresistible.',
    imagen: 'https://images.unsplash.com/photo-1556881286-fc6915169721?q=80&w=900&auto=format&fit=crop',
    icono: 'bottle',
    orden: 4,
    parentId: 'cat-bebidas',
  },

  // ==========================================
  // 5. SUBCATEGORÍAS DE COMBOS
  // ==========================================
  {
    id: 'sub-combos-especiales',
    slug: 'combos-especiales',
    nombre: 'Combos Especiales',
    descripcion: 'Packs completos de hamburguesa, papas a la francesa y bebida a precio insuperable.',
    subtitulo: 'El combo completo para saciar el hambre.',
    imagen: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=900&auto=format&fit=crop',
    icono: 'sparkles',
    orden: 1,
    parentId: 'cat-combos',
  },
];
