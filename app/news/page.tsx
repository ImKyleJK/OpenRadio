import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Calendar, User, Search } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const articles = [
  {
    id: "1",
    title: "Summer Music Festival Lineup Announced",
    excerpt:
      "Get ready for the biggest community event of the year! We're excited to reveal the incredible lineup for this summer's music festival featuring local and international artists.",
    author: "Sarah Johnson",
    date: "2024-12-08",
    category: "Events",
    image: "/music-festival-crowd-summer.jpg",
  },
  {
    id: "2",
    title: "New Late Night Show Premieres Friday",
    excerpt:
      "DJ Luna brings a fresh perspective to our late night programming with an eclectic mix of electronic and ambient sounds that will keep you company through the night.",
    author: "Mike Chen",
    date: "2024-12-05",
    category: "Shows",
    image: "/dj-booth-neon-lights-night.jpg",
  },
  {
    id: "3",
    title: "Community Spotlight: Local Artists Feature",
    excerpt:
      "This month we're highlighting incredible local talent. Tune in every Sunday for exclusive interviews and live performances from artists in our community.",
    author: "Alex Rivera",
    date: "2024-12-02",
    category: "Community",
    image: "/local-band-performing-acoustic.jpg",
  },
  {
    id: "4",
    title: "Studio Upgrade Complete: Better Sound Quality",
    excerpt:
      "We've invested in new equipment to bring you the best possible listening experience. Learn about our technical improvements and what they mean for you.",
    author: "Tech Team",
    date: "2024-11-28",
    category: "News",
    image: "/radio-studio-equipment-microphone.jpg",
  },
  {
    id: "5",
    title: "Holiday Programming Schedule Released",
    excerpt:
      "Special shows, holiday music marathons, and community events throughout December. Check out what we have planned for the festive season.",
    author: "Sarah Johnson",
    date: "2024-11-25",
    category: "Announcements",
    image: "/holiday-lights-decorations-festive.jpg",
  },
  {
    id: "6",
    title: "Volunteer Opportunities at the Station",
    excerpt:
      "Want to get involved with your community radio? We're looking for volunteers to help with various aspects of running the station.",
    author: "Admin Team",
    date: "2024-11-20",
    category: "Community",
    image: "/volunteers-team-meeting-radio.jpg",
  },
]

export default function NewsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-12 md:py-16 border-b border-border/50">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">News & Articles</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Stay updated with the latest station news, show updates, community events, and announcements.
            </p>
            <div className="relative max-w-md mt-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search articles..." className="pl-9" />
            </div>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
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
                    <CardDescription className="line-clamp-3 mb-4">{article.excerpt}</CardDescription>
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
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}
