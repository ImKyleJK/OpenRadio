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
  isBuffering: boolean
  volume: number
  isMuted: boolean
  isLive: boolean
  isLoadingNowPlaying: boolean
  hasLoadedNowPlaying: boolean
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
  const [isBuffering, setIsBuffering] = useState(false)
  const [volume, setVolumeState] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)
  const [isLive, setIsLive] = useState(true)
  const [isLoadingNowPlaying, setIsLoadingNowPlaying] = useState(true)
  const [hasLoadedNowPlaying, setHasLoadedNowPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [currentShow, setCurrentShow] = useState<Show | null>(null)
  const [recentTracks, setRecentTracks] = useState<Track[]>([])
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
      setIsBuffering(true)
      initializeAudio()
      audioContextRef.current?.resume().catch(console.error)
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true)
        })
        .catch((error) => {
          console.error("Playback failed", error)
          setIsBuffering(false)
        })
    }
    if (isPlaying) {
      setIsPlaying(false)
    }
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

  const setFallbackNowPlaying = useCallback(() => {
    setIsLive(true)
    setCurrentTrack((prev) => ({
      title: prev?.title || "Live Stream",
      artist: prev?.artist || stationConfig.name,
      artwork: prev?.artwork || stationConfig.logo || undefined,
    }))
    setCurrentShow((prev) => ({
      name: prev?.name || "Live",
      dj: prev?.dj || stationConfig.name,
      startTime: prev?.startTime || "",
      endTime: prev?.endTime || "",
      artwork: prev?.artwork || stationConfig.logo || undefined,
    }))
    if (!recentTracks.length) {
      setRecentTracks([
        { title: "Live Stream", artist: stationConfig.name, artwork: stationConfig.logo || undefined },
        { title: "Station IDs", artist: stationConfig.name, artwork: stationConfig.logo || undefined },
        { title: "Music Mix", artist: stationConfig.name, artwork: stationConfig.logo || undefined },
      ])
    }
  }, [recentTracks.length])

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
    if (!stationConfig.azuracastApiUrl) {
      setFallbackNowPlaying()
      setIsLoadingNowPlaying(false)
      setHasLoadedNowPlaying(true)
      return
    }
    if (!hasLoadedNowPlaying) {
      setIsLoadingNowPlaying(true)
    }

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

      if (!match) {
        setFallbackNowPlaying()
        setIsLoadingNowPlaying(false)
        return
      }

      const nowPlaying = match.now_playing || {}
      const live = match.live || {}
      const listenersCount = match.listeners?.current ?? listeners
      const song = nowPlaying.song || {}

      setIsLive(Boolean(live.is_live))
      setCurrentTrack({
        title: song.title || song.text || "Unknown Track",
        artist: song.artist || "Unknown Artist",
        album: song.album,
        artwork: song.art || currentTrack?.artwork || stationConfig.logo,
        duration: nowPlaying.duration,
        elapsed: nowPlaying.elapsed,
      })

      setCurrentShow({
        name: live.is_live ? live.streamer_name || "Live DJ" : "AutoDJ",
        dj: live.streamer_name || "AutoDJ",
        startTime: live.is_live ? "Live now" : "",
        endTime: live.is_live ? "" : "",
        description: live.is_live ? "Broadcasting live" : "Automated playlist",
        artwork: song.art || currentShow?.artwork || stationConfig.logo,
      })

      if (Array.isArray(match.song_history)) {
        const recent = match.song_history
          .slice(0, 5)
          .map((item: any) => ({
            title: item.song?.title || item.song?.text || "Unknown Track",
            artist: item.song?.artist || "Unknown Artist",
            artwork: item.song?.art || stationConfig.logo,
            duration: item.duration,
            elapsed: item.elapsed,
          }))
        setRecentTracks(recent)
      }

      setListeners(listenersCount)
      setHasLoadedNowPlaying(true)
    } catch (error) {
      console.error("Failed to load now playing data", error)
      setFallbackNowPlaying()
      setHasLoadedNowPlaying(true)
    } finally {
      setIsLoadingNowPlaying(false)
    }
  }, [currentShow, currentTrack, deriveStationShortcode, hasLoadedNowPlaying, listeners, setFallbackNowPlaying, streamUrl])

  // Simulate listener count updates
  useEffect(() => {
    fetchNowPlaying()
    const interval = setInterval(fetchNowPlaying, 20000)
    return () => clearInterval(interval)
  }, [fetchNowPlaying])

  useEffect(() => {
    const audioEl = audioRef.current
    if (!audioEl) return

    const handlePlaying = () => {
      setIsBuffering(false)
      setIsPlaying(true)
    }
    const handleWaiting = () => setIsBuffering(true)
    const handleCanPlay = () => setIsBuffering(false)
    const handlePause = () => {
      setIsPlaying(false)
      setIsBuffering(false)
    }
    const handleEnded = () => {
      setIsPlaying(false)
      setIsBuffering(false)
    }
    const handleError = () => {
      setIsPlaying(false)
      setIsBuffering(false)
    }

    audioEl.addEventListener("playing", handlePlaying)
    audioEl.addEventListener("waiting", handleWaiting)
    audioEl.addEventListener("canplay", handleCanPlay)
    audioEl.addEventListener("pause", handlePause)
    audioEl.addEventListener("ended", handleEnded)
    audioEl.addEventListener("error", handleError)

    return () => {
      audioEl.removeEventListener("playing", handlePlaying)
      audioEl.removeEventListener("waiting", handleWaiting)
      audioEl.removeEventListener("canplay", handleCanPlay)
      audioEl.removeEventListener("pause", handlePause)
      audioEl.removeEventListener("ended", handleEnded)
      audioEl.removeEventListener("error", handleError)
    }
  }, [])

  return (
    <RadioContext.Provider
      value={{
        isPlaying,
        isBuffering,
        volume,
        isMuted,
        isLive,
        isLoadingNowPlaying,
        hasLoadedNowPlaying,
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
