"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Calendar,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
} from "lucide-react"

interface DJ {
  id: string
  name: string
  avatar: string
}

interface ShowSlot {
  id: string
  name: string
  description?: string
  djId: string
  dj: DJ
  date: string
  startTime: string
  endTime: string
  status: "pending" | "approved" | "rejected" | "completed"
  isLive?: boolean
  isPast?: boolean
}

const mockDJs: DJ[] = [
  { id: "1", name: "DJ Luna", avatar: "/dj-luna-purple-neon.jpg" },
  { id: "2", name: "DJ Sunrise", avatar: "/dj-sunrise-morning-coffee.jpg" },
  { id: "3", name: "MC Midday", avatar: "/mc-midday-hip-hop-style.jpg" },
  { id: "4", name: "DJ Rush", avatar: "/dj-rush-energetic-red.jpg" },
  { id: "5", name: "DJ Midnight", avatar: "/dj-midnight-dark-hoodie.jpg" },
  { id: "6", name: "The Groove Collective", avatar: "/groove-collective-band-relaxed.jpg" },
]

const generateMockSchedule = (): ShowSlot[] => {
  const today = new Date()
  return [
    {
      id: "1",
      name: "Morning Brew",
      description: "Wake up with the best morning hits",
      djId: "2",
      dj: mockDJs[1],
      date: today.toISOString().split("T")[0],
      startTime: "06:00",
      endTime: "10:00",
      status: "completed",
      isPast: true,
    },
    {
      id: "2",
      name: "Lunch Break Beats",
      description: "Keep the energy going through lunch",
      djId: "3",
      dj: mockDJs[2],
      date: today.toISOString().split("T")[0],
      startTime: "12:00",
      endTime: "14:00",
      status: "approved",
      isLive: true,
    },
    {
      id: "3",
      name: "Drive Time",
      description: "Your commute soundtrack",
      djId: "4",
      dj: mockDJs[3],
      date: today.toISOString().split("T")[0],
      startTime: "16:00",
      endTime: "19:00",
      status: "approved",
    },
    {
      id: "4",
      name: "Night Vibes",
      description: "Late night chill session",
      djId: "1",
      dj: mockDJs[0],
      date: today.toISOString().split("T")[0],
      startTime: "22:00",
      endTime: "02:00",
      status: "approved",
    },
    {
      id: "5",
      name: "Weekend Special",
      description: "Special weekend mix",
      djId: "5",
      dj: mockDJs[4],
      date: new Date(today.getTime() + 86400000).toISOString().split("T")[0],
      startTime: "20:00",
      endTime: "00:00",
      status: "pending",
    },
    {
      id: "6",
      name: "Sunday Chill",
      description: "Relaxing Sunday vibes",
      djId: "6",
      dj: mockDJs[5],
      date: new Date(today.getTime() + 172800000).toISOString().split("T")[0],
      startTime: "14:00",
      endTime: "18:00",
      status: "pending",
    },
  ]
}

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const timeSlots = ["06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00", "00:00"]

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<ShowSlot[]>(generateMockSchedule)
  const [selectedDay, setSelectedDay] = useState("Mon")
  const [weekOffset, setWeekOffset] = useState(0)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<ShowSlot | null>(null)
  const [bookingForm, setBookingForm] = useState({
    name: "",
    description: "",
    djId: "",
    date: "",
    startTime: "",
    endTime: "",
  })

  const pendingRequests = schedule.filter((s) => s.status === "pending")
  const approvedShows = schedule.filter((s) => s.status === "approved")

  const handleBookSlot = () => {
    const dj = mockDJs.find((d) => d.id === bookingForm.djId)
    if (!dj) return

    const newSlot: ShowSlot = {
      id: Date.now().toString(),
      name: bookingForm.name,
      description: bookingForm.description,
      djId: bookingForm.djId,
      dj,
      date: bookingForm.date,
      startTime: bookingForm.startTime,
      endTime: bookingForm.endTime,
      status: "pending",
    }

    setSchedule([...schedule, newSlot])
    setIsBookingOpen(false)
    setBookingForm({ name: "", description: "", djId: "", date: "", startTime: "", endTime: "" })
  }

  const handleApprove = (slotId: string) => {
    setSchedule(schedule.map((s) => (s.id === slotId ? { ...s, status: "approved" } : s)))
  }

  const handleReject = (slotId: string) => {
    setSchedule(schedule.map((s) => (s.id === slotId ? { ...s, status: "rejected" } : s)))
  }

  const handleDelete = (slotId: string) => {
    setSchedule(schedule.filter((s) => s.id !== slotId))
  }

  const handleEditSlot = () => {
    if (!selectedSlot) return
    const dj = mockDJs.find((d) => d.id === bookingForm.djId) || selectedSlot.dj

    setSchedule(
      schedule.map((s) =>
        s.id === selectedSlot.id
          ? {
              ...s,
              name: bookingForm.name || s.name,
              description: bookingForm.description || s.description,
              djId: bookingForm.djId || s.djId,
              dj,
              date: bookingForm.date || s.date,
              startTime: bookingForm.startTime || s.startTime,
              endTime: bookingForm.endTime || s.endTime,
            }
          : s,
      ),
    )
    setIsEditOpen(false)
    setSelectedSlot(null)
  }

  const openEdit = (slot: ShowSlot) => {
    setSelectedSlot(slot)
    setBookingForm({
      name: slot.name,
      description: slot.description || "",
      djId: slot.djId,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
    })
    setIsEditOpen(true)
  }

  const statusColors = {
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    approved: "bg-green-500/20 text-green-400 border-green-500/30",
    rejected: "bg-red-500/20 text-red-400 border-red-500/30",
    completed: "bg-muted text-muted-foreground border-border",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule Management</h1>
          <p className="text-muted-foreground">Manage show schedules, approve bookings, and assign DJs</p>
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
              <DialogDescription>Request a time slot for a show. Staff will review and approve.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="showName">Show Name</Label>
                <Input
                  id="showName"
                  value={bookingForm.name}
                  onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                  placeholder="e.g., Friday Night Mix"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={bookingForm.description}
                  onChange={(e) => setBookingForm({ ...bookingForm, description: e.target.value })}
                  placeholder="Describe your show..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dj">DJ</Label>
                <Select
                  value={bookingForm.djId}
                  onValueChange={(value) => setBookingForm({ ...bookingForm, djId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a DJ" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockDJs.map((dj) => (
                      <SelectItem key={dj.id} value={dj.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={dj.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{dj.name[0]}</AvatarFallback>
                          </Avatar>
                          {dj.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={bookingForm.date}
                  onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={bookingForm.startTime}
                    onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={bookingForm.endTime}
                    onChange={(e) => setBookingForm({ ...bookingForm, endTime: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBookingOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleBookSlot} disabled={!bookingForm.name || !bookingForm.djId || !bookingForm.date}>
                Submit Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card className="glass-card border-border/50 border-yellow-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-400" />
              Pending Requests
              <Badge variant="secondary">{pendingRequests.length}</Badge>
            </CardTitle>
            <CardDescription>Review and approve booking requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRequests.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={slot.dj.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{slot.dj.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{slot.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {slot.dj.name} • {formatDate(slot.date)} • {slot.startTime} - {slot.endTime}
                    </p>
                    {slot.description && <p className="text-sm text-muted-foreground mt-1">{slot.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-500 bg-transparent"
                      onClick={() => handleApprove(slot.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500 bg-transparent"
                      onClick={() => handleReject(slot.id)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="week" className="space-y-6">
        <TabsList>
          <TabsTrigger value="week">Week View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="all">All Shows</TabsTrigger>
        </TabsList>

        <TabsContent value="week">
          <Card className="glass-card border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Weekly Schedule</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => setWeekOffset(weekOffset - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium min-w-[100px] text-center">
                    {weekOffset === 0 ? "This Week" : weekOffset > 0 ? `+${weekOffset} weeks` : `${weekOffset} weeks`}
                  </span>
                  <Button variant="outline" size="icon" onClick={() => setWeekOffset(weekOffset + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  <div className="grid grid-cols-8 gap-1 mb-2">
                    <div className="text-sm text-muted-foreground p-2">Time</div>
                    {daysOfWeek.map((day) => (
                      <div key={day} className="text-sm font-medium p-2 text-center">
                        {day}
                      </div>
                    ))}
                  </div>
                  {timeSlots.map((time) => (
                    <div key={time} className="grid grid-cols-8 gap-1">
                      <div className="text-xs text-muted-foreground p-2 border-t border-border/30">{time}</div>
                      {daysOfWeek.map((day) => (
                        <div
                          key={`${day}-${time}`}
                          className="p-1 border-t border-border/30 min-h-[50px] hover:bg-primary/5 transition-colors"
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card className="glass-card border-border/50">
            <CardHeader>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {daysOfWeek.map((day) => (
                  <Button
                    key={day}
                    variant={selectedDay === day ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDay(day)}
                  >
                    {day}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {approvedShows.length > 0 ? (
                  approvedShows.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 border border-border/50"
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={slot.dj.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{slot.dj.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{slot.name}</h3>
                          {slot.isLive && (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                              <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-1 animate-pulse" />
                              Live
                            </Badge>
                          )}
                          <Badge className={statusColors[slot.status]}>{slot.status}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {slot.dj.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(slot.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(slot)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-500">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Show</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{slot.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(slot.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No shows scheduled</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle>All Shows</CardTitle>
              <CardDescription>Complete list of all scheduled shows</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {schedule.map((slot) => (
                  <div
                    key={slot.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                      slot.isPast ? "opacity-60 bg-muted/20" : "bg-secondary/30"
                    } border-border/50`}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={slot.dj.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{slot.dj.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium">{slot.name}</h3>
                        <Badge className={statusColors[slot.status]}>{slot.status}</Badge>
                        {slot.isLive && <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Live</Badge>}
                        {slot.isPast && <Badge variant="outline">Past</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {slot.dj.name} • {formatDate(slot.date)} • {slot.startTime} - {slot.endTime}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(slot)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Show</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{slot.name}"?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(slot.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Show</DialogTitle>
            <DialogDescription>Update show details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editShowName">Show Name</Label>
              <Input
                id="editShowName"
                value={bookingForm.name}
                onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                value={bookingForm.description}
                onChange={(e) => setBookingForm({ ...bookingForm, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDj">DJ</Label>
              <Select
                value={bookingForm.djId}
                onValueChange={(value) => setBookingForm({ ...bookingForm, djId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a DJ" />
                </SelectTrigger>
                <SelectContent>
                  {mockDJs.map((dj) => (
                    <SelectItem key={dj.id} value={dj.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={dj.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{dj.name[0]}</AvatarFallback>
                        </Avatar>
                        {dj.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDate">Date</Label>
              <Input
                id="editDate"
                type="date"
                value={bookingForm.date}
                onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editStartTime">Start Time</Label>
                <Input
                  id="editStartTime"
                  type="time"
                  value={bookingForm.startTime}
                  onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editEndTime">End Time</Label>
                <Input
                  id="editEndTime"
                  type="time"
                  value={bookingForm.endTime}
                  onChange={(e) => setBookingForm({ ...bookingForm, endTime: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSlot}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}
