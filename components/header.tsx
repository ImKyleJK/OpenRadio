"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  X,
  User,
  LogIn,
  LogOut,
  Settings,
  LayoutDashboard,
  Home,
  CalendarDays,
  Newspaper,
  Info,
} from "lucide-react"
import { canAccessStaff } from "@/lib/auth"
import { stationConfig } from "@/lib/station-config"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    await logout()
    window.location.href = "/"
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "glass-card border-b border-border/50" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative h-10 w-10 rounded-full overflow-hidden border border-border/50 bg-background/50">
              {stationConfig.logo ? (
                <Image
                  src={stationConfig.logo}
                  alt={`${stationConfig.name} logo`}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              ) : (
                <>
                  <Radio className="h-10 w-10 p-2 text-primary" />
                  <div className="absolute inset-0 bg-primary/30 blur-lg rounded-full animate-pulse-glow" />
                </>
              )}
            </div>
            <span className="text-xl font-bold tracking-tight">{stationConfig.name}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              <Home className="h-4 w-4" />
              Home
            </Link>
            <Link
              href="/schedule"
              className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              <CalendarDays className="h-4 w-4" />
              Schedule
            </Link>
            <Link href="/news" className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              <Newspaper className="h-4 w-4" />
              News
            </Link>
            <Link href="/about" className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              <Info className="h-4 w-4" />
              About
            </Link>
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.displayName} />
                      <AvatarFallback>{user.displayName.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.displayName} />
                      <AvatarFallback>{user.displayName.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user.displayName}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  {canAccessStaff(user) && (
                    <DropdownMenuItem asChild>
                      <Link href="/staff" className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Staff Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/profile?tab=settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">
                    <User className="h-4 w-4 mr-2" />
                    Sign Up
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border/50 glass-card rounded-b-xl mt-1">
            <div className="flex flex-col gap-3">
              <Link
                href="/"
                className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-secondary/50 rounded-lg transition-colors flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="h-4 w-4" />
                Home
              </Link>
              <Link
                href="/schedule"
                className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-secondary/50 rounded-lg transition-colors flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <CalendarDays className="h-4 w-4" />
                Schedule
              </Link>
              <Link
                href="/news"
                className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-secondary/50 rounded-lg transition-colors flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Newspaper className="h-4 w-4" />
                News
              </Link>
              <Link
                href="/about"
                className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-secondary/50 rounded-lg transition-colors flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Info className="h-4 w-4" />
                About
              </Link>
              {user ? (
                <>
                  <div className="border-t border-border/50 pt-3 mt-1">
                    <div className="flex items-center gap-3 px-3 py-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.displayName} />
                        <AvatarFallback>{user.displayName.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.displayName}</p>
                        <p className="text-xs text-muted-foreground">{user.role}</p>
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-secondary/50 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  {canAccessStaff(user) && (
                    <Link
                      href="/staff"
                      className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-secondary/50 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Staff Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      handleLogout()
                    }}
                    className="px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-2 pt-3 border-t border-border/50">
                  <Button variant="ghost" size="sm" className="flex-1" asChild>
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button size="sm" className="flex-1" asChild>
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                      Sign Up
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
