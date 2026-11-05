import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Base public routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
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

  try {
    const restaurants = await prisma.restaurant.findMany({
      where: { activo: true },
      select: { slug: true, updatedAt: true },
    });

    for (const r of restaurants) {
      routes.push({
        url: `${baseUrl}/r/${r.slug}`,
        lastModified: r.updatedAt,
        changeFrequency: 'daily',
        priority: 0.8,
      });
      routes.push({
        url: `${baseUrl}/r/${r.slug}/menu`,
        lastModified: r.updatedAt,
        changeFrequency: 'daily',
        priority: 0.8,
      });
      routes.push({
        url: `${baseUrl}/r/${r.slug}/rastreo`,
        lastModified: r.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.4,
      });
    }
  } catch (e) {
    console.error('Error generating sitemap:', e);
  }

  return routes;
}
