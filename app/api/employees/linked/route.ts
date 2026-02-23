import { NextResponse } from 'next/server'
import clientPromise from '@/src/infrastructure/db/mongodb'

export async function GET() {
    try {
        const client = await clientPromise
        const db = client.db(process.env.MONGO_DB_NAME)

        // Get all employees that have uid (linked to Firebase)
        const employees = await db
            .collection('employees')
            .find({ uid: { $exists: true, $ne: null } })
            .toArray()

        const users = employees.map((emp: any) => ({
            uid: emp.uid,
            email: emp.email,
            name: emp.full_name || emp.name || emp.username || '',
            role: emp.role || 'employee',
            id: emp._id.toString(),
        }))

        return NextResponse.json(users)
    } catch (error) {
        console.error('Error fetching linked employees:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

