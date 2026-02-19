import { IUserRepository } from '../../domain/repositories/IUserRepository'
import { UserProfile } from '../../domain/entities/User'
import clientPromise from '../db/mongodb'

export class MongoUserRepository implements IUserRepository {
    async getUserByUid(uid: string): Promise<UserProfile | null> {
        const client = await clientPromise
        const db = client.db(process.env.MONGO_DB_NAME)

        // Using 'employees' collection as requested
        const employee = await db.collection('employees').findOne({ uid })

        if (!employee) return null

        return {
            id: employee._id.toString(),
            uid: employee.uid,
            email: employee.email,
            name: employee.full_name || employee.name || employee.username || '',
            role: employee.role,
            profilePicture: employee.profilePicture || employee.photo,
        }
    }

    async createUserProfile(profile: UserProfile): Promise<void> {
        const client = await clientPromise
        const db = client.db(process.env.MONGO_DB_NAME)

        await db.collection('employees').insertOne({
            ...profile,
            createdAt: new Date(),
        })
    }

    async updateUserProfile(uid: string, profile: Partial<UserProfile>): Promise<void> {
        const client = await clientPromise
        const db = client.db(process.env.MONGO_DB_NAME)

        await db.collection('employees').updateOne(
            { uid },
            { $set: { ...profile, updatedAt: new Date() } }
        )
    }

    async getUnlinkedEmployees(): Promise<UserProfile[]> {
        const client = await clientPromise
        const db = client.db(process.env.MONGO_DB_NAME)

        const employees = await db.collection('employees').find({
            $or: [
                { uid: { $exists: false } },
                { uid: null },
                { uid: '' }
            ]
        }).toArray()

        return employees.map(employee => ({
            id: employee._id.toString(),
            uid: employee.uid || '',
            email: employee.email || '',
            name: employee.full_name || employee.username || '',
            role: employee.role,
            profilePicture: employee.profilePicture || employee.photo,
        }))
    }

    async linkUserToEmployee(uid: string, employeeId: string): Promise<void> {
        const client = await clientPromise
        const db = client.db(process.env.MONGO_DB_NAME)
        const { ObjectId } = require('mongodb')

        const targetId = typeof employeeId === 'string' && employeeId.length === 24
            ? new ObjectId(employeeId)
            : employeeId

        await db.collection('employees').updateOne(
            { _id: targetId },
            { $set: { uid, updatedAt: new Date() } }
        )
    }
}
