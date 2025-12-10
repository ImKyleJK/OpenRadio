"use client"

import type React from "react"

import { createContext, useContext, useState, useRef, useEffect, useCallback, type ReactNode } from "react"
import { stationConfig } from "@/lib/station-config"

interface Track {
  title: string
  artist: string
  album?: string
  artwork?: string
  duration?: number
  elapsed?: number
}

interface Show {
  name: string
  dj: string
  startTime: string
  endTime: string
  description?: string
  artwork?: string
}

interface ActiveListener {
  id: string
  username: string
  avatar: string
  listeningFor: number // minutes
}

interface RadioContextType {
  isPlaying: boolean
  volume: number
  isMuted: boolean
  isLive: boolean
  currentTrack: Track | null
  currentShow: Show | null
  recentTracks: Track[]
  listeners: number
  activeListeners: ActiveListener[] // Added active listeners
  visualizerEnabled: boolean // Added visualizer toggle state
  audioRef: React.RefObject<HTMLAudioElement | null>
  analyserRef: React.RefObject<AnalyserNode | null>
  togglePlay: () => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  toggleVisualizer: () => void // Added visualizer toggle function
}

const RadioContext = createContext<RadioContextType | null>(null)

export function useRadio() {
  const context = useContext(RadioContext)
  if (!context) {
    throw new Error("useRadio must be used within RadioProvider")
  }
  return context
}

// Mock data - in production this would come from AzuraCast API
const mockCurrentTrack: Track = {
  title: "Midnight City",
  artist: "M83",
  album: "Hurry Up, We're Dreaming",
  artwork: "/album-art-synthwave-city-night.jpg",
  duration: 240,
  elapsed: 120,
}

const mockCurrentShow: Show = {
  name: "Night Vibes",
  dj: "DJ Luna",
  startTime: "22:00",
  endTime: "02:00",
  description: "Late night electronic and ambient music to help you unwind.",
  artwork: "/dj-headphones-neon.jpg",
}

const mockRecentTracks: Track[] = [
  { title: "Blinding Lights", artist: "The Weeknd", artwork: "/album-cover-retro-sunset.jpg" },
  { title: "Breathe", artist: "Télépopmusik", artwork: "/album-cover-dreamy-clouds.jpg" },
  { title: "Digital Love", artist: "Daft Punk", artwork: "/album-cover-robots-electronic.jpg" },
  { title: "Innerbloom", artist: "RÜFÜS DU SOL", artwork: "/album-cover-desert-bloom.jpg" },
  { title: "Sunset Lover", artist: "Petit Biscuit", artwork: "/album-cover-ocean-sunset.jpg" },
]

const mockActiveListeners: ActiveListener[] = [
  { id: "1", username: "MusicLover23", avatar: "/user-avatar-woman-smiling.jpg", listeningFor: 45 },
  { id: "2", username: "NightOwl", avatar: "/user-avatar-man-headphones.jpg", listeningFor: 32 },
  { id: "3", username: "BeatJunkie", avatar: "/user-avatar-young-person.jpg", listeningFor: 28 },
  { id: "4", username: "ChillVibes", avatar: "/user-avatar-casual.jpg", listeningFor: 21 },
  { id: "5", username: "SynthFan", avatar: "/user-avatar-glasses.jpg", listeningFor: 18 },
  { id: "6", username: "RetroWave", avatar: "/user-avatar-cool.jpg", listeningFor: 15 },
  { id: "7", username: "MidnightDJ", avatar: "/user-avatar-dj.jpg", listeningFor: 12 },
  { id: "8", username: "ElectronicSoul", avatar: "/user-avatar-music-fan.jpg", listeningFor: 9 },
  { id: "9", username: "WaveRider", avatar: "/user-avatar-surfer.jpg", listeningFor: 7 },
  { id: "10", username: "NeonDreams", avatar: "/user-avatar-neon-style.jpg", listeningFor: 5 },
  { id: "11", username: "BassDrop", avatar: "/user-avatar-bass-player.jpg", listeningFor: 3 },
  { id: "12", username: "AmbientZone", avatar: "/user-avatar-relaxed.jpg", listeningFor: 2 },
]

