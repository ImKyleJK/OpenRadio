import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { findUserByUsername } from "@/lib/users"
import { Calendar, Instagram, Link2, Twitter } from "lucide-react"
import Link from "next/link"

function formatRole(role: string) {
  return role.charAt(0).toUpperCase() + role.slice(1)
}

function formatDate(dateString?: string) {
  if (!dateString) return null
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch {
    return null
  }
}

export default async function UserProfilePage({ params }: { params: { username: string } }) {
  const username = params.username.toLowerCase()
  const user = await findUserByUsername(username)

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-16 text-center">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">User Not Found</h1>
            <p className="text-muted-foreground">We couldn&apos;t find anyone with the username @{username}.</p>
            <Button asChild>
              <Link href="/">Return Home</Link>
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

  const joined = formatDate(user.createdAt)
  const lastActive = formatDate(user.lastActive)
  const social = user.socialLinks || {}

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="h-56 md:h-72 bg-gradient-to-br from-primary/30 via-primary/10 to-background" />
        <div className="container mx-auto px-4">
          <div className="relative mt-16 md:mt-20 pb-16">
            <Card className="max-w-4xl mx-auto glass-card border-border/50 shadow-2xl">
              <CardContent className="p-6 md:p-10 flex flex-col gap-8">
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                  <div className="relative">
                    <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-background">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.displayName} />
                      <AvatarFallback className="text-4xl">
                        {user.displayName?.[0]?.toUpperCase() || user.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <h1 className="text-3xl font-bold">{user.displayName}</h1>
                        <p className="text-muted-foreground text-sm">@{user.username}</p>
                      </div>
                      <Badge className={roleColors[user.role] || "bg-muted"}>{formatRole(user.role)}</Badge>
                    </div>

                    {user.bio && <p className="text-muted-foreground mt-4 whitespace-pre-line">{user.bio}</p>}

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-6">
                      {joined && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Member since {joined}</span>
                        </div>
                      )}
                      {lastActive && <span>Last active {lastActive}</span>}
                    </div>
                  </div>
                </div>

                {(social.twitter || social.instagram || social.website) && (
                  <div className="flex flex-wrap items-center gap-3">
                    {social.twitter && (
                      <a
                        href={`https://twitter.com/${social.twitter.replace(/^@/, "")}`}
                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Twitter className="h-4 w-4" />
                        @{social.twitter.replace(/^@/, "")}
                      </a>
                    )}
                    {social.instagram && (
                      <a
                        href={`https://instagram.com/${social.instagram.replace(/^@/, "")}`}
                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Instagram className="h-4 w-4" />
                        @{social.instagram.replace(/^@/, "")}
                      </a>
                    )}
                    {social.website && (
                      <a
                        href={social.website}
                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Link2 className="h-4 w-4" />
                        Website
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
