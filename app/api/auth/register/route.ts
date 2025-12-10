import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createToken, type User } from "@/lib/auth"

// In production, this would insert into MongoDB with bcrypt hashed password
export async function POST(request: Request) {
  try {
    const { email, password, displayName } = await request.json()

    // Validation
    if (!email || !password || !displayName) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Create new user - in production, save to MongoDB with bcrypt
    const newUser: User = {
      id: Date.now().toString(),
      email,
      displayName,
      role: "listener", // Default role
      createdAt: new Date().toISOString(),
    }

    // Create JWT token
    const token = await createToken(newUser)

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return NextResponse.json({ user: newUser })
  } catch {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
