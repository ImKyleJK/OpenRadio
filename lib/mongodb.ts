import { MongoClient } from "mongodb"

let clientPromise: Promise<MongoClient> | undefined

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

export async function getDb() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error("MONGODB_URI is not set")
  }

  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri)
    global._mongoClientPromise = client.connect()
  }

  clientPromise = global._mongoClientPromise
  const connectedClient = await clientPromise
  return connectedClient.db()
}
