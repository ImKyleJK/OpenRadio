import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth.server"
import { getTrackLikeInfo, toggleTrackLike } from "@/lib/track-stats"
import { searchSpotifyTrack } from "@/lib/spotify"
import { fetchNowPlayingInfo } from "@/lib/now-playing"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

async function resolveCurrentTrack(
  override?: { title?: string | null; artist?: string | null; album?: string | null; artwork?: string | null },
) {
  if (override?.title && override?.artist) {
    return {
      title: override.title,
      artist: override.artist,
      album: override.album ?? undefined,
      artwork: override.artwork ?? undefined,
    }
  }

  const nowPlaying = await fetchNowPlayingInfo()
  if (!nowPlaying.songTitle || !nowPlaying.songArtist) {
    return null
  }

  return {
    title: nowPlaying.songTitle,
    artist: nowPlaying.songArtist,
    album: nowPlaying.songAlbum,
    artwork: nowPlaying.artwork,
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const track = await resolveCurrentTrack({
    title: searchParams.get("title"),
    artist: searchParams.get("artist"),
  })

  if (!track) {
    return NextResponse.json({ likeCount: 0, liked: false })
  }

  const session = await getSession()
  const info = await getTrackLikeInfo(track.title, track.artist, session?.user.id)
  return NextResponse.json(info)
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const track = await resolveCurrentTrack(body)
    if (!track) {
      return NextResponse.json({ error: "Unable to determine current track" }, { status: 400 })
    }

    const spotify = await searchSpotifyTrack(track.title, track.artist)
    const result = await toggleTrackLike(
      {
        title: spotify?.title || track.title,
        artist: spotify?.artist || track.artist,
        album: spotify?.album || track.album,
        artwork: spotify?.artwork || track.artwork,
        spotifyId: spotify?.id,
        spotifyUrl: spotify?.url,
      },
      session.user,
    )
    return NextResponse.json(result)
  } catch (error) {
    console.error("Failed to toggle like", error)
    return NextResponse.json({ error: "Unable to update like" }, { status: 500 })
  }
}
