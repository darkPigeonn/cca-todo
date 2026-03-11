import clientPromise from "@/lib/mongodb";
import { exp } from "firebase/firestore/pipelines";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const client = await clientPromise
        const db = client.db(process.env.MONGO_DB_NAME)

        // Get all employees that have uid (linked to Firebase)
        //get query param employeeId
        const { searchParams } = new URL(request.url)
        const employeeId = searchParams.get('employeeId')

      // Ambil batas awal (misal: 7 hari yang lalu)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        oneWeekAgo.setHours(0, 0, 0, 0);

        const now = new Date();
        const today = new Date(now.setHours(0, 0, 0, 0));
        
        // 1. Cari Senin minggu ini
        const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
        const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Jarak ke Senin terdekat
        const startOfThisWeek = new Date(today);
        startOfThisWeek.setDate(today.getDate() - diffToMonday);
        
        // 2. Cari Senin minggu lalu (Batas Bawah / Start)
        const startOfLastWeek = new Date(startOfThisWeek);
        startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);
        
        // 3. Cari Akhir minggu lalu (Batas Atas / End)
        // Kita gunakan Senin minggu ini sebagai batas "kurang dari" ($lt)
        const endOfLastWeek = startOfThisWeek; 
        
        const task = await db.collection('tasks')
            .find({
                userId: employeeId,
                status: { $in: [10, 20] },
                createdAt: { 
                    $gte: startOfLastWeek, // Senin lalu 00:00
                    $lt: endOfLastWeek     // Senin ini 00:00 (Sama dengan Minggu 23:59:59)
                },                
            })
            .sort({ createdAt: -1 })
            .limit(1)
            .toArray();    
            
            
        return NextResponse.json(task[0] || null)
    } catch (error) {
        console.error('Error fetching linked employees:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}


