import { initializeApp, getApps } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAnalytics } from "firebase/analytics"
import { getMessaging, isSupported } from "firebase/messaging"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://demo-project.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX",
}

// Initialize Firebase (avoid duplicate initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Initialize Firestore
export const db = getFirestore(app)

// Initialize Analytics (only in browser and if not demo config)
export const analytics = 
  typeof window !== "undefined" && 
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && 
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== "demo-project"
    ? getAnalytics(app) 
    : null

// Initialize Messaging (only in browser and if supported)
export const messaging = 
  typeof window !== "undefined" && 
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && 
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== "demo-project"
    ? (async () => {
        try {
          const supported = await isSupported()
          return supported ? getMessaging(app) : null
        } catch (err) {
          console.error("Messaging not supported:", err)
          return null
        }
      })()
    : null

export default app
