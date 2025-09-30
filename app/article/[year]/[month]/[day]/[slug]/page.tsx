'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface Article {
  id: string
  title: string
  content: string
  excerpt: string
  author: string
  category: string
  publishedAt: string
  imageUrl?: string
  slug: string
}

export default function ArticlePage() {
  const params = useParams()
  const router = useRouter()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArticle = async () => {
      if (!params.slug) {
        setLoading(false)
        return
      }
      
      try {
        // Query by slug
        const newsRef = collection(db, 'news')
        const q = query(newsRef, where('slug', '==', params.slug as string))
        const querySnapshot = await getDocs(q)
        
        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0]
          setArticle({ id: docSnap.id, ...docSnap.data() } as Article)
        } else {
          setArticle(null)
        }
      } catch (error) {
        console.error('Error fetching article:', error)
        setArticle(null)
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [params.slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-64 w-full mb-8 rounded-lg" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    )
  }

  if (!loading && !article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Article not found</h1>
            <p className="text-gray-600 mb-6">
              The article you're looking for doesn't exist or may have been moved.
            </p>
            <Button onClick={() => router.push('/')} className="bg-red-600 hover:bg-red-700 text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Button 
          onClick={() => router.back()} 
          variant="ghost" 
          className="mb-8 hover:bg-gray-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

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
          <Button 
            onClick={() => router.push('/')}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3"
          >
            Read More Articles
          </Button>
        </div>
      </div>
    </div>
  )
}
