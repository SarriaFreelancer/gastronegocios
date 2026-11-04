const fs = require('fs');
const path = require('path');

const seedData = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed-data.json'), 'utf8'));

// Format categories
const categoriesTs = `import { Category } from '@/types';

export const categories: Category[] = ${JSON.stringify(seedData.categories, null, 2)};
`;

// Format products
const productsTs = `import { Product } from '@/types';

export const products: Product[] = ${JSON.stringify(seedData.products, null, 2)};

export const promotions = [
  {
    id: 'combo-punto-g',
    nombre: 'Combo Punto G',
    descripcion: 'La combinación estelar de la casa para saciar tu antojo al mejor precio.',
    incluye: [
      'Hamburguesa Clásica artesanal',
      'Porción de Papas a la francesa crujientes',
      'Gaseosa Coca-Cola 400 ml helada'
    ],
    precio: 28900,
    precioAntes: 32000,
    imagen: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop',
    etiqueta: 'COMBO MÁS POPULAR',
  },
  {
    id: 'combo-parchados',
    nombre: 'Combo Parchados (2 Personas)',
    descripcion: '2 Hamburguesas Clásicas + Porción Grande de Salchipapa + 2 Gaseosas 400ml.',
    incluye: [
      '2 Hamburguesas Clásicas',
      '1 Salchipapa Especial para compartir',
      '2 Bebidas 400 ml a elección'
    ],
    precio: 49900,
    precioAntes: 58000,
    imagen: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop',
    etiqueta: 'IDEAL PARA PAREJAS',
  }
];
`;

fs.writeFileSync(path.join(__dirname, '../src/data/categories.ts'), categoriesTs, 'utf8');
fs.writeFileSync(path.join(__dirname, '../src/data/products.ts'), productsTs, 'utf8');

console.log('✅ Sincronizados exitosamente src/data/categories.ts y src/data/products.ts con el menú real.');
