"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Users, Search, Plus, Edit, Radio, Clock, Heart, ExternalLink } from "lucide-react"
import Link from "next/link"

interface DJ {
  id: string
  name: string
  email: string
  avatar: string
  bio: string
  showCount: number
  totalHours: number
  followers: number
  status: "active" | "inactive"
  socialLinks?: {
    twitter?: string
    instagram?: string
    soundcloud?: string
  }
  joinedAt: string
}

const mockDJs: DJ[] = [
  {
    id: "1",
    name: "DJ Luna",
    email: "luna@radio.com",
    avatar: "/dj-luna-purple-neon.jpg",
    bio: "Night time specialist. Deep house and techno vibes.",
    showCount: 48,
    totalHours: 192,
    followers: 1240,
    status: "active",
    socialLinks: { twitter: "djluna", instagram: "djluna", soundcloud: "djluna" },
    joinedAt: "2024-01-15",
  },
  {
    id: "2",
    name: "DJ Sunrise",
    email: "sunrise@radio.com",
    avatar: "/dj-sunrise-morning-coffee.jpg",
    bio: "Starting your day right with uplifting beats.",
    showCount: 62,
    totalHours: 248,
    followers: 890,
    status: "active",
    socialLinks: { instagram: "djsunrise" },
    joinedAt: "2023-11-20",
  },
  {
    id: "3",
    name: "MC Midday",
    email: "midday@radio.com",
    avatar: "/mc-midday-hip-hop-style.jpg",
    bio: "Hip-hop and R&B for your lunch break.",
    showCount: 35,
    totalHours: 105,
    followers: 2100,
    status: "active",
    socialLinks: { twitter: "mcmidday", instagram: "mcmidday" },
    joinedAt: "2024-03-01",
  },
  {
    id: "4",
    name: "DJ Rush",
    email: "rush@radio.com",
    avatar: "/dj-rush-energetic-red.jpg",
    bio: "High energy EDM for drive time.",
    showCount: 28,
    totalHours: 84,
    followers: 1560,
    status: "active",
    socialLinks: { soundcloud: "djrush" },
    joinedAt: "2024-02-10",
  },
  {
    id: "5",
    name: "DJ Midnight",
    email: "midnight@radio.com",
    avatar: "/dj-midnight-dark-hoodie.jpg",
    bio: "Late night underground sounds.",
    showCount: 20,
    totalHours: 80,
    followers: 450,
    status: "inactive",
    joinedAt: "2024-04-05",
  },
]

export default function DJsPage() {
  const [djs, setDjs] = useState(mockDJs)
  const [search, setSearch] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newDJ, setNewDJ] = useState({ name: "", email: "", bio: "" })

  const filteredDJs = djs.filter(
    (dj) =>
      dj.name.toLowerCase().includes(search.toLowerCase()) || dj.email.toLowerCase().includes(search.toLowerCase()),
  )

  const activeDJs = djs.filter((dj) => dj.status === "active").length
  const totalShows = djs.reduce((acc, dj) => acc + dj.showCount, 0)
  const totalHours = djs.reduce((acc, dj) => acc + dj.totalHours, 0)

  const handleAddDJ = () => {
    const newDJEntry: DJ = {
      id: Date.now().toString(),
      name: newDJ.name,
      email: newDJ.email,
      avatar: "/placeholder.svg",
      bio: newDJ.bio,
      showCount: 0,
      totalHours: 0,
      followers: 0,
      status: "active",
      joinedAt: new Date().toISOString().split("T")[0],
    }
    setDjs([...djs, newDJEntry])
    setIsAddOpen(false)
    setNewDJ({ name: "", email: "", bio: "" })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">DJ Management</h1>
          <p className="text-muted-foreground">Manage your station's DJs and presenters</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add DJ
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New DJ</DialogTitle>
              <DialogDescription>Add a new DJ or presenter to your station</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="djName">Name</Label>
                <Input
                  id="djName"
                  value={newDJ.name}
                  onChange={(e) => setNewDJ({ ...newDJ, name: e.target.value })}
                  placeholder="DJ Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="djEmail">Email</Label>
                <Input
                  id="djEmail"
                  type="email"
                  value={newDJ.email}
                  onChange={(e) => setNewDJ({ ...newDJ, email: e.target.value })}
                  placeholder="dj@radio.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="djBio">Bio</Label>
                <Textarea
                  id="djBio"
                  value={newDJ.bio}
                  onChange={(e) => setNewDJ({ ...newDJ, bio: e.target.value })}
                  placeholder="Tell us about this DJ..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddDJ} disabled={!newDJ.name || !newDJ.email}>
                Add DJ
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total DJs", value: djs.length, icon: Users },
          { label: "Active DJs", value: activeDJs, icon: Radio },
          { label: "Total Shows", value: totalShows, icon: Radio },
          { label: "Total Hours", value: `${totalHours}h`, icon: Clock },
        ].map((stat, index) => (
          <Card key={index} className="glass-card border-border/50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card border-border/50">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                All DJs
              </CardTitle>
              <CardDescription>Manage DJ accounts and profiles</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search DJs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-[200px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>DJ</TableHead>
                <TableHead className="hidden md:table-cell">Shows</TableHead>
                <TableHead className="hidden lg:table-cell">Hours</TableHead>
                <TableHead className="hidden sm:table-cell">Followers</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDJs.map((dj) => (
                <TableRow key={dj.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={dj.avatar || "/placeholder.svg"} alt={dj.name} />
                        <AvatarFallback>{dj.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{dj.name}</p>
                        <p className="text-xs text-muted-foreground">{dj.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-1">
                      <Radio className="h-3 w-3 text-muted-foreground" />
                      {dj.showCount}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {dj.totalHours}h
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3 text-muted-foreground" />
                      {dj.followers.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        dj.status === "active"
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {dj.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/u/${dj.id}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
