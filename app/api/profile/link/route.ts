import { NextRequest, NextResponse } from 'next/server'
import { MongoUserRepository } from '@/src/infrastructure/repositories/MongoUserRepository'
import { LinkEmployeeUseCase } from '@/src/application/usecases/auth/LinkEmployeeUseCase'
import { adminAuth } from '@/src/infrastructure/auth/firebaseAdmin'

export async function POST(request: NextRequest) {
    try {
        const { uid, employeeId } = await request.json()

        if (!uid || !employeeId) {
            return NextResponse.json({ error: 'UID and Employee ID are required' }, { status: 400 })
        }

        const userRepository = new MongoUserRepository()
        const useCase = new LinkEmployeeUseCase(userRepository)

        // Link employee
        await useCase.execute(uid, employeeId)

        // Get user profile to get role
        const userProfile = await userRepository.getUserByUid(uid)
        
        // Set custom claims based on role from database
        if (userProfile?.role) {
            try {
                await adminAuth.setCustomUserClaims(uid, {
                    role: userProfile.role,
                })
            } catch (claimsError) {
                console.warn('Error setting custom claims after link:', claimsError)
                // Don't fail the request if claims setting fails
            }
        }

        return NextResponse.json({ 
            success: true,
            message: 'Employee berhasil di-link dan custom claims di-set',
            role: userProfile?.role 
        })
    } catch (error) {
        console.error('Error linking employee:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
