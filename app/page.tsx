"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Clock,
  Radio,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Headphones,
  Zap,
  Rows as News,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import SubscribeForm from "@/components/SubscribeForm"
// Firebase utils no longer needed for simplified version
import { getNews } from "@/lib/admin-utils"
import { buildArticleUrl } from "@/lib/slug-utils"

export default function NewslineRadio() {
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)

  const [news, setNews] = useState([])

  useEffect(() => {
    const loadNews = async () => {
      try {
        setIsLoading(true)
        const newsData = await getNews().catch(() => [])
        setNews(newsData)
      } catch (error) {
        console.error("Error loading news:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadNews()
  }, [])


  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])



  const displayNews = news.length > 0 ? news : []


  const getTimeAgo = (date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }


  return (
    <div className="min-h-screen bg-white text-black">
      <div className="relative">
        <header className="bg-black text-white p-8 shadow-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative group">
                <Link href="/admin">
                  <Image
                    src="/newsline-logo.png"
                    alt="Newsline Media TV"
                    width={180}
                    height={90}
                    className="group-hover:opacity-80 transition-opacity duration-300 cursor-pointer"
                  />
                </Link>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="flex items-center space-x-3 animate-pulse">
                  <Radio className="w-4 h-4 text-blue-400 animate-bounce" />
                  <span className="text-sm font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 via-red-500 to-white text-black animate-gradient-x border border-blue-300">
                    LIVE ON AIR
                  </span>
                </div>
              </div>
            </div>
            
            {/* Animated Banner in Middle */}
            <div className="hidden lg:block flex-1 mx-12">
              <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-red-500 to-white rounded-lg shadow-lg border-2 border-white w-full">
                <div className="px-12 py-5">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="animate-pulse">
                      <Radio className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white animate-bounce">
                        NEWSLINE RADIO
                      </div>
                      <div className="text-sm text-white font-medium animate-pulse">
                        LIVE STREAMING 24/7 • NEWS • MUSIC • ENTERTAINMENT
                      </div>
                    </div>
                    <div className="animate-spin-slow">
                      <Headphones className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shine"></div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4 text-sm">
                <Clock className="w-4 h-4 text-white" />
                <span className="font-mono text-white">{currentTime.toLocaleTimeString()}</span>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-gray-800"
                  onClick={() => window.open("https://instagram.com/newslinemediatv", "_blank")}
                >
                  <Instagram className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-gray-800"
                  onClick={() => window.open("https://twitter.com/newslinemediatv", "_blank")}
                >
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-gray-800"
                  onClick={() => window.open("https://facebook.com/newslinemediatv", "_blank")}
                >
                  <Facebook className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-6 space-y-12">
          <section className="text-center space-y-8">
            <div className="space-y-4 animate-fade-in">
              <h1 className="text-5xl md:text-7xl font-bold">
                <span className="animate-color-cycle bg-gradient-to-r from-blue-600 via-red-500 to-blue-400 bg-clip-text text-transparent">
                  LIVE ON AIR
                </span>
              </h1>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                Broadcasting the latest news, music, and entertainment 24/7 from Newsline Radio
              </p>
            </div>

            <div className="flex justify-center">
              <div className="w-full max-w-4xl">
                <Card className="bg-white border-2 border-blue-200 shadow-lg">
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Radio className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-black">Newsline Radio</h3>
                          <p className="text-gray-600">Live Broadcasting 24/7</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-medium text-blue-600">NOW STREAMING</div>
                        <div className="text-sm text-gray-600">Live Broadcast</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="relative bg-gray-900 rounded-lg p-4 shadow-lg border border-gray-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg opacity-95"></div>
                        <iframe
                          src="https://a12.asurahosting.com/public/newsline/embed?theme=dark&autoplay=1"
                          frameBorder="0"
                          allowTransparency={true}
                          allow="autoplay"
                          className="w-full min-h-[180px] border-0 relative z-10 bg-transparent"
                          title="Newsline Radio Player"
                          style={{
                            filter: "contrast(1.2) brightness(1.1)",
                            background: "rgba(0,0,0,0.8)",
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-center space-x-4 text-sm">
                        <div className="flex items-center space-x-2 text-black">
                          <Zap className="w-4 h-4" />
                          <span>High Quality Stream</span>
                        </div>
                        <div className="flex items-center space-x-2 text-green-600">
                          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                          <span>Connected</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Subscribe Section */}
          <section>
            <SubscribeForm />
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-8 flex items-center space-x-2 text-black">
              <News className="w-8 h-8 text-blue-600" />
              <span>Latest News</span>
            </h2>
            
            {displayNews.length === 0 ? (
              <Card className="bg-white border-2 border-blue-200 shadow-lg">
                <CardContent className="p-12 text-center">
                  <News className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No News Articles</h3>
                  <p className="text-gray-500">
                    Latest news articles will appear here once they are published.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {displayNews.map((article, index) => (
                  <Card
                    key={article.id || index}
                    className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden"
                  >
                    {article.imageUrl && (
                      <div className="relative overflow-hidden h-48">
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide">
                            {article.category || "General"}
                          </span>
                        </div>
                      </div>
                    )}
                    <CardContent className="p-6 space-y-4">
                      {!article.imageUrl && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide">
                            {article.category || "General"}
                          </span>
                          <span className="text-gray-500">{new Date(article.publishedAt || Date.now()).toLocaleDateString()}</span>
                        </div>
                      )}
                      <h3 className="text-xl font-bold text-black group-hover:text-red-600 transition-colors duration-300 leading-tight">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed line-clamp-3">
                        {article.excerpt || article.content?.replace(/<[^>]*>/g, '').substring(0, 150) + '...'}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <span>By {article.author || "Newsline Team"}</span>
                          {article.imageUrl && (
                            <>
                              <span>•</span>
                              <span>{new Date(article.publishedAt || Date.now()).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                        <button 
                          onClick={() => {
                            const url = article.slug 
                              ? buildArticleUrl(article.slug, article.publishedAt)
                              : `/article/${article.id}`
                            router.push(url)
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 flex items-center space-x-2"
                        >
                          <span>Read More</span>
                          <span>→</span>
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>


        </main>

        <footer className="mt-16 bg-black border-t border-gray-700">
          <div className="max-w-7xl mx-auto p-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Newline Radio</h3>
                <p className="text-sm text-gray-300">
                  Broadcasting excellence 24/7. Your source for news, music, and entertainment.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>
                    <a href="#" className="hover:text-white">
                      Live Stream
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">
                      Schedule
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">
                      Podcasts
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">
                      Contact
                    </a>
                  </li>
                  <li>
                    <Link href="/admin" className="hover:text-white">
                      Admin Login
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-white">Shows</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>
                    <a href="#" className="hover:text-white">
                      Morning Newsline
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">
                      Business Beat
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">
                      Prime Time News
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">
                      Night Pulse
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-white">Follow Us</h4>
                <div className="flex space-x-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
                    onClick={() => window.open("https://instagram.com/newslinemediatv", "_blank")}
                  >
                    <Instagram className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-blue-400 hover:bg-blue-500/20 hover:text-blue-300"
                    onClick={() => window.open("https://twitter.com/newslinemediatv", "_blank")}
                  >
                    <Twitter className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-blue-400 hover:bg-blue-500/20 hover:text-blue-300"
                    onClick={() => window.open("https://facebook.com/newslinemediatv", "_blank")}
                  >
                    <Facebook className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-blue-400 hover:bg-blue-500/20 hover:text-blue-300"
                    onClick={() => window.open("https://youtube.com/newslinemediatv", "_blank")}
                  >
                    <Youtube className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-300">
              <p>© 2024 Newline Radio. All rights reserved. Broadcasting since 2020.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
