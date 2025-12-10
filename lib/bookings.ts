"use server"

import type { Db, WithId } from "mongodb"
import { ObjectId } from "mongodb"
import { getDb } from "@/lib/mongodb"
import type { User } from "@/lib/auth"
import { findUserById } from "@/lib/users"

export type BookingStatus = "pending" | "approved" | "rejected"

export interface Booking {
  id: string
  title: string
  description?: string
  djId: string
  djName: string
  djAvatar?: string
  start: string
  end: string
  status: BookingStatus
  createdById: string
  createdByName: string
  createdAt: string
  updatedAt: string
  actedById?: string
  actedByName?: string
}

interface BookingDoc extends Omit<Booking, "id"> {
  djAvatar?: string
}

const COLLECTION = "bookings"
const ADJACENT_THRESHOLD_MS = 5 * 60 * 1000

async function getCollection(db?: Db) {
  const database = db ?? (await getDb())
  await database.collection<BookingDoc>(COLLECTION).createIndex({ start: 1, end: 1 })
  await database.collection<BookingDoc>(COLLECTION).createIndex({ djId: 1, start: 1 })
  return database.collection<BookingDoc>(COLLECTION)
}

const serialize = ({ _id, ...doc }: WithId<BookingDoc>): Booking => ({
  id: _id.toString(),
  ...doc,
})

export async function listBookings({
  start,
  end,
  statuses,
  includeRejected = false,
}: {
  start?: string
  end?: string
  statuses?: BookingStatus[]
  includeRejected?: boolean
} = {}): Promise<Booking[]> {
  const collection = await getCollection()
  const query: Record<string, unknown> = {}

  if (start || end) {
    query.$and = [
      start ? { end: { $gte: start } } : {},
      end ? { start: { $lte: end } } : {},
    ].filter(Boolean)
  }

  if (statuses?.length) {
    query.status = { $in: statuses }
  } else if (!includeRejected) {
    const defaultStatuses: BookingStatus[] = ["pending", "approved"]
    query.status = { $in: defaultStatuses }
  }

  const docs = await collection
    .find(query)
    .sort({ start: 1 })
    .toArray()

  return docs.map(serialize)
}

export async function createBooking({
  title,
  description,
  djId,
  start,
  end,
  requestedBy,
}: {
  title: string
  description?: string
  djId?: string
  start: string
  end: string
  requestedBy: User
}): Promise<Booking> {
  const { doc, collection } = await buildBookingDoc({
    title,
    description,
    djId,
    start,
    end,
    requestedBy,
  })

  const { insertedId } = await collection.insertOne(doc)
  return { id: insertedId.toString(), ...doc }
}

async function buildBookingDoc({
  title,
  description,
  djId,
  start,
  end,
  requestedBy,
  excludeBookingId,
}: {
  title: string
  description?: string
  djId?: string
  start: string
  end: string
  requestedBy: User
  excludeBookingId?: string
}) {
  const startDate = new Date(start)
  const endDate = new Date(end)
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new Error("Invalid start or end time")
  }
  if (endDate <= startDate) {
    throw new Error("End time must be after start time")
  }

  const djUserId = djId || requestedBy.id
  const dj = await findUserById(djUserId)
  if (!dj || dj.role !== "dj") {
    throw new Error("DJ not found")
  }

  const collection = await getCollection()
  const overlapping = await collection.findOne({
    status: { $in: ["pending", "approved"] },
    start: { $lt: endDate.toISOString() },
    end: { $gt: startDate.toISOString() },
    ...(excludeBookingId ? { _id: { $ne: new ObjectId(excludeBookingId) } } : {}),
  })
  if (overlapping) {
    throw new Error("That slot is already booked")
  }

  const djBookings = await collection
    .find({
      djId: dj.id,
      status: { $in: ["pending", "approved"] },
      ...(excludeBookingId ? { _id: { $ne: new ObjectId(excludeBookingId) } } : {}),
    })
    .toArray()

  const adjacent = djBookings.find((booking) => {
    const existingStart = new Date(booking.start).getTime()
    const existingEnd = new Date(booking.end).getTime()
    return (
      Math.abs(existingEnd - startDate.getTime()) < ADJACENT_THRESHOLD_MS ||
      Math.abs(endDate.getTime() - existingStart) < ADJACENT_THRESHOLD_MS
    )
  })

  if (adjacent) {
    throw new Error("You cannot book back-to-back slots. Leave a break between shows.")
  }

  const nowIso = new Date().toISOString()

  const doc: BookingDoc = {
    title,
    description,
    djId: dj.id,
    djName: dj.displayName,
    djAvatar: dj.avatar,
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    status: "pending",
    createdById: requestedBy.id,
    createdByName: requestedBy.displayName,
    createdAt: nowIso,
    updatedAt: nowIso,
  }

  return { doc, collection, dj }
}

export async function updateBookingStatus({
  id,
  status,
  actedBy,
}: {
  id: string
  status: BookingStatus
  actedBy: User
}): Promise<Booking> {
  const collection = await getCollection()
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        status,
        updatedAt: new Date().toISOString(),
        actedById: actedBy.id,
        actedByName: actedBy.displayName,
      },
    },
    { returnDocument: "after" },
  )
  const value = result?.value
  if (!value) {
    throw new Error("Booking not found")
  }
  return serialize(value as WithId<BookingDoc>)
}

export async function updateBookingDetails({
  id,
  title,
  description,
  start,
  end,
  status,
  actedBy,
}: {
  id: string
  title?: string
  description?: string
  start?: string
  end?: string
  status?: BookingStatus
  actedBy: User
}) {
  const collection = await getCollection()
  const existing = await collection.findOne({ _id: new ObjectId(id) })
  if (!existing) {
    throw new Error("Booking not found")
  }

  const updates: Partial<BookingDoc> = {
    updatedAt: new Date().toISOString(),
    actedById: actedBy.id,
    actedByName: actedBy.displayName,
  }

  if (title) updates.title = title
  if (typeof description === "string") updates.description = description
  if (status) updates.status = status

  if (start || end) {
    const { doc } = await buildBookingDoc({
      title: updates.title || existing.title,
      description: updates.description ?? existing.description,
      djId: existing.djId,
      start: start ?? existing.start,
      end: end ?? existing.end,
      requestedBy: {
        id: existing.djId,
        displayName: existing.djName,
        email: "",
        username: existing.djId,
        role: "dj",
        createdAt: existing.createdAt,
      } as User,
      excludeBookingId: id,
    })
    updates.start = doc.start
    updates.end = doc.end
  }

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updates },
    { returnDocument: "after" },
  )

  if (!result?.value) {
    throw new Error("Booking not found")
  }
  return serialize(result.value as WithId<BookingDoc>)
}

export async function deleteBooking(id: string) {
  const collection = await getCollection()
  const { value } = await collection.findOneAndDelete({ _id: new ObjectId(id) })
  if (!value) {
    throw new Error("Booking not found")
  }
  return serialize(value as WithId<BookingDoc>)
}
