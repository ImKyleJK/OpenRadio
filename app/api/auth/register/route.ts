import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createToken } from "@/lib/auth.server"
import { createUser, findUserByEmail } from "@/lib/users"

export async function POST(request: Request) {
  try {
    const { email, password, displayName } = await request.json()

    if (!email || !password || !displayName) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (!email.includes("@")) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const existing = await findUserByEmail(email)
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    const newUser = await createUser({ email, password, displayName, role: "listener" })

    const token = await createToken(newUser)

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
