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

  // Get today tasks, eval tasks, or tasks that are not done (active tasks)
  const now = new Date(); // Rabu, 11 Maret 2026
  const dayOfWeek = now.getDay(); // 3 (Rabu)
  
  // Target Jumat adalah indeks 5
  // Rumus: (5 - 3 + 7) % 7 = 2
  let diffToFriday = (5 - dayOfWeek + 7) % 7;
  
  // Jika hari ini Jumat dan mau cari Jumat DEPAN, ubah 0 jadi 7
  // if (diffToFriday === 0) {
  //   diffToFriday = 7;
  // }
  
  const friday = new Date(now);
  friday.setDate(now.getDate() + diffToFriday);
  
  // MENGHINDARI BUG ISOSTRING: Gunakan format lokal YYYY-MM-DD
  const year = friday.getFullYear();
  const month = String(friday.getMonth() + 1).padStart(2, '0');
  const date = String(friday.getDate()).padStart(2, '0');
  const fridayISO = `${year}-${month}-${date}`;
  
  
  const filteredTasks = tasks.filter((task) => 
    task.dueDate === fridayISO || 
    task.status === TaskStatus.EVAL 
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