import { NextResponse } from "next/server"
import { listDjs } from "@/lib/users"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const djs = await listDjs()
  return NextResponse.json({ djs })
}
