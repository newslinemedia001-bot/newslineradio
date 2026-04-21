"use client"

import { useState, useEffect } from "react"
import {
  Clock,
  Radio,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  TrendingUp,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import SubscribeForm from "@/components/SubscribeForm"
import { getNews } from "@/lib/admin-utils"
import { buildArticleUrl } from "@/lib/slug-utils"

export default function NewslineRadio() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [news, setNews] = useState<any[]>([])

  useEffect(() => {
    const loadNews = async () => {
      try {
        const newsData = await getNews().catch(() => [])
        setNews(newsData)
      } catch (error) {
        console.error("Error loading news:", error)
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

  const getTimeAgo = (date: any) => {
    if (!date) return "Just now"
    
    // Handle Firestore Timestamp or Date object
    let dateObj;
    if (date.toDate) {
      dateObj = date.toDate(); // Firestore Timestamp
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      dateObj = new Date(date); // String or number
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

  const getNewsByCategory = (category: string) => news.filter((n: any) => n.category === category).slice(0, 6)
  const featuredArticle = news[0]
  const latestNews = news.slice(1, 13)
  const trendingNews = news.slice(0, 8)
  
  // Categories: News, Politics, Gossip, Entertainment, Media, Bizna, Sports, Videos, Lifestyle
  const politicsNews = getNewsByCategory("Politics")
  const sportsNews = getNewsByCategory("Sports")
  const entertainmentNews = getNewsByCategory("Entertainment")
  const lifestyleNews = getNewsByCategory("Lifestyle")


  return (
    <div className="min-h-screen bg-white">
      {/* Header with Logo and Radio Player Side by Side */}
      <header className="bg-black text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between gap-6">
            {/* Logo */}
            <Link href="/admin" className="flex-shrink-0">
              <Image
                src="/newsline-logo.png"
                alt="Newsline Media TV"
                width={140}
                height={70}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            </Link>
            
            {/* Radio Player Card - Horizontal beside logo */}
            <div className="flex-1 max-w-3xl">
              <Card className="bg-gradient-to-r from-red-600 via-red-500 to-pink-600 border-0 shadow-xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="bg-white/20 p-2 rounded-full animate-pulse">
                        <Radio className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white leading-tight">NEWSLINE RADIO</h3>
                        <p className="text-[10px] text-white/90">LIVE 24/7 • NEWS • MUSIC</p>
                      </div>
                    </div>
                    <div className="flex-1 bg-black/80 rounded overflow-hidden border border-white/20">
                      <iframe
                        src="http://84.8.135.135/public/newsline/embed"
                        allow="autoplay"
                        className="w-full h-[100px] border-0"
                        title="Newsline Radio Player"
                      />
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-[10px] text-white font-medium">LIVE</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Time & Social */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="hidden md:flex items-center gap-2 text-xs">
                <Clock className="w-3 h-3" />
                <span className="font-mono" suppressHydrationWarning>
                  {currentTime.toLocaleTimeString()}
                </span>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="text-white hover:bg-gray-800 p-2" onClick={() => window.open("https://instagram.com/newslinemediatv", "_blank")}>
                  <Instagram className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost" className="text-white hover:bg-gray-800 p-2" onClick={() => window.open("https://twitter.com/newslinemediatv", "_blank")}>
                  <Twitter className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost" className="text-white hover:bg-gray-800 p-2" onClick={() => window.open("https://facebook.com/newslinemediatv", "_blank")}>
                  <Facebook className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
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
        {/* Hero Section with Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8">
          {/* Left Category Sidebar - Politics */}
          <div className="lg:col-span-2">
            <Card className="bg-red-600 text-white border-0 shadow-xl h-full">
              <CardContent className="p-4">
                <h3 className="font-bold text-base mb-4 border-b-2 border-white/40 pb-2">POLITICS</h3>
                <div className="space-y-4">
                  {politicsNews.slice(0, 3).map((article, i) => (
                    <div key={i}>
                      <Link href={buildArticleUrl(article.slug)} className="block group">
                        <p className="text-sm leading-snug hover:underline line-clamp-3 font-medium">{article.title}</p>
                        <span className="text-xs text-white/80 mt-1 block">{getTimeAgo(article.publishedAt || article.timestamp)}</span>
                      </Link>
                      {i < 2 && <div className="border-b border-white/30 my-3"></div>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Hero Article */}
          <div className="lg:col-span-8">
            {featuredArticle && (
              <Link href={buildArticleUrl(featuredArticle.slug)}>
                <Card className="bg-white border-0 shadow-2xl overflow-hidden group cursor-pointer h-full">
                  <div className="relative h-[450px]">
                    <img
                      src={featuredArticle.imageUrl || "/placeholder.jpg"}
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                      <span className="bg-red-600 text-white px-4 py-1.5 rounded text-xs font-bold uppercase mb-4 inline-block shadow-lg">
                        {featuredArticle.category || "Featured"}
                      </span>
                      <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight drop-shadow-lg">
                        {featuredArticle.title}
                      </h1>
                      <p className="text-base text-white/95 mb-3 line-clamp-2 max-w-4xl">
                        {featuredArticle.excerpt || featuredArticle.content?.replace(/<[^>]*>/g, '').substring(0, 200)}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-medium">{featuredArticle.author || "Newsline Team"}</span>
                        <span>•</span>
                        <span>{getTimeAgo(featuredArticle.publishedAt || featuredArticle.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            )}
          </div>

          {/* Right Category Sidebar - Sports */}
          <div className="lg:col-span-2">
            <Card className="bg-red-600 text-white border-0 shadow-xl h-full">
              <CardContent className="p-4">
                <h3 className="font-bold text-base mb-4 border-b-2 border-white/40 pb-2">SPORTS</h3>
                <div className="space-y-4">
                  {sportsNews.slice(0, 3).map((article, i) => (
                    <div key={i}>
                      <Link href={buildArticleUrl(article.slug)} className="block group">
                        <p className="text-sm leading-snug hover:underline line-clamp-3 font-medium">{article.title}</p>
                        <span className="text-xs text-white/80 mt-1 block">{getTimeAgo(article.publishedAt || article.timestamp)}</span>
                      </Link>
                      {i < 2 && <div className="border-b border-white/30 my-3"></div>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Latest News and Trending Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Latest News */}
          <div className="lg:col-span-9">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-red-600 border-l-4 border-red-600 pl-4">LATEST NEWS</h2>
              <Link href="#" className="text-red-600 text-sm font-bold flex items-center hover:underline">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestNews.map((article, i) => (
                <Link key={i} href={buildArticleUrl(article.slug)}>
                  <Card className="backdrop-blur-sm bg-white/90 border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer overflow-hidden">
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={article.imageUrl || "/placeholder.jpg"}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded text-xs font-bold uppercase shadow-lg">
                        {article.category || "News"}
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

            {/* Entertainment Section */}
            <div className="mt-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-red-600 border-l-4 border-red-600 pl-4">ENTERTAINMENT</h2>
                <Link href="#" className="text-red-600 text-sm font-bold flex items-center hover:underline">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {entertainmentNews.slice(0, 6).map((article, i) => (
                  <Link key={i} href={buildArticleUrl(article.slug)}>
                    <Card className="backdrop-blur-sm bg-white/90 border border-white/20 shadow-lg hover:shadow-xl transition-all group cursor-pointer overflow-hidden">
                      <div className="relative h-44 overflow-hidden">
                        <img
                          src={article.imageUrl || "/placeholder.jpg"}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <span className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-[10px] font-bold uppercase shadow">
                          Entertainment
                        </span>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold text-sm mb-2 line-clamp-3 group-hover:text-red-600 transition-colors leading-tight">
                          {article.title}
                        </h3>
                        <div className="flex items-center justify-between text-[10px] text-gray-500 mt-3">
                          <span>{getTimeAgo(article.publishedAt || article.timestamp)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Trending Sidebar */}
          <div className="lg:col-span-3">
            <div className="backdrop-blur-sm bg-white/90 border border-white/20 shadow-xl rounded-lg p-5 sticky top-4">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-red-600">
                <TrendingUp className="w-6 h-6 text-red-600" />
                <h2 className="text-2xl font-bold text-red-600">TRENDING</h2>
              </div>
              <div className="space-y-5">
                {trendingNews.map((article, i) => (
                  <Link key={i} href={buildArticleUrl(article.slug)} className="flex items-start gap-4 group pb-5 border-b border-gray-100 last:border-0">
                    <span className="text-3xl font-bold text-red-600/20 min-w-[40px] group-hover:text-red-600 transition-colors">{i + 1}</span>
                    <div className="flex-1">
                      {article.imageUrl && (
                        <div className="relative h-20 w-full mb-3 overflow-hidden rounded-lg shadow">
                          <img
                            src={article.imageUrl}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <h4 className="text-sm font-bold line-clamp-3 group-hover:text-red-600 transition-colors leading-tight mb-2">
                        {article.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="font-medium">{article.category}</span>
                        <span>•</span>
                        <span>{getTimeAgo(article.publishedAt || article.timestamp)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Subscribe Section */}
        <div className="mt-12 mb-8">
          <SubscribeForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black border-t-4 border-red-600">
        <div className="max-w-7xl mx-auto p-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Newsline Radio</h3>
              <p className="text-sm text-gray-400">
                Broadcasting excellence 24/7. Your source for news, music, and entertainment.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-red-500 transition-colors">Live Stream</a></li>
                <li><a href="#" className="hover:text-red-500 transition-colors">Schedule</a></li>
                <li><a href="#" className="hover:text-red-500 transition-colors">Podcasts</a></li>
                <li><a href="#" className="hover:text-red-500 transition-colors">Contact</a></li>
                <li><Link href="/admin" className="hover:text-red-500 transition-colors">Admin Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Shows</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-red-500 transition-colors">Morning Newsline</a></li>
                <li><a href="#" className="hover:text-red-500 transition-colors">Business Beat</a></li>
                <li><a href="#" className="hover:text-red-500 transition-colors">Prime Time News</a></li>
                <li><a href="#" className="hover:text-red-500 transition-colors">Night Pulse</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Follow Us</h4>
              <div className="flex gap-3">
                <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-500/20 hover:text-red-400" onClick={() => window.open("https://instagram.com/newslinemediatv", "_blank")}>
                  <Instagram className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-500/20 hover:text-red-400" onClick={() => window.open("https://twitter.com/newslinemediatv", "_blank")}>
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-500/20 hover:text-red-400" onClick={() => window.open("https://facebook.com/newslinemediatv", "_blank")}>
                  <Facebook className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-500/20 hover:text-red-400" onClick={() => window.open("https://youtube.com/newslinemediatv", "_blank")}>
                  <Youtube className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
            <p>© 2024 Newsline Radio. All rights reserved. Broadcasting since 2020.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
