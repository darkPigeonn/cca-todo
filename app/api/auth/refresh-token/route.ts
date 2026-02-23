import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/src/infrastructure/auth/firebaseAdmin'

/**
 * API endpoint untuk verify ID token dan return custom claims
 * 
 * POST /api/auth/refresh-token
 * Body: { idToken: string }
 * 
 * Digunakan untuk mendapatkan custom claims terbaru setelah di-set
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { idToken } = body

        if (!idToken) {
            return NextResponse.json(
                { error: 'ID token is required' },
                { status: 400 }
            )
        }

        // Verify ID token
        const decodedToken = await adminAuth.verifyIdToken(idToken)

        // Get user to get latest custom claims
        const user = await adminAuth.getUser(decodedToken.uid)

        return NextResponse.json({
            success: true,
            uid: decodedToken.uid,
            claims: user.customClaims || {},
            role: user.customClaims?.role || null,
            email: decodedToken.email,
        })
    } catch (error: any) {
        console.error('Error verifying token:', error)
        return NextResponse.json(
            {
                error: 'Token tidak valid atau expired',
                details: error.message,
            },
            { status: 401 }
        )
    }
}

