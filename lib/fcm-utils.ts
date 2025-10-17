import { getToken, onMessage } from "firebase/messaging"
import { messaging } from "./firebase"

const VAPID_KEY = process.env.VITE_FIREBASE_VAPID_KEY

/**
 * Request notification permission and get FCM token
 * @returns { token: string, error?: string } | null
 */
export async function requestNotificationPermission() {
  try {
    console.log("🔔 Checking browser notification support...")
    console.log("🔔 VAPID Key loaded:", VAPID_KEY ? "Yes (" + VAPID_KEY.substring(0, 20) + "...)" : "NO - MISSING!")
    
    if (!VAPID_KEY) {
      console.error("❌ VAPID key is missing! Check environment variables.")
      return { token: null, error: "vapid_key_missing" }
    }
    
    // Check if browser supports notifications
    if (!("Notification" in window)) {
      console.error("❌ Browser does not support notifications")
      return { token: null, error: "browser_not_supported" }
    }

    console.log("🔔 Current permission status:", Notification.permission)

    // Request permission (this will show the popup if not already decided)
    console.log("🔔 Requesting notification permission...")
    const permission = await Notification.requestPermission()
    console.log("🔔 Permission result:", permission)
    
    if (permission === "granted") {
      console.log("✅ Permission granted! Getting FCM token...")
      
      // Get messaging instance
      const messagingInstance = await messaging
      
      if (!messagingInstance) {
        console.error("❌ Firebase Messaging not supported")
        return { token: null, error: "messaging_not_supported" }
      }

      // Register service worker if not already registered
      if ("serviceWorker" in navigator) {
        console.log("🔔 Registering service worker...")
        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        )
        console.log("✅ Service Worker registered:", registration)

        // Get FCM token
        console.log("🔔 Getting FCM token with VAPID key...")
        const token = await getToken(messagingInstance, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration,
        })

        if (token) {
          console.log("✅ FCM Token obtained:", token.substring(0, 20) + "...")
          return { token, error: null }
        } else {
          console.error("❌ Failed to get FCM token")
          return { token: null, error: "token_generation_failed" }
        }
      } else {
        console.error("❌ Service Worker not supported")
        return { token: null, error: "service_worker_not_supported" }
      }
    } else if (permission === "denied") {
      console.error("❌ Notification permission denied by user")
      return { token: null, error: "permission_denied" }
    } else {
      console.log("⚠️ Notification permission dismissed/default")
      return { token: null, error: "permission_dismissed" }
    }
  } catch (error) {
    console.error("❌ Error getting FCM token:", error)
    return { token: null, error: error instanceof Error ? error.message : "unknown_error" }
  }
}

/**
 * Listen for foreground messages
 */
export async function onMessageListener() {
  const messagingInstance = await messaging
  
  if (!messagingInstance) {
    return Promise.reject("Messaging not supported")
  }

  return new Promise((resolve) => {
    onMessage(messagingInstance, (payload) => {
      console.log("Message received:", payload)
      resolve(payload)
    })
  })
}
