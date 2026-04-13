import { Metadata } from 'next'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const newsRef = collection(db, 'news')
    const q = query(newsRef, where('slug', '==', params.slug))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      const article = doc.data()

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://radio.newsline.co.ke'
      const title = article.seoTitle || article.title || 'Article'
      const description = article.seoDescription || article.excerpt || article.content?.replace(/<[^>]*>/g, '').substring(0, 160) || ''
      const image = article.imageUrl || `${siteUrl}/newsline-logo.png`
      const articleUrl = `${siteUrl}/article/${params.slug}`

      return {
        title: `${title} | Newsline Radio`,
        description,
        keywords: article.focusKeyword || '',
        openGraph: {
          title,
          description,
          url: articleUrl,
          siteName: 'Newsline Radio',
          images: [
            {
              url: image,
              width: 1200,
              height: 630,
              alt: title,
            },
          ],
          type: 'article',
          publishedTime: article.publishedAt,
          authors: article.author ? [article.author] : undefined,
          section: article.category,
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: [image],
          site: '@newslinemediatv',
        },
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
  }

  // Fallback metadata
  return {
    title: 'Article | Newsline Radio',
    description: 'Professional news and radio broadcasting 24/7',
  }
}

export default function ArticleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
