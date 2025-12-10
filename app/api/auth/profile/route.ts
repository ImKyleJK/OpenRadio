import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSession, createToken } from "@/lib/auth.server"
import type { User } from "@/lib/auth"

export async function PATCH(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const updates = await request.json()

    // In production, update MongoDB document
    const updatedUser: User = {
      ...session.user,
      ...updates,
      // Prevent role escalation
      role: session.user.role,
      id: session.user.id,
      email: session.user.email,
    }

    // Create new token with updated user
    const token = await createToken(updatedUser)

    const cookieStore = await cookies()
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return NextResponse.json({ user: updatedUser })
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}
