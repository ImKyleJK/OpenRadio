"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Music, MessageSquare, Loader2 } from "lucide-react"
import Image from "next/image"

interface SpotifyTrack {
  id: string
  name: string
  artists: { name: string }[]
  album: {
    name: string
    images: { url: string }[]
  }
}

interface RequestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RequestModal({ open, onOpenChange }: RequestModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null)
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Mock Spotify search - in production, this would call the Spotify API
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      // Simulated search results - replace with actual Spotify API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      setSearchResults(
        [
          {
            id: "1",
            name: "Blinding Lights",
            artists: [{ name: "The Weeknd" }],
            album: { name: "After Hours", images: [{ url: "/blinding-lights-album.jpg" }] },
          },
          {
            id: "2",
            name: "Starboy",
            artists: [{ name: "The Weeknd" }, { name: "Daft Punk" }],
            album: { name: "Starboy", images: [{ url: "/starboy-album.jpg" }] },
          },
          {
            id: "3",
            name: "Save Your Tears",
            artists: [{ name: "The Weeknd" }],
            album: { name: "After Hours", images: [{ url: "/save-your-tears-album.jpg" }] },
          },
          {
            id: "4",
            name: "Take On Me",
            artists: [{ name: "a-ha" }],
            album: { name: "Hunting High and Low", images: [{ url: "/take-on-me-album.jpg" }] },
          },
          {
            id: "5",
            name: "Never Gonna Give You Up",
            artists: [{ name: "Rick Astley" }],
            album: { name: "Whenever You Need Somebody", images: [{ url: "/rick-astley-album.jpg" }] },
          },
        ].filter(
          (track) =>
            track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            track.artists.some((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase())),
        ),
      )
      setIsSearching(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    setSubmitted(true)
    setTimeout(() => {
      onOpenChange(false)
      setSubmitted(false)
      setSelectedTrack(null)
      setMessage("")
      setSearchQuery("")
    }, 2000)
  }

  const handleSelectTrack = (track: SpotifyTrack) => {
    setSelectedTrack(track)
    setSearchQuery("")
    setSearchResults([])
  }

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="glass-card border-white/10 sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <span className="text-3xl">🙌</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Request Sent!</h3>
            <p className="text-muted-foreground">The DJ will see your request shortly.</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-white/10 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">🙋</span>
            Request a Song
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="search" className="mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-white/5">
            <TabsTrigger value="search" className="gap-2 data-[state=active]:bg-white/10">
              <Music className="h-4 w-4" />
              Search Song
            </TabsTrigger>
            <TabsTrigger value="message" className="gap-2 data-[state=active]:bg-white/10">
              <MessageSquare className="h-4 w-4" />
              Send Message
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="mt-4 space-y-4">
            {/* Selected track display */}
            {selectedTrack && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <Image
                  src={selectedTrack.album.images[0]?.url || "/placeholder.svg"}
                  alt={selectedTrack.album.name}
                  width={48}
                  height={48}
                  className="rounded-md"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{selectedTrack.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {selectedTrack.artists.map((a) => a.name).join(", ")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTrack(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Change
                </Button>
              </div>
            )}

            {/* Search input */}
            {!selectedTrack && (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for a song or artist..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10"
                  />
                </div>

                {/* Search results */}
                {isSearching && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                )}

                {!isSearching && searchResults.length > 0 && (
                  <div className="max-h-64 overflow-y-auto space-y-1 -mx-2 px-2">
                    {searchResults.map((track) => (
                      <button
                        key={track.id}
                        onClick={() => handleSelectTrack(track)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors text-left"
                      >
                        <Image
                          src={track.album.images[0]?.url || "/placeholder.svg"}
                          alt={track.album.name}
                          width={48}
                          height={48}
                          className="rounded-md"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{track.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {track.artists.map((a) => a.name).join(", ")}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {!isSearching && searchQuery && searchResults.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No results found</p>
                )}
              </>
            )}

            {/* Optional message */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Add a message (optional)</label>
              <Textarea
                placeholder="Shoutout to my friend, it's their birthday!"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="bg-white/5 border-white/10 resize-none"
                rows={2}
              />
            </div>

            <Button onClick={handleSubmit} disabled={!selectedTrack || isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Request"
              )}
            </Button>
          </TabsContent>

          <TabsContent value="message" className="mt-4 space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Your message to the DJ</label>
              <Textarea
                placeholder="Hey DJ! Can you play something upbeat? Love the show!"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="bg-white/5 border-white/10 resize-none"
                rows={4}
              />
            </div>

            <Button onClick={handleSubmit} disabled={!message.trim() || isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
