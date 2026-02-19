import { ITaskRepository } from '../../domain/repositories/ITaskRepository'
import { CardTask, DbTask } from '../../domain/entities/Task'

export class UpdateTaskUseCase {
    constructor(private readonly repository: ITaskRepository) { }

    async execute(id: string, task: Partial<DbTask>): Promise<CardTask> {
        return this.repository.updateTask(id, task)
    }
}
