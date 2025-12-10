import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSession, createToken } from "@/lib/auth.server"
import { updateUser } from "@/lib/users"
import type { User } from "@/lib/auth"

export async function PATCH(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const updates = await request.json()

    const sanitizedUpdates = { ...updates }
    delete (sanitizedUpdates as Record<string, unknown>).role
    delete (sanitizedUpdates as Record<string, unknown>).email
    delete (sanitizedUpdates as Record<string, unknown>).username

    const updatedUser = (await updateUser(session.user.id, sanitizedUpdates)) as User | null

    if (!updatedUser) {
      return NextResponse.json({ error: "Update failed" }, { status: 500 })
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
