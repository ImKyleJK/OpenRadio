import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth.server"
import { createBooking, listBookings, type BookingStatus } from "@/lib/bookings"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const start = searchParams.get("start") || undefined
  const end = searchParams.get("end") || undefined
  const statuses = searchParams.get("statuses")?.split(",").filter(Boolean) as BookingStatus[] | undefined

  const bookings = await listBookings({
    start,
    end,
    statuses,
  })

  return NextResponse.json({ bookings })
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const booking = await createBooking({
      title: body.title,
      description: body.description,
      djId: body.djId,
      start: body.start,
      end: body.end,
      requestedBy: session.user,
    })
    return NextResponse.json({ booking })
  } catch (error) {
    console.error("Failed to create booking", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create booking" }, { status: 400 })
  }
}
