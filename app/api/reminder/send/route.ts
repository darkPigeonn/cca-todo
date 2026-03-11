import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/src/infrastructure/db/mongodb'

const delay = (ms: number) =>
    new Promise(resolve => setTimeout(resolve, ms))
  
  const randomDelay = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min

  export async function POST(request: NextRequest) {
    try {
      const body = await request.json()
      const { employees , message} = body
  
      if (!employees || employees.length === 0) {
        return NextResponse.json(
          { error: 'Employees kosong' },
          { status: 400 }
        )
      }
      console.log("Kirim reminder ke:", employees)
     
  
      for (const emp of employees) {
  
        // random delay 2 - 6 detik
        const wait = randomDelay(2000, 6000)
        await delay(wait)
  
        const res = await fetch('http://192.168.1.140:7020/send-message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            number: emp.phone,
            message: message
          }),
        })
        console.log("Response WA:", await res.text())
  
        console.log(`Terkirim ke ${emp.phone}, delay ${wait}ms`)
      }
  
      return NextResponse.json({ message: 'Reminder terkirim dengan queue' })
  
    } catch (err: any) {
      console.error(err)
      return NextResponse.json(
        { error: err.message },
        { status: 500 }
      )
    }
  }