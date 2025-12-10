"use server"

import { stationConfig } from "@/lib/station-config"

export interface NowPlayingInfo {
  listeners: number
  isLive: boolean
  showName: string
  djName: string
  startTime?: string
  endTime?: string
  songTitle?: string
  songArtist?: string
  songAlbum?: string
  artwork?: string
}

const FALLBACK: NowPlayingInfo = {
  listeners: 0,
  isLive: false,
  showName: "Live Stream",
  djName: stationConfig.name,
  songTitle: "Live Stream",
  songArtist: stationConfig.name,
  artwork: stationConfig.logo,
}

const sanitizeUrl = (url?: string | null) => (url ? url.replace(/\/$/, "") : "")

function deriveStationShortcode(url: string | undefined) {
  if (!url) return null
  try {
    const parsed = new URL(url)
    const parts = parsed.pathname.split("/").filter(Boolean)
    const listenIndex = parts.findIndex((p) => p === "listen")
    if (listenIndex >= 0 && parts[listenIndex + 1]) {
      return parts[listenIndex + 1]
    }
    return parts[0] || null
  } catch {
    return null
  }
}

export async function fetchNowPlayingInfo(): Promise<NowPlayingInfo> {
  if (!stationConfig.azuracastApiUrl) {
    return FALLBACK
  }

  try {
    const res = await fetch(`${sanitizeUrl(stationConfig.azuracastApiUrl)}/nowplaying`, {
      cache: "no-store",
      next: { revalidate: 5 },
    })
    if (!res.ok) return FALLBACK
    const data = await res.json()
    const entries = Array.isArray(data) ? data : [data]

    const shortcode =
      deriveStationShortcode(stationConfig.streamUrl) || stationConfig.name.toLowerCase().replace(/\s+/g, "-")
    const match =
      entries.find((entry: any) => entry?.station?.shortcode === shortcode) ||
      entries.find((entry: any) => entry?.station?.name?.toLowerCase().includes(shortcode)) ||
      entries[0]

    if (!match) return FALLBACK

    const nowPlaying = match.now_playing || {}
    const live = match.live || {}
    const song = nowPlaying.song || {}

    return {
      listeners: match.listeners?.current ?? FALLBACK.listeners,
      isLive: Boolean(live.is_live),
      showName: live.is_live ? live.streamer_name || "Live DJ" : "AutoDJ",
      djName: live.streamer_name || "AutoDJ",
      startTime: live.is_live ? live.connected_on : undefined,
      endTime: live.is_live ? live.disconnect_expected_at : undefined,
      songTitle: song.title || song.text || FALLBACK.songTitle,
      songArtist: song.artist || FALLBACK.songArtist,
      songAlbum: song.album,
      artwork: song.art || FALLBACK.artwork,
    }
  } catch {
    return FALLBACK
  }
}
