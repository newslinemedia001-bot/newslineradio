import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://newsline-radio.replit.app'
  
  return {
    rules: [
      {
        userAgent: 'Googlebot',
        allow: ['/'],
        disallow: ['/admin/', '/api/'],
      },
      {
        userAgent: 'Bingbot',
        allow: ['/'],
        disallow: ['/admin/', '/api/'],
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}