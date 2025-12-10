import { NextResponse } from "next/server"
import { searchSpotifyTrack } from "@/lib/spotify"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query") || ""
  const artist = searchParams.get("artist") || ""

  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 })
  }

  try {
    const track = await searchSpotifyTrack(query, artist)
    if (!track) {
      return NextResponse.json({ found: false })
    }

    return NextResponse.json({
      found: true,
      title: track.title,
      artist: track.artist,
      albumArt: track.artwork,
      spotifyId: track.id,
      spotifyUrl: track.url,
    })
  } catch (error) {
    console.error("Spotify search error", error)
    return NextResponse.json({ error: "Spotify lookup failed" }, { status: 500 })
  }
}
