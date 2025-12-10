"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>
  register: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

// Mock users for demo - in production this would be MongoDB
const mockUsers: (User & { password: string })[] = [
  {
    id: "1",
    email: "admin@radio.com",
    password: "admin123",
    displayName: "Station Admin",
    role: "admin",
    avatar: "/admin-avatar.png",
    bio: "Station administrator and technical lead.",
    createdAt: "2024-01-01",
  },
  {
    id: "2",
    email: "dj@radio.com",
    password: "dj123",
    displayName: "DJ Luna",
    role: "dj",
    avatar: "/dj-avatar-female.jpg",
    bio: "Late night electronic and ambient music specialist.",
    socialLinks: { twitter: "djluna", instagram: "djluna_music" },
    createdAt: "2024-02-15",
  },
  {
    id: "3",
    email: "writer@radio.com",
    password: "writer123",
    displayName: "Sarah Johnson",
    role: "writer",
    avatar: "/writer-avatar.png",
    bio: "Music journalist and content creator.",
    createdAt: "2024-03-01",
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/session")
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error("Session check failed:", error)
      } finally {
        setIsLoading(false)
      }
    }
    checkSession()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (res.ok && data.user) {
        setUser(data.user)
        return { success: true, user: data.user }
      }
      return { success: false, error: data.error }
    } catch {
      return { success: false, error: "Login failed" }
    }
  }

  const register = async (email: string, password: string, displayName: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, displayName }),
      })
      const data = await res.json()
      if (res.ok) {
        setUser(data.user)
        return { success: true }
      }
      return { success: false, error: data.error }
    } catch {
      return { success: false, error: "Registration failed" }
    }
  }

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
  }

  const updateProfile = async (data: Partial<User>) => {
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (res.ok) {
        setUser(result.user)
        return { success: true }
      }
      return { success: false, error: result.error }
    } catch {
      return { success: false, error: "Update failed" }
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}
