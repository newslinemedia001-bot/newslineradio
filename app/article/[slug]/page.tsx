"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Clock, User, Tag, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Article {
  id: string
  title: string
  content: string
  excerpt?: string
  category?: string
  author?: string
  imageUrl?: string
  publishedAt: string
  slug: string
  seoTitle?: string
  seoDescription?: string
  focusKeyword?: string
}

export default function ArticlePage() {
  const router = useRouter()
  const params = useParams()
  const slug = params?.slug as string
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return

    const loadArticle = async () => {
      try {
        console.log("Looking for article with slug:", slug)
        const newsRef = collection(db, "news")
        const q = query(newsRef, where("slug", "==", slug))
        const querySnapshot = await getDocs(q)
        
        console.log("Query results:", querySnapshot.size, "documents found")

        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0]
          const articleData = { id: doc.id, ...doc.data() } as Article
          console.log("Article found:", articleData.title)
          setArticle(articleData)
        } else {
          console.log("No article found with slug:", slug)
        }
      } catch (error) {
        console.error("Error loading article:", error)
      } finally {
        setLoading(false)
      }
    }

    loadArticle()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Article Not Found</h2>
          <p className="text-gray-600 mb-6">The article you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/")} className="bg-red-600 hover:bg-red-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-black text-white p-6 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/">
            <Image
              src="/newsline-logo.png"
              alt="Newsline Media TV"
              width={150}
              height={75}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          </Link>
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="text-white hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </header>

      {/* Article Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <article>
          {/* Category Badge */}
          {article.category && (
            <div className="mb-4">
              <span className="inline-flex items-center bg-red-600 text-white px-4 py-1 rounded-full text-sm font-medium uppercase tracking-wide">
                <Tag className="w-3 h-3 mr-2" />
                {article.category}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-6 leading-tight">
            {article.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span className="text-sm">{article.author || "Newsline Team"}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                {new Date(article.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                {Math.ceil(article.content.replace(/<[^>]*>/g, "").split(" ").length / 200)} min read
              </span>
            </div>
          </div>

          {/* Featured Image */}
          {article.imageUrl && (
            <div className="mb-8">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Article Content */}
          <div
            className="prose prose-lg max-w-none article-content"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>

        {/* Back Button */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <Button
            onClick={() => router.push("/")}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All Articles
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-black text-white border-t border-gray-700">
        <div className="max-w-4xl mx-auto p-8 text-center">
          <p className="text-sm text-gray-300">
            © 2024 Newsline Radio. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
