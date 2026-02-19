import { NextRequest, NextResponse } from 'next/server'
import { MongoUserRepository } from '@/src/infrastructure/repositories/MongoUserRepository'
import { GetUserProfileUseCase } from '@/src/application/usecases/auth/GetUserProfileUseCase'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const uid = searchParams.get('uid')

    if (!uid) {
        return NextResponse.json({ error: 'UID is required' }, { status: 400 })
    }

    const userRepository = new MongoUserRepository()
    const useCase = new GetUserProfileUseCase(userRepository)

    try {
        const profile = await useCase.execute(uid)
        return NextResponse.json(profile)
    } catch (error) {
        console.error('Error in profile API:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
