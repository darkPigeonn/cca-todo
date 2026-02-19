import { NextResponse } from 'next/server'
import { MongoProjectRepository } from '@/src/infrastructure/repositories/MongoProjectRepository'
import { GetProjectsUseCase } from '@/src/application/usecases/projects/GetProjectsUseCase'

export async function GET() {
    const repository = new MongoProjectRepository()
    const useCase = new GetProjectsUseCase(repository)

    try {
        const projects = await useCase.execute()
        return NextResponse.json(projects)
    } catch (error) {
        console.error('Error fetching projects:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
