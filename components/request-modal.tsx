"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Music, MessageSquare, Loader2 } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/context/auth-context"

interface SpotifyTrack {
  id: string
  title: string
  artist: string
  album?: string
  artwork?: string
}

interface RequestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RequestModal({ open, onOpenChange }: RequestModalProps) {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null)
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [activeTab, setActiveTab] = useState<"search" | "message">("search")
  const [error, setError] = useState("")
  const [guestName, setGuestName] = useState("")
  const [guestEmail, setGuestEmail] = useState("")

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(`/api/spotify/search?mode=list&query=${encodeURIComponent(searchQuery)}`, {
          signal: controller.signal,
          cache: "no-store",
        })
        const data = await res.json().catch(() => ({}))
        if (res.ok && Array.isArray(data.results)) {
          setSearchResults(data.results)
        } else {
          setSearchResults([])
        }
      } catch (fetchError) {
        if ((fetchError as Error).name !== "AbortError") {
          setSearchResults([])
        }
      } finally {
        setIsSearching(false)
      }
    }, 400)

    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [searchQuery])

  const resetState = () => {
    setSearchQuery("")
    setSearchResults([])
    setSelectedTrack(null)
    setMessage("")
    setGuestName("")
    setGuestEmail("")
    setError("")
    setSubmitted(false)
    setActiveTab("search")
    setIsSubmitting(false)
  }

  useEffect(() => {
    if (!open) {
      resetState()
    }
  }, [open])

  const handleSelectTrack = (track: SpotifyTrack) => {
    setSelectedTrack(track)
    setSearchQuery("")
    setSearchResults([])
  }

  const buildPayload = () => {
    const kind = activeTab === "message" ? "message" : "song"
    if (kind === "song" && !selectedTrack) return null
    const payload: Record<string, unknown> = {
      kind,
    }
    if (kind === "song" && selectedTrack) {
      payload.track = {
        title: selectedTrack.title,
        artist: selectedTrack.artist,
        album: selectedTrack.album,
        artwork: selectedTrack.artwork,
        spotifyId: selectedTrack.id,
      }
    }
    if (message.trim()) {
      payload.message = message.trim()
    }
    if (!user) {
      payload.guestName = guestName.trim()
      payload.guestEmail = guestEmail.trim()
    }
    return payload
  }

  const canSubmit =
    (activeTab === "search" && Boolean(selectedTrack)) || (activeTab === "message" && Boolean(message.trim()))

  const handleSubmit = async () => {
    if (!canSubmit) return
    const payload = buildPayload()
    if (!payload) {
      setError("Select a track to request.")
      return
    }
    if (!user) {
      if (!guestName.trim() || !guestEmail.trim()) {
        setError("Please provide your name and email.")
        return
      }
    }
    setIsSubmitting(true)
    setError("")
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || "Unable to submit request")
      }
      setSubmitted(true)
      setTimeout(() => {
        onOpenChange(false)
        resetState()
      }, 2000)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit request")
    } finally {
      setIsSubmitting(false)
    }
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

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="mt-4">
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
            {selectedTrack && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <Image
                  src={selectedTrack.artwork || "/placeholder.svg"}
                  alt={selectedTrack.album || selectedTrack.title}
                  width={48}
                  height={48}
                  className="rounded-md object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{selectedTrack.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{selectedTrack.artist}</p>
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
                          src={track.artwork || "/placeholder.svg"}
                          alt={track.album || track.title}
                          width={48}
                          height={48}
                          className="rounded-md object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{track.title}</p>
                          <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
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
          </TabsContent>
        </Tabs>

        {!user && (
          <div className="mt-4 space-y-3 bg-white/5 border border-white/10 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Share your info so the DJ can shout you out.</p>
            <Input placeholder="Your name" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
            <Input
              placeholder="Email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              type="email"
            />
          </div>
        )}

        {error && <p className="text-sm text-red-400 mt-3">{error}</p>}

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !canSubmit}
          className="w-full mt-4"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            "Send"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
