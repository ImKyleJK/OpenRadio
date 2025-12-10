import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { MongoClient } from "mongodb"
import type { UserRole } from "@/lib/auth"
import { generateUniqueUsername } from "@/lib/users"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { mongoUri, email, password, displayName } = body

    if (!mongoUri || typeof mongoUri !== "string") {
      return NextResponse.json({ error: "MongoDB URI is required" }, { status: 400 })
    }
    if (!email || !password || !displayName) {
      return NextResponse.json({ error: "Email, password, and display name are required" }, { status: 400 })
    }
    if (!email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const client = new MongoClient(mongoUri)
    await client.connect()
    const db = client.db()
    const users = db.collection("users")
    await users.createIndex({ email: 1 }, { unique: true })
    await users.createIndex({ username: 1 }, { unique: true })

    const existing = await users.findOne({ email })
    if (existing) {
      await client.close()
      return NextResponse.json({ error: "Admin email already exists" }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const username = await generateUniqueUsername(displayName, db)
    const adminDoc = {
      email,
      displayName,
      username,
      role: "admin" as UserRole,
      passwordHash,
      createdAt: new Date().toISOString(),
    }
    await users.insertOne(adminDoc)
    await client.close()

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Failed to seed admin", error)
    return NextResponse.json({ error: "Failed to create admin" }, { status: 500 })
  }
}
