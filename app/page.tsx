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
import { getSchedule, getHosts, getNews } from "@/lib/admin-utils"

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

  const [schedule, setSchedule] = useState([])
  const [hosts, setHosts] = useState([])
  const [news, setNews] = useState([])
  const [currentTrack, setCurrentTrack] = useState({
    title: "Breaking News Theme",
    artist: "Newsline Productions",
    duration: 192, // in seconds
    currentTime: 0,
  })
  const [recentlyPlayed, setRecentlyPlayed] = useState([])

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

        const sessionId = sessionStorage.getItem("newsline_session_id")
        if (!sessionId) {
          console.log("[v0] New session detected, tracking listener")
          const newSessionId = generateUserId()
          sessionStorage.setItem("newsline_session_id", newSessionId)
          await trackListener(storedUserId)
        }

        const [statsData, scheduleData, hostsData, newsData, messagesData] = await Promise.all([
          getStats().catch(() => ({ currentListeners: 0, totalLikes24h: 0, peakListeners24h: 0 })),
          getSchedule().catch(() => []),
          getHosts().catch(() => []),
          getNews().catch(() => []),
          getChatMessages().catch(() => []),
        ])

        setListeners(statsData.currentListeners || 0)
        setLikes(statsData.totalLikes24h || 0)
        setPeakListeners(statsData.peakListeners24h || 0)
        setSchedule(scheduleData)
        setHosts(hostsData)
        setNews(newsData)
        setChatMessages(messagesData)

        const recentlyPlayedData = generateRecentlyPlayed(scheduleData)
        setRecentlyPlayed(recentlyPlayedData)

        const userLiked = await checkUserLike(storedUserId).catch(() => false)
        setIsLiked(userLiked)
      } catch (error) {
        console.error("Error initializing user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeUser()

    const handleBeforeUnload = async () => {
      console.log("[v0] User leaving, decrementing listener count")
      try {
        await decrementListener(userId)
      } catch (error) {
        console.error("Error decrementing listener:", error)
      }
    }

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        console.log("[v0] Page hidden, decrementing listener count")
        try {
          await decrementListener(userId)
        } catch (error) {
          console.error("Error decrementing listener:", error)
        }
      } else {
        console.log("[v0] Page visible, tracking listener")
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
      if (userId) {
        decrementListener(userId).catch(console.error)
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

  const getTodaysSchedule = () => {
    const today = new Date().toISOString().split("T")[0]
    const todaysSchedule = schedule.filter((item) => item.date === today)

    if (todaysSchedule.length > 0) {
      return todaysSchedule
    }

    const defaultSchedule = schedule.filter((item) => item.isDefault)
    if (defaultSchedule.length > 0) {
      return defaultSchedule
    }

    return []
  }

  const getTodaysHost = () => {
    const today = new Date().toISOString().split("T")[0]
    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5) // HH:MM format

    // Find host for current time today
    const todaysHost = hosts.find(
      (host) => host.date === today && host.startTime <= currentTime && host.endTime >= currentTime,
    )

    if (todaysHost) {
      return [todaysHost]
    }

    // Fall back to default host
    const defaultHost = hosts.find((host) => host.isDefault)
    if (defaultHost) {
      return [defaultHost]
    }

    return []
  }

  const displaySchedule = getTodaysSchedule()
  const displayHosts = getTodaysHost()
  const displayNews = news.length > 0 ? news : []

  const generateRecentlyPlayed = (scheduleData) => {
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Only show schedules that were played/passed within the last 24 hours
    const recentFromSchedule = scheduleData
      .filter((item) => {
        if (!item.timestamp) return false
        const itemTime = item.timestamp.toDate ? item.timestamp.toDate() : new Date(item.timestamp)
        return itemTime >= twentyFourHoursAgo && itemTime <= now
      })
      .sort((a, b) => {
        const timeA = a.timestamp.toDate ? a.timestamp.toDate() : new Date(a.timestamp)
        const timeB = b.timestamp.toDate ? b.timestamp.toDate() : new Date(b.timestamp)
        return timeB - timeA
      })
      .slice(0, 4)
      .map((item) => ({
        title: item.show || item.title,
        artist: item.host || item.artist || "Newsline Productions",
        time: getTimeAgo(item.timestamp.toDate ? item.timestamp.toDate() : new Date(item.timestamp)),
        likes: Math.floor(Math.random() * 50) + 10,
      }))

    // If no recent schedules in past 24 hours, show default schedule data
    if (recentFromSchedule.length === 0) {
      const defaultSchedule = scheduleData.filter((item) => item.isDefault)
      return defaultSchedule.slice(0, 4).map((item) => ({
        title: item.show || item.title,
        artist: item.host || item.artist || "Newsline Productions",
        time: "Default Schedule",
        likes: Math.floor(Math.random() * 50) + 10,
      }))
    }

    return recentFromSchedule
  }

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
        <header className="bg-black text-white p-4 shadow-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative group">
                <Link href="/admin">
                  <Image
                    src="/newsline-logo.png"
                    alt="Newsline Media TV"
                    width={140}
                    height={70}
                    className="group-hover:opacity-80 transition-opacity duration-300 cursor-pointer"
                  />
                </Link>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <Badge variant="secondary" className="bg-red-600 text-white border-red-600">
                  <Radio className="w-3 h-3 mr-1" />
                  LIVE
                </Badge>
                <div className="flex items-center space-x-2 text-sm">
                  <Users className="w-4 h-4 text-white" />
                  <span className="font-mono text-red-500">{listeners.toLocaleString()}</span>
                  <span className="text-gray-300">listeners</span>
                </div>
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
              <h1 className="text-5xl md:text-7xl font-bold text-black">LIVE ON AIR</h1>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                Broadcasting the latest news, music, and entertainment 24/7 from Newsline Radio
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card className="bg-white border-2 border-gray-200 shadow-lg">
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Radio className="w-8 h-8 text-red-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-black">Morning Newsline</h3>
                          <p className="text-gray-600">with Sarah Johnson</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-red-600">{listeners.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">listeners</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center space-x-6">
                      <Button
                        onClick={handleLike}
                        disabled={isLoading}
                        variant="ghost"
                        size="lg"
                        className={`${isLiked ? "text-red-600" : "text-gray-600"} hover:text-red-500 transition-colors ${isLoading ? "opacity-50" : ""}`}
                      >
                        <Heart className={`w-6 h-6 ${isLiked ? "fill-current" : ""}`} />
                        <span className="ml-2">{isLoading ? "..." : likes}</span>
                      </Button>

                      <Button variant="ghost" size="lg" className="text-gray-600 hover:text-red-500">
                        <Share2 className="w-6 h-6" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="relative overflow-hidden bg-gray-100 p-4 border-2 border-gray-200">
                        <iframe
                          src="https://a12.asurahosting.com/public/newsline/embed?theme=dark"
                          frameBorder="0"
                          allowTransparency={true}
                          className="w-full min-h-[180px] border-0 bg-transparent relative z-10"
                          title="Newsline Radio Player"
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
                <Card className="bg-white border-2 border-gray-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-black">
                      <Music className="w-5 h-5" />
                      <span>Now Playing</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-red-600 mx-auto mb-3 flex items-center justify-center">
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
                        className="bg-red-600 h-1 transition-all duration-1000 ease-linear"
                        style={{ width: `${(currentTrack.currentTime / currentTrack.duration) * 100}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-2 border-gray-200 shadow-lg">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-black font-medium">Peak Listeners Today</span>
                      <span className="text-red-600 font-bold">
                        {isLoading ? "..." : peakListeners.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-black font-medium">Show Rating</span>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-red-600 text-red-600" />
                        ))}
                        <span className="text-sm text-red-600 ml-1">4.9</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-black font-medium">Total Likes</span>
                      <span className="text-red-600 font-bold">{isLoading ? "..." : likes.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-8 flex items-center space-x-2 text-black">
              <TrendingUp className="w-8 h-8 text-red-600" />
              <span>Recently Played</span>
            </h2>
            {recentlyPlayed.length === 0 ? (
              <Card className="bg-white border-2 border-gray-200 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Recent Activity</h3>
                  <p className="text-gray-500">
                    Recently played shows will appear here once schedule items are played.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {recentlyPlayed.map((track, index) => (
                  <Card
                    key={index}
                    className="bg-white border-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <CardContent className="p-4 flex items-center space-x-4">
                      <div className="w-12 h-12 bg-red-600 flex items-center justify-center">
                        <Music className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-black">{track.title}</h4>
                        <p className="text-sm text-gray-600">{track.artist}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1 text-red-600">
                          <Heart className="w-4 h-4" />
                          <span className="text-sm">{track.likes}</span>
                        </div>
                        <p className="text-xs text-gray-500">{track.time}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-4xl font-bold mb-8 flex items-center space-x-2">
                <Calendar className="w-8 h-8 text-red-500" />
                <span className="text-black">Today's Schedule</span>
              </h2>
            </div>

            {displaySchedule.length === 0 ? (
              <Card className="backdrop-blur-lg bg-white/5 border-blue-500/20">
                <CardContent className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No Schedule Available</h3>
                  <p className="text-gray-500">No schedule found for today and no default schedule configured.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {displaySchedule.map((item, index) => (
                  <Card
                    key={item.id || index}
                    className={`backdrop-blur-lg border-red-500/20 hover:bg-white/10 transition-all duration-300 transform hover:scale-105 animate-fade-in-up ${
                      item.status === "live" ? "bg-red-900/20 border-red-500/50" : "bg-white/90"
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-red-500 font-mono text-sm font-semibold">
                          <Clock className="w-4 h-4" />
                          <span>
                            {item.startTime && item.endTime ? `${item.startTime} - ${item.endTime}` : item.time}
                          </span>
                        </div>
                        {item.status === "live" && (
                          <Badge className="bg-red-600 text-white animate-pulse">
                            <Radio className="w-3 h-3 mr-1" />
                            LIVE
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-black">{item.show}</h3>
                      <p className="text-gray-700 text-sm font-medium">Hosted by {item.host}</p>
                      {item.status === "live" && (
                        <div className="flex items-center space-x-2 text-red-500">
                          <Users className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {(item.listeners || listeners).toLocaleString()} listening
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-4xl font-bold mb-8 flex items-center space-x-2">
                <Mic className="w-8 h-8 text-red-500" />
                <span className="text-black">Current Host</span>
              </h2>
              <p className="text-gray-700">Meet the voice behind Newline Radio right now</p>
            </div>

            {displayHosts.length === 0 ? (
              <Card className="backdrop-blur-lg bg-white/5 border-blue-500/20">
                <CardContent className="p-12 text-center">
                  <Mic className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No Host Available</h3>
                  <p className="text-gray-500">No host scheduled for this time and no default host configured.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {displayHosts.map((dj, index) => (
                  <Card
                    key={dj.id || index}
                    className="backdrop-blur-lg bg-white/90 border-red-500/20 hover:bg-white/95 transition-all duration-300 transform hover:scale-105 animate-fade-in-up"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <CardContent className="p-6 text-center space-y-4">
                      <div className="relative">
                        <Image
                          src={dj.image || "/placeholder.svg"}
                          alt={dj.name}
                          width={80}
                          height={80}
                          className="rounded-full mx-auto border-4 border-red-500/30"
                        />
                        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                          <Award className="w-3 h-3" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-black">{dj.name}</h3>
                        <p className="text-red-500 font-medium">{dj.show}</p>
                        {dj.startTime && dj.endTime && (
                          <p className="text-sm text-gray-700 font-medium">
                            {dj.startTime} - {dj.endTime}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4 text-red-500" />
                          <span className="text-black font-medium">{dj.followers}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-red-500 text-red-500" />
                          <span className="text-black font-medium">{dj.rating || 4.5}</span>
                        </div>
                      </div>
                      <Button className="w-full bg-red-600 hover:bg-red-700">Follow Host</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-4xl font-bold mb-8 flex items-center space-x-2">
                <News className="w-8 h-8 text-red-500" />
                <span className="text-black">Latest Updates</span>
              </h2>
            </div>

            {displayNews.length === 0 ? (
              <Card className="backdrop-blur-lg bg-white/5 border-blue-500/20">
                <CardContent className="p-12 text-center">
                  <News className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No News Available</h3>
                  <p className="text-gray-500">Latest news updates will appear here once configured by admin.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {displayNews.map((newsItem, index) => (
                  <Card
                    key={newsItem.id || index}
                    className="backdrop-blur-lg bg-white/90 border-red-500/20 hover:bg-white/95 transition-all duration-300 animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardContent className="p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="bg-red-600/20 text-red-600 font-medium">
                          {newsItem.category}
                        </Badge>
                        <span className="text-sm text-gray-700 font-medium">
                          {newsItem.timestamp?.toDate?.()?.toLocaleDateString() || newsItem.time || "Recently"}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-black hover:text-red-500 cursor-pointer transition-colors">
                        {newsItem.url ? (
                          <a href={newsItem.url} target="_blank" rel="noopener noreferrer">
                            {newsItem.title}
                          </a>
                        ) : (
                          newsItem.title
                        )}
                      </h3>
                      <div className="flex items-center justify-center space-x-4 text-sm text-gray-700">
                        <button className="flex items-center space-x-1 hover:text-red-500 font-medium">
                          <Heart className="w-4 h-4" />
                          <span>Like</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:text-red-500 font-medium">
                          <Share2 className="w-4 h-4" />
                          <span>Share</span>
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
