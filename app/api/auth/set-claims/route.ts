import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/src/infrastructure/auth/firebaseAdmin'
import { MongoUserRepository } from '@/src/infrastructure/repositories/MongoUserRepository'

/**
 * API endpoint untuk set custom claims pada Firebase user
 * 
 * POST /api/auth/set-claims
 * Body: { uid: string, role?: string, customClaims?: Record<string, any> }
 * 
 * Custom claims akan di-set berdasarkan role dari database MongoDB
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { uid, role, customClaims } = body

        if (!uid) {
            return NextResponse.json(
                { error: 'UID is required' },
                { status: 400 }
            )
        }

        // Get user role from MongoDB if not provided
        let userRole = role
        if (!userRole) {
            const userRepository = new MongoUserRepository()
            const userProfile = await userRepository.getUserByUid(uid)
            userRole = userProfile?.role || 'employee'
        }

        // Prepare custom claims
        const claims: Record<string, any> = {
            role: userRole,
            ...customClaims,
        }

        // Set custom claims
        await adminAuth.setCustomUserClaims(uid, claims)

        // Get updated user to verify
        const user = await adminAuth.getUser(uid)

        return NextResponse.json({
            success: true,
            message: 'Custom claims berhasil di-set',
            uid,
            claims: user.customClaims,
            role: userRole,
        })
    } catch (error: any) {
        console.error('Error setting custom claims:', error)
        return NextResponse.json(
            {
                error: 'Gagal set custom claims',
                details: error.message,
            },
            { status: 500 }
        )
    }
}

/**
 * GET /api/auth/set-claims?uid=xxx
 * Get current custom claims for a user
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const uid = searchParams.get('uid')

        if (!uid) {
            return NextResponse.json(
                { error: 'UID is required' },
                { status: 400 }
            )
        }

        const user = await adminAuth.getUser(uid)

        return NextResponse.json({
            uid,
            claims: user.customClaims || {},
            role: user.customClaims?.role || null,
        })
    } catch (error: any) {
        console.error('Error getting custom claims:', error)
        return NextResponse.json(
            {
                error: 'Gagal mendapatkan custom claims',
                details: error.message,
            },
            { status: 500 }
        )
    }
}

