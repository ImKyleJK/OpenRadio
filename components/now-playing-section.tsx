"use client"

import { useRadio } from "@/context/radio-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Users } from "lucide-react"
import Image from "next/image"

export function NowPlayingSection() {
  const { recentTracks, activeListeners, listeners } = useRadio()

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
              {/* Stacked avatars row */}
              <div className="flex items-center mb-6">
                <div className="flex -space-x-3">
                  {activeListeners.slice(0, 8).map((listener, index) => (
                    <div
                      key={listener.id}
                      className="relative group"
                      style={{ zIndex: activeListeners.length - index }}
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-background hover:ring-primary transition-all hover:scale-110 hover:z-50">
                        <Image
                          src={listener.avatar || "/placeholder.svg"}
                          alt={listener.username}
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
                        {listener.username}
                      </div>
                    </div>
                  ))}
                  {activeListeners.length > 8 && (
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center ring-2 ring-background text-xs font-medium">
                      +{listeners - 8}
                    </div>
                  )}
                </div>
              </div>

              {/* List of active listeners */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {activeListeners.map((listener) => (
                  <div
                    key={listener.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={listener.avatar || "/placeholder.svg"}
                        alt={listener.username}
                        width={32}
                        height={32}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{listener.username}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{listener.listeningFor}m</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recently Played - unchanged */}
          <Card className="glass-card border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-primary" />
                Recently Played
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTracks.map((track, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <Image
                      src={track.artwork || "/placeholder.svg?height=48&width=48&query=album cover"}
                      alt={track.title}
                      width={48}
                      height={48}
                      className="rounded-lg shrink-0"
                    />
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
