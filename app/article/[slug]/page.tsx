"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getNews } from "@/lib/admin-utils"
import { buildArticleUrl } from "@/lib/slug-utils"
import { ExternalLink, Calendar, User, Tag } from "lucide-react"

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const [article, setArticle] = useState<any>(null)
  const [similarArticles, setSimilarArticles] = useState<any[]>([])
  const [latestArticles, setLatestArticles] = useState<any[]>([])
  const [sidebarArticles, setSidebarArticles] = useState<any[]>([])
  const [readAlsoArticles, setReadAlsoArticles] = useState<any[]>([])

  useEffect(() => {
    const loadArticle = async () => {
      try {
        const newsData = await getNews()
        const found = newsData.find((n: any) => n.slug === params.slug)
        
        if (found) {
          setArticle(found)
          
          // Similar articles (same category, exclude current)
          const similar = newsData
            .filter((n: any) => n.category === found.category && n.id !== found.id)
            .slice(0, 4)
          setSimilarArticles(similar)
          
          // Latest articles (exclude current)
          const latest = newsData
            .filter((n: any) => n.id !== found.id)
            .slice(0, 4)
          setLatestArticles(latest)
          
          // Sidebar articles (random category, exclude current)
          const sidebar = newsData
            .filter((n: any) => n.id !== found.id)
            .slice(0, 6)
          setSidebarArticles(sidebar)
          
          // Read also articles (for inline links)
          const readAlso = newsData
            .filter((n: any) => n.id !== found.id)
            .slice(0, 3)
          setReadAlsoArticles(readAlso)
        }
      } catch (error) {
        console.error("Error loading article:", error)
      }
    }
    loadArticle()
  }, [params.slug])

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

  if (!article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  // Insert "Read Also" links into content
  const insertReadAlsoLinks = (content: string) => {
    if (!readAlsoArticles.length) return content
    
    const paragraphs = content.split('</p>')
    const insertPositions = [
      Math.floor(paragraphs.length * 0.3),
      Math.floor(paragraphs.length * 0.6),
      Math.floor(paragraphs.length * 0.9)
    ]
    
    insertPositions.forEach((pos, index) => {
      if (readAlsoArticles[index] && paragraphs[pos]) {
        const readAlsoLink = `
          <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0;">
            <p style="color: #3b82f6; font-weight: 600; margin-bottom: 8px;">📖 READ ALSO:</p>
            <a href="${buildArticleUrl(readAlsoArticles[index].slug)}" style="color: #2563eb; text-decoration: none; font-weight: 500; hover:underline">
              ${readAlsoArticles[index].title}
            </a>
          </div>
        `
        paragraphs[pos] += readAlsoLink
      }
    })
    
    return paragraphs.join('</p>')
  }

  return (
    <div className="min-h-screen bg-gray-50">
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

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <article className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Featured Image */}
              {article.imageUrl && (
                <div className="relative h-96 w-full">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-8">
                {/* Category Badge */}
                <Link href={`/category/${article.category?.toLowerCase()}`}>
                  <span className="inline-block bg-red-600 text-white px-4 py-1 rounded text-sm font-bold uppercase mb-4 hover:bg-red-700 transition-colors">
                    {article.category}
                  </span>
                </Link>

                {/* Title */}
                <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {article.title}
                </h1>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{article.author || "Newsline Team"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{getTimeAgo(article.publishedAt || article.timestamp)}</span>
                  </div>
                  {article.sourceName && (
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      <span>{article.sourceName}</span>
                    </div>
                  )}
                </div>

                {/* Article Content with Read Also links */}
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: insertReadAlsoLinks(article.content || '') }}
                />

                {/* Read Original Source Button (for RSS articles) */}
                {article.isRssImport && article.sourceUrl && (
                  <div className="mt-8 p-6 bg-blue-50 border-l-4 border-blue-500 rounded">
                    <p className="text-gray-700 mb-3">This article was imported from an external source.</p>
                    <Button 
                      onClick={() => window.open(article.sourceUrl, '_blank')}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Read Original Source
                    </Button>
                  </div>
                )}
              </div>
            </article>

            {/* Similar Articles */}
            {similarArticles.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {similarArticles.map((item, i) => (
                    <Link key={i} href={buildArticleUrl(item.slug)}>
                      <Card className="bg-white hover:shadow-xl transition-all group cursor-pointer h-full">
                        <div className="relative h-32 overflow-hidden">
                          <img
                            src={item.imageUrl || "/placeholder.jpg"}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <CardContent className="p-3">
                          <h3 className="font-bold text-sm line-clamp-2 group-hover:text-red-600 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-2">{getTimeAgo(item.publishedAt || item.timestamp)}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Latest Articles */}
            {latestArticles.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest News</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {latestArticles.map((item, i) => (
                    <Link key={i} href={buildArticleUrl(item.slug)}>
                      <Card className="bg-white hover:shadow-xl transition-all group cursor-pointer h-full">
                        <div className="relative h-32 overflow-hidden">
                          <img
                            src={item.imageUrl || "/placeholder.jpg"}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <CardContent className="p-3">
                          <h3 className="font-bold text-sm line-clamp-2 group-hover:text-red-600 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-2">{getTimeAgo(item.publishedAt || item.timestamp)}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-red-600">
                More Stories
              </h2>
              <div className="space-y-4">
                {sidebarArticles.map((item, i) => (
                  <Link key={i} href={buildArticleUrl(item.slug)} className="flex gap-3 group pb-4 border-b border-gray-100 last:border-0">
                    <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded">
                      <img
                        src={item.imageUrl || "/placeholder.jpg"}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-sm line-clamp-3 group-hover:text-red-600 transition-colors mb-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-500">{getTimeAgo(item.publishedAt || item.timestamp)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
