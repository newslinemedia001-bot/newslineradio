import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getArticleById } from '@/lib/firebase-utils'
import { Calendar, User, Tag, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface PageProps {
  params: Promise<{ id: string }>
}

// Generate SEO metadata for each article
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const article = await getArticleById(id)
  
  if (!article) {
    return {
      title: 'Article Not Found | Newsline Radio',
      description: 'The requested article could not be found.',
    }
  }

  return {
    title: `${article.title} | Newsline Radio`,
    description: article.excerpt || article.content.replace(/<[^>]*>/g, '').substring(0, 160) + '...',
    openGraph: {
      title: article.title,
      description: article.excerpt || 'Latest news from Newsline Radio',
      type: 'article',
    },
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { id } = await params
  const article = await getArticleById(id)
  
  if (!article) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/" className="inline-block mb-8">
          <Button variant="ghost" className="hover:bg-gray-200">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        {article.imageUrl && (
          <div className="relative mb-8 rounded-xl overflow-hidden shadow-lg">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-64 md:h-96 object-cover"
            />
            <div className="absolute bottom-6 left-6">
              <span className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium uppercase tracking-wide">
                {article.category}
              </span>
            </div>
          </div>
        )}

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
          
          <div className="flex flex-wrap items-center gap-6 text-gray-600 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="font-medium">By {article.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <span>{article.category}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          {article.excerpt && (
            <div className="text-xl text-gray-700 font-medium mb-8 pb-6 border-b border-gray-200 leading-relaxed">
              {article.excerpt}
            </div>
          )}
          
          <div 
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

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