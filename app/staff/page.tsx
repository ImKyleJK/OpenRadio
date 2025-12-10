import { getCurrentUser } from "@/lib/auth.server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Music2, FileText, Radio, Calendar, Wifi, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { fetchNowPlayingInfo } from "@/lib/now-playing"
import { listBookings } from "@/lib/bookings"
import { listDjs } from "@/lib/users"
import { getMostLikedTracks, getPopularTracks } from "@/lib/track-stats"

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
})

export default async function StaffDashboardPage() {
  const user = await getCurrentUser()
  const nowPlayingPromise = fetchNowPlayingInfo()

  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 7)

  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const [nowPlaying, bookings, djs, popularTracks, topLikedTracks] = await Promise.all([
    nowPlayingPromise,
    listBookings({ start: start.toISOString(), end: end.toISOString(), statuses: ["pending", "approved"] }),
    listDjs(),
    getPopularTracks(monthStart, 5),
    getMostLikedTracks(5),
  ])

  const pendingBookings = bookings.filter((booking) => booking.status === "pending")
  const approvedBookings = bookings.filter((booking) => booking.status === "approved")

  const nextShows = approvedBookings.slice(0, 3)

  const liveShow = nowPlaying.isLive
    ? bookings.find((booking) => {
        const now = Date.now()
        return new Date(booking.start).getTime() <= now && now <= new Date(booking.end).getTime()
      }) || null
    : null

  const stats = [
    {
      label: "Listeners Online",
      value: nowPlaying.listeners.toString(),
      icon: Users,
      trend: nowPlaying.isLive ? "Live DJ" : "AutoDJ",
    },
    {
      label: "Pending Bookings",
      value: pendingBookings.length.toString(),
      icon: Music2,
      trend: "Waiting review",
    },
    {
      label: "Approved Shows (7d)",
      value: approvedBookings.length.toString(),
      icon: Calendar,
      trend: "Upcoming week",
    },
    {
      label: "Active DJs",
      value: djs.length.toString(),
      icon: FileText,
      trend: "On roster",
    },
  ]

  const formatRange = (startIso: string, endIso: string) =>
    `${timeFormatter.format(new Date(startIso))} - ${timeFormatter.format(new Date(endIso))}`

  const quickLinks = [
    {
      title: "Go Live Guide",
      description: "Connection settings and encoder setup",
      href: "/staff/connection",
      icon: Wifi,
    },
    { title: "View Schedule", description: "See upcoming shows and slots", href: "/staff/schedule", icon: Calendar },
    { title: "Manage Requests", description: "Review and play song requests", href: "/staff/requests", icon: Music2 },
    { title: "Write Article", description: "Create a new blog post", href: "/staff/articles/new", icon: FileText },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.displayName?.split(" ")[0]}</h1>
        <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your station today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="glass-card border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-primary mt-1">{stat.trend}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Current Show */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-primary" />
              Currently On Air
            </CardTitle>
            <CardDescription>Live data pulled from AzuraCast</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-primary/20 flex items-center justify-center">
                <Radio className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{nowPlaying.showName}</h3>
                <p className="text-primary">{nowPlaying.djName}</p>
                <p className="text-sm text-muted-foreground">
                  {nowPlaying.songTitle} • {nowPlaying.songArtist}
                </p>
              </div>
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-1.5 animate-pulse" />
                {nowPlaying.isLive ? "Live" : "AutoDJ"}
              </Badge>
            </div>
            {liveShow && (
              <p className="text-xs text-muted-foreground mt-4">
                Booked slot: {liveShow.title} ({formatRange(liveShow.start, liveShow.end)})
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Requests */}
        <Card className="glass-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Music2 className="h-5 w-5 text-primary" />
              Pending Bookings
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/staff/requests">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingBookings.length ? (
                pendingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{booking.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.djName} • {formatRange(booking.start, booking.end)}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 ml-2">
                      Pending
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No pending booking requests</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link, index) => (
            <Link key={index} href={link.href}>
              <Card className="glass-card border-border/50 h-full hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <link.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{link.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{link.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle>Upcoming Shows</CardTitle>
          <CardDescription>Approved bookings happening next</CardDescription>
        </CardHeader>
        <CardContent>
          {nextShows.length ? (
            <div className="grid gap-3">
              {nextShows.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between border-b border-border/30 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-semibold">{booking.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.djName} • {formatRange(booking.start, booking.end)}
                    </p>
                  </div>
                  <Badge variant="outline">Approved</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No approved shows scheduled for this week yet.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle>Most Played This Month</CardTitle>
            <CardDescription>Based on track plays recorded since {monthStart.toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent>
            {popularTracks.length ? (
              <div className="space-y-3">
                {popularTracks.map((track) => (
                  <div key={track.trackKey} className="flex items-center gap-3 border border-border/40 rounded-lg p-3">
                    <div className="h-10 w-10 rounded-lg overflow-hidden bg-secondary/40">
                      <Image
                        src={track.artwork || "/placeholder.svg"}
                        alt=""
                        width={40}
                        height={40}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{track.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                    </div>
                    <Badge variant="outline">{track.plays} plays</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No track plays recorded yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle>Most Liked Tracks</CardTitle>
            <CardDescription>Based on listener reactions</CardDescription>
          </CardHeader>
          <CardContent>
            {topLikedTracks.length ? (
              <div className="space-y-3">
                {topLikedTracks.map((track) => (
                  <div key={track.trackKey} className="flex items-center gap-3 border border-border/40 rounded-lg p-3">
                    <div className="h-10 w-10 rounded-lg overflow-hidden bg-secondary/40">
                      <Image
                        src={track.artwork || "/placeholder.svg"}
                        alt=""
                        width={40}
                        height={40}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{track.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                    </div>
                    <Badge variant="secondary">{track.likes} likes</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No likes recorded yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
