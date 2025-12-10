"use client"

import { useState } from "react"
import { useRadio } from "@/context/radio-context"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2, VolumeX, Heart, Users, Radio, Share2, BarChart3, Hand } from "lucide-react"
import Image from "next/image"
import { RequestModal } from "@/components/request-modal"
import { BackgroundVisualizer } from "@/components/background-visualizer"

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
    visualizerEnabled,
    toggleVisualizer,
  } = useRadio()

  const [requestModalOpen, setRequestModalOpen] = useState(false)

  const backgroundImage = currentTrack?.artwork || currentShow?.artwork || "/abstract-music-waves.png"
  const djArtwork = hasLoadedNowPlaying ? currentShow?.artwork : undefined
  const trackArtwork = hasLoadedNowPlaying ? currentTrack?.artwork : undefined

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
                  <span>2.4k likes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4" />
                  <span>128 shows</span>
                </div>
              </div>

              {/* Follow button */}
              <Button variant="outline" className="mt-6 gap-2 border-white/20 hover:bg-white/10 bg-transparent">
                <Heart className="h-4 w-4" />
                Follow DJ
              </Button>
            </div>

            {/* Right side - Song Info */}
            <div className="flex flex-col items-center md:items-end text-center md:text-right order-1 md:order-2">
              {/* Album Art */}
              <div className="relative mb-6">
                <div
                  className={`w-48 h-48 md:w-64 md:h-64 lg:w-72 lg:h-72 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10 ${
                    isLoadingNowPlaying && !hasLoadedNowPlaying ? "bg-secondary/50 animate-pulse" : ""
                  }`}
                >
                  {trackArtwork ? (
                    <Image
                      src={trackArtwork}
                      alt={currentTrack?.title || "Now Playing"}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : null}
                </div>
                {/* Vinyl effect overlay */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
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
                  onClick={toggleVisualizer}
                  className={`h-9 w-9 transition-shadow ${
                    visualizerEnabled
                      ? "text-primary shadow-[0_0_16px_rgba(34,211,238,0.5)] ring-1 ring-primary/40"
                      : "text-muted-foreground"
                  } hover:text-foreground`}
                  aria-label={visualizerEnabled ? "Disable visualizer" : "Enable visualizer"}
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
