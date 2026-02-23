import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/src/infrastructure/auth/firebaseAdmin'
import { MongoUserRepository } from '@/src/infrastructure/repositories/MongoUserRepository'

/**
 * API endpoint untuk sync custom claims dari MongoDB ke Firebase
 * 
 * POST /api/auth/sync-claims?uid=xxx
 * atau
 * POST /api/auth/sync-claims (sync all users)
 * 
 * Berguna untuk sync role dari database ke Firebase custom claims
 */
export async function POST(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const uid = searchParams.get('uid')

        const userRepository = new MongoUserRepository()

        if (uid) {
            // Sync single user
            const userProfile = await userRepository.getUserByUid(uid)
            if (!userProfile) {
                return NextResponse.json(
                    { error: 'User not found in database' },
                    { status: 404 }
                )
            }

            const claims = {
                role: userProfile.role || 'employee',
            }

            await adminAuth.setCustomUserClaims(uid, claims)

            return NextResponse.json({
                success: true,
                message: 'Custom claims berhasil di-sync',
                uid,
                role: userProfile.role,
            })
        } else {
            // Sync all users (use with caution)
            // Get all employees from MongoDB
            const allEmployees = await userRepository.getUnlinkedEmployees()
            const linkedEmployees = await (async () => {
                const client = await import('@/src/infrastructure/db/mongodb').then(m => m.default)
                const db = (await client).db(process.env.MONGO_DB_NAME)
                const employees = await db.collection('employees').find({ uid: { $exists: true, $ne: null } }).toArray()
                return employees.map((emp: any) => ({
                    uid: emp.uid,
                    role: emp.role || 'employee',
                }))
            })()

            const results = []
            for (const emp of linkedEmployees) {
                try {
                    const claims = {
                        role: emp.role || 'employee',
                    }
                    await adminAuth.setCustomUserClaims(emp.uid, claims)
                    results.push({ uid: emp.uid, role: emp.role, status: 'success' })
                } catch (error: any) {
                    results.push({ uid: emp.uid, role: emp.role, status: 'error', error: error.message })
                }
            }

            return NextResponse.json({
                success: true,
                message: `Berhasil sync ${results.filter(r => r.status === 'success').length} dari ${results.length} users`,
                results,
            })
        }
    } catch (error: any) {
        console.error('Error syncing custom claims:', error)
        return NextResponse.json(
            {
                error: 'Gagal sync custom claims',
                details: error.message,
            },
            { status: 500 }
        )
    }
}

