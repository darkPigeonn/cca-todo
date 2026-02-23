'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { Layout, Shield, Users, LogOut, User as UserIcon } from 'lucide-react'
import { useAuth } from '@/app/providers/AuthContext'
import Link from 'next/link'

interface NavItem {
    name: string
    href: string
    icon: React.ReactNode
    coordinatorOnly?: boolean
}

const navigation: NavItem[] = [
    { name: 'Task Board', href: '/', icon: <Layout size={20} /> },
    { name: 'Custom Claims', href: '/admin/claims', icon: <Shield size={20} />, coordinatorOnly: true },
]

export default function MainSidebar() {
    const pathname = usePathname()
    const { user, logout } = useAuth()
    const isCoordinator = user?.role?.toLowerCase() === 'coordinator' || user?.role?.toLowerCase() === 'koordinator'

    const filteredNav = navigation.filter((item) => !item.coordinatorOnly || isCoordinator)

    return (
        <div className="flex flex-col h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white w-64 border-r border-slate-700">
            {/* Logo/Header */}
            <div className="p-6 border-b border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                        <Layout size={24} />
                    </div>
                    <div>
                        <h1 className="text-lg font-black">Task Monitor</h1>
                        <p className="text-xs text-slate-400">Centrum Carlo Acutis</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {filteredNav.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            {item.icon}
                            <span className="font-bold">{item.name}</span>
                        </Link>
                    )
                })}
            </nav>

        </div>
    )
}

