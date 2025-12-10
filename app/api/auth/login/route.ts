import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createToken, type User } from "@/lib/auth"

// Mock users - in production this would query MongoDB
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

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Find user - in production, query MongoDB and use bcrypt
    const user = mockUsers.find((u) => u.email === email && u.password === password)

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Create user object without password
    const { password: _, ...userWithoutPassword } = user

    // Create JWT token
    const token = await createToken(userWithoutPassword)

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return NextResponse.json({ user: userWithoutPassword })
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
