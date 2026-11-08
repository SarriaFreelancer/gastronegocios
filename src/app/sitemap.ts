import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://puntog.app';

  // Base public routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/registro`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/menu`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/rastreo`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.5,
    },
  ];

  // Dynamically query active restaurants from the live database at runtime
  try {
    if (process.env.DATABASE_URL) {
      const restaurants = await prisma.restaurant.findMany({
        where: { activo: true },
        select: { slug: true, updatedAt: true },
      });

      for (const r of restaurants) {
        if (!r.slug) continue;
        routes.push({
          url: `${baseUrl}/r/${r.slug}`,
          lastModified: r.updatedAt || new Date(),
          changeFrequency: 'daily',
          priority: 0.9,
        });
        routes.push({
          url: `${baseUrl}/r/${r.slug}/menu`,
          lastModified: r.updatedAt || new Date(),
          changeFrequency: 'daily',
          priority: 0.9,
        });
        routes.push({
          url: `${baseUrl}/r/${r.slug}/promociones`,
          lastModified: r.updatedAt || new Date(),
          changeFrequency: 'daily',
          priority: 0.8,
        });
        routes.push({
          url: `${baseUrl}/r/${r.slug}/nosotros`,
          lastModified: r.updatedAt || new Date(),
          changeFrequency: 'monthly',
          priority: 0.6,
        });
        routes.push({
          url: `${baseUrl}/r/${r.slug}/contacto`,
          lastModified: r.updatedAt || new Date(),
          changeFrequency: 'monthly',
          priority: 0.6,
        });
        routes.push({
          url: `${baseUrl}/r/${r.slug}/rastreo`,
          lastModified: r.updatedAt || new Date(),
          changeFrequency: 'weekly',
          priority: 0.4,
        });
      }
    }
  } catch (e) {
    console.error('Error generating dynamic sitemap from database:', e);
  }

  return routes;
}
