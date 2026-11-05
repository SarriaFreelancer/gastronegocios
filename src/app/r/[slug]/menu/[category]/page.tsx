'use client';

import React, { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import { categories as defaultCategories } from '@/data/categories';
import { CategoryClientView } from '@/components/menu/CategoryClientView';

export default function TenantCategoryDetailPage() {
  const params = useParams();
  const slug = ((params?.slug as string) || 'punto-g').toLowerCase().trim();
  const categoryParam = params?.category as string;

  const [categoriesList, setCategoriesList] = useState<any[]>(defaultCategories);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/categories?restaurantSlug=${slug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategoriesList(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const isPuntoG = slug === 'punto-g' || slug === 'puntog';
  const category = categoriesList.find((c) => c.slug === categoryParam);

  if (!category && !loading) {
    if (isPuntoG) {
      const fallback = defaultCategories.find((c) => c.slug === categoryParam);
      if (fallback) return <CategoryClientView category={fallback} />;
    }
    notFound();
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-[#080808] pt-28 text-center text-white">
        <p className="text-sm text-gray-400">Cargando categoría...</p>
      </div>
    );
  }

  return <CategoryClientView category={category} />;
}
