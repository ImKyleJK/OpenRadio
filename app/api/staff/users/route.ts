import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth.server"
import { canAccessStaff } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"
import { updateUser } from "@/lib/users"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const session = await getSession()
  if (!session || !canAccessStaff(session.user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const query = (searchParams.get("q") || "").trim()
  const db = await getDb()
  const collection = db.collection("users")

  const filter = query
    ? {
        $or: [
          { displayName: { $regex: query, $options: "i" } },
          { email: { $regex: query, $options: "i" } },
          { username: { $regex: query, $options: "i" } },
        ],
      }
    : {}

  const docs = await collection
    .find(filter, { projection: { passwordHash: 0 } })
    .limit(25)
    .sort({ createdAt: -1 })
    .toArray()

  const users = docs.map((doc) => ({
    id: doc._id.toString(),
    displayName: doc.displayName,
    email: doc.email,
    avatar: doc.avatar ?? null,
    role: doc.role,
    username: doc.username,
  }))

  return NextResponse.json({ users })
}

export async function PATCH(request: Request) {
  const session = await getSession()
  if (!session || !canAccessStaff(session.user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { userId, displayName, avatar } = body ?? {}
    if (!userId || !displayName?.trim()) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const updated = await updateUser(userId, {
      displayName: displayName.trim(),
      avatar: avatar?.trim() || undefined,
      role: "dj",
    })

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user: updated })
  } catch (error) {
    console.error("Failed to update DJ", error)
    return NextResponse.json({ error: "Unable to update user" }, { status: 500 })
  }
}
