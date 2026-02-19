import { ITaskRepository } from '../../domain/repositories/ITaskRepository'

export class DeleteTaskUseCase {
    constructor(private readonly repository: ITaskRepository) { }

    async execute(id: string): Promise<boolean> {
        return this.repository.deleteTask(id)
    }
}
