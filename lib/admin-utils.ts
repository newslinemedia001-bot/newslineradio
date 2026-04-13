import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "./firebase"

// Admin authentication
export const authenticateAdmin = (username: string, password: string) => {
  const adminUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME || "admin"
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "newsline1234"

  return username === adminUsername && password === adminPassword
}

// Schedule management
export const getSchedule = async () => {
  try {
    const scheduleRef = collection(db, "schedule")
    const q = query(scheduleRef, orderBy("startTime"))
    const querySnapshot = await getDocs(q)

    const schedule = []
    querySnapshot.forEach((doc) => {
      schedule.push({ id: doc.id, ...doc.data() })
    })

    return schedule
  } catch (error) {
    console.error("Error getting schedule:", error)
    return []
  }
}

export const addScheduleItem = async (scheduleData: any) => {
  try {
    const scheduleRef = collection(db, "schedule")
    await addDoc(scheduleRef, {
      ...scheduleData,
      isDefault: scheduleData.isDefault || false,
      timestamp: serverTimestamp(),
    })
    return true
  } catch (error) {
    console.error("Error adding schedule item:", error)
    return false
  }
}

export const updateScheduleItem = async (id: string, scheduleData: any) => {
  try {
    const scheduleRef = doc(db, "schedule", id)
    await updateDoc(scheduleRef, {
      ...scheduleData,
      isDefault: scheduleData.isDefault || false,
      updatedAt: serverTimestamp(),
    })
    return true
  } catch (error) {
    console.error("Error updating schedule item:", error)
    return false
  }
}

export const deleteScheduleItem = async (id: string) => {
  try {
    const scheduleRef = doc(db, "schedule", id)
    await deleteDoc(scheduleRef)
    return true
  } catch (error) {
    console.error("Error deleting schedule item:", error)
    return false
  }
}

// Hosts management
export const getHosts = async () => {
  try {
    const hostsRef = collection(db, "hosts")
    const querySnapshot = await getDocs(hostsRef)

    const hosts = []
    querySnapshot.forEach((doc) => {
      hosts.push({ id: doc.id, ...doc.data() })
    })

    return hosts
  } catch (error) {
    console.error("Error getting hosts:", error)
    return []
  }
}

export const addHost = async (hostData: any) => {
  try {
    const hostsRef = collection(db, "hosts")
    await addDoc(hostsRef, {
      ...hostData,
      isDefault: hostData.isDefault || false,
      timestamp: serverTimestamp(),
    })
    return true
  } catch (error) {
    console.error("Error adding host:", error)
    return false
  }
}

export const updateHost = async (id: string, hostData: any) => {
  try {
    const hostRef = doc(db, "hosts", id)
    await updateDoc(hostRef, {
      ...hostData,
      isDefault: hostData.isDefault || false,
      updatedAt: serverTimestamp(),
    })
    return true
  } catch (error) {
    console.error("Error updating host:", error)
    return false
  }
}

export const deleteHost = async (id: string) => {
  try {
    const hostRef = doc(db, "hosts", id)
    await deleteDoc(hostRef)
    return true
  } catch (error) {
    console.error("Error deleting host:", error)
    return false
  }
}

// News management
export const getNews = async () => {
  try {
    const newsRef = collection(db, "news")
    const q = query(newsRef, orderBy("timestamp", "desc"))
    const querySnapshot = await getDocs(q)

    const news = []
    querySnapshot.forEach((doc) => {
      news.push({ id: doc.id, ...doc.data() })
    })

    return news
  } catch (error) {
    console.error("Error getting news:", error)
    return []
  }
}

export const addNews = async (newsData: any) => {
  try {
    const newsRef = collection(db, "news")
    await addDoc(newsRef, {
      ...newsData,
      timestamp: serverTimestamp(),
    })
    return true
  } catch (error) {
    console.error("Error adding news:", error)
    return false
  }
}

export const updateNews = async (id: string, newsData: any) => {
  try {
    const newsRef = doc(db, "news", id)
    await updateDoc(newsRef, {
      ...newsData,
      updatedAt: serverTimestamp(),
    })
    return true
  } catch (error) {
    console.error("Error updating news:", error)
    return false
  }
}

export const deleteNews = async (id: string) => {
  try {
    const newsRef = doc(db, "news", id)
    await deleteDoc(newsRef)
    return true
  } catch (error) {
    console.error("Error deleting news:", error)
    return false
  }
}

// Get contact messages for admin
export const getContactMessages = async (date?: string) => {
  try {
    const contactRef = collection(db, "contacts")
    let q = query(contactRef, orderBy("timestamp", "desc"))

    if (date) {
      q = query(contactRef, where("date", "==", date), orderBy("timestamp", "desc"))
    }

    const querySnapshot = await getDocs(q)

    const messages = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      messages.push({
        id: doc.id,
        email: data.email,
        message: data.message,
        timestamp: data.timestamp,
        date: data.date,
        status: data.status || "unread",
        timeAgo: getTimeAgo(data.timestamp),
      })
    })

    return messages
  } catch (error) {
    console.error("Error getting contact messages:", error)
    return []
  }
}

// Get chat messages for admin
export const getChatMessagesForAdmin = async (date?: string) => {
  try {
    const chatRef = collection(db, "livechat")
    let q = query(chatRef, orderBy("timestamp", "desc"))

    if (date) {
      q = query(chatRef, where("date", "==", date), orderBy("timestamp", "desc"))
    }

    const querySnapshot = await getDocs(q)

    const messages = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      messages.push({
        id: doc.id,
        username: data.username,
        message: data.message,
        timestamp: data.timestamp,
        date: data.date,
        timeAgo: getTimeAgo(data.timestamp),
      })
    })

    return messages
  } catch (error) {
    console.error("Error getting chat messages for admin:", error)
    return []
  }
}

// Mark contact message as read
export const markContactAsRead = async (id: string) => {
  try {
    const contactRef = doc(db, "contacts", id)
    await updateDoc(contactRef, {
      status: "read",
      readAt: serverTimestamp(),
    })
    return true
  } catch (error) {
    console.error("Error marking contact as read:", error)
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
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
  return `${Math.floor(diffInMinutes / 1440)}d ago`
}
