"use client"

import { useRadio } from "@/context/radio-context"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Users } from "lucide-react"
import Image from "next/image"

export function NowPlayingSection() {
  const { recentTracks, listeners, isLoadingNowPlaying, hasLoadedNowPlaying, isPlaying } = useRadio()
  const { user } = useAuth()
  const userListening = Boolean(user && isPlaying)
  const guestCount = Math.max(listeners - (userListening ? 1 : 0), 0)
  const shouldShowSkeletons = isLoadingNowPlaying && !hasLoadedNowPlaying && recentTracks.length === 0

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="glass-card border-border/50 overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Active Listeners
                </div>
                <span className="text-sm font-normal text-muted-foreground">{listeners} tuned in</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userListening ? (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40 border border-border/50">
                  <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary/40">
                    <Image
                      src={user?.avatar || "/placeholder.svg"}
                      alt={user?.displayName || "You"}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm">{user?.displayName || "You"}</p>
                    <p className="text-xs text-muted-foreground truncate">Listening now</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">You</span>
                </div>
              ) : null}

              <div className="mt-6 flex justify-center">
                <div className="w-full max-w-md text-center rounded-3xl border border-border/50 bg-secondary/40 p-8 shadow-md">
                  <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-background/80 shadow-inner">
                    <Users className="h-12 w-12 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-foreground">
                    {listeners <= 0 ? "No Listeners Right Now" : `${guestCount} Guest${guestCount === 1 ? "" : "s"} Listening`}
                  </h4>
                  <p className="mt-4 text-base text-muted-foreground">
                    {listeners <= 0
                      ? "When listeners tune in, you’ll see them here."
                      : "Register to appear here and share your vibe."}
                  </p>
                  {listeners > 0 && (
                    <a
                      href="/register"
                      className="mt-5 inline-flex items-center justify-center rounded-full border border-primary/50 bg-primary/10 px-5 py-2 text-sm font-semibold text-primary hover:bg-primary/20"
                    >
                      Get Started
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recently Played */}
          <Card className="glass-card border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-primary" />
                Recently Played
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {shouldShowSkeletons
                  ? Array.from({ length: 4 }).map((_, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 rounded-lg">
                        <div className="w-12 h-12 rounded-lg bg-secondary/60 animate-pulse" />
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="h-3.5 bg-secondary/50 rounded w-32 animate-pulse" />
                          <div className="h-3 bg-secondary/40 rounded w-24 animate-pulse" />
                        </div>
                        <div className="h-3 w-12 bg-secondary/40 rounded animate-pulse" />
                      </div>
                    ))
                  : recentTracks.map((track, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                        {track.artwork ? (
                          <Image
                            src={track.artwork}
                            alt={track.title}
                            width={48}
                            height={48}
                            className="rounded-lg shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-secondary/50" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{track.title}</p>
                          <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {index === 0 ? "Just now" : `${(index + 1) * 3}m ago`}
                        </span>
                      </div>
                    ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
