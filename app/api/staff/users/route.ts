import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth.server"
import { canAccessStaff, type UserRole } from "@/lib/auth"
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

const allowedRoles: UserRole[] = ["listener", "dj", "writer", "staff", "admin"]

export async function PATCH(request: Request) {
  const session = await getSession()
  if (!session || !canAccessStaff(session.user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { userId, displayName, avatar, role } = body ?? {}
    if (!userId) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 })
    }

    const updatePayload: Record<string, unknown> = {}
    if (typeof displayName === "string") {
      const trimmed = displayName.trim()
      if (!trimmed) {
        return NextResponse.json({ error: "Display name cannot be empty" }, { status: 400 })
      }
      updatePayload.displayName = trimmed
    }
    if (typeof avatar === "string") {
      updatePayload.avatar = avatar.trim() || undefined
    }
    if (typeof role === "string") {
      if (!allowedRoles.includes(role as UserRole)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 })
      }
      updatePayload.role = role as UserRole
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: "No changes submitted" }, { status: 400 })
    }

    const updated = await updateUser(userId, updatePayload)

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user: updated })
  } catch (error) {
    console.error("Failed to update user", error)
    return NextResponse.json({ error: "Unable to update user" }, { status: 500 })
  }
}
