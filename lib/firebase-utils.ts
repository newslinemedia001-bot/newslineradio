import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore"
import { db } from "./firebase"

// Listener tracking
export const trackListener = async () => {
  try {
    const statsRef = doc(db, "stats", "listeners")
    const statsDoc = await getDoc(statsRef)

    if (statsDoc.exists()) {
      const currentData = statsDoc.data()
      const newListenerCount = (currentData.currentListeners || 0) + 1

      const updateData: any = {
        currentListeners: increment(1),
        totalVisits: increment(1),
        lastUpdated: serverTimestamp(),
      }

      if (newListenerCount > (currentData.peakListeners24h || 0)) {
        updateData.peakListeners24h = newListenerCount
        updateData.peakTimestamp = serverTimestamp()
      }

      await updateDoc(statsRef, updateData)
    } else {
      await setDoc(statsRef, {
        currentListeners: 1,
        totalVisits: 1,
        peakListeners24h: 1,
        peakTimestamp: serverTimestamp(),
        lastUpdated: serverTimestamp(),
      })
    }
  } catch (error) {
    console.error("Error tracking listener:", error)
  }
}

export const decrementListener = async () => {
  try {
    const statsRef = doc(db, "stats", "listeners")
    const statsDoc = await getDoc(statsRef)

    if (statsDoc.exists()) {
      const currentData = statsDoc.data()
      const currentListeners = Math.max(0, (currentData.currentListeners || 0) - 1)

      await updateDoc(statsRef, {
        currentListeners: currentListeners,
        lastUpdated: serverTimestamp(),
      })
    }
  } catch (error) {
    console.error("Error decrementing listener:", error)
  }
}

// Get current stats
export const getStats = async () => {
  try {
    const statsRef = doc(db, "stats", "listeners")
    const statsDoc = await getDoc(statsRef)

    if (statsDoc.exists()) {
      return statsDoc.data()
    }
    return {
      currentListeners: 0,
      peakListeners24h: 0,
      totalLikes24h: 0,
    }
  } catch (error) {
    console.error("Error getting stats:", error)
    return {
      currentListeners: 0,
      peakListeners24h: 0,
      totalLikes24h: 0,
    }
  }
}

// Like functionality
export const toggleLike = async (userId: string) => {
  try {
    const likeRef = doc(db, "likes", userId)
    const likeDoc = await getDoc(likeRef)

    const statsRef = doc(db, "stats", "listeners")
    const statsDoc = await getDoc(statsRef)

    const currentStats = statsDoc.exists() ? statsDoc.data() : { totalLikes24h: 0 }

    if (likeDoc.exists() && likeDoc.data().liked) {
      // Unlike - only decrement if current likes > 0
      await setDoc(likeRef, {
        liked: false,
        timestamp: serverTimestamp(),
      })

      if ((currentStats.totalLikes24h || 0) > 0) {
        await updateDoc(statsRef, {
          totalLikes24h: increment(-1),
        })
      }
      return false
    } else {
      // Like
      await setDoc(likeRef, {
        liked: true,
        timestamp: serverTimestamp(),
      })
      await updateDoc(statsRef, {
        totalLikes24h: increment(1),
      })
      return true
    }
  } catch (error) {
    console.error("Error toggling like:", error)
    return false
  }
}

// Check if user has liked
export const checkUserLike = async (userId: string) => {
  try {
    const likeRef = doc(db, "likes", userId)
    const likeDoc = await getDoc(likeRef)

    if (likeDoc.exists()) {
      return likeDoc.data().liked || false
    }
    return false
  } catch (error) {
    console.error("Error checking user like:", error)
    return false
  }
}

// Live Chat functionality
export const sendChatMessage = async (username: string, message: string) => {
  try {
    const chatRef = collection(db, "livechat")
    await addDoc(chatRef, {
      username,
      message,
      timestamp: serverTimestamp(),
      date: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
    })
    return true
  } catch (error) {
    console.error("Error sending chat message:", error)
    return false
  }
}

