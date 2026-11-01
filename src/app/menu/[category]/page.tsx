import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { categories } from '@/data/categories';
import { products } from '@/data/products';
import { CategoryClientView } from '@/components/menu/CategoryClientView';

interface CategoryPageProps {
  params: {
    category: string;
  };
}

export async function generateStaticParams() {
  return categories.map((cat) => ({
    category: cat.slug,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const cat = categories.find((c) => c.slug === params.category);
  if (!cat) {
    return {
      title: 'Categoría no encontrada | Punto G',
    };
  }
  return {
    title: `${cat.nombre} | Menú Punto G Cali`,
    description: `${cat.descripcion} Pide a domicilio o para recoger por WhatsApp.`,
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const category = categories.find((c) => c.slug === params.category);

  if (!category) {
    notFound();
  }

  // Filter products for this specific category
  const categoryProducts = products.filter((p) => p.categoria === category.slug);

  return <CategoryClientView category={category} products={categoryProducts} />;
}
