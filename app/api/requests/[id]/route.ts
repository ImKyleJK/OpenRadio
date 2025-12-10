import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth.server"
import { updateSongRequestStatus, SongRequestStatus } from "@/lib/song-requests"
import { hasRole } from "@/lib/auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getSession()
  if (!session || !hasRole(session.user, ["dj", "staff", "admin"])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = params
  if (!id) {
    return NextResponse.json({ error: "Missing request id" }, { status: 400 })
  }

  try {
    const body = await request.json()
    const status = body?.status as SongRequestStatus
    if (!["pending", "played", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }
    const updated = await updateSongRequestStatus(id, status)
    if (!updated) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }
    return NextResponse.json({ request: updated })
  } catch (error) {
    console.error("Failed to update request", error)
    return NextResponse.json({ error: "Unable to update request" }, { status: 500 })
  }
}
