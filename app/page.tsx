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
  const [news, setNews] = useState([])

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

  const getNewsByCategory = (category) => news.filter(n => n.category === category).slice(0, 4)
  const featuredArticle = news[0]
  const latestNews = news.slice(1, 9)
  const trendingNews = news.slice(0, 11)
  
  // Get articles by actual categories used in the site
  const politicsNews = getNewsByCategory("Politics")
  const gossipNews = getNewsByCategory("Gossip")
  const entertainmentNews = getNewsByCategory("Entertainment")
  const sportsNews = getNewsByCategory("Sports")


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Radio Player */}
      <header className="bg-black text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/admin">
              <Image
                src="/newsline-logo.png"
                alt="Newsline Media TV"
                width={160}
                height={80}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            </Link>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm">
                <Clock className="w-4 h-4" />
                <span className="font-mono" suppressHydrationWarning>
                  {currentTime.toLocaleTimeString()}
                </span>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="ghost" className="text-white hover:bg-gray-800" onClick={() => window.open("https://instagram.com/newslinemediatv", "_blank")}>
                  <Instagram className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-white hover:bg-gray-800" onClick={() => window.open("https://twitter.com/newslinemediatv", "_blank")}>
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-white hover:bg-gray-800" onClick={() => window.open("https://facebook.com/newslinemediatv", "_blank")}>
                  <Facebook className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Radio Player Card in Navbar */}
          <Card className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 border-0 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-full animate-pulse">
                    <Radio className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">NEWSLINE RADIO</h3>
                    <p className="text-xs text-white/90">LIVE STREAMING 24/7 • NEWS • MUSIC • ENTERTAINMENT</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-white font-medium">LIVE</span>
                </div>
              </div>
              <div className="bg-gray-900/50 rounded-lg overflow-hidden">
                <iframe
                  src="https://a12.asurahosting.com/public/newsline/embed?theme=dark&autoplay=1"
                  frameBorder="0"
                  allow="autoplay"
                  className="w-full h-[120px] border-0"
                  title="Newsline Radio Player"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Hero Section with Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
          {/* Left Category Sidebar */}
          <div className="lg:col-span-2 space-y-3">
            <Card className="bg-blue-600 text-white border-0 shadow-lg">
              <CardContent className="p-4">
                <h3 className="font-bold text-sm mb-3 border-b border-white/30 pb-2">POLITICS</h3>
                <div className="space-y-3">
                  {politicsNews.slice(0, 3).map((article, i) => (
                    <Link key={i} href={buildArticleUrl(article.slug)} className="block group">
                      <p className="text-xs leading-tight hover:underline line-clamp-2">{article.title}</p>
                      <span className="text-[10px] text-white/70 mt-1 block">{getTimeAgo(new Date(article.publishedAt))}</span>
                      {i < 2 && <div className="border-b border-white/20 my-2"></div>}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Hero Article */}
          <div className="lg:col-span-8">
            {featuredArticle && (
              <Link href={buildArticleUrl(featuredArticle.slug)}>
                <Card className="bg-white border-0 shadow-xl overflow-hidden group cursor-pointer h-full">
                  <div className="relative h-[400px]">
                    <img
                      src={featuredArticle.imageUrl || "/placeholder.jpg"}
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold uppercase mb-3 inline-block">
                        {featuredArticle.category || "Featured"}
                      </span>
                      <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">
                        {featuredArticle.title}
                      </h1>
                      <p className="text-sm text-white/90 mb-2 line-clamp-2">
                        {featuredArticle.excerpt || featuredArticle.content?.replace(/<[^>]*>/g, '').substring(0, 200)}
                      </p>
                      <div className="flex items-center space-x-3 text-xs">
                        <span>{featuredArticle.author || "Newsline Team"}</span>
                        <span>•</span>
                        <span>{getTimeAgo(new Date(featuredArticle.publishedAt))}</span>
                        <span>•</span>
                        <span>5 min read</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            )}
          </div>

          {/* Right Category Sidebar */}
          <div className="lg:col-span-2 space-y-3">
            <Card className="bg-gray-100 border border-gray-300 shadow-lg">
              <CardContent className="p-4">
                <h3 className="font-bold text-sm mb-3 border-b border-gray-400 pb-2 text-gray-800">GOSSIP</h3>
                <div className="space-y-3">
                  {gossipNews.slice(0, 3).map((article, i) => (
                    <Link key={i} href={buildArticleUrl(article.slug)} className="block group">
                      <p className="text-xs leading-tight hover:underline line-clamp-2 text-gray-800">{article.title}</p>
                      <span className="text-[10px] text-gray-600 mt-1 block">{getTimeAgo(new Date(article.publishedAt))}</span>
                      {i < 2 && <div className="border-b border-gray-300 my-2"></div>}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Latest News and Trending Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Latest News */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">LATEST NEWS</h2>
              <Link href="#" className="text-blue-600 text-sm font-medium flex items-center hover:underline">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {latestNews.map((article, i) => (
                <Link key={i} href={buildArticleUrl(article.slug)}>
                  <Card className="bg-white border border-gray-200 shadow hover:shadow-lg transition-shadow group cursor-pointer">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={article.imageUrl || "/placeholder.jpg"}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-[10px] font-bold uppercase">
                        {article.category || "News"}
                      </span>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-sm mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {article.excerpt || article.content?.replace(/<[^>]*>/g, '').substring(0, 100)}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-gray-500">
                        <span>{article.author || "Newsline"}</span>
                        <span>{getTimeAgo(new Date(article.publishedAt))}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Entertainment Section */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">ENTERTAINMENT</h2>
                <Link href="#" className="text-blue-600 text-sm font-medium flex items-center hover:underline">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {entertainmentNews.slice(0, 4).map((article, i) => (
                  <Link key={i} href={buildArticleUrl(article.slug)}>
                    <Card className="bg-white border border-gray-200 shadow hover:shadow-lg transition-shadow group cursor-pointer">
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={article.imageUrl || "/placeholder.jpg"}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-[10px] font-bold uppercase">
                          Entertainment
                        </span>
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-bold text-xs mb-2 line-clamp-3 group-hover:text-blue-600 transition-colors">
                          {article.title}
                        </h3>
                        <div className="flex items-center justify-between text-[10px] text-gray-500">
                          <span>{getTimeAgo(new Date(article.publishedAt))}</span>
                          <span>5 min read</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Trending Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-gray-200 shadow-lg rounded-lg p-4 sticky top-4">
              <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-gray-200">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">TRENDING</h2>
              </div>
              <div className="space-y-4">
                {trendingNews.map((article, i) => (
                  <Link key={i} href={buildArticleUrl(article.slug)} className="flex items-start space-x-3 group">
                    <span className="text-2xl font-bold text-gray-300 min-w-[30px]">{i + 1}</span>
                    <div className="flex-1">
                      {article.imageUrl && (
                        <div className="relative h-16 w-full mb-2 overflow-hidden rounded">
                          <img
                            src={article.imageUrl}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <h4 className="text-sm font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {article.title}
                      </h4>
                      <span className="text-[10px] text-gray-500 mt-1 block">
                        {getTimeAgo(new Date(article.publishedAt))}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Subscribe Section */}
        <div className="mt-12">
          <SubscribeForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-black border-t border-gray-700">
        <div className="max-w-7xl mx-auto p-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Newsline Radio</h3>
              <p className="text-sm text-gray-300">
                Broadcasting excellence 24/7. Your source for news, music, and entertainment.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white">Live Stream</a></li>
                <li><a href="#" className="hover:text-white">Schedule</a></li>
                <li><a href="#" className="hover:text-white">Podcasts</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><Link href="/admin" className="hover:text-white">Admin Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Shows</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white">Morning Newsline</a></li>
                <li><a href="#" className="hover:text-white">Business Beat</a></li>
                <li><a href="#" className="hover:text-white">Prime Time News</a></li>
                <li><a href="#" className="hover:text-white">Night Pulse</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Follow Us</h4>
              <div className="flex space-x-3">
                <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-500/20 hover:text-red-300" onClick={() => window.open("https://instagram.com/newslinemediatv", "_blank")}>
                  <Instagram className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-blue-400 hover:bg-blue-500/20 hover:text-blue-300" onClick={() => window.open("https://twitter.com/newslinemediatv", "_blank")}>
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-blue-400 hover:bg-blue-500/20 hover:text-blue-300" onClick={() => window.open("https://facebook.com/newslinemediatv", "_blank")}>
                  <Facebook className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-blue-400 hover:bg-blue-500/20 hover:text-blue-300" onClick={() => window.open("https://youtube.com/newslinemediatv", "_blank")}>
                  <Youtube className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-300">
            <p>© 2024 Newsline Radio. All rights reserved. Broadcasting since 2020.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
