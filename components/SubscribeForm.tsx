"use client"

import { useState } from "react"
import { Bell, Mail, Youtube } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { requestNotificationPermission } from "@/lib/fcm-utils"
import { createSubscriber } from "@/lib/firebase-utils"

export default function SubscribeForm() {
  const [email, setEmail] = useState("")
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [isEnablingNotifications, setIsEnablingNotifications] = useState(false)

  const handleEmailSubscribe = async () => {
    console.log("📧 Starting email subscription process...")
    
    if (!email || !email.includes("@")) {
      console.error("❌ Invalid email:", email)
      toast.error("Please enter a valid email address")
      return
    }

    console.log("📧 Subscribing email:", email)
    setIsSubscribing(true)
    
    try {
      const result = await createSubscriber(email, undefined, "email")
      console.log("📧 Subscription result:", result)
      
      if (result === "success") {
        console.log("✅ Email subscription successful!")
        toast.success("✅ Successfully subscribed to email updates!", {
          description: "You'll receive email notifications when we publish new content or go live!",
          duration: 6000,
        })
        setEmail("")
      } else if (result === "already_subscribed") {
        console.log("ℹ️ Email already subscribed")
        toast.info("Already subscribed!", {
          description: "This email is already on our mailing list. You're all set!",
          duration: 5000,
        })
        setEmail("")
      } else {
        console.error("❌ Email subscription failed")
        toast.error("Failed to subscribe. Please try again.")
      }
    } catch (error) {
      console.error("❌ Error subscribing:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      toast.error("An error occurred while subscribing", {
        description: errorMessage,
        duration: 5000,
      })
    } finally {
      console.log("🏁 Email subscription process completed")
      setIsSubscribing(false)
    }
  }

  const handleNotificationSubscribe = async () => {
    console.log("🔔 Starting push notification enable process...")
    setIsEnablingNotifications(true)
    
    try {
      console.log("🔔 Requesting notification permission...")
      const token = await requestNotificationPermission()
      console.log("🔔 Token received:", token ? "Yes" : "No")
      
      if (token) {
        console.log("🔔 Subscribing with token...")
        const result = await createSubscriber(undefined, token, "notification")
        console.log("🔔 Subscription result:", result)
        
        if (result === "success") {
          console.log("✅ Push notifications enabled successfully!")
          toast.success("🔔 Push Notifications Enabled Successfully!", {
            description: "You'll receive instant push notifications whenever we broadcast live or publish new content!",
            duration: 6000,
          })
        } else if (result === "already_subscribed") {
          console.log("ℹ️ Push notifications already enabled")
          toast.info("Already subscribed!", {
            description: "Push notifications are already enabled for this device. You're all set!",
            duration: 5000,
          })
        } else {
          console.error("❌ Failed to save notification subscription")
          toast.error("Failed to enable notifications", {
            description: "There was an error saving your subscription. Please try again.",
            duration: 5000,
          })
        }
      } else {
        console.error("❌ Could not get notification permission or token")
        toast.error("Could not enable notifications", {
          description: "Please allow notifications in your browser settings and try again.",
          duration: 6000,
        })
      }
    } catch (error) {
      console.error("❌ Error enabling notifications:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      toast.error("An error occurred while enabling notifications", {
        description: errorMessage,
        duration: 5000,
      })
    } finally {
      console.log("🏁 Push notification enable process completed")
      setIsEnablingNotifications(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Main Notification Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-red-50 border-2 border-blue-200 shadow-xl overflow-hidden">
        <CardContent className="p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="bg-red-600 p-3 rounded-full">
                <Bell className="w-8 h-8 text-white animate-pulse" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-black">
              Get Notified When We Go Live!
            </h2>
            <p className="text-gray-700 text-lg">
              Subscribe to receive updates whenever Newsline Radio starts broadcasting.
            </p>
          </div>

          {/* Email Subscription */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-black font-semibold">
              <Mail className="w-5 h-5" />
              <span>Email Updates</span>
            </div>
            <div className="flex gap-3">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleEmailSubscribe()
                  }
                }}
              />
              <Button
                onClick={handleEmailSubscribe}
                disabled={isSubscribing}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6"
              >
                {isSubscribing ? "Subscribing..." : "Subscribe"}
              </Button>
            </div>
          </div>

          {/* Push Notifications */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-black font-semibold">
              <Bell className="w-5 h-5" />
              <span>Push Notifications</span>
            </div>
            <Button
              onClick={handleNotificationSubscribe}
              disabled={isEnablingNotifications}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-6 text-lg"
            >
              <Bell className="w-5 h-5 mr-2" />
              {isEnablingNotifications ? "Enabling..." : "Enable Push Notifications"}
            </Button>
          </div>

          {/* Disclaimer */}
          <p className="text-center text-sm text-gray-600">
            We'll only notify you about live broadcasts. No spam, ever.
          </p>
        </CardContent>
      </Card>

      {/* YouTube Subscription Card */}
      <Card className="bg-gradient-to-br from-red-600 to-red-700 border-2 border-red-800 shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-3 rounded-full">
                <Youtube className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Subscribe to Newsline TV
                </h3>
                <p className="text-red-100">
                  Stay updated with our latest content
                </p>
              </div>
            </div>
            <Button
              onClick={() => window.open("https://www.youtube.com/@newslinetv-i3q", "_blank")}
              className="bg-white hover:bg-gray-100 text-red-600 font-semibold px-6 py-5"
            >
              Subscribe
              <span className="ml-2">→</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
