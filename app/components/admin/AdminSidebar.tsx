'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Shield, Layout, Users, Settings, LogOut } from 'lucide-react'
import { useAuth } from '@/app/providers/AuthContext'

interface NavItem {
    name: string
    href: string
    icon: React.ReactNode
}

const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/', icon: <Layout size={20} /> },
    { name: 'Custom Claims', href: '/admin/claims', icon: <Shield size={20} /> },
    { name: 'User Management', href: '/admin/users', icon: <Users size={20} /> },
]

export default function AdminSidebar() {
    const pathname = usePathname()
    const { user, logout } = useAuth()

    return (
        <div className="flex flex-col h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white w-64 border-r border-slate-700">
            {/* Logo/Header */}
            <div className="p-6 border-b border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h1 className="text-lg font-black">Admin Panel</h1>
                        <p className="text-xs text-slate-400">Centrum Task Monitor</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navigation.map((item) => {
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

            {/* User Info & Logout */}
            <div className="p-4 border-t border-slate-700">
                <div className="mb-3 p-3 bg-slate-800/50 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-black">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{user?.name || 'User'}</p>
                            <p className="text-xs text-slate-400 truncate">{user?.email || ''}</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-red-600 hover:text-white transition-all font-bold"
                >
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    )
}

