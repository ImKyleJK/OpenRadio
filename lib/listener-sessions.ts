import { ObjectId } from "mongodb"
import { getDb } from "@/lib/mongodb"
import type { User } from "@/lib/auth"

interface ListenerSessionDoc {
  _id: ObjectId
  userId: string
  displayName: string
  avatar?: string
  startedAt: string
  lastSeenAt: string
  endedAt?: string | null
}

const COLLECTION = "listenerSessions"
const ACTIVE_WINDOW_MS = 5 * 60 * 1000

export async function recordListenerStart(user: User) {
  const db = await getDb()
  const collection = db.collection<ListenerSessionDoc>(COLLECTION)
  const nowIso = new Date().toISOString()
  const existing = await collection.findOne({ userId: user.id })

  await collection.updateOne(
    { userId: user.id },
    {
      $set: {
        userId: user.id,
        displayName: user.displayName,
        avatar: user.avatar,
        lastSeenAt: nowIso,
        endedAt: null,
        startedAt: existing?.endedAt ? nowIso : existing?.startedAt ?? nowIso,
      },
    },
    { upsert: true },
  )
}

export async function recordListenerStop(userId: string) {
  const db = await getDb()
  const collection = db.collection<ListenerSessionDoc>(COLLECTION)
  const nowIso = new Date().toISOString()
  await collection.updateOne({ userId }, { $set: { endedAt: nowIso, lastSeenAt: nowIso } })
}

export async function touchListener(userId: string) {
  const db = await getDb()
  const collection = db.collection<ListenerSessionDoc>(COLLECTION)
  const nowIso = new Date().toISOString()
  await collection.updateOne({ userId }, { $set: { lastSeenAt: nowIso }, $setOnInsert: { startedAt: nowIso } }, { upsert: true })
}

export async function getActiveListeners(windowMs = ACTIVE_WINDOW_MS) {
  const db = await getDb()
  const collection = db.collection<ListenerSessionDoc>(COLLECTION)
  const cutoff = new Date(Date.now() - windowMs).toISOString()
  const docs = await collection
    .find({
      lastSeenAt: { $gte: cutoff },
      $or: [{ endedAt: null }, { endedAt: { $exists: false } }, { endedAt: { $gte: cutoff } }],
    })
    .sort({ lastSeenAt: -1 })
    .toArray()
  return docs.map((doc) => ({
    userId: doc.userId,
    displayName: doc.displayName,
    avatar: doc.avatar,
    startedAt: doc.startedAt,
    lastSeenAt: doc.lastSeenAt,
  }))
}
