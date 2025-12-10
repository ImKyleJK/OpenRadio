import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth.server"
import { findUserByDisplayName, countUsers } from "@/lib/users"
import { getFollowerStats, toggleFollow } from "@/lib/dj-follows"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const session = await getSession()
  const { searchParams } = new URL(request.url)
  const displayName = searchParams.get("displayName")

  if (!displayName) {
    return NextResponse.json({ followerCount: 0, canFollow: false })
  }

  const dj = await findUserByDisplayName(displayName)

  if (!dj || dj.role !== "dj") {
    const totalUsers = await countUsers()
    return NextResponse.json({ followerCount: totalUsers, canFollow: false, displayName, isFollowing: false })
  }

  const stats = await getFollowerStats(dj.id)
  const isFollowing = Boolean(session?.user?.id && stats.followers.some((f) => f.userId === session.user.id))

  return NextResponse.json({
    followerCount: stats.count,
    canFollow: Boolean(session?.user?.id),
    isFollowing,
    djId: dj.id,
    displayName: dj.displayName,
  })
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const displayName = body?.displayName
  if (!displayName) {
    return NextResponse.json({ error: "Missing DJ" }, { status: 400 })
  }

  const dj = await findUserByDisplayName(displayName)
  if (!dj || dj.role !== "dj") {
    return NextResponse.json({ error: "DJ not found" }, { status: 404 })
  }

  const result = await toggleFollow({ djId: dj.id, userId: session.user.id, displayName: session.user.displayName })
  return NextResponse.json({ followerCount: result.count, isFollowing: result.isFollowing, djId: dj.id })
}
