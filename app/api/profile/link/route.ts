import { NextRequest, NextResponse } from 'next/server'
import { MongoUserRepository } from '@/src/infrastructure/repositories/MongoUserRepository'
import { LinkEmployeeUseCase } from '@/src/application/usecases/auth/LinkEmployeeUseCase'

export async function POST(request: NextRequest) {
    try {
        const { uid, employeeId } = await request.json()

        if (!uid || !employeeId) {
            return NextResponse.json({ error: 'UID and Employee ID are required' }, { status: 400 })
        }

        const userRepository = new MongoUserRepository()
        const useCase = new LinkEmployeeUseCase(userRepository)

        await useCase.execute(uid, employeeId)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error linking employee:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
