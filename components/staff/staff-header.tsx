"use client"

import Link from "next/link"
import { useState } from "react"
import type { User } from "@/lib/auth"
import { canWriteArticles, canManageUsers, canManageShows } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Radio,
  Menu,
  LayoutDashboard,
  Calendar,
  Music2,
  FileText,
  Users,
  Settings,
  Wifi,
  Home,
  UserIcon,
  LogOut,
} from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { resolveAvatar } from "@/lib/avatar"

interface StaffHeaderProps {
  user: User
}

export function StaffHeader({ user }: StaffHeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const avatarUrl = resolveAvatar(user)

  const navItems = [
    { title: "Dashboard", href: "/staff", icon: LayoutDashboard, show: true },
    { title: "Schedule", href: "/staff/schedule", icon: Calendar, show: canManageShows(user) },
    { title: "Song Requests", href: "/staff/requests", icon: Music2, show: canManageShows(user) },
    { title: "Connection Guide", href: "/staff/connection", icon: Wifi, show: canManageShows(user) },
    { title: "Articles", href: "/staff/articles", icon: FileText, show: canWriteArticles(user) },
    { title: "Users", href: "/staff/users", icon: Users, show: canManageUsers(user) },
    { title: "Settings", href: "/staff/settings", icon: Settings, show: canManageUsers(user) },
  ].filter((item) => item.show)

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/"
  }

  return (
    <header className="h-16 border-b border-border/50 bg-card/50 backdrop-blur flex items-center justify-between px-4 lg:px-8">
      {/* Mobile menu */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="h-16 flex items-center gap-2 px-6 border-b border-border/50">
            <Radio className="h-6 w-6 text-primary" />
            <span className="font-bold">Staff Panel</span>
          </div>
          <nav className="space-y-1 p-3">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
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
          <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border/50">
            <Link href="/" onClick={() => setIsOpen(false)}>
              <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                <Home className="h-4 w-4" />
                Back to Site
              </Button>
            </Link>
          </div>
        </SheetContent>
      </Sheet>

      <div className="lg:hidden" />

      {/* Page title - desktop only */}
      <div className="hidden lg:block" />

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatarUrl} alt={user.displayName} />
              <AvatarFallback>{user.displayName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline">{user.displayName}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">{user.displayName}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <UserIcon className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
