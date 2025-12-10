"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, User, CheckCircle, XCircle, Loader2, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"
import { resolveAvatar } from "@/lib/avatar"

interface DJOption {
  id: string
  name: string
  avatar?: string
}

interface Booking {
  id: string
  title: string
  description?: string
  djId: string
  djName: string
  djAvatar?: string
  start: string
  end: string
  status: "pending" | "approved" | "rejected"
}

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const dateFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" })
const timeFormatter = new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit" })

const getWeekStart = (offset: number) => {
  const now = new Date()
  const day = now.getDay() || 7
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day - 1) + offset * 7)
  monday.setHours(0, 0, 0, 0)
  return monday
}

const combineDateTime = (date: string, time: string) => {
  if (!date || !time) return null
  const combined = new Date(`${date}T${time}`)
  if (Number.isNaN(combined.getTime())) return null
  return combined.toISOString()
}

export default function SchedulePage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [djs, setDjs] = useState<DJOption[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [weekOffset, setWeekOffset] = useState(0)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [form, setForm] = useState({ title: "", description: "", djId: "", date: "", startTime: "", endTime: "" })
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const canApprove = user ? ["admin", "staff"].includes(user.role) : false

  const weekStart = useMemo(() => getWeekStart(weekOffset), [weekOffset])
  const weekEnd = useMemo(() => {
    const end = new Date(weekStart)
    end.setDate(end.getDate() + 6)
    end.setHours(23, 59, 59, 999)
    return end
  }, [weekStart])

  const fetchDjs = async () => {
    const res = await fetch("/api/djs")
    if (!res.ok) return
    const data = await res.json()
    setDjs(data.djs || [])
    if (!form.djId && user?.role === "dj") {
      setForm((prev) => ({ ...prev, djId: user.id }))
    }
  }

  const fetchBookings = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        start: weekStart.toISOString(),
        end: weekEnd.toISOString(),
        statuses: "pending,approved",
      })
      const res = await fetch(`/api/bookings?${params.toString()}`)
      const data = await res.json()
      setBookings(data.bookings || [])
    } catch (error) {
      console.error("Failed to load bookings", error)
      toast({ title: "Unable to load bookings", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDjs()
  }, [])

  useEffect(() => {
    if (user?.role === "dj") {
      setForm((prev) => ({ ...prev, djId: user.id }))
    }
  }, [user])

  useEffect(() => {
    fetchBookings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffset])

  const pendingBookings = bookings.filter((booking) => booking.status === "pending")
  const approvedBookings = bookings.filter((booking) => booking.status === "approved")
  const isDjUser = user?.role === "dj"

  const weekDays = useMemo(() => {
    return daysOfWeek.map((label, index) => {
      const date = new Date(weekStart)
      date.setDate(date.getDate() + index)
      date.setHours(0, 0, 0, 0)
      return { label, date, iso: date.toISOString().split("T")[0] }
    })
  }, [weekStart])

  const hours = useMemo(() => Array.from({ length: 18 }, (_, i) => i + 6), [])

  const getBookingForCell = (dayIndex: number, hour: number) => {
    const slotStart = new Date(weekStart)
    slotStart.setDate(slotStart.getDate() + dayIndex)
    slotStart.setHours(hour, 0, 0, 0)
    const slotEnd = new Date(slotStart)
    slotEnd.setHours(slotEnd.getHours() + 1)

    return bookings.find((booking) => {
      const bookingStart = new Date(booking.start)
      const bookingEnd = new Date(booking.end)
      return bookingStart < slotEnd && bookingEnd > slotStart
    })
  }

  const handleCellClick = (dayIso: string, hour: number) => {
    const startTime = `${String(hour).padStart(2, "0")}:00`
    const endHour = hour + 1
    const endTime = endHour >= 24 ? "23:59" : `${String(endHour).padStart(2, "0")}:00`
    setForm((prev) => ({
      ...prev,
      date: dayIso,
      startTime,
      endTime,
      djId: isDjUser ? user?.id || "" : prev.djId,
    }))
    setIsBookingOpen(true)
  }

  const formatHourLabel = (hour: number) => {
    const labelDate = new Date()
    labelDate.setHours(hour, 0, 0, 0)
    return timeFormatter.format(labelDate)
  }

  const handleBookSlot = async () => {
    const startIso = combineDateTime(form.date, form.startTime)
    const endIso = combineDateTime(form.date, form.endTime)
    if (!startIso || !endIso) {
      toast({ title: "Provide a valid date and time", variant: "destructive" })
      return
    }
    setActionLoading("book")
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          djId: form.djId || undefined,
          start: startIso,
          end: endIso,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Unable to create booking")
      }
      toast({ title: "Slot requested", description: "Your booking is awaiting approval." })
      setIsBookingOpen(false)
      setForm({ title: "", description: "", djId: user?.role === "dj" ? user.id : "", date: "", startTime: "", endTime: "" })
      await fetchBookings()
    } catch (error) {
      toast({ title: "Booking failed", description: error instanceof Error ? error.message : undefined, variant: "destructive" })
    } finally {
      setActionLoading(null)
    }
  }

  const handleStatusChange = async (id: string, status: "approved" | "rejected") => {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Unable to update booking")
      }
      toast({ title: `Booking ${status}` })
      await fetchBookings()
    } catch (error) {
      toast({ title: "Update failed", description: error instanceof Error ? error.message : undefined, variant: "destructive" })
    } finally {
      setActionLoading(null)
    }
  }

  const bookingButtonDisabled = !form.title || !form.date || !form.startTime || !form.endTime || (!form.djId && !isDjUser)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule Management</h1>
          <p className="text-muted-foreground">Book time slots, review pending requests, and track the live timetable.</p>
        </div>
        <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Book Slot
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Book a Show Slot</DialogTitle>
              <DialogDescription>Request a slot. An admin will confirm it.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Show Title</Label>
                <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Friday Night Mix" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Tell listeners about the vibe..."
                  rows={2}
                />
              </div>
              {!isDjUser ? (
                <div className="space-y-2">
                  <Label htmlFor="dj">DJ</Label>
                  <Select value={form.djId} onValueChange={(value) => setForm({ ...form, djId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a DJ" />
                    </SelectTrigger>
                    <SelectContent>
                      {djs.map((dj) => (
                        <SelectItem key={dj.id} value={dj.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                            <AvatarImage src={resolveAvatar(dj)} />
                              <AvatarFallback>{dj.name[0]}</AvatarFallback>
                            </Avatar>
                            {dj.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-1 rounded-lg border border-border/40 bg-muted/30 p-3 text-sm">
                  <p className="font-medium">You&apos;re booking this slot</p>
                  <p className="text-muted-foreground">{user?.displayName || user?.name}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input id="startTime" type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input id="endTime" type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBookingOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleBookSlot} disabled={bookingButtonDisabled || actionLoading === "book"}>
                {actionLoading === "book" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {pendingBookings.length > 0 && (
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-400" />
              Pending Requests
              <Badge variant="secondary">{pendingBookings.length}</Badge>
            </CardTitle>
            <CardDescription>Approve or reject upcoming bookings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingBookings.map((booking) => (
              <div key={booking.id} className="flex flex-wrap gap-4 items-center justify-between border border-border/30 rounded-lg p-4 bg-muted/10">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={booking.djAvatar || "/placeholder.svg"} />
                    <AvatarFallback>{booking.djName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{booking.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.djName} • {dateFormatter.format(new Date(booking.start))} • {timeFormatter.format(new Date(booking.start))} - {timeFormatter.format(new Date(booking.end))}
                    </p>
                  </div>
                </div>
                {canApprove ? (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-500"
                      disabled={actionLoading === booking.id}
                      onClick={() => handleStatusChange(booking.id, "approved")}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500"
                      disabled={actionLoading === booking.id}
                      onClick={() => handleStatusChange(booking.id, "rejected")}
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </div>
                ) : (
                  <Badge variant="outline" className="bg-muted/40">
                    Waiting approval
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="week" className="space-y-4">
        <TabsList>
          <TabsTrigger value="week">Week View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="week">
          <Card className="glass-card border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <CardTitle>Weekly Timetable</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => setWeekOffset((prev) => prev - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium min-w-[140px] text-center">
                    {weekOffset === 0 ? "This Week" : weekOffset > 0 ? `+${weekOffset} weeks` : `${weekOffset} weeks`}
                  </span>
                  <Button variant="outline" size="icon" onClick={() => setWeekOffset((prev) => prev + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                {dateFormatter.format(weekStart)} – {dateFormatter.format(weekEnd)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading schedule...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr>
                        <th className="sticky left-0 z-10 bg-background text-left px-3 py-2 text-muted-foreground font-semibold">Time</th>
                        {weekDays.map((day) => (
                          <th key={day.label} className="px-3 py-2 text-left text-muted-foreground font-semibold">
                            <div className="flex flex-col">
                              <span>{day.label}</span>
                              <span className="text-xs text-muted-foreground/80">{dateFormatter.format(day.date)}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {hours.map((hour) => (
                        <tr key={hour} className="border-t border-border/30">
                          <td className="sticky left-0 z-10 bg-background px-3 py-2 font-medium text-muted-foreground">{formatHourLabel(hour)}</td>
                          {weekDays.map((day, index) => {
                            const booking = getBookingForCell(index, hour)
                            const isPending = booking?.status === "pending"
                            return (
                              <td key={`${day.iso}-${hour}`} className="px-2 py-2 align-top">
                                {booking ? (
                                  <div
                                    className={`rounded-lg border px-3 py-2 ${
                                      isPending ? "bg-muted/60 border-dashed text-muted-foreground" : "bg-secondary/50 border-border/50"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-2 text-xs uppercase tracking-wide">
                                      <span>{isPending ? "Pending" : "Approved"}</span>
                                      <span>
                                        {timeFormatter.format(new Date(booking.start))} - {timeFormatter.format(new Date(booking.end))}
                                      </span>
                                    </div>
                                    <p className="font-semibold text-sm mt-1">{booking.title}</p>
                                    <p className="text-xs text-muted-foreground">{booking.djName}</p>
                                  </div>
                                ) : (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start border border-dashed border-border/40 bg-muted/10 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                                    onClick={() => handleCellClick(day.iso, hour)}
                                  >
                                    Request slot
                                  </Button>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle>All Bookings This Week</CardTitle>
              <CardDescription>Combined list for quick scanning.</CardDescription>
            </CardHeader>
            <CardContent>
              {approvedBookings.length + pendingBookings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No bookings yet.</p>
              ) : (
                <div className="space-y-3">
                  {[...approvedBookings, ...pendingBookings]
                    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                    .map((booking) => (
                      <div key={booking.id} className="flex flex-wrap items-center gap-3 border border-border/30 rounded-xl p-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={booking.djAvatar || "/placeholder.svg"} />
                            <AvatarFallback>{booking.djName[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{booking.title}</p>
                            <div className="text-sm text-muted-foreground flex flex-wrap gap-4">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {dateFormatter.format(new Date(booking.start))}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {timeFormatter.format(new Date(booking.start))} - {timeFormatter.format(new Date(booking.end))}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {booking.djName}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge variant={booking.status === "pending" ? "outline" : "secondary"}>{booking.status}</Badge>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
