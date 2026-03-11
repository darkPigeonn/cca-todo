import { ITaskRepository } from '../../domain/repositories/ITaskRepository'
import { CardTask, DbTask, TaskStatus } from '../../domain/entities/Task'
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
        const client = await clientPromise
        const db = client.db(process.env.MONGO_DB_NAME)
        const employeesCollection = db.collection('employees')

        // Get all active tasks (not DONE) or tasks with deadline in current/future months
        // This ensures we get all relevant tasks regardless of when they were created
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        startOfMonth.setHours(0, 0, 0, 0)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        endOfMonth.setHours(23, 59, 59, 999)
        const query: any = {
            $or: [
                // Tasks that are not done (active tasks)
                { status: { $ne: 60 } },
                // Or tasks with deadline from current month onwards

            ],
            $and: [
                {createdAt: { $gte: startOfMonth } },
                { deadline: { $lte: endOfMonth } },
            ]
        }

        if (employeeId) {
            query.$and = [
                { $or: query.$or },
                { $or: [{ id_leader: employeeId }, { userId: employeeId }] },
            ]
            delete query.$or
        }
       
        const tasks = await collection.find(query).toArray()
        // Fetch user names for tasks
        
        let userMap = new Map<string, string>()
  

        const mappedTasks = tasks.map((t) => {
            const task = t as unknown as DbTask
            const userId = task.userId || task.id_leader
            const userName = userId ? (userMap.get(userId.toString()) || userMap.get(userId)) : undefined
            return mapTaskToCard(task, userName)
        })
      
        return mappedTasks
    }

    async createTask(task: Partial<DbTask>): Promise<CardTask> {
        const collection = await this.getCollection()
        const { _id, ...taskData } = task as any
        
        // Normalize priority: 'medium' -> 'mid' to match DbTask format
        const normalizePriority = (priority: string): 'low' | 'mid' | 'high' => {
            const p = priority?.toLowerCase() || 'low'
            if (p === 'medium' || p === 'mid') return 'mid'
            if (p === 'high') return 'high'
            return 'low'
        }
        
        // Normalize dates to start of day in UTC to avoid timezone issues
        // This ensures the date stored matches the date intended by the user
        const normalizeDateToStartOfDay = (date: Date | string | undefined): Date => {
            if (!date) {
                const now = new Date()
                return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0))
            }
            
            // ALWAYS extract YYYY-MM-DD from string first, regardless of format
            if (typeof date === 'string') {
                // Extract YYYY-MM-DD from string (handle both "2026-02-21" and "2026-02-21T..." formats)
                const dateOnly = date.split('T')[0].split(' ')[0] // Handle both T and space separators
                
                // Validate it's in YYYY-MM-DD format
                if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
                    const [year, month, day] = dateOnly.split('-').map(Number)
                    const utcDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
                    console.log(`[normalizeDate] String "${date}" -> extracted "${dateOnly}" -> UTC: ${utcDate.toISOString()}`)
                    return utcDate
                }
                
                // If format is invalid, log warning and use today
                console.warn(`[normalizeDate] Invalid date format: "${date}", using today`)
                const now = new Date()
                return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0))
            }
            
            // If it's a Date object, extract local date components to preserve user's intended date
            const d = date instanceof Date ? date : new Date(date)
            const utcDate = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0))
            console.log(`[normalizeDate] Date object -> local: ${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} -> UTC: ${utcDate.toISOString()}`)
            return utcDate
        }

        const getFridayThisWeek = () => {
            const d = new Date();
            const day = d.getDay();
            // Jika hari ini Sabtu (6), geser ke belakang atau tetap di minggu yang sama?
            // Logika ini akan mencari Jumat terdekat di minggu kalender yang sama (Minggu-Sabtu)
            const diff = 5 - day; 
            d.setDate(d.getDate() + diff);
            return normalizeDateToStartOfDay(d);
        };
        //all created task must deadline on the friday in this weeks

        // Ensure all required fields are present with proper defaults
        const taskToInsert: Partial<DbTask> = {
            nama_task: taskData.nama_task || '',
            project_type: taskData.project_type || '',
            partner: taskData.partner || '',
            goal : taskData.partner || '',
            deskripsi: taskData.deskripsi || '',
            priority: normalizePriority(taskData.priority),
            deadline: getFridayThisWeek(),
            createdAt: normalizeDateToStartOfDay(taskData.createdAt),
            id_leader: taskData.id_leader || taskData.userId || '',
            userId: taskData.userId || taskData.id_leader || '',
            status: taskData.status ?? 20,
            // Optional fields with defaults
            note: taskData.note || '',
            id_project: taskData.id_project || '',
            createdBy: taskData.createdBy || taskData.id_leader || taskData.userId || '',
            members: taskData.members || [],
            timeline: taskData.timeline || [],
            dependencies: taskData.dependencies || [],
            alasanPenundaan: taskData.alasanPenundaan,
            capaian: taskData.capaian,
            kendala: taskData.kendala,
            loggerStatus: [
                {
                    timestamp: new Date(),
                    status: 'Task Created',
                    details: `Task created with status ${taskData.status ?? 20}`
                }
            ]
        }
    
        const result = await collection.insertOne(taskToInsert as any)
      

        const inserted = await collection.findOne({ _id: result.insertedId })
        return mapTaskToCard(inserted as unknown as DbTask)
    }

    async updateTask(id: string, task: Partial<DbTask>): Promise<CardTask> {
        const collection = await this.getCollection()
        task.updatedAt = new Date() // Add updatedAt timestamp

        // logging status change if status is being updated
        if (task.status) {
            const existing = await collection.findOne({ _id: new ObjectId(id) as any }) as unknown as DbTask
            const oldStatus = existing?.status
            if (oldStatus !== task.status) {
                const oldStatusText = TaskStatus[oldStatus || 0] || `Unknown(${oldStatus})`
                const newStatusText = TaskStatus[task.status] || `Unknown(${task.status})`
                const logEntry = {
                    timestamp: new Date(),
                    status: `Status changed from ${oldStatusText} to ${newStatusText}`,
                    details: `Task status updated from ${oldStatus} to ${task.status}`
                }
                task.loggerStatus = [...(existing?.loggerStatus || []), logEntry]
            }
        }
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
