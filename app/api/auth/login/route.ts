import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import { createToken } from "@/lib/auth.server"
import { findUserByEmail } from "@/lib/users"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    const user = await findUserByEmail(email)

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash)
    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const { passwordHash: _, ...userWithoutPassword } = user

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
