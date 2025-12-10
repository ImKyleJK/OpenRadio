"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { User } from "@/lib/auth"
import { canWriteArticles, canManageUsers, canManageShows } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Radio,
  LayoutDashboard,
  Calendar,
  Music2,
  FileText,
  Users,
  Settings,
  Wifi,
  Home,
  Disc3,
  BarChart3,
} from "lucide-react"

interface StaffSidebarProps {
  user: User
}

export function StaffSidebar({ user }: StaffSidebarProps) {
  const pathname = usePathname()

  const navItems = [
    {
      title: "Dashboard",
      href: "/staff",
      icon: LayoutDashboard,
      show: true,
    },
    {
      title: "Schedule",
      href: "/staff/schedule",
      icon: Calendar,
      show: canManageShows(user),
    },
    {
      title: "Song Requests",
      href: "/staff/requests",
      icon: Music2,
      show: canManageShows(user),
    },
    {
      title: "Connection Guide",
      href: "/staff/connection",
      icon: Wifi,
      show: canManageShows(user),
    },
    {
      title: "DJ Management",
      href: "/staff/djs",
      icon: Disc3,
      show: canManageUsers(user),
    },
    {
      title: "Articles",
      href: "/staff/articles",
      icon: FileText,
      show: canWriteArticles(user),
    },
    {
      title: "Users",
      href: "/staff/users",
      icon: Users,
      show: canManageUsers(user),
    },
    {
      title: "Analytics",
      href: "/staff/analytics",
      icon: BarChart3,
      show: canManageUsers(user),
    },
    {
      title: "Settings",
      href: "/staff/settings",
      icon: Settings,
      show: canManageUsers(user),
    },
  ]

  const filteredNavItems = navItems.filter((item) => item.show)

  return (
    <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 z-50 border-r border-border/50 bg-card">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2 px-6 border-b border-border/50">
        <Radio className="h-6 w-6 text-primary" />
        <span className="font-bold">Staff Panel</span>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-3">
          {filteredNavItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3",
                  pathname === item.href && "bg-primary/10 text-primary hover:bg-primary/20",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Button>
            </Link>
          ))}
        </nav>
      </ScrollArea>

      {/* Back to site */}
      <div className="p-3 border-t border-border/50">
        <Link href="/">
          <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
            <Home className="h-4 w-4" />
            Back to Site
          </Button>
        </Link>
      </div>
    </aside>
  )
}
