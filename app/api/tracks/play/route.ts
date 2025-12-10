import { NextResponse } from "next/server"
import { recordTrackPlay } from "@/lib/track-stats"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, artist, album, artwork, spotifyId, spotifyUrl, playedAt } = body
    if (!title || !artist) {
      return NextResponse.json({ error: "Missing track data" }, { status: 400 })
    }
    await recordTrackPlay(
      {
        title,
        artist,
        album,
        artwork,
        spotifyId,
        spotifyUrl,
      },
      playedAt ? new Date(playedAt) : new Date(),
    )
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Failed to record track play", error)
    return NextResponse.json({ error: "Unable to record play" }, { status: 500 })
  }
}
