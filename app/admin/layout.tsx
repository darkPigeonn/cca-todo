'use client'

import React from 'react'
import AdminSidebar from '@/app/components/admin/AdminSidebar'
import { useAuth } from '@/app/providers/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth()
    const router = useRouter()

 

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        } 
        else if (
            user &&
            user.role?.toLowerCase() !== 'coordinator' &&
            user.role?.toLowerCase() !== 'koordinator'
        ) {
            router.push('/')
        }
    }, [user, loading, router])

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        )
    }

    if (!user || (user.role?.toLowerCase() !== 'coordinator' && user.role?.toLowerCase() !== 'koordinator')) {
        return null
    }

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="p-6 md:p-8">{children}</div>
            </main>
        </div>
    )
}

