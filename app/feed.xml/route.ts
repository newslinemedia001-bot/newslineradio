import { getAllArticles } from '@/lib/firebase-utils'

// Cache RSS feed for 30 minutes
export const revalidate = 1800

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://newsline-radio.replit.app'
  const articles = await getAllArticles()
  
  // Take only the latest 50 articles for RSS feed
  const latestArticles = articles.slice(0, 50)
  
  const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Newsline Radio - Latest News</title>
    <link>${baseUrl}</link>
    <description>Broadcasting the latest news, music, and entertainment 24/7 from Newsline Radio</description>
    <language>en-us</language>
    <managingEditor>news@newsline-radio.com (Newsline Editorial Team)</managingEditor>
    <webMaster>webmaster@newsline-radio.com (Newsline Webmaster)</webMaster>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <ttl>60</ttl>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${baseUrl}/newsline-logo.png</url>
      <title>Newsline Radio</title>
      <link>${baseUrl}</link>
      <width>180</width>
      <height>90</height>
    </image>
    ${latestArticles.map(article => {
      const plainTextContent = article.content.replace(/<[^>]*>/g, '')
      const description = article.excerpt || plainTextContent.substring(0, 250) + '...'
      
      return `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${baseUrl}/article/${article.id}</link>
      <description><![CDATA[${description}]]></description>
      <dc:creator xmlns:dc="http://purl.org/dc/elements/1.1/">${article.author}</dc:creator>
      <category>${article.category}</category>
      <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
      <guid isPermaLink="true">${baseUrl}/article/${article.id}</guid>
      ${article.imageUrl ? `<enclosure url="${article.imageUrl}" type="image/jpeg" />` : ''}
    </item>`
    }).join('')}
  </channel>
</rss>`

  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
    },
  })
}