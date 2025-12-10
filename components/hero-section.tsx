"use client"

import { useEffect, useMemo, useState } from "react"
import { useRadio } from "@/context/radio-context"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2, VolumeX, Heart, Users, Radio, Share2, BarChart3, Hand, UserPlus } from "lucide-react"
import Image from "next/image"
import { RequestModal } from "@/components/request-modal"
import { BackgroundVisualizer } from "@/components/background-visualizer"
import { stationConfig } from "@/lib/station-config"

export function HeroSection() {
  const {
    isPlaying,
    isBuffering,
    togglePlay,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    currentShow,
    currentTrack,
    isLive,
    listeners,
    isLoadingNowPlaying,
    hasLoadedNowPlaying,
    visualizerMode,
    cycleVisualizer,
  } = useRadio()
  const { user } = useAuth()

  const [requestModalOpen, setRequestModalOpen] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [isLiking, setIsLiking] = useState(false)
  const [followStats, setFollowStats] = useState({ count: 0, isFollowing: false, canFollow: false, displayName: "" })
  const [followLoading, setFollowLoading] = useState(false)
  const [albumTilt, setAlbumTilt] = useState({ rotateX: 0, rotateY: 0 })
  const BASE_ALBUM_TILT_X = -8
  const BASE_ALBUM_TILT_Y = -4
  const { toast } = useToast()

  const trackArtwork = hasLoadedNowPlaying ? currentTrack?.artwork : undefined
  const backgroundImage = currentTrack?.artwork || currentShow?.artwork || "/abstract-music-waves.png"
  const djArtwork = isLive
    ? currentShow?.artwork || trackArtwork || stationConfig.logo || "/placeholder.svg"
    : stationConfig.logo || trackArtwork || "/placeholder.svg"
  const trackTitle = currentTrack?.title
  const trackArtist = currentTrack?.artist
  const isAutoDJ = (currentShow?.dj || "").toLowerCase() === "autodj"

  useEffect(() => {
    if (!hasLoadedNowPlaying) return
    setLiked(false)
    setLikeCount(0)
    const controller = new AbortController()
    const fetchLikes = async () => {
      try {
        const res = await fetch(`/api/tracks/like`, { signal: controller.signal })
        if (!res.ok) return
        const data = await res.json()
        setLiked(Boolean(data.liked))
        setLikeCount(data.likeCount || 0)
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Failed to load like info", error)
        }
      }
    }
    void fetchLikes()
    return () => controller.abort()
  }, [trackTitle, trackArtist, hasLoadedNowPlaying])

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      const { innerWidth, innerHeight } = window
      const rotateY = ((event.clientX / innerWidth - 0.5) * -10) || 0
      const rotateX = ((event.clientY / innerHeight - 0.5) * 10) || 0
      setAlbumTilt({ rotateX, rotateY })
    }
    window.addEventListener("mousemove", handleMove)
    return () => window.removeEventListener("mousemove", handleMove)
  }, [])

  useEffect(() => {
    if (!currentShow?.dj) {
      setFollowStats((prev) => ({ ...prev, count: 0, isFollowing: false, canFollow: false, displayName: "" }))
      return
    }
    const controller = new AbortController()
    const fetchFollowStats = async () => {
      try {
        const res = await fetch(`/api/djs/follow?displayName=${encodeURIComponent(currentShow.dj!)}`, {
          signal: controller.signal,
          cache: "no-store",
        })
        if (!res.ok) return
        const data = await res.json()
        setFollowStats({
          count: data.followerCount || 0,
          isFollowing: Boolean(data.isFollowing),
          canFollow: Boolean(data.canFollow),
          displayName: data.displayName || currentShow.dj || "",
        })
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Failed to load follow stats", error)
        }
      }
    }
    void fetchFollowStats()
    return () => controller.abort()
  }, [currentShow?.dj, user])

  const albumArtStyle = useMemo(
    () => ({
      transform: `rotateX(${BASE_ALBUM_TILT_X + albumTilt.rotateX}deg) rotateY(${BASE_ALBUM_TILT_Y + albumTilt.rotateY}deg) rotateZ(-6deg) translate3d(${(BASE_ALBUM_TILT_Y + albumTilt.rotateY) * 1.5}px, ${(BASE_ALBUM_TILT_X + albumTilt.rotateX) * 1.2}px, 0)`,
      transition: "transform 0.35s ease-out",
    }),
    [albumTilt],
  )

  const handleLike = async () => {
    if (!user) {
      toast({ title: "Login required", description: "Sign in to like tracks.", variant: "destructive" })
      return
    }
    setIsLiking(true)
    try {
      const res = await fetch("/api/tracks/like", {
        method: "POST",
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Unable to update like")
      }
      setLiked(Boolean(data.liked))
      setLikeCount(data.likeCount ?? 0)
    } catch (error) {
      toast({
        title: "Could not update like",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      })
    } finally {
      setIsLiking(false)
    }
  }

  const handleFollow = async () => {
    if (!followStats.canFollow) {
      toast({
        title: "Following unavailable",
        description: "You need to be logged in and listening to follow this DJ.",
        variant: "destructive",
      })
      return
    }
    setFollowLoading(true)
    try {
      const res = await fetch("/api/djs/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: followStats.displayName || currentShow?.dj }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Unable to update follow state")
      }
      setFollowStats((prev) => ({
        ...prev,
        count: data.followerCount ?? prev.count,
        isFollowing: data.isFollowing,
      }))
    } catch (error) {
      toast({
        title: "Could not update follow",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      })
    } finally {
      setFollowLoading(false)
    }
  }

  const displayedLikes = isAutoDJ ? followStats.count : likeCount

  return (
    <>
      <section className="relative min-h-[75vh] w-full flex flex-col overflow-hidden">
        {/* Blurred background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={backgroundImage || "/placeholder.svg"}
            alt=""
            fill
            className="object-cover scale-110 blur-3xl brightness-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/50 to-background" />
        </div>

        <div className="absolute inset-0 z-[1]">
          <BackgroundVisualizer />
        </div>

        {/* Main content - split layout */}
        <div className="relative z-[2] flex-1 flex items-center justify-center px-6 md:px-12 lg:px-20 pt-20">
          <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-center">
            {/* Left side - DJ Info */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left order-2 md:order-1">
              {/* Live badge */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${isLive ? "bg-red-500 animate-pulse" : "bg-muted-foreground"}`}
                  />
                  <span className="text-sm font-medium uppercase tracking-wider">{isLive ? "Live" : "Offline"}</span>
                </div>
              </div>

              <div className="relative mb-6">
                <div
                  className={`w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden ring-3 ring-primary/30 shadow-2xl shadow-primary/20 aspect-square ${
                    isLoadingNowPlaying && !hasLoadedNowPlaying ? "bg-secondary/50 animate-pulse" : ""
                  }`}
                >
                  {djArtwork ? (
                    <Image
                      src={djArtwork}
                      alt={currentShow?.dj || "DJ"}
                      width={160}
                      height={160}
                      className="object-cover w-full h-full"
                    />
                  ) : null}
                </div>
                {/* Online indicator */}
                {isLive && (
                  <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-2 border-background" />
                )}
              </div>

              {/* DJ Name & Show */}
              <h2 className="text-xl md:text-2xl font-bold mb-1">
                {isLoadingNowPlaying && !hasLoadedNowPlaying ? (
                  <span className="inline-block w-36 h-6 bg-secondary/60 rounded animate-pulse" />
                ) : (
                  currentShow?.dj || "AutoDJ"
                )}
              </h2>
              <p className="text-base md:text-lg text-primary font-medium mb-4">
                {isLoadingNowPlaying && !hasLoadedNowPlaying ? (
                  <span className="inline-block w-48 h-5 bg-secondary/50 rounded animate-pulse" />
                ) : (
                  currentShow?.name || "Non-Stop Music"
                )}
              </p>

              {/* DJ Stats */}
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{listeners} listening</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  <span>
                    {displayedLikes.toLocaleString()} like{displayedLikes === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4" />
                  <span>{currentShow?.stats?.shows ?? "128"} shows</span>
                </div>
              </div>

              {/* Follow button */}
              <div className="mt-6 flex flex-col items-center md:items-start gap-2">
                <Button
                  variant="outline"
                  className={`gap-2 border-white/20 bg-transparent ${
                    !followStats.canFollow ? "opacity-50 cursor-not-allowed" : "hover:bg-white/10"
                  }`}
                  disabled={followLoading || !followStats.displayName || !followStats.canFollow}
                  onClick={handleFollow}
                >
                  <UserPlus className="h-4 w-4" />
                  {followStats.canFollow
                    ? followStats.isFollowing
                      ? "Following"
                      : `Follow ${currentShow?.dj || "DJ"}`
                    : "Follow DJ"}
              </Button>
              </div>
            </div>

            {/* Right side - Song Info */}
            <div className="flex flex-col items-center md:items-end text-center md:text-right order-1 md:order-2">
              {/* Album Art */}
              <div className="relative w-full max-w-[20rem]" style={{ perspective: "1200px" }}>
                <div className="absolute inset-6 -z-10 rounded-[36px] bg-primary/25 blur-3xl opacity-70" />
                <div
                  className={`relative w-48 h-48 md:w-64 md:h-64 lg:w-72 lg:h-72 rounded-[32px] overflow-hidden shadow-[0_25px_90px_rgba(0,0,0,0.5)] ring-1 ring-white/10 bg-secondary/30 ${
                    isLoadingNowPlaying && !hasLoadedNowPlaying ? "animate-pulse" : ""
                  }`}
                  style={albumArtStyle}
                >
                  {trackArtwork ? (
                    <Image
                      src={trackArtwork}
                      alt={currentTrack?.title || "Now Playing"}
                      fill
                      className="object-cover w-full h-full rounded-[32px]"
                      priority
                    />
                  ) : null}
                  <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Track Info */}
              <div className="max-w-xs md:max-w-sm">
                <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Now Playing</p>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 text-balance leading-tight">
                  {isLoadingNowPlaying && !hasLoadedNowPlaying ? (
                    <span className="inline-block h-7 w-48 bg-secondary/60 rounded animate-pulse" />
                  ) : (
                    currentTrack?.title || "Unknown Track"
                  )}
                </h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  {isLoadingNowPlaying && !hasLoadedNowPlaying ? (
                    <span className="inline-block h-5 w-32 bg-secondary/50 rounded animate-pulse" />
                  ) : (
                    currentTrack?.artist || "Unknown Artist"
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-[2] w-full">
          <div className="glass-card border-t border-white/10 px-4 md:px-8 py-4">
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
              {/* Left - Mini track info */}
              <div className="hidden sm:flex items-center gap-3 flex-1 min-w-0">
                <div
                  className={`w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 ${
                    isLoadingNowPlaying && !hasLoadedNowPlaying ? "bg-secondary/50 animate-pulse" : ""
                  }`}
                >
                  {trackArtwork ? (
                    <Image
                      src={trackArtwork}
                      alt=""
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate text-sm">
                    {isLoadingNowPlaying ? <span className="inline-block h-4 w-28 bg-secondary/50 rounded animate-pulse" /> : currentTrack?.title || "Unknown Track"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {isLoadingNowPlaying ? <span className="inline-block h-3 w-20 bg-secondary/40 rounded animate-pulse" /> : currentTrack?.artist || "Unknown Artist"}
                  </p>
                </div>
              </div>

              {/* Center - Main controls (icon-only buttons) */}
              <div className="flex items-center gap-1 md:gap-2">
                {/* Visualizer toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={cycleVisualizer}
                  className={`h-9 w-9 transition-shadow ${
                    visualizerMode === "wave"
                      ? "text-primary shadow-[0_0_16px_rgba(34,211,238,0.5)] ring-1 ring-primary/40"
                      : visualizerMode === "bars"
                        ? "text-orange-400 shadow-[0_0_16px_rgba(251,146,60,0.5)] ring-1 ring-orange-400/40"
                        : "text-muted-foreground"
                  } hover:text-foreground`}
                  aria-label={
                    visualizerMode === "off"
                      ? "Enable wave visualizer"
                      : visualizerMode === "wave"
                        ? "Switch to bars visualizer"
                        : "Turn off visualizer"
                  }
                >
                  <BarChart3 className="h-5 w-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-foreground"
                  aria-label="Share"
                >
                  <Share2 className="h-5 w-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (!isBuffering) togglePlay()
                  }}
                  disabled={isBuffering}
                  className="h-10 w-10 text-foreground hover:text-primary hover:bg-primary/10 disabled:opacity-60"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isBuffering ? (
                    <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6 ml-0.5" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLike}
                  disabled={isLiking}
                  className={`h-9 w-9 ${liked ? "text-pink-500" : "text-muted-foreground"} hover:text-foreground`}
                  aria-label={liked ? "Unlike track" : "Like track"}
                >
                  {isLiking ? (
                    <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Heart className={`h-5 w-5 ${liked ? "fill-pink-500" : ""}`} />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRequestModalOpen(true)}
                  className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-primary/10"
                  aria-label="Request a song"
                >
                  <Hand className="h-5 w-5" />
                </Button>
              </div>

              {/* Right - Volume controls */}
              <div className="flex items-center gap-1 md:gap-2 flex-1 justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="h-9 w-9 text-muted-foreground hover:text-foreground"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>

                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  onValueChange={([value]) => setVolume(value / 100)}
                  max={100}
                  step={1}
                  className="w-20 md:w-28 hidden sm:flex"
                  aria-label="Volume"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <RequestModal open={requestModalOpen} onOpenChange={setRequestModalOpen} />
    </>
  )
}
