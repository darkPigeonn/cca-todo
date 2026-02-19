import { ITaskRepository } from '../../domain/repositories/ITaskRepository'
import { CardTask, DbTask } from '../../domain/entities/Task'

export class CreateTaskUseCase {
    constructor(private readonly repository: ITaskRepository) { }

    async execute(task: Partial<DbTask>): Promise<CardTask> {
        return this.repository.createTask(task)
    }
}
