import { promises as fs } from "fs"
import path from "path"
import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get("file")

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image uploads are allowed" }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  if (buffer.length > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File too large. Max 5MB." }, { status: 413 })
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads")
  await fs.mkdir(uploadsDir, { recursive: true })

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
  const filename = `${Date.now()}-${safeName}`
  const filePath = path.join(uploadsDir, filename)

  await fs.writeFile(filePath, buffer)

  const url = `/uploads/${filename}`
  return NextResponse.json({ url })
}
