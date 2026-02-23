import { NextResponse } from 'next/server'
import { MongoTaskRepository } from '@/src/infrastructure/repositories/MongoTaskRepository'
import { GetTasksUseCase } from '@/src/application/usecases/GetTasksUseCase'
import { CreateTaskUseCase } from '@/src/application/usecases/CreateTaskUseCase'
import { UpdateTaskUseCase } from '@/src/application/usecases/UpdateTaskUseCase'
import { DeleteTaskUseCase } from '@/src/application/usecases/DeleteTaskUseCase'
import { TaskStatus } from '@/src/domain/entities/Task'
import { MongoUserRepository } from '@/src/infrastructure/repositories/MongoUserRepository'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const employeeId = searchParams.get('employeeId')

  const repository = new MongoTaskRepository()
  const useCase = new GetTasksUseCase(repository)
  const tasks = await useCase.execute(employeeId || undefined)
  console.log(tasks)
  // Get today tasks, backlog tasks, or tasks that are not done (active tasks)
  const today = new Date().toISOString().split('T')[0]
  const filteredTasks = tasks.filter((task) => 
    task.dueDate === today || 
    task.status === TaskStatus.BACKLOG 
  
  )
  
  // Get fullName from employee collection for each task
  const userRepository = new MongoUserRepository()
  const tasksWithUserNames = await Promise.all(
    filteredTasks.map(async (task) => {
      if (task.userId) {
        try {
          const employee = await userRepository.getUserById(task.userId)
          if (employee) {
            return { ...task, userName: employee.name }
          }
        } catch (error) {
          console.error(`Failed to fetch user for task ${task.id}:`, error)
        }
      }
      return task
    })
  )
  
  return NextResponse.json(tasksWithUserNames)
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