// Get recent chat messages
export const getChatMessages = async (limitCount = 20) => {
  try {
    const chatRef = collection(db, "livechat")
    const q = query(chatRef, orderBy("timestamp", "desc"), limit(limitCount))
    const querySnapshot = await getDocs(q)

    const messages: any[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      messages.push({
        id: doc.id,
        username: data.username,
        message: data.message,
        timestamp: data.timestamp,
        timeAgo: getTimeAgo(data.timestamp),
      })
    })

    return messages.reverse() // Show oldest first
  } catch (error) {
    console.error("Error getting chat messages:", error)
    return []
  }
}

// Contact form functionality
export const sendContactMessage = async (email: string, message: string) => {
  try {
    const contactRef = collection(db, "contacts")
    await addDoc(contactRef, {
      email,
      message,
      timestamp: serverTimestamp(),
      date: new Date().toISOString().split("T")[0],
      status: "unread",
    })
    return true
  } catch (error) {
    console.error("Error sending contact message:", error)
    return false
  }
}

// Helper function to calculate time ago
const getTimeAgo = (timestamp: any) => {
  if (!timestamp) return "now"

  const now = new Date()
  const messageTime = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return "now"
  if (diffInMinutes < 60) return `${diffInMinutes}m`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`
  return `${Math.floor(diffInMinutes / 1440)}d`
}

// Generate unique user ID for session
export const generateUserId = () => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Generate random username for anonymous users
export const generateRandomUsername = () => {
  const adjectives = ["Cool", "Happy", "Smart", "Quick", "Bright", "Kind", "Bold", "Swift", "Calm", "Wise"]
  const nouns = ["Listener", "Fan", "User", "Guest", "Friend", "Voice", "Star", "Wave", "Beat", "Tune"]

  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const number = Math.floor(Math.random() * 999) + 1

  return `${adjective}${noun}${number}`
}

export const resetDailyStats = async () => {
  try {
    const statsRef = doc(db, "stats", "listeners")
    const statsDoc = await getDoc(statsRef)

    if (statsDoc.exists()) {
      const data = statsDoc.data()
      const lastReset = data.lastReset ? data.lastReset.toDate() : new Date(0)
      const now = new Date()
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

      if (lastReset < oneDayAgo) {
        await updateDoc(statsRef, {
          totalLikes24h: 0,
          peakListeners24h: Math.max(data.currentListeners || 0, 0), // Start fresh but don't go below current
          lastReset: serverTimestamp(),
        })
      }
    }
  } catch (error) {
    console.error("Error resetting daily stats:", error)
  }
}

// Subscriber management functions

/**
 * Create a subscriber (email or notification)
 */
export const createSubscriber = async (email?: string, fcmToken?: string, type: "email" | "notification" = "email") => {
  try {
    // Create deterministic ID based on email or token
    const subscriberId = email 
      ? `email_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}` 
      : `fcm_${fcmToken?.substring(0, 20) || 'unknown'}`
    
    const subscriberRef = doc(db, "subscribers", subscriberId)
    
    await setDoc(subscriberRef, {
      email: email || null,
      fcmToken: fcmToken || null,
      type: type,
      subscribedAt: serverTimestamp(),
    })
    
    return true
  } catch (error) {
    console.error("Error creating subscriber:", error)
    return false
  }
}

/**
 * Get all subscribers
 */
export const getSubscribers = async () => {
  try {
    const subscribersRef = collection(db, "subscribers")
    const q = query(subscribersRef, orderBy("subscribedAt", "desc"))
    const querySnapshot = await getDocs(q)
    
    const subscribers: any[] = []
    querySnapshot.forEach((doc) => {
      subscribers.push({
        id: doc.id,
        ...doc.data(),
      })
    })
    
    return subscribers
  } catch (error) {
    console.error("Error getting subscribers:", error)
    return []
  }
}

/**
 * Delete a subscriber
 */
export const deleteSubscriber = async (subscriberId: string) => {
  try {
    const subscriberRef = doc(db, "subscribers", subscriberId)
    await setDoc(subscriberRef, { deleted: true }, { merge: true })
    return true
  } catch (error) {
    console.error("Error deleting subscriber:", error)
    return false
  }
}
