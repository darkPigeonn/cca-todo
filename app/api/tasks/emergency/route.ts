import { NextResponse } from 'next/server'
import clientPromise from '@/src/infrastructure/db/mongodb'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, userName, reason, timestamp } = body

    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: 'Alasan interupsi wajib diisi' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db(process.env.MONGO_DB_NAME)

    // Store emergency log in a separate collection
    await db.collection('emergency_logs').insertOne({
      userId,
      userName: userName || 'Unknown',
      reason,
      timestamp: timestamp || new Date(),
      createdAt: new Date(),
    })

    return NextResponse.json({ success: true, message: 'Interupsi berhasil dicatat' })
  } catch (error) {
    console.error('Error logging emergency:', error)
    return NextResponse.json({ error: 'Gagal mencatat interupsi' }, { status: 500 })
  }
}

