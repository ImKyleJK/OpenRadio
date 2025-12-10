"use server"

import { ObjectId } from "mongodb"
import { getDb } from "@/lib/mongodb"

interface DjFollowDoc {
  _id: ObjectId
  djId: string
  followers: { userId: string; displayName: string; followedAt: string }[]
  count: number
}

const COLLECTION = "djFollows"

export async function getFollowerStats(djId: string) {
  const db = await getDb()
  const doc = await db.collection<DjFollowDoc>(COLLECTION).findOne({ djId })
  return { count: doc?.count ?? 0, followers: doc?.followers ?? [] }
}

export async function toggleFollow({
  djId,
  userId,
  displayName,
}: {
  djId: string
  userId: string
  displayName: string
}) {
  const db = await getDb()
  const collection = db.collection<DjFollowDoc>(COLLECTION)
  const doc = await collection.findOne({ djId })
  const now = new Date().toISOString()
  const alreadyFollowing = doc?.followers?.some((f) => f.userId === userId)

  if (alreadyFollowing) {
    await collection.updateOne(
      { djId },
      {
        $pull: { followers: { userId } },
        $inc: { count: -1 },
      },
    )
    const updated = await collection.findOne({ djId })
    return { isFollowing: false, count: Math.max(updated?.count ?? 0, 0) }
  }

  await collection.updateOne(
    { djId },
    {
      $push: { followers: { userId, displayName, followedAt: now } },
      $inc: { count: 1 },
    },
    { upsert: true },
  )
  const updated = await collection.findOne({ djId })
  return { isFollowing: true, count: updated?.count ?? 1 }
}
