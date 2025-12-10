"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Music2, Search, Check, X, Clock, RefreshCcw } from "lucide-react"

type RequestStatus = "pending" | "played" | "rejected"

interface SongRequest {
  id: string
  kind: "song" | "message"
  track?: {
    title: string
    artist: string
    album?: string
    artwork?: string
  }
  message?: string
  requester: {
    type: "user" | "guest"
    name: string
    email?: string
  }
  status: RequestStatus
  createdAt: string
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<SongRequest[]>([])
  const [filter, setFilter] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState("")

  const fetchRequests = async () => {
    setIsLoading(true)
    setError("")
    try {
      const res = await fetch("/api/requests", { cache: "no-store" })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Unable to load requests")
      }
      setRequests(data.requests || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load requests")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void fetchRequests()
  }, [])

  const pendingCount = useMemo(() => requests.filter((r) => r.status === "pending").length, [requests])

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesFilter = filter === "all" || request.status === filter
      const targetText = [
        request.track?.title,
        request.track?.artist,
        request.track?.album,
        request.requester.name,
        request.requester.email,
        request.message,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      const matchesSearch = targetText.includes(search.toLowerCase())
      return matchesFilter && matchesSearch
    })
  }, [requests, filter, search])

  const updateStatus = async (id: string, status: RequestStatus) => {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Unable to update request")
      }
      setRequests((prev) => prev.map((req) => (req.id === id ? data.request : req)))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update request")
    } finally {
      setActionLoading(null)
    }
  }

  const statusColors: Record<RequestStatus, string> = {
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    played: "bg-green-500/20 text-green-400 border-green-500/30",
    rejected: "bg-red-500/20 text-red-400 border-red-500/30",
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Song Requests</h1>
          <p className="text-muted-foreground">Manage incoming song requests from listeners</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void fetchRequests()} disabled={isLoading}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card className="glass-card border-border/50">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Music2 className="h-5 w-5 text-primary" />
                All Requests
                {pendingCount > 0 && <Badge variant="secondary">{pendingCount} pending</Badge>}
              </CardTitle>
              <CardDescription>Review and manage song requests</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search requests..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-[200px]"
                />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="played">Played</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Song / Type</TableHead>
                <TableHead>Requester</TableHead>
                <TableHead className="hidden md:table-cell">Message</TableHead>
                <TableHead className="hidden sm:table-cell">Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isLoading &&
                filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="max-w-[240px]">
                      {request.track ? (
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden border border-border/40 bg-muted flex-shrink-0">
                            <Image
                              src={request.track.artwork || "/placeholder.svg"}
                              alt={request.track.title}
                              width={48}
                              height={48}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{request.track.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{request.track.artist}</p>
                            {request.track.album && (
                              <p className="text-[11px] text-muted-foreground/80 truncate">{request.track.album}</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium">Message</p>
                          <p className="text-xs text-muted-foreground">No track selected</p>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.requester.name}</p>
                        {request.requester.email && (
                          <p className="text-xs text-muted-foreground">{request.requester.email}</p>
                        )}
                        <Badge className="mt-1" variant="outline">
                          {request.requester.type === "user" ? "Member" : "Guest"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-[220px] truncate text-muted-foreground">
                      {request.message || (request.kind === "message" ? "General message" : "-")}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {formatTime(request.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[request.status]}>{request.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {request.status === "pending" ? (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                            onClick={() => updateStatus(request.id, "played")}
                            disabled={actionLoading === request.id}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                            onClick={() => updateStatus(request.id, "rejected")}
                            disabled={actionLoading === request.id}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => updateStatus(request.id, "pending")}
                          disabled={actionLoading === request.id}
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          {!isLoading && filteredRequests.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No requests found</div>
          )}
          {isLoading && <div className="text-center py-8 text-muted-foreground">Loading requests...</div>}
        </CardContent>
      </Card>
    </div>
  )
}

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
}
