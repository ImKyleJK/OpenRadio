import { NextResponse } from "next/server"
import { findUserByEmail } from "@/lib/users"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 })
  }

  const normalized = email.trim().toLowerCase()
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)
  if (!isValidEmail) {
    return NextResponse.json({ available: false, valid: false })
  }

  const existing = await findUserByEmail(normalized)
  return NextResponse.json({ available: !existing, valid: true })
}
