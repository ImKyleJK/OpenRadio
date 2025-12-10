import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Radio, Heart, Calendar, Music2, ExternalLink, Twitter, Instagram } from "lucide-react"
import Link from "next/link"

interface UserProfile {
  id: string
  username: string
  displayName: string
  avatar: string
  bio: string
  role: string
  followers: number
  following: number
  showCount: number
  totalHours: number
  joinedAt: string
  socialLinks?: {
    twitter?: string
    instagram?: string
    soundcloud?: string
    website?: string
  }
  recentShows: {
    id: string
    name: string
    date: string
    listeners: number
  }[]
  favoriteGenres: string[]
  isLive?: boolean
}

// Mock user data - in production this would come from a database
const getMockUser = (username: string): UserProfile | null => {
  const users: Record<string, UserProfile> = {
    "1": {
      id: "1",
      username: "djluna",
      displayName: "DJ Luna",
      avatar: "/dj-luna-purple-neon.jpg",
      bio: "Night time specialist bringing you the best in deep house and techno. Broadcasting live every Friday and Saturday night from 10PM. Let's vibe together under the moonlight.",
      role: "dj",
      followers: 1240,
      following: 89,
      showCount: 48,
      totalHours: 192,
      joinedAt: "2024-01-15",
      socialLinks: {
        twitter: "djluna",
        instagram: "djluna",
        soundcloud: "djluna",
        website: "https://djluna.com",
      },
      recentShows: [
        { id: "1", name: "Night Vibes", date: "2024-12-10", listeners: 289 },
        { id: "2", name: "Midnight Session", date: "2024-12-07", listeners: 312 },
        { id: "3", name: "Late Night Grooves", date: "2024-12-03", listeners: 256 },
      ],
      favoriteGenres: ["Deep House", "Techno", "Progressive"],
      isLive: true,
    },
    "2": {
      id: "2",
      username: "djsunrise",
      displayName: "DJ Sunrise",
      avatar: "/dj-sunrise-morning-coffee.jpg",
      bio: "Starting your day right with uplifting beats and positive energy. Catch me every weekday morning from 6AM to 10AM.",
      role: "dj",
      followers: 890,
      following: 45,
      showCount: 62,
      totalHours: 248,
      joinedAt: "2023-11-20",
      socialLinks: {
        instagram: "djsunrise",
      },
      recentShows: [
        { id: "1", name: "Morning Brew", date: "2024-12-10", listeners: 412 },
        { id: "2", name: "Rise & Shine", date: "2024-12-09", listeners: 389 },
      ],
      favoriteGenres: ["Pop", "Indie", "Acoustic"],
    },
    listener1: {
      id: "listener1",
      username: "listener1",
      displayName: "John Doe",
      avatar: "/user-avatar-man-headphones.jpg",
      bio: "Music enthusiast and regular listener. Love discovering new tracks and supporting independent artists.",
      role: "listener",
      followers: 23,
      following: 156,
      showCount: 0,
      totalHours: 0,
      joinedAt: "2024-06-15",
      socialLinks: {
        twitter: "johndoe",
      },
      recentShows: [],
      favoriteGenres: ["Electronic", "Hip-Hop", "Jazz"],
    },
  }

  return users[username] || null
}

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const user = getMockUser(username)

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
            <p className="text-muted-foreground mb-4">The user you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const roleColors: Record<string, string> = {
    admin: "bg-red-500/20 text-red-400 border-red-500/30",
    staff: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    dj: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    writer: "bg-green-500/20 text-green-400 border-green-500/30",
    listener: "bg-muted text-muted-foreground border-border",
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Profile Header */}
        <div className="relative">
          {/* Banner Background */}
          <div className="h-48 md:h-64 bg-gradient-to-br from-primary/30 via-primary/10 to-background" />

          <div className="container mx-auto px-4">
            <div className="relative -mt-20 md:-mt-24 pb-8">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-end">
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-background shadow-xl">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.displayName} />
                    <AvatarFallback className="text-4xl">{user.displayName[0]}</AvatarFallback>
                  </Avatar>
                  {user.isLive && (
                    <Badge className="absolute bottom-2 right-2 bg-red-500 text-white border-0">
                      <span className="w-1.5 h-1.5 bg-white rounded-full mr-1 animate-pulse" />
                      LIVE
                    </Badge>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold">{user.displayName}</h1>
                    <Badge className={roleColors[user.role]}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-4">@{user.username}</p>

                  {/* Stats */}
                  <div className="flex items-center justify-center md:justify-start gap-6 text-sm">
                    <div>
                      <span className="font-bold">{user.followers.toLocaleString()}</span>
                      <span className="text-muted-foreground ml-1">Followers</span>
                    </div>
                    <div>
                      <span className="font-bold">{user.following}</span>
                      <span className="text-muted-foreground ml-1">Following</span>
                    </div>
                    {user.role === "dj" && (
                      <>
                        <div className="hidden sm:block">
                          <span className="font-bold">{user.showCount}</span>
                          <span className="text-muted-foreground ml-1">Shows</span>
                        </div>
                        <div className="hidden sm:block">
                          <span className="font-bold">{user.totalHours}h</span>
                          <span className="text-muted-foreground ml-1">Airtime</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button>
                    <Heart className="h-4 w-4 mr-2" />
                    Follow
                  </Button>
                  {user.isLive && (
                    <Button variant="outline" className="border-red-500/50 text-red-400 bg-transparent">
                      <Radio className="h-4 w-4 mr-2" />
                      Listen Live
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-12">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Bio */}
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">About</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{user.bio}</p>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {formatDate(user.joinedAt)}</span>
                  </div>

                  {/* Genres */}
                  {user.favoriteGenres.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Favorite Genres</p>
                      <div className="flex flex-wrap gap-2">
                        {user.favoriteGenres.map((genre) => (
                          <Badge key={genre} variant="secondary">
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Social Links */}
              {user.socialLinks && Object.keys(user.socialLinks).length > 0 && (
                <Card className="glass-card border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Links</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {user.socialLinks.twitter && (
                      <a
                        href={`https://twitter.com/${user.socialLinks.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <Twitter className="h-5 w-5 text-[#1DA1F2]" />
                        <span className="text-sm">@{user.socialLinks.twitter}</span>
                        <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                      </a>
                    )}
                    {user.socialLinks.instagram && (
                      <a
                        href={`https://instagram.com/${user.socialLinks.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <Instagram className="h-5 w-5 text-[#E4405F]" />
                        <span className="text-sm">@{user.socialLinks.instagram}</span>
                        <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                      </a>
                    )}
                    {user.socialLinks.soundcloud && (
                      <a
                        href={`https://soundcloud.com/${user.socialLinks.soundcloud}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <Music2 className="h-5 w-5 text-[#FF5500]" />
                        <span className="text-sm">{user.socialLinks.soundcloud}</span>
                        <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                      </a>
                    )}
                    {user.socialLinks.website && (
                      <a
                        href={user.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <ExternalLink className="h-5 w-5 text-primary" />
                        <span className="text-sm truncate">{user.socialLinks.website.replace("https://", "")}</span>
                        <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="shows" className="space-y-6">
                <TabsList>
                  {user.role === "dj" && <TabsTrigger value="shows">Shows</TabsTrigger>}
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="favorites">Favorites</TabsTrigger>
                </TabsList>

                {user.role === "dj" && (
                  <TabsContent value="shows">
                    <Card className="glass-card border-border/50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Radio className="h-5 w-5 text-primary" />
                          Recent Shows
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {user.recentShows.length > 0 ? (
                          <div className="space-y-4">
                            {user.recentShows.map((show) => (
                              <div
                                key={show.id}
                                className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 border border-border/50"
                              >
                                <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
                                  <Radio className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold">{show.name}</h3>
                                  <p className="text-sm text-muted-foreground">{formatDate(show.date)}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">{show.listeners}</p>
                                  <p className="text-xs text-muted-foreground">listeners</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-muted-foreground py-8">No shows yet</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}

                <TabsContent value="activity">
                  <Card className="glass-card border-border/50">
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30 border border-border/50">
                          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <Heart className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Requested "Midnight City" by M83</p>
                            <p className="text-sm text-muted-foreground">2 hours ago</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30 border border-border/50">
                          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <Radio className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Listened to "Night Vibes" for 2h 15m</p>
                            <p className="text-sm text-muted-foreground">Yesterday</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="favorites">
                  <Card className="glass-card border-border/50">
                    <CardHeader>
                      <CardTitle>Favorite Shows</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-center text-muted-foreground py-8">No favorites yet</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}
