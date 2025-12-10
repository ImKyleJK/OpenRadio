import { NextResponse } from "next/server"
import { MongoClient } from "mongodb"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { mongoUri } = body as { mongoUri?: string }

    if (!mongoUri || typeof mongoUri !== "string") {
      return NextResponse.json({ error: "MongoDB URI is required" }, { status: 400 })
    }

    const client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 5000 })
    await client.connect()
    const db = client.db()
    await db.command({ ping: 1 })
    const collections = await db.listCollections({}, { nameOnly: true }).toArray()
    await client.close()

    return NextResponse.json({ ok: true, collections: collections.map((collection) => collection.name) })
  } catch (error) {
    console.error("Database verification failed", error)
    return NextResponse.json(
      {
        error: "Unable to connect to MongoDB. Check your URI, credentials, and network.",
      },
      { status: 500 },
    )
  }
}
