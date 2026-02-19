import { Project } from '../entities/Project'

export interface IProjectRepository {
    getAllProjects(): Promise<Project[]>
}
