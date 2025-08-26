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
  Radio,
  Server,
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
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <Card className="w-full max-w-md border border-gray-200 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-black">Admin Login</CardTitle>
            <p className="text-gray-600">Access the Newsline Radio admin panel</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-white border-gray-300 text-black"
                required
              />
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white border-gray-300 text-black pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black">Admin Panel</h1>
            <p className="text-gray-600">Manage Newsline Radio content and settings</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push("/")} className="text-red-600 hover:text-red-700">
              <Home className="w-4 h-4 mr-2" />
              Back to Site
            </Button>
            <Button variant="ghost" onClick={handleLogout} className="text-red-600 hover:text-red-700">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Current Listeners</p>
                  <p className="text-2xl font-bold text-black">{stats.currentListeners || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Peak Today</p>
                  <p className="text-2xl font-bold text-black">{stats.peakListeners24h || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Likes</p>
                  <p className="text-2xl font-bold text-black">{stats.totalLikes24h || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Mail className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">New Messages</p>
                  <p className="text-2xl font-bold text-black">
                    {contactMessages.filter((msg) => msg.status === "unread").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="connection" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-gray-100">
            <TabsTrigger
              value="connection"
              className="text-black data-[state=active]:bg-white data-[state=active]:text-red-600"
            >
              Connection
            </TabsTrigger>
            <TabsTrigger
              value="schedule"
              className="text-black data-[state=active]:bg-white data-[state=active]:text-red-600"
            >
              Schedule
            </TabsTrigger>
            <TabsTrigger
              value="hosts"
              className="text-black data-[state=active]:bg-white data-[state=active]:text-red-600"
            >
              Hosts
            </TabsTrigger>
            <TabsTrigger
              value="news"
              className="text-black data-[state=active]:bg-white data-[state=active]:text-red-600"
            >
              News
            </TabsTrigger>
            <TabsTrigger
              value="messages"
              className="text-black data-[state=active]:bg-white data-[state=active]:text-red-600"
            >
              Messages
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="text-black data-[state=active]:bg-white data-[state=active]:text-red-600"
            >
              Live Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connection" className="space-y-6">
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Radio className="w-5 h-5 text-red-600" />
                  <span className="text-black">Connection Information</span>
                </CardTitle>
                <p className="text-gray-600">Broadcasting setup instructions for radio hosts and testers</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Server className="w-5 h-5 text-red-600" />
                      <h3 className="text-lg font-semibold text-black">Icecast Clients</h3>
                    </div>
                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Server:</label>
                        <p className="text-red-600 font-mono">s12.ssurahosting.com</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          You may need to connect directly via your IP address:
                        </label>
                        <p className="text-red-600 font-mono">95.188.195.42</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Port:</label>
                        <p className="text-red-600 font-mono">8555</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Mount Name:</label>
                        <p className="text-red-600 font-mono">/</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Radio className="w-5 h-5 text-red-600" />
                      <h3 className="text-lg font-semibold text-black">Shoutcast Clients</h3>
                    </div>
                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Server:</label>
                        <p className="text-red-600 font-mono">s12.ssurahosting.com</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          You may need to connect directly via your IP address:
                        </label>
                        <p className="text-red-600 font-mono">95.188.195.42</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Port:</label>
                        <p className="text-red-600 font-mono">8555</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">For some clients, use port:</label>
                        <p className="text-red-600 font-mono">8556</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Password:</label>
                        <p className="text-red-600 font-mono">dj_username:dj_password in our case is newsline:newsline1234</p>
                        <p className="text-sm text-gray-600">or</p>
                        <p className="text-red-600 font-mono">dj_username,dj_password in our case is newsline,newsline1234</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-black mb-2">Setup Instructions</h4>
                  <p className="text-gray-700 mb-2">
                    Setup instructions for broadcasting software are available on the{" "}
                    <a
                      href="https://azuracast.com/docs/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-600 hover:text-red-700 underline"
                    >
                      AzuraCast wiki
                    </a>
                  </p>
                  <p className="text-sm text-gray-600">
                    Use these connection details in your broadcasting software (OBS, SAM Broadcaster, etc.) to connect
                    to the radio stream.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-red-600" />
                  <span className="text-black">Schedule Management</span>
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
                    className="bg-white border-gray-300 text-black"
                    required
                  />
                  <Input
                    type="time"
                    placeholder="Start Time"
                    value={scheduleForm.startTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                    className="bg-white border-gray-300 text-black"
                    required
                  />
                  <Input
                    type="time"
                    placeholder="End Time"
                    value={scheduleForm.endTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                    className="bg-white border-gray-300 text-black"
                    required
                  />
                  <Input
                    placeholder="Show Name"
                    value={scheduleForm.show}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, show: e.target.value })}
                    className="bg-white border-gray-300 text-black"
                    required
                  />
                  <Input
                    placeholder="Host Name"
                    value={scheduleForm.host}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, host: e.target.value })}
                    className="bg-white border-gray-300 text-black"
                    required
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="scheduleDefault"
                      checked={scheduleForm.isDefault || false}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, isDefault: e.target.checked })}
                      className="w-4 h-4 text-red-600 bg-white border-gray-300 rounded"
                    />
                    <label htmlFor="scheduleDefault" className="text-sm text-gray-700">
                      Default
                    </label>
                  </div>
                  <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">
                    {editingItem ? "Update" : "Add"}
                  </Button>
                </form>

                <div className="space-y-2">
                  {schedule.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center space-x-4">
                        <Clock className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-gray-600">{item.date}</span>
                        <span className="font-mono text-black">
                          {item.startTime} - {item.endTime}
                        </span>
                        <span className="font-semibold text-black">{item.show}</span>
                        <span className="text-gray-600">with {item.host}</span>
                        <Badge variant={item.status === "live" ? "destructive" : "secondary"}>{item.status}</Badge>
                        {item.isDefault && (
                          <Badge variant="outline" className="text-red-600 border-red-600">
                            DEFAULT
                          </Badge>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(item, "schedule")}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(item.id, "schedule")}
                          className="text-red-600 hover:text-red-700"
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
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mic className="w-5 h-5 text-red-600" />
                  <span className="text-black">Hosts Management</span>
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
                    className="bg-white border-gray-300 text-black"
                    required
                  />
                  <Input
                    placeholder="Show Name"
                    value={hostForm.show}
                    onChange={(e) => setHostForm({ ...hostForm, show: e.target.value })}
                    className="bg-white border-gray-300 text-black"
                    required
                  />
                  <Input
                    type="date"
                    value={hostForm.date}
                    onChange={(e) => setHostForm({ ...hostForm, date: e.target.value })}
                    className="bg-white border-gray-300 text-black"
                    required
                  />
                  <Input
                    type="time"
                    placeholder="Start Time"
                    value={hostForm.startTime}
                    onChange={(e) => setHostForm({ ...hostForm, startTime: e.target.value })}
                    className="bg-white border-gray-300 text-black"
                    required
                  />
                  <Input
                    type="time"
                    placeholder="End Time"
                    value={hostForm.endTime}
                    onChange={(e) => setHostForm({ ...hostForm, endTime: e.target.value })}
                    className="bg-white border-gray-300 text-black"
                    required
                  />
                  <Input
                    placeholder="Image URL"
                    value={hostForm.image}
                    onChange={(e) => setHostForm({ ...hostForm, image: e.target.value })}
                    className="bg-white border-gray-300 text-black"
                  />
                  <Input
                    placeholder="Followers"
                    value={hostForm.followers}
                    onChange={(e) => setHostForm({ ...hostForm, followers: e.target.value })}
                    className="bg-white border-gray-300 text-black"
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="hostDefault"
                      checked={hostForm.isDefault || false}
                      onChange={(e) => setHostForm({ ...hostForm, isDefault: e.target.checked })}
                      className="w-4 h-4 text-red-600 bg-white border-gray-300 rounded"
                    />
                    <label htmlFor="hostDefault" className="text-sm text-gray-700">
                      Default
                    </label>
                  </div>
                  <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">
                    {editingItem ? "Update" : "Add"}
                  </Button>
                </form>

                <div className="grid gap-4 md:grid-cols-2">
                  {hosts.map((host) => (
                    <div key={host.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white">
                          {host.name[0]}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-black">{host.name}</h3>
                            {host.isDefault && (
                              <Badge variant="outline" className="text-red-600 border-red-600 text-xs">
                                DEFAULT
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{host.show}</p>
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
                          className="text-red-600 hover:text-red-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(host.id, "host")}
                          className="text-red-600 hover:text-red-700"
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
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <News className="w-5 h-5 text-red-600" />
                  <span className="text-black">News Management</span>
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
                    className="bg-white border-gray-300 text-black"
                    required
                  />
                  <Input
                    placeholder="Category"
                    value={newsForm.category}
                    onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                    className="bg-white border-gray-300 text-black"
                    required
                  />
                  <Input
                    placeholder="Article URL (optional)"
                    value={newsForm.url}
                    onChange={(e) => setNewsForm({ ...newsForm, url: e.target.value })}
                    className="bg-white border-gray-300 text-black"
                    type="url"
                  />
                  <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">
                    {editingItem ? "Update" : "Add"}
                  </Button>
                </form>

                <div className="space-y-2">
                  {news.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="secondary">{item.category}</Badge>
                          <span className="text-xs text-gray-500">
                            {item.timestamp?.toDate?.()?.toLocaleDateString() || "Recently"}
                          </span>
                        </div>
                        <h3 className="font-semibold text-black">{item.title}</h3>
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-600 text-sm hover:underline"
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
                          className="text-red-600 hover:text-red-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(item.id, "news")}
                          className="text-red-600 hover:text-red-700"
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
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-5 h-5 text-red-600" />
                    <span className="text-black">Contact Messages</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactMessages.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No contact messages found.</p>
                ) : (
                  <div className="space-y-4">
                    {contactMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-4 rounded-lg border ${
                          message.status === "unread" ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-red-600" />
                            <span className="font-semibold text-black">{message.email}</span>
                            <Badge variant={message.status === "unread" ? "destructive" : "secondary"}>
                              {message.status}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">{message.timeAgo}</span>
                            {message.status === "unread" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleMarkAsRead(message.id)}
                                className="text-green-600 hover:text-green-700"
                              >
                                Mark as Read
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-700">{message.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5 text-red-600" />
                    <span className="text-black">Live Chat Messages</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {chatMessages.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No chat messages found.</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {chatMessages.map((message) => (
                      <div key={message.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border">
                        <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                          {message.username[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold text-red-600">{message.username}</span>
                            <span className="text-xs text-gray-500">{message.timeAgo}</span>
                          </div>
                          <p className="text-sm text-gray-700">{message.message}</p>
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
