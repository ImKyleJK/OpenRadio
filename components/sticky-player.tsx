"use client"

import { useRadio } from "@/context/radio-context"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2, VolumeX, Radio, ChevronUp, X } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"

export function StickyPlayer() {
  const { isPlaying, togglePlay, volume, setVolume, isMuted, toggleMute, isLive, currentTrack, currentShow } =
    useRadio()

  const [isExpanded, setIsExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky player after scrolling past 80% of viewport height
      setIsVisible(window.scrollY > window.innerHeight * 0.8)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!isVisible) return null

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border/50 transition-all duration-300 animate-in slide-in-from-bottom ${
        isExpanded ? "h-auto" : "h-20"
      }`}
    >
      <div className="container mx-auto px-4">
        {/* Expand toggle for mobile */}
        <button
          className="absolute -top-8 left-1/2 -translate-x-1/2 md:hidden w-10 h-8 glass-card rounded-t-lg flex items-center justify-center border-t border-x border-border/50"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? "Collapse player" : "Expand player"}
        >
          {isExpanded ? <X className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>

        <div className="flex items-center gap-4 h-20">
          {/* Play button */}
          <Button
            size="icon"
            onClick={togglePlay}
            className="h-12 w-12 rounded-full shrink-0 shadow-lg shadow-primary/25"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
          </Button>

          {/* Track info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {currentTrack?.artwork && (
              <Image
                src={currentTrack.artwork || "/placeholder.svg"}
                alt=""
                width={48}
                height={48}
                className="rounded-lg shrink-0 hidden sm:block"
              />
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {isLive && (
                  <span className="flex items-center gap-1 text-xs font-medium text-red-500">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                    LIVE
                  </span>
                )}
                <span className="text-xs text-muted-foreground hidden sm:inline">{currentShow?.name}</span>
              </div>
              <p className="font-medium truncate">{currentTrack?.title || "Unknown Track"}</p>
              <p className="text-sm text-muted-foreground truncate">{currentTrack?.artist || "Unknown Artist"}</p>
            </div>
          </div>

          {/* Volume controls - desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="shrink-0"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume * 100]}
              onValueChange={([value]) => setVolume(value / 100)}
              max={100}
              step={1}
              className="w-24"
              aria-label="Volume"
            />
          </div>

          {/* Stream info */}
          <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
            <Radio className="h-4 w-4 text-primary" />
            <span>192 kbps</span>
          </div>
        </div>

        {/* Expanded mobile content */}
        {isExpanded && (
          <div className="md:hidden pb-4 pt-2 border-t border-border/30">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={toggleMute} aria-label={isMuted ? "Unmute" : "Mute"}>
                {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume * 100]}
                onValueChange={([value]) => setVolume(value / 100)}
                max={100}
                step={1}
                className="flex-1"
                aria-label="Volume"
              />
              <span className="text-sm text-muted-foreground w-12 text-right">{Math.round(volume * 100)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