export function RadioProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolumeState] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)
  const [isLive, setIsLive] = useState(true)
  const [currentTrack, setCurrentTrack] = useState<Track | null>(mockCurrentTrack)
  const [currentShow, setCurrentShow] = useState<Show | null>(mockCurrentShow)
  const [recentTracks, setRecentTracks] = useState<Track[]>(mockRecentTracks)
  const [listeners, setListeners] = useState(127)
  const [activeListeners, setActiveListeners] = useState<ActiveListener[]>(mockActiveListeners) //
  const [visualizerEnabled, setVisualizerEnabled] = useState(true) //

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null)

  // Stream URL would come from .env in production
  const streamUrl = stationConfig.streamUrl

  const initializeAudio = useCallback(() => {
    if (!audioRef.current || audioContextRef.current) return
    audioRef.current.crossOrigin = "anonymous"

    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const audioContext = new AudioContextClass()
    const analyser = audioContext.createAnalyser()
    analyser.fftSize = 512
    analyser.smoothingTimeConstant = 0.75

    const source = audioContext.createMediaElementSource(audioRef.current)
    source.connect(analyser)
    analyser.connect(audioContext.destination)

    audioContextRef.current = audioContext
    analyserRef.current = analyser
    sourceNodeRef.current = source
  }, [])

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      initializeAudio()
      audioContextRef.current?.resume().catch(console.error)
      audioRef.current.play().catch(console.error)
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying, initializeAudio])

  const setVolume = useCallback(
    (newVolume: number) => {
      setVolumeState(newVolume)
      if (audioRef.current) {
        audioRef.current.volume = newVolume
      }
      if (newVolume > 0 && isMuted) {
        setIsMuted(false)
      }
    },
    [isMuted],
  )

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
    }
    setIsMuted(!isMuted)
  }, [isMuted])

  const toggleVisualizer = useCallback(() => {
    setVisualizerEnabled((prev) => !prev)
  }, [])

  const deriveStationShortcode = useCallback((url: string | undefined) => {
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
  }, [])

  const fetchNowPlaying = useCallback(async () => {
    if (!stationConfig.azuracastApiUrl) return

    try {
      const res = await fetch(`${stationConfig.azuracastApiUrl.replace(/\/$/, "")}/nowplaying`, {
        cache: "no-store",
      })
      const data = await res.json()
      const entries = Array.isArray(data) ? data : [data]

      const shortcode = deriveStationShortcode(streamUrl) || stationConfig.name.toLowerCase().replace(/\s+/g, "-")
      const match =
        entries.find((entry: any) => entry?.station?.shortcode === shortcode) ||
        entries.find((entry: any) => entry?.station?.name?.toLowerCase().includes(shortcode)) ||
        entries[0]

      if (!match) return

      const nowPlaying = match.now_playing || {}
      const live = match.live || {}
      const listenersCount = match.listeners?.current ?? listeners
      const song = nowPlaying.song || {}

      setIsLive(Boolean(live.is_live))
      setCurrentTrack({
        title: song.title || song.text || "Unknown Track",
        artist: song.artist || "Unknown Artist",
        album: song.album,
        artwork: song.art || currentTrack?.artwork,
        duration: nowPlaying.duration,
        elapsed: nowPlaying.elapsed,
      })

      setCurrentShow({
        name: live.is_live ? live.streamer_name || "Live DJ" : "AutoDJ",
        dj: live.streamer_name || "AutoDJ",
        startTime: live.is_live ? "Live now" : "",
        endTime: live.is_live ? "" : "",
        description: live.is_live ? "Broadcasting live" : "Automated playlist",
        artwork: song.art || currentShow?.artwork,
      })

      if (Array.isArray(match.song_history)) {
        const recent = match.song_history
          .slice(0, 5)
          .map((item: any) => ({
            title: item.song?.title || item.song?.text || "Unknown Track",
            artist: item.song?.artist || "Unknown Artist",
            artwork: item.song?.art,
            duration: item.duration,
            elapsed: item.elapsed,
          }))
        setRecentTracks(recent)
      }

      setListeners(listenersCount)
    } catch (error) {
      console.error("Failed to load now playing data", error)
    }
  }, [currentShow?.artwork, currentTrack?.artwork, deriveStationShortcode, listeners, streamUrl])

  // Simulate listener count updates
  useEffect(() => {
    fetchNowPlaying()
    const interval = setInterval(fetchNowPlaying, 20000)
    return () => clearInterval(interval)
  }, [fetchNowPlaying])

  return (
    <RadioContext.Provider
      value={{
        isPlaying,
        volume,
        isMuted,
        isLive,
        currentTrack,
        currentShow,
        recentTracks,
        listeners,
        activeListeners, //
        visualizerEnabled, //
        audioRef,
        analyserRef,
        togglePlay,
        setVolume,
        toggleMute,
        toggleVisualizer, //
      }}
    >
      {children}
      <audio ref={audioRef} src={streamUrl} preload="none" crossOrigin="anonymous" />
    </RadioContext.Provider>
  )
}
