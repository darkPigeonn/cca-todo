import { CardTask, DbTask } from '../entities/Task'

export interface ITaskRepository {
    getTasksForCurrentMonth(employeeId?: string): Promise<CardTask[]>
    createTask(task: Partial<DbTask>): Promise<CardTask>
    updateTask(id: string, task: Partial<DbTask>): Promise<CardTask>
    deleteTask(id: string): Promise<boolean>
}
