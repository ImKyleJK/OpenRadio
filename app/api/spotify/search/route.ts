import { NextResponse } from "next/server"

let cachedToken: { token: string; expiresAt: number } | null = null

async function getToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return null
  }

  const now = Date.now()
  if (cachedToken && cachedToken.expiresAt > now + 5000) {
    return cachedToken.token
  }

  const params = new URLSearchParams()
  params.append("grant_type", "client_credentials")

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  })

  if (!response.ok) {
    throw new Error("Failed to fetch Spotify token")
  }

  const data = (await response.json()) as { access_token: string; expires_in: number }
  cachedToken = { token: data.access_token, expiresAt: now + data.expires_in * 1000 }
  return cachedToken.token
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query") || ""
  const artist = searchParams.get("artist") || ""

  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 })
  }

  try {
    const token = await getToken()
    if (!token) {
      return NextResponse.json({ error: "Spotify credentials not configured" }, { status: 503 })
    }
    const searchQuery = [query, artist].filter(Boolean).join(" ")
    const response = await fetch(
      `https://api.spotify.com/v1/search?type=track&limit=1&q=${encodeURIComponent(searchQuery)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    if (!response.ok) {
      throw new Error("Spotify search failed")
    }

    const data = await response.json()
    const track = data?.tracks?.items?.[0]
    if (!track) {
      return NextResponse.json({ found: false })
    }

    return NextResponse.json({
      found: true,
      title: track.name,
      artist: track.artists?.map((a: { name: string }) => a.name).join(", "),
      albumArt: track.album?.images?.[0]?.url,
    })
  } catch (error) {
    console.error("Spotify search error", error)
    return NextResponse.json({ error: "Spotify lookup failed" }, { status: 500 })
  }
}
