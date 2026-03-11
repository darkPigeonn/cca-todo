import clientPromise from "@/lib/mongodb";
import { DbTask } from "@/src/domain/entities/Task";
import { mapTaskToCard } from "@/src/infrastructure/mappers/TaskMapper";
import { exp } from "firebase/firestore/pipelines";
import { NextResponse } from "next/server";


export async function GET(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGO_DB_NAME)

    const { searchParams } = new URL(request.url)

    // Ambil tanggal awal tahun dan awal tahun depan
    const now = new Date()
    const startOfYear = new Date(now.getFullYear(), 0, 1)       // 1 Jan tahun ini
    const startOfNextYear = new Date(now.getFullYear() + 1, 0, 1) // 1 Jan tahun depan

    const tasks = await db.collection('tasks')
      .find({
        nama_task: { $ne: "" },
        status: { $in: [10, 20] },
        deadline: { $gte: startOfYear, $lt: startOfNextYear },
      })
      .sort({ createdAt: -1 })
      .toArray()

      const employees = await db.collection('employees').find({outlets : "imavi"}).toArray()
        let userMap = new Map<string, string>()
        employees.forEach((e) => {
            userMap.set(e._id.toString(), e.full_name || e.fullName || 'Nama tidak tersedia')
        })
        const mappedTasks = tasks.map((t) => {
            const task = t as unknown as DbTask
            const userId = task.userId || task.id_leader
            const userName = userId ? (userMap.get(userId.toString()) || userMap.get(userId)) : undefined
            return mapTaskToCard(task, userName)
        })
    return NextResponse.json(mappedTasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

    