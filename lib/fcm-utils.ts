import { getToken, onMessage } from "firebase/messaging"
import { messaging } from "./firebase"

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || process.env.VITE_FIREBASE_VAPID_KEY

/**
 * Request notification permission and get FCM token
 */
export async function requestNotificationPermission() {
  try {
    // Check if browser supports notifications
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications")
      return null
    }

    // Request permission
    const permission = await Notification.requestPermission()
    
    if (permission === "granted") {
      // Get messaging instance
      const messagingInstance = await messaging
      
      if (!messagingInstance) {
        console.log("Messaging not supported")
        return null
      }

      // Register service worker if not already registered
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        )
        console.log("Service Worker registered:", registration)

        // Get FCM token
        const token = await getToken(messagingInstance, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration,
        })

        console.log("FCM Token:", token)
        return token
      }
    } else {
      console.log("Notification permission denied")
      return null
    }

    return null
  } catch (error) {
    console.error("Error getting FCM token:", error)
    return null
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
