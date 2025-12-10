import { ObjectId } from "mongodb"
import { getDb } from "@/lib/mongodb"

export type SongRequestStatus = "pending" | "played" | "rejected"
export type SongRequestKind = "song" | "message"

export interface SongRequestTrack {
  title: string
  artist: string
  album?: string
  artwork?: string
  spotifyId?: string
}

export interface SongRequest {
  id: string
  kind: SongRequestKind
  track?: SongRequestTrack
  message?: string
  requester: {
    type: "user" | "guest"
    name: string
    email?: string
    userId?: string
    avatar?: string
  }
  status: SongRequestStatus
  createdAt: string
}

interface SongRequestDoc extends Omit<SongRequest, "id"> {
  _id: ObjectId
}

const COLLECTION = "songRequests"

function mapDoc(doc: SongRequestDoc): SongRequest {
  const { _id, ...rest } = doc
  return { id: _id.toString(), ...rest }
}

export async function createSongRequest(data: {
  kind: SongRequestKind
  track?: SongRequestTrack
  message?: string
  requester: SongRequest["requester"]
}) {
  const db = await getDb()
  const nowIso = new Date().toISOString()
  const doc: Omit<SongRequestDoc, "_id"> = {
    ...data,
    status: "pending",
    createdAt: nowIso,
  }
  const result = await db.collection<Omit<SongRequestDoc, "_id">>(COLLECTION).insertOne(doc)
  return mapDoc({ _id: result.insertedId, ...doc } as SongRequestDoc)
}

export async function listSongRequests() {
  const db = await getDb()
  const docs = await db.collection<SongRequestDoc>(COLLECTION).find().sort({ createdAt: -1 }).toArray()
  return docs.map((doc) => mapDoc(doc))
}

export async function updateSongRequestStatus(id: string, status: SongRequestStatus) {
  const db = await getDb()
  const result = await db
    .collection<SongRequestDoc>(COLLECTION)
    .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: { status } }, { returnDocument: "after" })
  if (!result.value) return null
  return mapDoc(result.value)
}
