import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getArticleById, Article } from '@/lib/firebase-utils'
import { Calendar, User, Tag } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import JsonLdNewsArticle from '@/components/JsonLdNewsArticle'

interface PageProps {
  params: { id: string }
}

// Generate SEO metadata for each article (critical for SEO)
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = await getArticleById(params.id)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  
  if (!baseUrl) {
    console.error('NEXT_PUBLIC_BASE_URL environment variable is not set. This may cause SEO issues.')
  }
  
  const resolvedBaseUrl = baseUrl || 'https://newsline-radio.replit.app'
  const articleUrl = `${resolvedBaseUrl}/article/${params.id}`
  
  if (!article) {
    return {
      title: 'Article Not Found | Newsline Radio',
      description: 'The requested article could not be found.',
      alternates: {
        canonical: articleUrl,
      },
    }
  }

  // Strip HTML tags from content for description
  const plainTextContent = article.content.replace(/<[^>]*>/g, '')
  const description = article.excerpt || plainTextContent.substring(0, 160) + '...'

  return {
    title: `${article.title} | Newsline Radio`,
    description,
    keywords: `${article.category}, news, radio, broadcasting, ${article.author}, newsline radio`,
    authors: [{ name: article.author }],
    alternates: {
      canonical: articleUrl,
    },
    openGraph: {
      title: article.title,
      description,
      type: 'article',
      publishedTime: new Date(article.publishedAt).toISOString(),
      modifiedTime: new Date(article.publishedAt).toISOString(),
      authors: [article.author],
      section: article.category,
      tags: [article.category, 'news', 'radio'],
      url: articleUrl,
      siteName: 'Newsline Radio',
      locale: 'en_US',
      images: article.imageUrl ? [{
        url: article.imageUrl,
        alt: article.title,
        width: 1200,
        height: 630,
        type: 'image/jpeg'
      }] : [{
        url: `${resolvedBaseUrl}/placeholder.jpg`,
        alt: 'Newsline Radio Default Image',
        width: 1200,
        height: 630
      }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@newslinemediatv',
      creator: '@newslinemediatv',
      title: article.title,
      description,
      images: article.imageUrl ? [article.imageUrl] : [`${resolvedBaseUrl}/placeholder.jpg`],
    },
    other: {
      'news_keywords': `${article.category}, ${article.author}, newsline radio`,
      'article:published_time': new Date(article.publishedAt).toISOString(),
      'article:modified_time': new Date(article.publishedAt).toISOString(),
      'article:author': article.author,
      'article:section': article.category,
      'article:tag': article.category,
    },
  }
}

export default async function ArticlePage({ params }: PageProps) {
  // Fetch article data server-side for SEO
  const article = await getArticleById(params.id)
  
  // If article doesn't exist, show 404
  if (!article) {
    notFound()
  }

  return (
    <div>
      {/* JSON-LD Structured Data for SEO and Google News */}
      <JsonLdNewsArticle article={article} />
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Link href="/" className="inline-block mb-8">
          <Button variant="ghost" className="hover:bg-gray-200">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        {/* Featured Image */}
        {article.imageUrl && (
          <div className="relative mb-8 rounded-xl overflow-hidden shadow-lg">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-64 md:h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-6 left-6">
              <span className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium uppercase tracking-wide">
                {article.category}
              </span>
            </div>
          </div>
        )}

        {/* Article Header */}
        <div className="mb-8">
          {!article.imageUrl && (
            <div className="mb-4">
              <span className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium uppercase tracking-wide">
                {article.category}
              </span>
            </div>
          )}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {article.title}
          </h1>
          
          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-6 text-gray-600 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="font-medium">By {article.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(article.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <span>{article.category}</span>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          {article.excerpt && (
            <div className="text-xl text-gray-700 font-medium mb-8 pb-6 border-b border-gray-200 leading-relaxed">
              {article.excerpt}
            </div>
          )}
          
          <div 
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-red-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-img:rounded-lg prose-img:shadow-md"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

        {/* Call to Action */}
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Stay Updated</h3>
          <p className="text-gray-600 mb-6">Get the latest news and updates from Newsline Radio</p>
          <Link href="/">
            <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3">
              Read More Articles
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}