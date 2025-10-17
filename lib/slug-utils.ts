import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "./firebase"

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

export async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  try {
    const newsRef = collection(db, "news")
    const q = query(newsRef, where("slug", "==", baseSlug))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return baseSlug
    }

    let counter = 1
    let uniqueSlug = `${baseSlug}-${counter}`
    
    while (true) {
      const checkQuery = query(newsRef, where("slug", "==", uniqueSlug))
      const checkSnapshot = await getDocs(checkQuery)
      
      if (checkSnapshot.empty) {
        return uniqueSlug
      }
      
      counter++
      uniqueSlug = `${baseSlug}-${counter}`
      
      if (counter > 100) {
        uniqueSlug = `${baseSlug}-${Date.now()}`
        break
      }
    }
    
    return uniqueSlug
  } catch (error) {
    console.error("Error ensuring unique slug:", error)
    return `${baseSlug}-${Date.now()}`
  }
}

export function getDateParts(dateString?: string): { year: string; month: string; day: string } {
  const date = dateString ? new Date(dateString) : new Date()
  
  return {
    year: date.getFullYear().toString(),
    month: String(date.getMonth() + 1).padStart(2, '0'),
    day: String(date.getDate()).padStart(2, '0'),
  }
}

export function buildArticleUrl(slug: string, publishedAt?: string): string {
  const { year, month, day } = getDateParts(publishedAt)
  return `/article/${year}/${month}/${day}/${slug}`
}
