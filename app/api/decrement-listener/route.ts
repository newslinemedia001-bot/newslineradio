import { type NextRequest, NextResponse } from "next/server"
import { doc, updateDoc, increment } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function POST(request: NextRequest) {
  try {
    const statsRef = doc(db, "stats", "listeners")
    await updateDoc(statsRef, {
      currentListeners: increment(-1),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error decrementing listener count:", error)
    return NextResponse.json({ error: "Failed to decrement listener count" }, { status: 500 })
  }
}
