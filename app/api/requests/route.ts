import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth.server"
import { createSongRequest, listSongRequests, SongRequestKind, SongRequestTrack } from "@/lib/song-requests"
import { hasRole } from "@/lib/auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getSession()
  if (!session || !hasRole(session.user, ["dj", "staff", "admin"])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const requests = await listSongRequests()
  return NextResponse.json({ requests })
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    const body = await request.json()
    const kind: SongRequestKind = body?.kind === "message" ? "message" : "song"
    const message = typeof body?.message === "string" ? body.message.trim() : ""
    const track = body?.track

    if (kind === "song") {
      if (!track || typeof track?.title !== "string" || typeof track?.artist !== "string") {
        return NextResponse.json({ error: "Track information is required" }, { status: 400 })
      }
    } else if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    let sanitizedTrack: SongRequestTrack | undefined
    if (kind === "song") {
      const title = typeof track?.title === "string" ? track.title.trim() : ""
      const artist = typeof track?.artist === "string" ? track.artist.trim() : ""
      if (!title || !artist) {
        return NextResponse.json({ error: "Track information is required" }, { status: 400 })
      }
      sanitizedTrack = {
        title,
        artist,
        album: typeof track?.album === "string" ? track.album.trim() : undefined,
        artwork: typeof track?.artwork === "string" ? track.artwork : undefined,
        spotifyId: typeof track?.spotifyId === "string" ? track.spotifyId : undefined,
      }
    }

    let requester
    if (session) {
      requester = {
        type: "user" as const,
        name: session.user.displayName,
        email: session.user.email,
        userId: session.user.id,
        avatar: session.user.avatar,
      }
    } else {
      const guestName = typeof body?.guestName === "string" ? body.guestName.trim() : ""
      const guestEmail = typeof body?.guestEmail === "string" ? body.guestEmail.trim() : ""
      if (!guestName || !guestEmail) {
        return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(guestEmail.toLowerCase())) {
        return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
      }
      requester = {
        type: "guest" as const,
        name: guestName,
        email: guestEmail.toLowerCase(),
      }
    }

    const newRequest = await createSongRequest({
      kind,
      track: kind === "song" ? sanitizedTrack : undefined,
      message: message || undefined,
      requester,
    })

    return NextResponse.json({ request: newRequest })
  } catch (error) {
    console.error("Failed to create request", error)
    return NextResponse.json({ error: "Unable to submit request" }, { status: 500 })
  }
}
