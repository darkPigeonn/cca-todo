'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function AdminPage() {
    const router = useRouter()

    useEffect(() => {
        // Redirect to claims page by default
        router.push('/admin/claims')
    }, [router])

    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
    )
}

