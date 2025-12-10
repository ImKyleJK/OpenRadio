import { NextResponse } from "next/server"
import { searchSpotifyTrack, searchSpotifyTracks } from "@/lib/spotify"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query") || ""
  const artist = searchParams.get("artist") || ""
  const mode = searchParams.get("mode")
  const limit = Number(searchParams.get("limit") || "5")

  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 })
  }

  if (mode === "list") {
    try {
      const tracks = await searchSpotifyTracks(query, limit)
      return NextResponse.json({ results: tracks })
    } catch (error) {
      console.error("Spotify list search error", error)
      return NextResponse.json({ error: "Spotify lookup failed" }, { status: 500 })
    }
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
