import bcrypt from "bcryptjs"
import type { Db, WithId, Filter } from "mongodb"
import { ObjectId } from "mongodb"
import { getDb } from "@/lib/mongodb"
import type { User, UserRole } from "@/lib/auth"

const COLLECTION = "users"

interface UserDoc extends Omit<User, "id"> {
  passwordHash: string
}

export async function ensureIndexes(db?: Db) {
  const database = db ?? (await getDb())
  await database.collection<UserDoc>(COLLECTION).createIndex({ email: 1 }, { unique: true })
  await database.collection<UserDoc>(COLLECTION).createIndex({ username: 1 }, { unique: true })
}

const usernameBase = (displayName: string) => {
  const sanitized = displayName
    .toLowerCase()
    .replace(/[^a-z\s_-]/g, "")
    .replace(/\s+/g, "_")
    .replace(/-{2,}/g, "-")
    .replace(/_{2,}/g, "_")
    .replace(/^[-_]+|[-_]+$/g, "")
  return sanitized || "user"
}

export async function generateUniqueUsername(
  displayName: string,
  db?: Db,
  excludeUserId?: ObjectId | string,
): Promise<string> {
  const database = db ?? (await getDb())
  const collection = database.collection<UserDoc>(COLLECTION)
  const excludeId =
    typeof excludeUserId === "string" ? new ObjectId(excludeUserId) : excludeUserId ?? undefined
  const base = usernameBase(displayName)
  let candidate = base
  let suffix = 1

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const filter: Filter<UserDoc> = { username: candidate }
    if (excludeId) {
      filter._id = { $ne: excludeId } as unknown as Filter<UserDoc>["_id"]
    }
    const existing = await collection.findOne(filter, { projection: { _id: 1 } })
    if (!existing) {
      return candidate
    }
    candidate = `${base}_${suffix}`
    suffix += 1
  }
}

async function ensureDocUsername(doc: WithId<UserDoc>, db: Db) {
  if (doc.username) return doc
  const username = await generateUniqueUsername(doc.displayName, db, doc._id)
  await db.collection<UserDoc>(COLLECTION).updateOne({ _id: doc._id }, { $set: { username } })
  return { ...doc, username }
}

export async function findUserByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
  const db = await getDb()
  const doc = await db.collection<UserDoc>(COLLECTION).findOne({ email })
  if (!doc) return null
  const hydrated = await ensureDocUsername(doc as WithId<UserDoc>, db)
  const { _id, passwordHash, ...rest } = hydrated
  return { id: _id.toString(), passwordHash, ...rest }
}

export async function createUser({
  email,
  password,
  displayName,
  role,
  avatar,
}: {
  email: string
  password: string
  displayName: string
  role: UserRole
  avatar?: string
}) {
  const db = await getDb()
  await ensureIndexes(db)
  const passwordHash = await bcrypt.hash(password, 10)
  const username = await generateUniqueUsername(displayName, db)
  const doc: UserDoc = {
    email,
    displayName,
    username,
    role,
    avatar,
    createdAt: new Date().toISOString(),
  }
  const result = await db.collection<UserDoc>(COLLECTION).insertOne({ ...doc, passwordHash })
  return { id: result.insertedId.toString(), ...doc }
}

export async function findUserById(id: string): Promise<User | null> {
  const db = await getDb()
  const doc = await db.collection<UserDoc>(COLLECTION).findOne({ _id: new ObjectId(id) })
  if (!doc) return null
  const hydrated = await ensureDocUsername(doc as WithId<UserDoc>, db)
  const { passwordHash: _ph, _id, ...rest } = hydrated
  return { id: _id.toString(), ...rest }
}

export async function findUserByUsername(username: string): Promise<User | null> {
  const db = await getDb()
  const doc = await db.collection<UserDoc>(COLLECTION).findOne({ username: username.toLowerCase() })
  if (!doc) return null
  const hydrated = await ensureDocUsername(doc as WithId<UserDoc>, db)
  const { passwordHash: _ph, _id, ...rest } = hydrated
  return { id: _id.toString(), ...rest }
}

export async function listDjs(): Promise<User[]> {
  const db = await getDb()
  const cursor = db.collection<UserDoc>(COLLECTION).find({ role: "dj" })
  const docs = await cursor.toArray()
  return Promise.all(
    docs.map(async (doc) => {
      const hydrated = await ensureDocUsername(doc as WithId<UserDoc>, db)
      const { _id, passwordHash: _ph, ...rest } = hydrated
      return { id: _id.toString(), ...rest }
    }),
  )
}

export async function findUserByDisplayName(name: string): Promise<User | null> {
  const db = await getDb()
  const doc = await db
    .collection<UserDoc>(COLLECTION)
    .findOne({ displayName: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" } })
  if (!doc) return null
  const hydrated = await ensureDocUsername(doc as WithId<UserDoc>, db)
  const { passwordHash: _ph, _id, ...rest } = hydrated
  return { id: _id.toString(), ...rest }
}

export async function countUsers(): Promise<number> {
  const db = await getDb()
  return db.collection<UserDoc>(COLLECTION).countDocuments()
}

export async function updateUser(
  id: string,
  data: Partial<Omit<UserDoc, "passwordHash">> & { password?: string },
): Promise<User | null> {
  const db = await getDb()
  const existing = await db.collection<UserDoc>(COLLECTION).findOne({ _id: new ObjectId(id) })
  if (!existing) return null

  const update: Record<string, unknown> = { ...data }
  if (data.password) {
    update.passwordHash = await bcrypt.hash(data.password, 10)
    delete update.password
  }
  if (data.displayName && data.displayName !== existing.displayName) {
    update.username = await generateUniqueUsername(data.displayName, db, existing._id)
  }
  const { matchedCount } = await db.collection<UserDoc>(COLLECTION).updateOne(
    { _id: new ObjectId(id) },
    { $set: update },
  )
  if (!matchedCount) return null
  const updated = await db.collection<UserDoc>(COLLECTION).findOne({ _id: new ObjectId(id) })
  if (!updated) return null
  const { passwordHash: _ph, _id, ...rest } = updated as WithId<UserDoc>
  return { id: _id.toString(), ...rest }
}
