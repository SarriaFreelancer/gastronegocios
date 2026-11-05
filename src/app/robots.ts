import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/menu', '/r/*'],
        disallow: [
          '/admin',
          '/admin/*',
          '/superadmin',
          '/superadmin/*',
          '/api/*',
          '/login',
          '/checkout',
          '/mesero',
          '/cocina',
          '/turnero',
          '/*/admin',
          '/*/admin/*',
          '/*/login',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
