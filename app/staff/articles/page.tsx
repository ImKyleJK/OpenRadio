"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FileText, Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Calendar } from "lucide-react"

type ArticleStatus = "draft" | "scheduled" | "published"

interface Article {
  id: string
  title: string
  excerpt: string
  author: string
  status: ArticleStatus
  publishDate?: string
  createdAt: string
  category: string
}

const mockArticles: Article[] = [
  {
    id: "1",
    title: "Summer Music Festival Lineup Announced",
    excerpt: "Get ready for the biggest community event of the year!",
    author: "Sarah Johnson",
    status: "published",
    publishDate: "2024-12-08",
    createdAt: "2024-12-05",
    category: "Events",
  },
  {
    id: "2",
    title: "New Late Night Show Premieres Friday",
    excerpt: "DJ Luna brings a fresh perspective to our late night programming.",
    author: "Mike Chen",
    status: "published",
    publishDate: "2024-12-05",
    createdAt: "2024-12-03",
    category: "Shows",
  },
  {
    id: "3",
    title: "Community Spotlight: Local Artists Feature",
    excerpt: "This month we're highlighting incredible local talent.",
    author: "Alex Rivera",
    status: "published",
    publishDate: "2024-12-02",
    createdAt: "2024-11-28",
    category: "Community",
  },
  {
    id: "4",
    title: "Holiday Programming Schedule",
    excerpt: "Special shows and events for the holiday season.",
    author: "Sarah Johnson",
    status: "scheduled",
    publishDate: "2024-12-15",
    createdAt: "2024-12-08",
    category: "Announcements",
  },
  {
    id: "5",
    title: "Behind the Scenes: Studio Upgrade",
    excerpt: "A look at our new equipment and what it means for sound quality.",
    author: "Mike Chen",
    status: "draft",
    createdAt: "2024-12-10",
    category: "News",
  },
]

export default function ArticlesPage() {
  const [articles, setArticles] = useState(mockArticles)
  const [filter, setFilter] = useState<string>("all")
  const [search, setSearch] = useState("")

  const filteredArticles = articles.filter((a) => {
    const matchesFilter = filter === "all" || a.status === filter
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.author.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const deleteArticle = (id: string) => {
    setArticles(articles.filter((a) => a.id !== id))
  }

  const statusColors: Record<ArticleStatus, string> = {
    draft: "bg-muted text-muted-foreground border-border",
    scheduled: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    published: "bg-green-500/20 text-green-400 border-green-500/30",
  }

  const stats = {
    total: articles.length,
    published: articles.filter((a) => a.status === "published").length,
    scheduled: articles.filter((a) => a.status === "scheduled").length,
    drafts: articles.filter((a) => a.status === "draft").length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Articles</h1>
          <p className="text-muted-foreground">Create and manage blog posts and announcements</p>
        </div>
        <Button asChild>
          <Link href="/staff/articles/new">
            <Plus className="h-4 w-4 mr-2" />
            New Article
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total },
          { label: "Published", value: stats.published },
          { label: "Scheduled", value: stats.scheduled },
          { label: "Drafts", value: stats.drafts },
        ].map((stat, index) => (
          <Card key={index} className="glass-card border-border/50">
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card border-border/50">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                All Articles
              </CardTitle>
              <CardDescription>Manage your station&apos;s content</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-[200px]"
                />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="draft">Drafts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Author</TableHead>
                <TableHead className="hidden sm:table-cell">Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredArticles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>
                    <div className="max-w-[300px]">
                      <p className="font-medium truncate">{article.title}</p>
                      <p className="text-xs text-muted-foreground truncate md:hidden">{article.author}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{article.author}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline">{article.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[article.status]}>{article.status}</Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(article.publishDate || article.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/news/${article.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/staff/articles/${article.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => deleteArticle(article.id)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredArticles.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No articles found</div>
          )}
        </CardContent>
      </Card>
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
