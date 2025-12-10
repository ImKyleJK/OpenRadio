import { ObjectId } from "mongodb"
import { getDb } from "@/lib/mongodb"
import type { User } from "@/lib/auth"
import type { SpotifyTrack } from "@/lib/spotify"

export interface TrackMeta {
  title: string
  artist: string
  album?: string
  artwork?: string
  spotifyId?: string
  spotifyUrl?: string
}

interface LikeEntry {
  userId: string
  likedAt: string
}

interface TrackStatsDoc extends TrackMeta {
  _id: ObjectId
  trackKey: string
  playCount: number
  playCountsByMonth?: Record<string, number>
  lastPlayedAt?: string
  likes: LikeEntry[]
  likeCount: number
  createdAt: string
  updatedAt: string
}

const TRACK_STATS_COLLECTION = "trackStats"
const TRACK_PLAYS_COLLECTION = "trackPlays"

export const buildTrackKey = (title: string, artist: string) => `${title.trim().toLowerCase()}|${artist.trim().toLowerCase()}`

const sanitizeMeta = (meta: TrackMeta) => ({
  title: meta.title?.trim() || "Unknown Track",
  artist: meta.artist?.trim() || "Unknown Artist",
  album: meta.album?.trim(),
  artwork: meta.artwork,
  spotifyId: meta.spotifyId,
  spotifyUrl: meta.spotifyUrl,
})

export async function recordTrackPlay(meta: TrackMeta, playedAt = new Date()) {
  if (!meta.title || !meta.artist) return
  const db = await getDb()
  const statsCollection = db.collection<TrackStatsDoc>(TRACK_STATS_COLLECTION)
  const playsCollection = db.collection(TRACK_PLAYS_COLLECTION)
  const key = buildTrackKey(meta.title, meta.artist)
  const normalized = sanitizeMeta(meta)
  const monthKey = `${playedAt.getUTCFullYear()}-${String(playedAt.getUTCMonth() + 1).padStart(2, "0")}`
  const nowIso = new Date().toISOString()

  const inc: Record<string, number> = { playCount: 1 }
  inc[`playCountsByMonth.${monthKey}`] = 1

  await statsCollection.updateOne(
    { trackKey: key },
    {
      $setOnInsert: {
        trackKey: key,
        playCount: 0,
        playCountsByMonth: {},
        likes: [],
        likeCount: 0,
        createdAt: nowIso,
      },
      $set: {
        ...normalized,
        updatedAt: nowIso,
        lastPlayedAt: playedAt.toISOString(),
      },
      $inc: inc,
    },
    { upsert: true },
  )

  await playsCollection.insertOne({
    trackKey: key,
    title: normalized.title,
    artist: normalized.artist,
    album: normalized.album,
    artwork: normalized.artwork,
    playedAt,
  })
}

export async function getTrackSummary(title: string, artist: string) {
  const db = await getDb()
  const statsCollection = db.collection<TrackStatsDoc>(TRACK_STATS_COLLECTION)
  const key = buildTrackKey(title, artist)
  const doc = await statsCollection.findOne({ trackKey: key })
  if (!doc) return null
  return { ...doc, id: doc._id.toString() }
}

export async function toggleTrackLike(meta: TrackMeta, user: User) {
  if (!meta.title || !meta.artist) {
    throw new Error("Track information missing")
  }
  const db = await getDb()
  const statsCollection = db.collection<TrackStatsDoc>(TRACK_STATS_COLLECTION)
  const key = buildTrackKey(meta.title, meta.artist)
  const normalized = sanitizeMeta(meta)
  const nowIso = new Date().toISOString()

  const existing = await statsCollection.findOne({ trackKey: key, "likes.userId": user.id })
  const baseSet = {
    ...normalized,
    updatedAt: nowIso,
  }

  if (existing) {
    await statsCollection.updateOne(
      { trackKey: key },
      {
        $set: baseSet,
        $pull: { likes: { userId: user.id } },
        $inc: { likeCount: -1 },
      },
    )
    const updated = await statsCollection.findOne({ trackKey: key })
    return { liked: false, likeCount: Math.max(updated?.likeCount ?? 0, 0) }
  }

  await statsCollection.updateOne(
    { trackKey: key },
    {
      $setOnInsert: {
        trackKey: key,
        playCount: 0,
        playCountsByMonth: {},
        likes: [],
        likeCount: 0,
        createdAt: nowIso,
      },
      $set: baseSet,
      $push: { likes: { userId: user.id, likedAt: nowIso } },
      $inc: { likeCount: 1 },
    },
    { upsert: true },
  )
  const updated = await statsCollection.findOne({ trackKey: key })
  return { liked: true, likeCount: updated?.likeCount ?? 1 }
}

export async function getTrackLikeInfo(title: string, artist: string, userId?: string) {
  const summary = await getTrackSummary(title, artist)
  if (!summary) {
    return { likeCount: 0, liked: false }
  }
  return {
    likeCount: summary.likeCount ?? 0,
    liked: Boolean(userId && summary.likes?.some((like) => like.userId === userId)),
  }
}

export async function getPopularTracks(from: Date, limit = 5) {
  const db = await getDb()
  const playsCollection = db.collection(TRACK_PLAYS_COLLECTION)
  const pipeline = [
    { $match: { playedAt: { $gte: from } } },
    {
      $group: {
        _id: "$trackKey",
        count: { $sum: 1 },
        title: { $last: "$title" },
        artist: { $last: "$artist" },
        album: { $last: "$album" },
        artwork: { $last: "$artwork" },
      },
    },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]
  const results = await playsCollection.aggregate(pipeline).toArray()
  return results.map((entry) => ({
    trackKey: entry._id as string,
    title: entry.title,
    artist: entry.artist,
    album: entry.album,
    artwork: entry.artwork,
    plays: entry.count,
  }))
}

export async function getMostLikedTracks(limit = 5) {
  const db = await getDb()
  const statsCollection = db.collection<TrackStatsDoc>(TRACK_STATS_COLLECTION)
  const docs = await statsCollection
    .find({ likeCount: { $gt: 0 } })
    .sort({ likeCount: -1 })
    .limit(limit)
    .toArray()
  return docs.map((doc) => ({
    trackKey: doc.trackKey,
    title: doc.title,
    artist: doc.artist,
    album: doc.album,
    artwork: doc.artwork,
    likes: doc.likeCount,
  }))
}
