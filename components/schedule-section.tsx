"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Clock, ChevronRight, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

const allShows = [
  {
    name: "Late Night Sessions",
    dj: "DJ Midnight",
    time: "02:00 - 06:00",
    avatar: "/dj-midnight-dark-hoodie.jpg",
    status: "past" as const,
  },
  {
    name: "Morning Brew",
    dj: "DJ Sunrise",
    time: "06:00 - 10:00",
    avatar: "/dj-sunrise-morning-coffee.jpg",
    status: "past" as const,
  },
  {
    name: "Lunch Break Beats",
    dj: "MC Midday",
    time: "12:00 - 14:00",
    avatar: "/mc-midday-hip-hop-style.jpg",
    status: "past" as const,
  },
  {
    name: "Drive Time",
    dj: "DJ Rush",
    time: "16:00 - 19:00",
    avatar: "/dj-rush-energetic-red.jpg",
    status: "live" as const,
  },
  {
    name: "Night Vibes",
    dj: "DJ Luna",
    time: "22:00 - 02:00",
    avatar: "/dj-luna-purple-neon.jpg",
    status: "upcoming" as const,
  },
  {
    name: "Weekend Chill",
    dj: "The Groove Collective",
    time: "14:00 - 18:00",
    avatar: "/groove-collective-band-relaxed.jpg",
    status: "upcoming" as const,
  },
  {
    name: "Sunday Brunch",
    dj: "DJ Mellow",
    time: "10:00 - 14:00",
    avatar: "/dj-mellow-acoustic-guitar.jpg",
    status: "upcoming" as const,
  },
]

export function ScheduleSection() {
  // Find the index of the live show (center of carousel)
  const liveIndex = allShows.findIndex((show) => show.status === "live")
  const centerIndex = liveIndex >= 0 ? liveIndex : 3

  const [currentIndex, setCurrentIndex] = useState(centerIndex)

  // Calculate min/max bounds (3 shows back, 3 shows forward from live)
  const minIndex = Math.max(0, centerIndex - 3)
  const maxIndex = Math.min(allShows.length - 1, centerIndex + 3)

  const canGoBack = currentIndex > minIndex
  const canGoForward = currentIndex < maxIndex

  const goBack = () => {
    if (canGoBack) setCurrentIndex((prev) => prev - 1)
  }

  const goForward = () => {
    if (canGoForward) setCurrentIndex((prev) => prev + 1)
  }

  // Get the 3 shows to display (previous, current, next)
  const displayShows = [allShows[currentIndex - 1], allShows[currentIndex], allShows[currentIndex + 1]].filter(Boolean)

  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Show Schedule</h2>
            <p className="text-muted-foreground mt-1">See what&apos;s on the air</p>
          </div>
          <Button variant="outline" asChild className="gap-2 border-white/20 hover:bg-white/10 bg-transparent">
            <Link href="/schedule">
              View Full Schedule
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Navigation Arrows */}
          <Button
            variant="ghost"
            size="icon"
            onClick={goBack}
            disabled={!canGoBack}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10"
            aria-label="Previous show"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={goForward}
            disabled={!canGoForward}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10"
            aria-label="Next show"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Shows display */}
          <div className="flex items-center justify-center gap-4 md:gap-6 px-12">
            {displayShows.map((show, idx) => {
              const isCenter = show === allShows[currentIndex]
              const isLive = show.status === "live"

              return (
                <div
                  key={show.name}
                  className={`glass-card border-border/50 p-6 rounded-2xl transition-all duration-300 flex flex-col items-center text-center ${
                    isCenter
                      ? "flex-1 max-w-sm scale-100 opacity-100"
                      : "flex-1 max-w-xs scale-95 opacity-60 hidden sm:flex"
                  } ${isLive ? "ring-2 ring-primary/50 border-primary/30" : ""}`}
                >
                  {/* Status badge */}
                  <div className="mb-4">
                    {isLive ? (
                      <Badge variant="destructive" className="gap-1.5">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        Live Now
                      </Badge>
                    ) : show.status === "past" ? (
                      <Badge variant="secondary" className="bg-muted/50">
                        Previously
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-primary/50 text-primary">
                        Up Next
                      </Badge>
                    )}
                  </div>

                  {/* DJ Avatar */}
                  <div className={`relative mb-4 ${isCenter ? "w-20 h-20" : "w-16 h-16"}`}>
                    <div
                      className={`w-full h-full rounded-full overflow-hidden ring-2 ${
                        isLive ? "ring-primary" : "ring-white/20"
                      }`}
                    >
                      <Image
                        src={show.avatar || "/placeholder.svg"}
                        alt={show.dj}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    {isLive && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>

                  {/* Show Info */}
                  <h3 className={`font-bold mb-1 ${isCenter ? "text-xl" : "text-lg"}`}>{show.name}</h3>
                  <p className="text-primary font-medium mb-3">{show.dj}</p>

                  {/* Time */}
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{show.time}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Dots indicator */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {allShows.slice(minIndex, maxIndex + 1).map((show, idx) => {
              const actualIndex = minIndex + idx
              const isActive = actualIndex === currentIndex
              const isLive = show.status === "live"

              return (
                <button
                  key={show.name}
                  onClick={() => setCurrentIndex(actualIndex)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    isActive
                      ? isLive
                        ? "w-6 bg-primary"
                        : "w-6 bg-foreground"
                      : isLive
                        ? "bg-primary/50"
                        : "bg-muted-foreground/30"
                  }`}
                  aria-label={`Go to ${show.name}`}
                />
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
