import { ITaskRepository } from '../../domain/repositories/ITaskRepository'
import { CardTask } from '../../domain/entities/Task'

export class GetTasksUseCase {
    constructor(private readonly repository: ITaskRepository) { }

    async execute(employeeId?: string): Promise<CardTask[]> {
        return this.repository.getTasksForCurrentMonth(employeeId)
    }
}
