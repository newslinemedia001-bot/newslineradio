"use client"

import { useState, useEffect, useRef } from "react"
import {
  Calendar,
  Clock,
  Radio,
  Users,
  MessageCircle,
  Heart,
  Share2,
  Mic,
  Music,
  TrendingUp,
  Star,
  Send,
  Mail,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Headphones,
  Zap,
  Award,
  Rows as News,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import {
  trackListener,
  getStats,
  toggleLike,
  checkUserLike,
  generateUserId,
  sendChatMessage,
  getChatMessages,
  sendContactMessage,
  generateRandomUsername,
  decrementListener,
  resetDailyStats,
} from "@/lib/firebase-utils"
import { getNews } from "@/lib/admin-utils"

export default function NewslineRadio() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [listeners, setListeners] = useState(0)
  const [likes, setLikes] = useState(0)
  const [peakListeners, setPeakListeners] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState("")
  const [chatMessage, setChatMessage] = useState("")
  const [chatMessages, setChatMessages] = useState([])
  const [chatLoading, setChatLoading] = useState(false)
  const [contactEmail, setContactEmail] = useState("")
  const [contactMessage, setContactMessage] = useState("")
  const [contactLoading, setContactLoading] = useState(false)
  const [contactSuccess, setContactSuccess] = useState(false)
  const [username, setUsername] = useState("")
  const chatContainerRef = useRef(null)

  const [news, setNews] = useState([])
  const [currentTrack, setCurrentTrack] = useState({
    title: "Breaking News Theme",
    artist: "Newsline Productions",
    duration: 192, // in seconds
    currentTime: 0,
  })

  useEffect(() => {
    const initializeUser = async () => {
      try {
        setIsLoading(true)

        let storedUserId = localStorage.getItem("newsline_user_id")
        if (!storedUserId) {
          storedUserId = generateUserId()
          localStorage.setItem("newsline_user_id", storedUserId)
        }
        setUserId(storedUserId)

        let storedUsername = localStorage.getItem("newsline_username")
        if (!storedUsername) {
          storedUsername = generateRandomUsername()
          localStorage.setItem("newsline_username", storedUsername)
        }
        setUsername(storedUsername)

        const sessionKey = `newsline_session_${storedUserId}_${Date.now()}`
        const existingSession = sessionStorage.getItem("newsline_active_session")
        const lastSessionUser = localStorage.getItem("newsline_last_session_user")

        // Only track as new listener if it's a genuinely new session or different user
        if (!existingSession || lastSessionUser !== storedUserId) {
          console.log("[v0] New session detected, tracking listener")
          sessionStorage.setItem("newsline_active_session", sessionKey)
          localStorage.setItem("newsline_last_session_user", storedUserId)
          await trackListener(storedUserId)
        } else {
          console.log("[v0] Existing session found, not incrementing listener count")
          // Just refresh the session key without incrementing
          sessionStorage.setItem("newsline_active_session", sessionKey)
        }

        const [statsData, newsData, messagesData] = await Promise.all([
          getStats().catch(() => ({ currentListeners: 0, totalLikes24h: 0, peakListeners24h: 0 })),
          getNews().catch(() => []),
          getChatMessages().catch(() => []),
        ])

        setListeners(statsData.currentListeners || 0)
        setLikes(statsData.totalLikes24h || 0)
        setNews(newsData)
        setChatMessages(messagesData)


        // Start with unliked state, let user like manually
        setIsLiked(false)
      } catch (error) {
        console.error("Error initializing user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeUser()

    const handleBeforeUnload = async (event: BeforeUnloadEvent) => {
      console.log("[v0] User leaving, decrementing listener count")
      const activeSession = sessionStorage.getItem("newsline_active_session")
      if (activeSession) {
        sessionStorage.removeItem("newsline_active_session")
        localStorage.removeItem("newsline_last_session_user")
        try {
          // Use sendBeacon for more reliable cleanup
          if (navigator.sendBeacon && userId) {
            navigator.sendBeacon("/api/decrement-listener", JSON.stringify({ userId }))
          } else if (userId) {
            await decrementListener(userId)
          }
        } catch (error) {
          console.error("Error decrementing listener:", error)
        }
      }
    }

    const handleVisibilityChange = async () => {
      const activeSession = sessionStorage.getItem("newsline_active_session")
      if (document.hidden && activeSession) {
        console.log("[v0] Page hidden, decrementing listener count")
        sessionStorage.removeItem("newsline_active_session")
        localStorage.removeItem("newsline_last_session_user")
        try {
          if (userId) await decrementListener(userId)
        } catch (error) {
          console.error("Error decrementing listener:", error)
        }
      } else if (!document.hidden && !activeSession && userId) {
        console.log("[v0] Page visible, tracking listener")
        const newSessionKey = `newsline_session_${userId}_${Date.now()}`
        sessionStorage.setItem("newsline_active_session", newSessionKey)
        localStorage.setItem("newsline_last_session_user", userId)
        try {
          await trackListener(userId)
        } catch (error) {
          console.error("Error tracking listener:", error)
        }
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      const activeSession = sessionStorage.getItem("newsline_active_session")
      if (activeSession) {
        sessionStorage.removeItem("newsline_active_session")
        localStorage.removeItem("newsline_last_session_user")
        if (userId) {
          decrementListener(userId).catch(console.error)
        }
      }
    }
  }, [userId])

  useEffect(() => {
    const trackTimer = setInterval(() => {
      setCurrentTrack((prev) => ({
        ...prev,
        currentTime: prev.currentTime >= prev.duration ? 0 : prev.currentTime + 1,
      }))
    }, 1000)

    return () => clearInterval(trackTimer)
  }, [])

  useEffect(() => {
    const timer = setInterval(async () => {
      setCurrentTime(new Date())

      try {
        await resetDailyStats()
        const stats = await getStats().catch(() => ({ currentListeners: 0, totalLikes24h: 0, peakListeners24h: 0 }))
        setListeners(stats.currentListeners || 0)
        setLikes(stats.totalLikes24h || 0)
        setPeakListeners(stats.peakListeners24h || 0)

        const messages = await getChatMessages().catch(() => [])
        setChatMessages(messages)
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }, 3000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatMessages])

  const handleLike = async () => {
    if (!userId || isLoading) return

    try {
      setIsLoading(true)
      const newLikedState = await toggleLike(userId)
      setIsLiked(newLikedState)

      const freshStats = await getStats()
      setLikes(freshStats.totalLikes24h || 0)

      setIsLoading(false)
    } catch (error) {
      console.error("Error handling like:", error)
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || chatLoading || !username) return

    try {
      setChatLoading(true)
      const success = await sendChatMessage(username, chatMessage.trim())

      if (success) {
        setChatMessage("")
        const messages = await getChatMessages()
        setChatMessages(messages)
      } else {
        alert("Failed to send message. Please try again.")
      }

      setChatLoading(false)
    } catch (error) {
      console.error("Error sending message:", error)
      setChatLoading(false)
      alert("Failed to send message. Please try again.")
    }
  }

  const handleSendContact = async () => {
    if (!contactEmail.trim() || !contactMessage.trim() || contactLoading) return

    try {
      setContactLoading(true)
      const success = await sendContactMessage(contactEmail.trim(), contactMessage.trim())

      if (success) {
        setContactEmail("")
        setContactMessage("")
        setContactSuccess(true)
        setTimeout(() => setContactSuccess(false), 5000)
      } else {
        alert("Failed to send message. Please try again.")
      }

      setContactLoading(false)
    } catch (error) {
      console.error("Error sending contact message:", error)
      setContactLoading(false)
      alert("Failed to send message. Please try again.")
    }
  }

  const handleKeyPress = (e, action) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (action === "chat") {
        handleSendMessage()
      } else if (action === "contact") {
        handleSendContact()
      }
    }
  }

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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
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

            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card className="bg-white border-2 border-blue-200 shadow-lg">
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Radio className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-black">Morning Newsline</h3>
                          <p className="text-gray-600">with Sarah Johnson</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-medium text-blue-600">NOW STREAMING</div>
                        <div className="text-sm text-gray-600">Live Broadcast</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center space-x-6">
                      <Button
                        onClick={handleLike}
                        disabled={isLoading}
                        variant="ghost"
                        size="lg"
                        className={`${isLiked ? "text-blue-600" : "text-gray-600"} hover:text-blue-500 transition-colors ${isLoading ? "opacity-50" : ""}`}
                      >
                        <Heart className={`w-6 h-6 ${isLiked ? "fill-current" : ""}`} />
                        <span className="ml-2">{isLoading ? "..." : likes}</span>
                      </Button>

                      <Button variant="ghost" size="lg" className="text-gray-600 hover:text-blue-500">
                        <Share2 className="w-6 h-6" />
                      </Button>
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

              <div className="space-y-4">
                <Card className="bg-white border-2 border-blue-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-black">
                      <Music className="w-5 h-5 text-blue-600" />
                      <span>Now Playing</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-red-500 mx-auto mb-3 flex items-center justify-center">
                        <Headphones className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="font-semibold text-black">{currentTrack.title}</h4>
                      <p className="text-sm text-gray-600">{currentTrack.artist}</p>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{formatTime(currentTrack.currentTime)}</span>
                      <span className="text-gray-600">{formatTime(currentTrack.duration)}</span>
                    </div>
                    <div className="w-full bg-gray-300 h-1">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-red-500 h-1 transition-all duration-1000 ease-linear"
                        style={{ width: `${(currentTrack.currentTime / currentTrack.duration) * 100}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-2 border-blue-200 shadow-lg">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-black font-medium">Show Rating</span>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-blue-600 text-blue-600" />
                        ))}
                        <span className="text-sm text-blue-600 ml-1">4.9</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-black font-medium">Total Likes</span>
                      <span className="text-blue-600 font-bold">{isLoading ? "..." : likes.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-black font-medium">Stream Quality</span>
                      <span className="text-green-600 font-bold">HD Audio</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
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
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {displayNews.map((article, index) => (
                  <Card
                    key={article.id || index}
                    className="bg-white border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    {article.imageUrl && (
                      <div className="relative overflow-hidden">
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardContent className="p-6 space-y-3">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{article.category || "General"}</span>
                        <span>{new Date(article.publishedAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-lg font-bold text-black group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3">
                        {article.excerpt || article.content?.replace(/<[^>]*>/g, '').substring(0, 150) + '...'}
                      </p>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-gray-500">By {article.author || "Newsline Team"}</span>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-300">
                          Read More →
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>


          <section>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-8 flex items-center justify-center space-x-2 text-black">
                <Users className="w-8 h-8 text-red-600" />
                <span>Community</span>
              </h2>
              <p className="text-gray-700 text-lg">Connect with fellow listeners and stay in touch</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white border-2 border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-black">
                    <MessageCircle className="w-5 h-5 text-red-600" />
                    <span>Live Chat</span>
                    <Badge className="bg-red-600 text-white">{listeners} online</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    ref={chatContainerRef}
                    className="h-64 overflow-y-auto space-y-3 bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    {chatMessages.length === 0 ? (
                      <div className="text-center text-gray-600 py-8">
                        <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p>No messages yet. Be the first to say hello!</p>
                      </div>
                    ) : (
                      chatMessages.map((msg, index) => (
                        <div key={msg.id || index} className="flex items-start space-x-2 animate-fade-in-up">
                          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                            {msg.username[0]?.toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-red-600 text-sm font-semibold">{msg.username}</span>
                              <span className="text-xs text-gray-500">{msg.timeAgo}</span>
                            </div>
                            <p className="text-sm text-black">{msg.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      placeholder={`Type your message as ${username}...`}
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, "chat")}
                      className="bg-white border-gray-300"
                      disabled={chatLoading}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={chatLoading || !chatMessage.trim()}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {chatLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600">
                    Chatting as: <span className="text-red-600 font-medium">{username}</span>
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-2 border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-black">
                    <Mail className="w-5 h-5 text-red-600" />
                    <span>Stay Connected</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contactSuccess && (
                    <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-green-700 text-sm">
                      ✓ Message sent successfully! We'll get back to you soon.
                    </div>
                  )}
                  <Input
                    type="email"
                    placeholder="Your email address"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="bg-white border-gray-300"
                    disabled={contactLoading}
                  />
                  <Textarea
                    placeholder="Your message or song request..."
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, "contact")}
                    className="bg-white border-gray-300"
                    disabled={contactLoading}
                  />
                  <Button
                    onClick={handleSendContact}
                    disabled={contactLoading || !contactEmail.trim() || !contactMessage.trim()}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    {contactLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
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
