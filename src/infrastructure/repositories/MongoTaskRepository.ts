import { ITaskRepository } from '../../domain/repositories/ITaskRepository'
import { CardTask, DbTask } from '../../domain/entities/Task'
import { mapTaskToCard } from '../mappers/TaskMapper'
import clientPromise from '../db/mongodb'
import { ObjectId } from 'mongodb'

export class MongoTaskRepository implements ITaskRepository {
    private async getCollection() {
        const client = await clientPromise
        const db = client.db(process.env.MONGO_DB_NAME)
        return db.collection('tasks')
    }

    async getTasksForCurrentMonth(employeeId?: string): Promise<CardTask[]> {
        const collection = await this.getCollection()

        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

        const query: any = {
            createdAt: {
                $gte: startOfMonth,
                $lte: endOfMonth,
            },
        }

        if (employeeId) {
            query.id_leader = employeeId
        }

        const tasks = await collection.find(query).toArray()
        return tasks.map((t) => mapTaskToCard(t as unknown as DbTask))
    }

    async createTask(task: Partial<DbTask>): Promise<CardTask> {
        const collection = await this.getCollection()
        const { _id, ...taskData } = task as any
        const result = await collection.insertOne({
            ...taskData,
            createdAt: new Date(),
            timeline: task.timeline || [],
        } as any)

        const inserted = await collection.findOne({ _id: result.insertedId })
        return mapTaskToCard(inserted as unknown as DbTask)
    }

    async updateTask(id: string, task: Partial<DbTask>): Promise<CardTask> {
        const collection = await this.getCollection()
        await collection.updateOne(
            { _id: new ObjectId(id) as any },
            { $set: task }
        )

        const updated = await collection.findOne({ _id: new ObjectId(id) as any })
        return mapTaskToCard(updated as unknown as DbTask)
    }

    async deleteTask(id: string): Promise<boolean> {
        const collection = await this.getCollection()
        const result = await collection.deleteOne({ _id: new ObjectId(id) as any })
        return result.deletedCount === 1
    }
}
