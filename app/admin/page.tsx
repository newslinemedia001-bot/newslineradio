"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Calendar,
  Clock,
  Users,
  MessageCircle,
  Mail,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  LogOut,
  Home,
  Mic,
  Rows as News,
  BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  authenticateAdmin,
  getSchedule,
  addScheduleItem,
  updateScheduleItem,
  deleteScheduleItem,
  getHosts,
  addHost,
  updateHost,
  deleteHost,
  getNews,
  addNews,
  updateNews,
  deleteNews,
  getContactMessages,
  getChatMessagesForAdmin,
  markContactAsRead,
} from "@/lib/admin-utils"
import { getStats } from "@/lib/firebase-utils"

export default function AdminPanel() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState("")

  // Data states
  const [schedule, setSchedule] = useState([])
  const [hosts, setHosts] = useState([])
  const [news, setNews] = useState([])
  const [contactMessages, setContactMessages] = useState([])
  const [chatMessages, setChatMessages] = useState([])
  const [stats, setStats] = useState({})

  // Form states
  const [scheduleForm, setScheduleForm] = useState({
    date: new Date().toISOString().split("T")[0],
    startTime: "",
    endTime: "",
    show: "",
    host: "",
    status: "upcoming",
    isDefault: false,
  })
  const [hostForm, setHostForm] = useState({
    name: "",
    show: "",
    image: "",
    followers: "",
    rating: 4.5,
    date: new Date().toISOString().split("T")[0],
    startTime: "",
    endTime: "",
    isDefault: false,
  })
  const [newsForm, setNewsForm] = useState({
    title: "",
    category: "",
    url: "",
  })

  const [editingItem, setEditingItem] = useState(null)
  const [editingType, setEditingType] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])

  useEffect(() => {
    const authStatus = localStorage.getItem("admin_authenticated")
    if (authStatus === "true") {
      setIsAuthenticated(true)
      loadData()
    }
  }, [])

  const loadData = async () => {
    try {
      const [scheduleData, hostsData, newsData, contactData, chatData, statsData] = await Promise.all([
        getSchedule(),
        getHosts(),
        getNews(),
        getContactMessages(),
        getChatMessagesForAdmin(),
        getStats(),
      ])

      setSchedule(scheduleData)
      setHosts(hostsData)
      setNews(newsData)
      setContactMessages(contactData)
      setChatMessages(chatData)
      setStats(statsData)
    } catch (error) {
      console.error("Error loading data:", error)
    }
  }

  const handleLogin = (e) => {
    e.preventDefault()
    if (authenticateAdmin(username, password)) {
      setIsAuthenticated(true)
      localStorage.setItem("admin_authenticated", "true")
      setLoginError("")
      loadData()
    } else {
      setLoginError("Invalid username or password")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("admin_authenticated")
    setUsername("")
    setPassword("")
  }

  const handleAddSchedule = async (e) => {
    e.preventDefault()
    const success = await addScheduleItem(scheduleForm)
    if (success) {
      setScheduleForm({
        date: new Date().toISOString().split("T")[0],
        startTime: "",
        endTime: "",
        show: "",
        host: "",
        status: "upcoming",
        isDefault: false,
      })
      loadData()
    }
  }

  const handleAddHost = async (e) => {
    e.preventDefault()
    const success = await addHost(hostForm)
    if (success) {
      setHostForm({
        name: "",
        show: "",
        image: "",
        followers: "",
        rating: 4.5,
        date: new Date().toISOString().split("T")[0],
        startTime: "",
        endTime: "",
        isDefault: false,
      })
      loadData()
    }
  }

  const handleAddNews = async (e) => {
    e.preventDefault()
    const success = await addNews(newsForm)
    if (success) {
      setNewsForm({ title: "", category: "", url: "" })
      loadData()
    }
  }

  const handleEdit = (item, type) => {
    setEditingItem(item)
    setEditingType(type)
    if (type === "schedule") {
      setScheduleForm(item)
    } else if (type === "host") {
      setHostForm(item)
    } else if (type === "news") {
      setNewsForm(item)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    let success = false

    if (editingType === "schedule") {
      success = await updateScheduleItem(editingItem.id, scheduleForm)
    } else if (editingType === "host") {
      success = await updateHost(editingItem.id, hostForm)
    } else if (editingType === "news") {
      success = await updateNews(editingItem.id, newsForm)
    }

    if (success) {
      setEditingItem(null)
      setEditingType("")
      loadData()
    }
  }

  const handleDelete = async (id, type) => {
    if (!confirm("Are you sure you want to delete this item?")) return

    let success = false
    if (type === "schedule") {
      success = await deleteScheduleItem(id)
    } else if (type === "host") {
      success = await deleteHost(id)
    } else if (type === "news") {
      success = await deleteNews(id)
    }

    if (success) {
      loadData()
    }
  }

  const handleMarkAsRead = async (id) => {
    const success = await markContactAsRead(id)
    if (success) {
      loadData()
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 text-white flex items-center justify-center">
        <Card className="w-full max-w-md backdrop-blur-lg bg-white/5 border-blue-500/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-blue-400">Admin Login</CardTitle>
            <p className="text-gray-400">Access the Newsline Radio admin panel</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-black/20 border-blue-500/30"
                required
              />
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black/20 border-blue-500/30 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 text-white">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-400">Admin Panel</h1>
            <p className="text-gray-400">Manage Newsline Radio content and settings</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push("/")} className="text-blue-400">
              <Home className="w-4 h-4 mr-2" />
              Back to Site
            </Button>
            <Button variant="ghost" onClick={handleLogout} className="text-red-400">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="backdrop-blur-lg bg-white/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-sm text-gray-400">Current Listeners</p>
                  <p className="text-2xl font-bold">{stats.currentListeners || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-lg bg-white/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-sm text-gray-400">Peak Today</p>
                  <p className="text-2xl font-bold">{stats.peakListeners24h || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-lg bg-white/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-8 h-8 text-red-400" />
                <div>
                  <p className="text-sm text-gray-400">Total Likes</p>
                  <p className="text-2xl font-bold">{stats.totalLikes24h || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-lg bg-white/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Mail className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-sm text-gray-400">New Messages</p>
                  <p className="text-2xl font-bold">
                    {contactMessages.filter((msg) => msg.status === "unread").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="schedule" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/5">
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="hosts">Hosts</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="chat">Live Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-6">
            <Card className="backdrop-blur-lg bg-white/5 border-blue-500/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <span>Schedule Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form
                  onSubmit={editingItem ? handleUpdate : handleAddSchedule}
                  className="grid grid-cols-2 md:grid-cols-7 gap-4"
                >
                  <Input
                    type="date"
                    value={scheduleForm.date}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                    className="bg-black/20 border-blue-500/30"
                    required
                  />
                  <Input
                    type="time"
                    placeholder="Start Time"
                    value={scheduleForm.startTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                    className="bg-black/20 border-blue-500/30"
                    required
                  />
                  <Input
                    type="time"
                    placeholder="End Time"
                    value={scheduleForm.endTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                    className="bg-black/20 border-blue-500/30"
                    required
                  />
                  <Input
                    placeholder="Show Name"
                    value={scheduleForm.show}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, show: e.target.value })}
                    className="bg-black/20 border-blue-500/30"
                    required
                  />
                  <Input
                    placeholder="Host Name"
                    value={scheduleForm.host}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, host: e.target.value })}
                    className="bg-black/20 border-blue-500/30"
                    required
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="scheduleDefault"
                      checked={scheduleForm.isDefault || false}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, isDefault: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-black/20 border-blue-500/30 rounded"
                    />
                    <label htmlFor="scheduleDefault" className="text-sm text-gray-300">
                      Default
                    </label>
                  </div>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {editingItem ? "Update" : "Add"}
                  </Button>
                </form>

                <div className="space-y-2">
                  {schedule.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-gray-400">{item.date}</span>
                        <span className="font-mono">
                          {item.startTime} - {item.endTime}
                        </span>
                        <span className="font-semibold">{item.show}</span>
                        <span className="text-gray-400">with {item.host}</span>
                        <Badge variant={item.status === "live" ? "destructive" : "secondary"}>{item.status}</Badge>
                        {item.isDefault && (
                          <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                            DEFAULT
                          </Badge>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(item, "schedule")}
                          className="text-blue-400"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(item.id, "schedule")}
                          className="text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hosts" className="space-y-6">
            <Card className="backdrop-blur-lg bg-white/5 border-blue-500/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mic className="w-5 h-5 text-blue-400" />
                  <span>Hosts Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form
                  onSubmit={editingItem ? handleUpdate : handleAddHost}
                  className="grid grid-cols-2 md:grid-cols-9 gap-4"
                >
                  <Input
                    placeholder="Host Name"
                    value={hostForm.name}
                    onChange={(e) => setHostForm({ ...hostForm, name: e.target.value })}
                    className="bg-black/20 border-blue-500/30"
                    required
                  />
                  <Input
                    placeholder="Show Name"
                    value={hostForm.show}
                    onChange={(e) => setHostForm({ ...hostForm, show: e.target.value })}
                    className="bg-black/20 border-blue-500/30"
                    required
                  />
                  <Input
                    type="date"
                    value={hostForm.date}
                    onChange={(e) => setHostForm({ ...hostForm, date: e.target.value })}
                    className="bg-black/20 border-blue-500/30"
                    required
                  />
                  <Input
                    type="time"
                    placeholder="Start Time"
                    value={hostForm.startTime}
                    onChange={(e) => setHostForm({ ...hostForm, startTime: e.target.value })}
                    className="bg-black/20 border-blue-500/30"
                    required
                  />
                  <Input
                    type="time"
                    placeholder="End Time"
                    value={hostForm.endTime}
                    onChange={(e) => setHostForm({ ...hostForm, endTime: e.target.value })}
                    className="bg-black/20 border-blue-500/30"
                    required
                  />
                  <Input
                    placeholder="Image URL"
                    value={hostForm.image}
                    onChange={(e) => setHostForm({ ...hostForm, image: e.target.value })}
                    className="bg-black/20 border-blue-500/30"
                  />
                  <Input
                    placeholder="Followers"
                    value={hostForm.followers}
                    onChange={(e) => setHostForm({ ...hostForm, followers: e.target.value })}
                    className="bg-black/20 border-blue-500/30"
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="hostDefault"
                      checked={hostForm.isDefault || false}
                      onChange={(e) => setHostForm({ ...hostForm, isDefault: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-black/20 border-blue-500/30 rounded"
                    />
                    <label htmlFor="hostDefault" className="text-sm text-gray-300">
                      Default
                    </label>
                  </div>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {editingItem ? "Update" : "Add"}
                  </Button>
                </form>

                <div className="grid gap-4 md:grid-cols-2">
                  {hosts.map((host) => (
                    <div key={host.id} className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                          {host.name[0]}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{host.name}</h3>
                            {host.isDefault && (
                              <Badge variant="outline" className="text-yellow-400 border-yellow-400 text-xs">
                                DEFAULT
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">{host.show}</p>
                          <p className="text-xs text-gray-500">
                            {host.date} • {host.startTime}-{host.endTime}
                          </p>
                          <p className="text-xs text-gray-500">
                            {host.followers} followers • ⭐ {host.rating || 4.5}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(host, "host")}
                          className="text-blue-400"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(host.id, "host")}
                          className="text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="news" className="space-y-6">
            <Card className="backdrop-blur-lg bg-white/5 border-blue-500/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <News className="w-5 h-5 text-blue-400" />
                  <span>News Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form
                  onSubmit={editingItem ? handleUpdate : handleAddNews}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4"
                >
                  <Input
                    placeholder="News Title"
                    value={newsForm.title}
                    onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                    className="bg-black/20 border-blue-500/30"
                    required
                  />
                  <Input
                    placeholder="Category"
                    value={newsForm.category}
                    onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                    className="bg-black/20 border-blue-500/30"
                    required
                  />
                  <Input
                    placeholder="Article URL (optional)"
                    value={newsForm.url}
                    onChange={(e) => setNewsForm({ ...newsForm, url: e.target.value })}
                    className="bg-black/20 border-blue-500/30"
                    type="url"
                  />
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {editingItem ? "Update" : "Add"}
                  </Button>
                </form>

                <div className="space-y-2">
                  {news.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="secondary">{item.category}</Badge>
                          <span className="text-xs text-gray-500">
                            {item.timestamp?.toDate?.()?.toLocaleDateString() || "Recently"}
                          </span>
                        </div>
                        <h3 className="font-semibold">{item.title}</h3>
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 text-sm hover:underline"
                          >
                            Read more →
                          </a>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(item, "news")}
                          className="text-blue-400"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(item.id, "news")}
                          className="text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <Card className="backdrop-blur-lg bg-white/5 border-blue-500/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-5 h-5 text-blue-400" />
                    <span>Contact Messages</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactMessages.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">No contact messages found.</p>
                ) : (
                  <div className="space-y-4">
                    {contactMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-4 rounded-lg border ${
                          message.status === "unread"
                            ? "bg-blue-900/20 border-blue-500/30"
                            : "bg-black/20 border-gray-500/30"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-blue-400" />
                            <span className="font-semibold">{message.email}</span>
                            <Badge variant={message.status === "unread" ? "destructive" : "secondary"}>
                              {message.status}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-400">{message.timeAgo}</span>
                            {message.status === "unread" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleMarkAsRead(message.id)}
                                className="text-green-400"
                              >
                                Mark as Read
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-300">{message.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <Card className="backdrop-blur-lg bg-white/5 border-blue-500/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5 text-blue-400" />
                    <span>Live Chat Messages</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {chatMessages.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">No chat messages found.</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {chatMessages.map((message) => (
                      <div key={message.id} className="flex items-start space-x-3 p-3 bg-black/20 rounded-lg">
                        <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-xs font-bold">
                          {message.username[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold text-red-400">{message.username}</span>
                            <span className="text-xs text-gray-500">{message.timeAgo}</span>
                          </div>
                          <p className="text-sm text-gray-300">{message.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
