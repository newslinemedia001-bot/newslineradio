import type { MetadataRoute } from 'next'
import { getAllArticles } from '@/lib/firebase-utils'

// Cache sitemap for 1 hour
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://newsline-radio.replit.app'
  
  // Get all articles from Firebase
  const articles = await getAllArticles()
  
  // Create sitemap entries for articles
  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/article/${article.id}`,
    lastModified: new Date(article.publishedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/admin`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    }
  ]

  return [...staticPages, ...articleEntries]
}