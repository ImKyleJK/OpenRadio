"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Radio, TrendingUp, Clock, Music2, Heart, ArrowUp, ArrowDown } from "lucide-react"

export default function AnalyticsPage() {
  const stats = [
    { label: "Total Listeners", value: "12,847", change: "+12%", trend: "up", icon: Users },
    { label: "Peak Concurrent", value: "342", change: "+8%", trend: "up", icon: TrendingUp },
    { label: "Avg. Listen Time", value: "47m", change: "-3%", trend: "down", icon: Clock },
    { label: "Song Requests", value: "1,892", change: "+24%", trend: "up", icon: Music2 },
  ]

  const topShows = [
    { name: "Night Vibes", dj: "DJ Luna", listeners: 4521, hours: 192 },
    { name: "Morning Brew", dj: "DJ Sunrise", listeners: 3892, hours: 248 },
    { name: "Lunch Break Beats", dj: "MC Midday", listeners: 2847, hours: 105 },
    { name: "Drive Time", dj: "DJ Rush", listeners: 2156, hours: 84 },
    { name: "Weekend Chill", dj: "Groove Collective", listeners: 1893, hours: 96 },
  ]

  const topSongs = [
    { title: "Blinding Lights", artist: "The Weeknd", requests: 156 },
    { title: "Midnight City", artist: "M83", requests: 142 },
    { title: "Digital Love", artist: "Daft Punk", requests: 128 },
    { title: "Take On Me", artist: "a-ha", requests: 115 },
    { title: "Running Up That Hill", artist: "Kate Bush", requests: 98 },
  ]

  const recentActivity = [
    { type: "listener", message: "Peak listener count reached: 342", time: "2 hours ago" },
    { type: "request", message: "50 new song requests today", time: "4 hours ago" },
    { type: "show", message: "Night Vibes ended with 289 listeners", time: "6 hours ago" },
    { type: "follower", message: "DJ Luna gained 15 new followers", time: "8 hours ago" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Station performance and insights</p>
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
                  <div className="flex items-center gap-1 mt-1">
                    {stat.trend === "up" ? (
                      <ArrowUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <ArrowDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`text-xs ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-muted-foreground">vs last week</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="shows" className="space-y-6">
        <TabsList>
          <TabsTrigger value="shows">Top Shows</TabsTrigger>
          <TabsTrigger value="songs">Top Requests</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="shows">
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-primary" />
                Top Performing Shows
              </CardTitle>
              <CardDescription>Shows ranked by total listeners this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topShows.map((show, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 border border-border/50"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{show.name}</h3>
                      <p className="text-sm text-muted-foreground">{show.dj}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{show.listeners.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">listeners</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="font-medium">{show.hours}h</p>
                      <p className="text-xs text-muted-foreground">airtime</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="songs">
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music2 className="h-5 w-5 text-primary" />
                Most Requested Songs
              </CardTitle>
              <CardDescription>Top song requests this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topSongs.map((song, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 border border-border/50"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{song.title}</h3>
                      <p className="text-sm text-muted-foreground">{song.artist}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-primary" />
                      <span className="font-medium">{song.requests}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest station events and milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30 border border-border/50"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      {activity.type === "listener" && <Users className="h-4 w-4 text-primary" />}
                      {activity.type === "request" && <Music2 className="h-4 w-4 text-primary" />}
                      {activity.type === "show" && <Radio className="h-4 w-4 text-primary" />}
                      {activity.type === "follower" && <Heart className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.message}</p>
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
