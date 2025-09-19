import { Article } from '@/lib/firebase-utils'

interface JsonLdNewsArticleProps {
  article: Article
  baseUrl?: string
}

export default function JsonLdNewsArticle({ article, baseUrl = 'https://newsline-radio.replit.app' }: JsonLdNewsArticleProps) {
  const articleUrl = `${baseUrl}/article/${article.id}`
  
  // Strip HTML tags from content for word count estimation
  const plainTextContent = article.content.replace(/<[^>]*>/g, '')
  const wordCount = plainTextContent.split(' ').length
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "description": article.excerpt || plainTextContent.substring(0, 160) + '...',
    "image": article.imageUrl ? [
      article.imageUrl,
      // Add different aspect ratios for better Google News compatibility
      article.imageUrl
    ] : [`${baseUrl}/placeholder.jpg`],
    "datePublished": new Date(article.publishedAt).toISOString(),
    "dateModified": new Date(article.publishedAt).toISOString(),
    "author": {
      "@type": "Person",
      "name": article.author,
      "url": `${baseUrl}/#author-${article.author.toLowerCase().replace(/\s+/g, '-')}`
    },
    "publisher": {
      "@type": "NewsMediaOrganization",
      "name": "Newsline Radio",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/newsline-logo.png`,
        "width": 180,
        "height": 90
      },
      "url": baseUrl
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": articleUrl
    },
    "url": articleUrl,
    "articleSection": article.category,
    "keywords": `${article.category}, news, radio, broadcasting, ${article.author}`,
    "wordCount": wordCount,
    "inLanguage": "en-US",
    "isAccessibleForFree": true,
    "genre": "news"
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd, null, 2)
      }}
    />
  )
}