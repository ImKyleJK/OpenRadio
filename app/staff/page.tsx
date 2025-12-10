import { getCurrentUser } from "@/lib/auth.server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Music2, FileText, Radio, Calendar, Wifi, ArrowRight } from "lucide-react"
import Link from "next/link"

export default async function StaffDashboardPage() {
  const user = await getCurrentUser()

  const stats = [
    { label: "Listeners Online", value: "127", icon: Users, trend: "+12%" },
    { label: "Song Requests", value: "24", icon: Music2, trend: "8 pending" },
    { label: "Published Articles", value: "156", icon: FileText, trend: "+3 this week" },
    { label: "Scheduled Shows", value: "12", icon: Calendar, trend: "Today" },
  ]

  const recentRequests = [
    { name: "John D.", song: "Midnight City - M83", time: "2 min ago", status: "pending" },
    { name: "Sarah M.", song: "Blinding Lights - The Weeknd", time: "5 min ago", status: "pending" },
    { name: "Mike R.", song: "Digital Love - Daft Punk", time: "12 min ago", status: "played" },
  ]

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
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-primary/20 flex items-center justify-center">
                <Radio className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Night Vibes</h3>
                <p className="text-primary">DJ Luna</p>
                <p className="text-sm text-muted-foreground">22:00 - 02:00</p>
              </div>
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-1.5 animate-pulse" />
                Live
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Recent Requests */}
        <Card className="glass-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Music2 className="h-5 w-5 text-primary" />
              Recent Requests
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
              {recentRequests.map((request, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{request.song}</p>
                    <p className="text-sm text-muted-foreground">
                      {request.name} • {request.time}
                    </p>
                  </div>
                  <Badge variant={request.status === "pending" ? "secondary" : "outline"} className="shrink-0 ml-2">
                    {request.status}
                  </Badge>
                </div>
              ))}
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
    </div>
  )
}
