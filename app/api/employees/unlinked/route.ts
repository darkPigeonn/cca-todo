import { NextRequest, NextResponse } from 'next/server'
import { MongoUserRepository } from '@/src/infrastructure/repositories/MongoUserRepository'
import { GetUnlinkedEmployeesUseCase } from '@/src/application/usecases/auth/GetUnlinkedEmployeesUseCase'

export async function GET() {
    const userRepository = new MongoUserRepository()
    const useCase = new GetUnlinkedEmployeesUseCase(userRepository)

    try {
        const employees = await useCase.execute()
        return NextResponse.json(employees)
    } catch (error) {
        console.error('Error fetching unlinked employees:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
