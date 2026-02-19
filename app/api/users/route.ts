import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  const client = await clientPromise
  const db = client.db(process.env.MONGODB_DB)

  const users = await db.collection("users").find({}).toArray()

  return NextResponse.json(users)
}

export async function POST(req: Request) {
  const body = await req.json()

  const client = await clientPromise
  const db = client.db(process.env.MONGODB_DB)

  const result = await db.collection("users").insertOne(body)

  return NextResponse.json({
    insertedId: result.insertedId,
  })
}
