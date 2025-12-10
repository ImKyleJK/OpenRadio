import bcrypt from "bcryptjs"
import type { Db, WithId } from "mongodb"
import { getDb } from "@/lib/mongodb"
import type { User, UserRole } from "@/lib/auth"

const COLLECTION = "users"

interface UserDoc extends Omit<User, "id"> {
  passwordHash: string
}

export async function ensureIndexes(db?: Db) {
  const database = db ?? (await getDb())
  await database.collection<UserDoc>(COLLECTION).createIndex({ email: 1 }, { unique: true })
}

export async function findUserByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
  const db = await getDb()
  const doc = await db.collection<UserDoc>(COLLECTION).findOne({ email })
  if (!doc) return null
  const { _id, passwordHash, ...rest } = doc as WithId<UserDoc>
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
  const doc: UserDoc = {
    email,
    displayName,
    role,
    avatar,
    createdAt: new Date().toISOString(),
  }
  const result = await db.collection<UserDoc>(COLLECTION).insertOne({ ...doc, passwordHash })
  return { id: result.insertedId.toString(), ...doc }
}

export async function updateUser(
  id: string,
  data: Partial<Omit<UserDoc, "passwordHash">> & { password?: string },
): Promise<User | null> {
  const db = await getDb()
  const update: Record<string, unknown> = { ...data }
  if (data.password) {
    update.passwordHash = await bcrypt.hash(data.password, 10)
    delete update.password
  }
  const { matchedCount } = await db.collection<UserDoc>(COLLECTION).updateOne(
    { _id: new (await import("mongodb")).ObjectId(id) },
    { $set: update },
  )
  if (!matchedCount) return null
  const updated = await db.collection<UserDoc>(COLLECTION).findOne({ _id: new (await import("mongodb")).ObjectId(id) })
  if (!updated) return null
  const { passwordHash: _ph, _id, ...rest } = updated as WithId<UserDoc>
  return { id: _id.toString(), ...rest }
}
