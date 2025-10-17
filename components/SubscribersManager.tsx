"use client"

import { useState, useEffect } from "react"
import { Bell, Mail, Trash2, Copy, Send, Radio } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { getSubscribers, deleteSubscriber } from "@/lib/firebase-utils"

interface Subscriber {
  id: string
  email?: string
  fcmToken?: string
  type: "email" | "notification"
  subscribedAt: any
  deleted?: boolean
}

export default function SubscribersManager() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [notificationTitle, setNotificationTitle] = useState("")
  const [notificationMessage, setNotificationMessage] = useState("")
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    loadSubscribers()
  }, [])

  const loadSubscribers = async () => {
    setIsLoading(true)
    try {
      const data = await getSubscribers()
      setSubscribers(data.filter((s: Subscriber) => !s.deleted))
    } catch (error) {
      console.error("Error loading subscribers:", error)
      toast.error("Failed to load subscribers")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteSubscriber = async (subscriberId: string) => {
    if (!confirm("Are you sure you want to delete this subscriber?")) {
      return
    }

    try {
      const success = await deleteSubscriber(subscriberId)
      if (success) {
        toast.success("Subscriber deleted")
        loadSubscribers()
      } else {
        toast.error("Failed to delete subscriber")
      }
    } catch (error) {
      console.error("Error deleting subscriber:", error)
      toast.error("An error occurred")
    }
  }

  const copyAllEmails = () => {
    const emails = subscribers
      .filter((s) => s.type === "email" && s.email)
      .map((s) => s.email)
      .join(", ")

    if (emails) {
      navigator.clipboard.writeText(emails)
      toast.success("Emails copied to clipboard!")
    } else {
      toast.error("No email subscribers found")
    }
  }

  const sendNotifications = async () => {
    console.log("🔔 Starting push notification send process...")
    
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      console.error("❌ Missing title or message")
      toast.error("Please enter both title and message")
      return
    }

    const notificationSubscribers = subscribers.filter(
      (s) => s.type === "notification" && s.fcmToken && !s.deleted
    )

    console.log(`📊 Found ${notificationSubscribers.length} notification subscribers`)

    if (notificationSubscribers.length === 0) {
      console.error("❌ No notification subscribers found")
      toast.error("No notification subscribers found")
      return
    }

    setIsSending(true)
    
    try {
      const tokens = notificationSubscribers.map((s) => s.fcmToken).filter(Boolean)
      
      console.log(`📤 Sending to ${tokens.length} tokens...`)
      console.log(`📝 Title: "${notificationTitle}"`)
      console.log(`📝 Message: "${notificationMessage}"`)

      const response = await fetch("/.netlify/functions/send-push-notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tokens,
          title: notificationTitle,
          message: notificationMessage,
        }),
      })

      console.log(`📡 API Response Status: ${response.status}`)
      
      const result = await response.json()
      console.log("📦 API Response Data:", result)

      if (response.ok) {
        console.log(`✅ Successfully sent to ${result.successCount} devices!`)
        if (result.failureCount > 0) {
          console.warn(`⚠️ Failed to send to ${result.failureCount} devices`)
        }
        
        toast.success(
          `✅ Push Notifications Sent Successfully!`,
          {
            description: `Delivered to ${result.successCount} subscribers${result.failureCount > 0 ? ` (${result.failureCount} failed)` : ""}`,
            duration: 6000,
          }
        )
        setNotificationTitle("")
        setNotificationMessage("")
      } else {
        console.error("❌ API returned error:", result.error || "Unknown error")
        console.error("❌ Full error details:", result)
        toast.error(`Failed to send notifications: ${result.error || "Unknown error"}`, {
          description: result.details || "Check console for more details",
          duration: 8000,
        })
      }
    } catch (error) {
      console.error("❌ Critical error sending notifications:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      console.error("❌ Error details:", {
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined
      })
      toast.error("Failed to send notifications", {
        description: `Error: ${errorMessage}. Check console for details.`,
        duration: 8000,
      })
    } finally {
      console.log("🏁 Notification send process completed")
      setIsSending(false)
    }
  }

  const setQuickLiveMessage = () => {
    setNotificationTitle("Newsline Radio is LIVE! 🔴")
    setNotificationMessage("Tune in now! We're broadcasting live with the latest news and updates.")
  }

  const emailSubscribers = subscribers.filter((s) => s.type === "email")
  const notificationSubscribers = subscribers.filter((s) => s.type === "notification")

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <Card className="bg-gradient-to-br from-blue-50 to-red-50 border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center space-x-2">
            <Bell className="w-6 h-6 text-blue-600" />
            <span>Subscriber Statistics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-lg border-2 border-blue-200 shadow-md">
              <div className="flex items-center space-x-3">
                <Mail className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-gray-600 text-sm">Email Subscribers</p>
                  <p className="text-3xl font-bold text-black">{emailSubscribers.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border-2 border-red-200 shadow-md">
              <div className="flex items-center space-x-3">
                <Bell className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-gray-600 text-sm">Push Notification Subscribers</p>
                  <p className="text-3xl font-bold text-black">{notificationSubscribers.length}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Send Push Notifications */}
      <Card className="border-2 border-red-200">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center space-x-2">
            <Send className="w-6 h-6 text-red-600" />
            <span>Send Push Notifications</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-black">Notification Title</label>
            <Input
              placeholder="e.g., Newsline Radio is LIVE!"
              value={notificationTitle}
              onChange={(e) => setNotificationTitle(e.target.value)}
              className="border-blue-300 focus:border-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-black">Notification Message</label>
            <Textarea
              placeholder="e.g., Tune in now for the latest news and updates!"
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
              rows={3}
              className="border-blue-300 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-3">
            <Button
              onClick={sendNotifications}
              disabled={isSending || notificationSubscribers.length === 0}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-6 text-lg"
            >
              <Send className="w-5 h-5 mr-2" />
              {isSending
                ? "Sending..."
                : `Send to ${notificationSubscribers.length} Notification Subscribers`}
            </Button>
            <Button
              onClick={setQuickLiveMessage}
              variant="outline"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-6"
            >
              <Radio className="w-5 h-5 mr-2" />
              Quick: I'm Live
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email Subscribers List */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center space-x-2">
              <Mail className="w-5 h-5 text-blue-600" />
              <span>Email Subscribers ({emailSubscribers.length})</span>
            </CardTitle>
            <Button
              onClick={copyAllEmails}
              variant="outline"
              size="sm"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-gray-500 text-center py-4">Loading subscribers...</p>
          ) : emailSubscribers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No email subscribers yet</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {emailSubscribers.map((subscriber) => (
                <div
                  key={subscriber.id}
                  className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200"
                >
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span className="text-black font-medium">{subscriber.email}</span>
                    <span className="text-xs text-gray-500">
                      {subscriber.subscribedAt?.toDate?.()?.toLocaleDateString() || "Unknown date"}
                    </span>
                  </div>
                  <Button
                    onClick={() => handleDeleteSubscriber(subscriber.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Subscribers List */}
      <Card className="border-2 border-red-200">
        <CardHeader>
          <CardTitle className="text-xl flex items-center space-x-2">
            <Bell className="w-5 h-5 text-red-600" />
            <span>Push Notification Subscribers ({notificationSubscribers.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-gray-500 text-center py-4">Loading subscribers...</p>
          ) : notificationSubscribers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No notification subscribers yet</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {notificationSubscribers.map((subscriber) => (
                <div
                  key={subscriber.id}
                  className="flex items-center justify-between bg-red-50 p-3 rounded-lg border border-red-200"
                >
                  <div className="flex items-center space-x-3">
                    <Bell className="w-4 h-4 text-red-600" />
                    <span className="text-black font-medium text-sm font-mono">
                      {subscriber.fcmToken?.substring(0, 30)}...
                    </span>
                    <span className="text-xs text-gray-500">
                      {subscriber.subscribedAt?.toDate?.()?.toLocaleDateString() || "Unknown date"}
                    </span>
                  </div>
                  <Button
                    onClick={() => handleDeleteSubscriber(subscriber.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
