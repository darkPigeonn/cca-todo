import { IProjectRepository } from '../../../domain/repositories/IProjectRepository'
import { Project } from '../../../domain/entities/Project'

export class GetProjectsUseCase {
    constructor(private readonly projectRepository: IProjectRepository) { }

    async execute(): Promise<Project[]> {
        return this.projectRepository.getAllProjects()
    }
}
