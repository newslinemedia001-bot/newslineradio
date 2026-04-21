"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { getNews } from "@/lib/admin-utils"
import { buildArticleUrl } from "@/lib/slug-utils"
import { ChevronRight } from "lucide-react"

export default function CategoryPage({ params }: { params: { category: string } }) {
  const [news, setNews] = useState<any[]>([])
  const category = params.category.charAt(0).toUpperCase() + params.category.slice(1)

  useEffect(() => {
    const loadNews = async () => {
      try {
        const newsData = await getNews()
        const filtered = newsData.filter((n: any) => 
          n.category?.toLowerCase() === params.category.toLowerCase()
        )
        setNews(filtered)
      } catch (error) {
        console.error("Error loading news:", error)
      }
    }
    loadNews()
  }, [params.category])

  const getTimeAgo = (date: any) => {
    if (!date) return "Just now"
    
    let dateObj
    if (date.toDate) {
      dateObj = date.toDate()
    } else if (date instanceof Date) {
      dateObj = date
    } else {
      dateObj = new Date(date)
    }
    
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60))
    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-black text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <Link href="/">
            <img
              src="/newsline-logo.png"
              alt="Newsline Media TV"
              width={140}
              height={70}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          </Link>
        </div>
      </header>

      <nav className="bg-gradient-to-r from-red-600 to-red-700 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center gap-1 py-3 overflow-x-auto">
            <Link href="/" className="px-4 py-2 text-white font-semibold hover:bg-white/20 rounded transition-colors whitespace-nowrap">
              HOME
            </Link>
            <Link href="/category/news" className="px-4 py-2 text-white font-semibold hover:bg-white/20 rounded transition-colors whitespace-nowrap">
              NEWS
            </Link>
            <Link href="/category/politics" className="px-4 py-2 text-white font-semibold hover:bg-white/20 rounded transition-colors whitespace-nowrap">
              POLITICS
            </Link>
            <Link href="/category/entertainment" className="px-4 py-2 text-white font-semibold hover:bg-white/20 rounded transition-colors whitespace-nowrap">
              ENTERTAINMENT
            </Link>
            <Link href="/category/sports" className="px-4 py-2 text-white font-semibold hover:bg-white/20 rounded transition-colors whitespace-nowrap">
              SPORTS
            </Link>
            <Link href="/category/lifestyle" className="px-4 py-2 text-white font-semibold hover:bg-white/20 rounded transition-colors whitespace-nowrap">
              LIFESTYLE
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-red-600 border-l-4 border-red-600 pl-4">{category.toUpperCase()}</h1>
          <p className="text-gray-600 mt-2 ml-5">{news.length} articles</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {news.map((article, i) => (
            <Link key={i} href={buildArticleUrl(article.slug)}>
              <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer overflow-hidden h-full">
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={article.imageUrl || "/placeholder.jpg"}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded text-xs font-bold uppercase shadow-lg">
                    {article.category}
                  </span>
                </div>
                <CardContent className="p-5">
                  <h3 className="font-bold text-base mb-3 line-clamp-2 group-hover:text-red-600 transition-colors leading-tight">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                    {article.excerpt || article.content?.replace(/<[^>]*>/g, '').substring(0, 100)}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                    <span className="font-medium">{article.author || "Newsline"}</span>
                    <span>{getTimeAgo(article.publishedAt || article.timestamp)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {news.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No articles found in this category yet.</p>
          </div>
        )}
      </main>
    </div>
  )
}
