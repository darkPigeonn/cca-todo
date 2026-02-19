'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../providers/AuthContext'
import { User, Loader2, CheckCircle2, AlertCircle, Search } from 'lucide-react'
import { UserProfile } from '../../src/domain/entities/User'

export default function ConnectPage() {
    const { user, loading, refreshProfile, logout } = useAuth()
    const router = useRouter()
    const [employees, setEmployees] = useState<UserProfile[]>([])
    const [searching, setSearching] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)
    const [linking, setLinking] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        } else if (!loading && user?.isLinked) {
            router.push('/')
        }
    }, [user, loading, router])

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await fetch('/api/employees/unlinked')
                if (res.ok) {
                    const data = await res.json()
                    setEmployees(data)
                }
            } catch (err) {
                console.error('Failed to fetch employees:', err)
                setError('Gagal mengambil daftar karyawan')
            } finally {
                setSearching(false)
            }
        }

        if (user && !user.isLinked) {
            fetchEmployees()
        }
    }, [user])

    const handleConnect = async () => {
        if (!selectedEmployee || !user) return

        setLinking(true)
        setError(null)

        try {
            const res = await fetch('/api/profile/link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: user.uid,
                    employeeId: selectedEmployee
                })
            })

            if (res.ok) {
                await refreshProfile()
                router.push('/')
            } else {
                const data = await res.json()
                setError(data.error || 'Gagal menghubungkan akun')
            }
        } catch (err) {
            setError('Terjadi kesalahan koneksi')
        } finally {
            setLinking(false)
        }
    }

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        )
    }

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] grayscale">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            </div>

            <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-8 md:p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />

                <div className="relative">
                    <div className="mb-8 flex flex-col items-center">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-200 transform -rotate-3">
                            <User className="text-white" size={32} />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Hubungkan Akun</h1>
                        <p className="text-slate-500 font-medium mt-2 text-center">
                            Akun Firebase Anda belum terhubung dengan data karyawan Imavi.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Cari nama atau email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white transition-all outline-none font-medium"
                            />
                        </div>

                        <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                            {searching ? (
                                <div className="flex flex-col items-center py-8">
                                    <Loader2 className="animate-spin text-slate-300 mb-2" size={24} />
                                    <p className="text-slate-400 text-sm font-medium">Mencari karyawan...</p>
                                </div>
                            ) : filteredEmployees.length > 0 ? (
                                filteredEmployees.map((emp) => (
                                    <button
                                        key={emp.id}
                                        onClick={() => setSelectedEmployee(emp.id || null)}
                                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${selectedEmployee === emp.id
                                            ? 'bg-blue-50 border-blue-500 shadow-sm'
                                            : 'bg-white border-slate-100 hover:border-slate-200'
                                            }`}
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                                            {emp.profilePicture ? (
                                                <img src={emp.profilePicture} alt="" className="w-full h-full object-cover rounded-xl" />
                                            ) : (
                                                <User className="text-slate-400" size={20} />
                                            )}
                                        </div>
                                        <div className="text-left overflow-hidden">
                                            <p className="font-bold text-slate-900 truncate">{emp.name}</p>
                                            <p className="text-xs text-slate-500 font-medium truncate">{emp.email}</p>
                                        </div>
                                        {selectedEmployee === (emp as any)._id && (
                                            <CheckCircle2 className="ml-auto text-blue-600 shrink-0" size={20} />
                                        )}
                                    </button>
                                ))
                            ) : (
                                <div className="py-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                    <p className="text-slate-400 font-medium">Karyawan tidak ditemukan</p>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-4 flex items-start gap-3 animate-shake">
                                <AlertCircle className="text-red-500 mt-0.5 shrink-0" size={18} />
                                <p className="text-red-600 text-sm font-bold leading-tight">{error}</p>
                            </div>
                        )}

                        <button
                            onClick={handleConnect}
                            disabled={!selectedEmployee || linking}
                            className={`w-full py-4 rounded-2xl font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3 ${!selectedEmployee || linking
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 hover:scale-[1.02] active:scale-95'
                                }`}
                        >
                            {linking ? (
                                <>
                                    <Loader2 className="animate-spin" size={24} />
                                    <span>Menghubungkan...</span>
                                </>
                            ) : (
                                <span>Hubungkan Sekarang</span>
                            )}
                        </button>

                        <button
                            onClick={logout}
                            className="w-full py-2 text-slate-400 font-bold hover:text-slate-600 transition-colors text-sm"
                        >
                            Keluar dari Akun
                        </button>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }
                .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
            `}} />
        </main>
    )
}
