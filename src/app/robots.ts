import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/admin/*',
          '/intern/',
          '/intern/*',
          '/api/admin/',
          '/api/auth/',
          '/login/reset-password',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/careers', '/services', '/portfolio', '/about', '/magazine', '/magazine/*', '/contact', '/ai-zaya', '/verify', '/verify-id'],
        disallow: ['/admin/', '/intern/', '/api/admin/'],
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: ['/admin/', '/intern/'],
      },
    ],
    sitemap: 'https://zayacodehub.in/sitemap.xml',
    host: 'https://zayacodehub.in',
  }
}

