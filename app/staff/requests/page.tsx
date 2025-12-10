"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Music2, Search, Check, X, Clock } from "lucide-react"

type RequestStatus = "pending" | "played" | "rejected"

interface SongRequest {
  id: string
  name: string
  email?: string
  song: string
  message?: string
  status: RequestStatus
  createdAt: string
}

const mockRequests: SongRequest[] = [
  {
    id: "1",
    name: "John D.",
    email: "john@example.com",
    song: "Midnight City - M83",
    message: "Love this show!",
    status: "pending",
    createdAt: "2024-12-10T22:30:00",
  },
  {
    id: "2",
    name: "Sarah M.",
    song: "Blinding Lights - The Weeknd",
    status: "pending",
    createdAt: "2024-12-10T22:25:00",
  },
  {
    id: "3",
    name: "Mike R.",
    email: "mike@example.com",
    song: "Digital Love - Daft Punk",
    message: "Can you play this for my girlfriend?",
    status: "pending",
    createdAt: "2024-12-10T22:18:00",
  },
  { id: "4", name: "Emily K.", song: "Innerbloom - RÜFÜS DU SOL", status: "played", createdAt: "2024-12-10T22:10:00" },
  {
    id: "5",
    name: "Alex T.",
    song: "Sunset Lover - Petit Biscuit",
    status: "played",
    createdAt: "2024-12-10T22:00:00",
  },
  { id: "6", name: "Chris P.", song: "Something inappropriate", status: "rejected", createdAt: "2024-12-10T21:55:00" },
]

export default function RequestsPage() {
  const [requests, setRequests] = useState(mockRequests)
  const [filter, setFilter] = useState<string>("all")
  const [search, setSearch] = useState("")

  const updateStatus = (id: string, status: RequestStatus) => {
    setRequests(requests.map((r) => (r.id === id ? { ...r, status } : r)))
  }

  const filteredRequests = requests.filter((r) => {
    const matchesFilter = filter === "all" || r.status === filter
    const matchesSearch =
      r.song.toLowerCase().includes(search.toLowerCase()) || r.name.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const pendingCount = requests.filter((r) => r.status === "pending").length

  const statusColors: Record<RequestStatus, string> = {
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    played: "bg-green-500/20 text-green-400 border-green-500/30",
    rejected: "bg-red-500/20 text-red-400 border-red-500/30",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Song Requests</h1>
        <p className="text-muted-foreground">Manage incoming song requests from listeners</p>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Song</TableHead>
                <TableHead>Requester</TableHead>
                <TableHead className="hidden md:table-cell">Message</TableHead>
                <TableHead className="hidden sm:table-cell">Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">{request.song}</TableCell>
                  <TableCell>
                    <div>
                      <p>{request.name}</p>
                      {request.email && <p className="text-xs text-muted-foreground">{request.email}</p>}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell max-w-[200px] truncate text-muted-foreground">
                    {request.message || "-"}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {formatTime(request.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[request.status]}>{request.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {request.status === "pending" && (
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                          onClick={() => updateStatus(request.id, "played")}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                          onClick={() => updateStatus(request.id, "rejected")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    {request.status !== "pending" && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => updateStatus(request.id, "pending")}
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredRequests.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No requests found</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
}
