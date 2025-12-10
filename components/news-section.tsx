import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronRight, Calendar, User } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const articles = [
  {
    id: "1",
    title: "Summer Music Festival Lineup Announced",
    excerpt:
      "Get ready for the biggest community event of the year! We're excited to reveal the incredible lineup for this summer's music festival.",
    author: "Sarah Johnson",
    date: "2024-12-08",
    category: "Events",
    image: "/music-festival-crowd-summer.jpg",
  },
  {
    id: "2",
    title: "New Late Night Show Premieres Friday",
    excerpt:
      "DJ Luna brings a fresh perspective to our late night programming with an eclectic mix of electronic and ambient sounds.",
    author: "Mike Chen",
    date: "2024-12-05",
    category: "Shows",
    image: "/dj-booth-neon-lights-night.jpg",
  },
  {
    id: "3",
    title: "Community Spotlight: Local Artists Feature",
    excerpt:
      "This month we're highlighting incredible local talent. Tune in every Sunday for exclusive interviews and live performances.",
    author: "Alex Rivera",
    date: "2024-12-02",
    category: "Community",
    image: "/local-band-performing-acoustic.jpg",
  },
]

export function NewsSection() {
  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Latest News</h2>
            <p className="text-muted-foreground mt-1">Stay updated with station news and events</p>
          </div>
          <Button variant="ghost" asChild className="hidden sm:flex">
            <Link href="/news">
              All Articles
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Card
              key={article.id}
              className="glass-card border-border/50 overflow-hidden group hover:border-primary/50 transition-colors"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={article.image || "/placeholder.svg"}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="secondary">{article.category}</Badge>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                  <Link href={`/news/${article.id}`}>{article.title}</Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="line-clamp-2 mb-4">{article.excerpt}</CardDescription>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{article.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(article.date)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center mt-6 sm:hidden">
          <Button variant="outline" asChild>
            <Link href="/news">
              View All Articles
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}
