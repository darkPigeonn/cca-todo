import { IProjectRepository } from '../../domain/repositories/IProjectRepository'
import { Project } from '../../domain/entities/Project'
import clientPromise from '../db/mongodb'

export class MongoProjectRepository implements IProjectRepository {
    async getAllProjects(): Promise<Project[]> {
        const client = await clientPromise
        const db = client.db(process.env.MONGO_DB_NAME)

        // Using 'projects' collection
        const projects = await db.collection('projects').find({ status: 'active' }).toArray()

        return projects.map(p => ({
            id: p._id.toString(),
            name: p.nama_project || p.nama_proyek || p.name || '',
            description: p.deskripsi || p.description,
        }))
    }
}
