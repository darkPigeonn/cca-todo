import { NextResponse } from 'next/server'
import { MongoTaskRepository } from '@/src/infrastructure/repositories/MongoTaskRepository'
import { GetTasksUseCase } from '@/src/application/usecases/GetTasksUseCase'
import { CreateTaskUseCase } from '@/src/application/usecases/CreateTaskUseCase'
import { UpdateTaskUseCase } from '@/src/application/usecases/UpdateTaskUseCase'
import { DeleteTaskUseCase } from '@/src/application/usecases/DeleteTaskUseCase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const employeeId = searchParams.get('employeeId')

  const repository = new MongoTaskRepository()
  const useCase = new GetTasksUseCase(repository)
  const tasks = await useCase.execute(employeeId || undefined)
  return NextResponse.json(tasks)
}

export async function POST(request: Request) {
  const body = await request.json()
  const repository = new MongoTaskRepository()
  const useCase = new CreateTaskUseCase(repository)
  const task = await useCase.execute(body)
  return NextResponse.json(task)
}

export async function PATCH(request: Request) {
  const body = await request.json()
  const { id, ...data } = body
  const repository = new MongoTaskRepository()
  const useCase = new UpdateTaskUseCase(repository)
  const task = await useCase.execute(id, data)
  return NextResponse.json(task)
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

  const repository = new MongoTaskRepository()
  const useCase = new DeleteTaskUseCase(repository)
  const success = await useCase.execute(id)
  return NextResponse.json({ success })
}