"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Edit,
  Trash2,
  Eye,
  EyeOff,
  LogOut,
  Home,
  Rows as News,
  Bell,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ArticleEditor from "@/components/admin/ArticleEditor"
import SubscribersManager from "@/components/SubscribersManager"
import {
  authenticateAdmin,
  getNews,
  addNews,
  updateNews,
  deleteNews,
} from "@/lib/admin-utils"

export default function AdminPanel() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState("")

  // Data states
  const [news, setNews] = useState([])

  // Form states
  const [showArticleEditor, setShowArticleEditor] = useState(false)
  const [editingArticle, setEditingArticle] = useState(null)

  useEffect(() => {
    const authStatus = localStorage.getItem("admin_authenticated")
    if (authStatus === "true") {
      setIsAuthenticated(true)
      loadData()
    }
  }, [])

  const loadData = async () => {
    try {
      const newsData = await getNews()
      setNews(newsData)
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

  const handleSaveArticle = async (articleData) => {
    try {
      let success = false
      if (editingArticle) {
        success = await updateNews(editingArticle.id, articleData)
      } else {
        success = await addNews(articleData)
      }
      
      if (success) {
        setShowArticleEditor(false)
        setEditingArticle(null)
        loadData()
      }
    } catch (error) {
      console.error("Error saving article:", error)
    }
  }

  const handleCancelEdit = () => {
    setShowArticleEditor(false)
    setEditingArticle(null)
  }

  const handleEditArticle = (article) => {
    setEditingArticle(article)
    setShowArticleEditor(true)
  }

  const handleDeleteArticle = async (id) => {
    if (!confirm("Are you sure you want to delete this article?")) return

    const success = await deleteNews(id)
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
            <p className="text-gray-600">Manage Newsline Radio articles and content</p>
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

        <Tabs defaultValue="news" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100">
            <TabsTrigger
              value="news"
              className="text-black data-[state=active]:bg-white data-[state=active]:text-red-600"
            >
              Articles Management
            </TabsTrigger>
            <TabsTrigger
              value="subscribers"
              className="text-black data-[state=active]:bg-white data-[state=active]:text-red-600"
            >
              Subscribers & Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="news" className="space-y-6">
            {showArticleEditor ? (
              <ArticleEditor
                onSave={handleSaveArticle}
                initialData={editingArticle}
                onCancel={handleCancelEdit}
              />
            ) : (
              <Card className="border border-gray-200 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <News className="w-5 h-5 text-red-600" />
                      <span className="text-black">Articles Management</span>
                    </div>
                    <Button 
                      onClick={() => setShowArticleEditor(true)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Create New Article
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {news.length === 0 ? (
                    <div className="text-center py-12">
                      <News className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No Articles Yet</h3>
                      <p className="text-gray-500 mb-4">
                        Create your first news article using the WordPress-style editor.
                      </p>
                      <Button 
                        onClick={() => setShowArticleEditor(true)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Create First Article
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {news.map((article) => (
                        <div key={article.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-lg border hover:shadow-md transition-shadow">
                          <div className="flex items-start space-x-4 flex-1">
                            {article.imageUrl && (
                              <img 
                                src={article.imageUrl} 
                                alt={article.title}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                            )}
                            <div className="flex-1">
                              <h3 className="font-semibold text-black text-lg">{article.title}</h3>
                              <p className="text-sm text-gray-600 mt-1">{article.category || "General"}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                By {article.author || "Newsline Team"} • {new Date(article.publishedAt || Date.now()).toLocaleDateString()}
                              </p>
                              {article.excerpt && (
                                <p className="text-sm text-gray-700 mt-2 line-clamp-2">{article.excerpt}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditArticle(article)}
                              className="text-blue-600 hover:text-blue-700 border-blue-600 hover:bg-blue-50"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteArticle(article.id)}
                              className="text-red-600 hover:text-red-700 border-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="subscribers" className="space-y-6">
            <SubscribersManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}