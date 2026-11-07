import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/superadmin',
          '/superadmin/*',
          '/api/*',
          '/checkout',
          '/*/admin',
          '/*/admin/*',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/superadmin',
          '/superadmin/*',
          '/api/*',
        ],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: ['/', '/images/*', '/*'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
