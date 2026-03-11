'use client'

import React, { useState, useEffect } from 'react'
import {
    Shield,
    User,
    RefreshCw,
    CheckCircle,
    XCircle,
    Loader2,
    AlertCircle,
    Search,
    Users,
    Settings,
} from 'lucide-react'

interface UserClaims {
    uid: string
    email?: string
    name?: string
    role?: string
    claims?: Record<string, any>
    dbRole?: string
}

export default function CustomClaimsPage() {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [searchUid, setSearchUid] = useState('')
    const [userClaims, setUserClaims] = useState<UserClaims | null>(null)
    const [selectedRole, setSelectedRole] = useState('employee')
    const [syncing, setSyncing] = useState(false)
    const [allUsers, setAllUsers] = useState<UserClaims[]>([])
    const [showAllUsers, setShowAllUsers] = useState(false)
    const [showPhoneModal, setShowPhoneModal] = useState(false)
    const [phoneNumber, setPhoneNumber] = useState('')
    const [savingPhone, setSavingPhone] = useState(false)
    const [selectedUid, setSelectedUid] = useState<string | null>(null)

    const handleGetClaims = async () => {
        if (!searchUid.trim()) {
            setMessage({ type: 'error', text: 'UID tidak boleh kosong' })
            return
        }

        setLoading(true)
        setMessage(null)
        try {
            const res = await fetch(`/api/auth/set-claims?uid=${searchUid}`)
            const data = await res.json()

            if (res.ok) {
                setUserClaims({
                    uid: searchUid,
                    role: data.role,
                    claims: data.claims,
                })
                setMessage({ type: 'success', text: 'Claims berhasil diambil' })
            } else {
                setMessage({ type: 'error', text: data.error || 'Gagal mengambil claims' })
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Terjadi kesalahan' })
        } finally {
            setLoading(false)
        }
    }

    const handleSetClaims = async () => {
        if (!searchUid.trim()) {
            setMessage({ type: 'error', text: 'UID tidak boleh kosong' })
            return
        }

        setLoading(true)
        setMessage(null)
        try {
            const res = await fetch('/api/auth/set-claims', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: searchUid,
                    role: selectedRole,
                }),
            })

            const data = await res.json()

            if (res.ok) {
                setMessage({ type: 'success', text: data.message || 'Claims berhasil di-set' })
                // Refresh claims
                await handleGetClaims()
            } else {
                setMessage({ type: 'error', text: data.error || 'Gagal set claims' })
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Terjadi kesalahan' })
        } finally {
            setLoading(false)
        }
    }

    const handleSyncClaims = async (uid?: string) => {
        setSyncing(true)
        setMessage(null)
        try {
            const url = uid ? `/api/auth/sync-claims?uid=${uid}` : '/api/auth/sync-claims'
            const res = await fetch(url, { method: 'POST' })
            const data = await res.json()

            if (res.ok) {
                setMessage({
                    type: 'success',
                    text: uid
                        ? 'Claims berhasil di-sync untuk user ini'
                        : data.message || 'Claims berhasil di-sync untuk semua user',
                })
                if (uid) {
                    await handleGetClaims()
                } else {
                    await fetchAllUsers()
                }
            } else {
                setMessage({ type: 'error', text: data.error || 'Gagal sync claims' })
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Terjadi kesalahan' })
        } finally {
            setSyncing(false)
        }
    }

    const fetchAllUsers = async () => {
        setLoading(true)
        try {
            // Fetch linked employees from MongoDB
            const res = await fetch('/api/employees/linked')
            if (res.ok) {
                const users = await res.json()
                // Get claims for each user
                const usersWithClaims = await Promise.all(
                    users.map(async (u: any) => {
                        try {
                            const claimsRes = await fetch(`/api/auth/set-claims?uid=${u.uid}`)
                            if (claimsRes.ok) {
                                const claimsData = await claimsRes.json()
                                return {
                                    uid: u.uid,
                                    email: u.email,
                                    name: u.name,
                                    role: claimsData.role,
                                    claims: claimsData.claims,
                                    dbRole: u.role,
                                }
                            }
                        } catch (e) {
                            console.error('Error fetching claims for', u.uid, e)
                        }
                        return {
                            uid: u.uid,
                            email: u.email,
                            name: u.name,
                            role: null,
                            claims: {},
                            dbRole: u.role,
                        }
                    })
                )
                setAllUsers(usersWithClaims)
            }
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSavePhone = async (uid:string) => {
       
       
    
        try {
            setSavingPhone(true)
    
            const res = await fetch('/api/employees/linked/', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: uid,
                    phoneNumber,
                }),
            })
    
            const data = await res.json()
    
            if (res.ok) {
                setMessage({ type: 'success', text: 'Nomor HP berhasil disimpan' })
                setShowPhoneModal(false)
                setPhoneNumber('')
            } else {
                setMessage({ type: 'error', text: data.error || 'Gagal menyimpan nomor HP' })
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message })
        } finally {
            setSavingPhone(false)
        }
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                        <Shield className="text-white" size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Custom Claims Management</h1>
                        <p className="text-slate-600 font-medium">Kelola role dan permissions Firebase users dengan mudah</p>
                    </div>
                </div>
            </div>

                {/* Message Alert */}
                {message && (
                    <div
                        className={`mb-6 p-4 rounded-xl flex items-center gap-3 shadow-md animate-in slide-in-from-top ${
                            message.type === 'success'
                                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 text-green-800'
                                : 'bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 text-red-800'
                        }`}
                    >
                        {message.type === 'success' ? (
                            <CheckCircle size={22} className="text-green-600" />
                        ) : (
                            <XCircle size={22} className="text-red-600" />
                        )}
                        <span className="font-bold flex-1">{message.text}</span>
                        <button
                            onClick={() => setMessage(null)}
                            className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-white/50 rounded"
                        >
                            <XCircle size={18} />
                        </button>
                    </div>
                )}

                {/* Quick Actions Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <User className="text-blue-600" size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase">Total Users</p>
                                <p className="text-lg font-extrabold text-slate-900">{allUsers.length || '-'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle className="text-green-600" size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase">With Claims</p>
                                <p className="text-lg font-extrabold text-slate-900">
                                    {allUsers.filter(u => u.role).length || '-'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <AlertCircle className="text-orange-600" size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase">Without Claims</p>
                                <p className="text-lg font-extrabold text-slate-900">
                                    {allUsers.filter(u => !u.role).length || '-'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Set Claims Section */}
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 lg:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-100 rounded-xl">
                                <Settings className="text-blue-600" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900">Set Custom Claims</h2>
                                <p className="text-xs text-slate-500 mt-0.5">Atur role untuk user tertentu</p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            {/* Step 1: Search User */}
                            <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 rounded-xl border border-slate-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-xs font-black rounded-full">1</span>
                                    <label className="text-sm font-bold text-slate-700">
                                        Cari User
                                    </label>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={searchUid}
                                        onChange={(e) => setSearchUid(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleGetClaims()}
                                        placeholder="Masukkan Firebase UID..."
                                        className="flex-1 p-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none font-medium text-slate-900 placeholder:text-slate-400 transition-all"
                                    />
                                    <button
                                        onClick={handleGetClaims}
                                        disabled={loading || !searchUid.trim()}
                                        className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {loading ? (
                                            <Loader2 className="animate-spin" size={18} />
                                        ) : (
                                            <Search size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Step 2: Select Role */}
                            {userClaims && (
                                <div className="bg-gradient-to-br from-slate-50 to-emerald-50/30 p-4 rounded-xl border border-slate-200">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="flex items-center justify-center w-6 h-6 bg-emerald-600 text-white text-xs font-black rounded-full">2</span>
                                        <label className="text-sm font-bold text-slate-700">
                                            Pilih Role
                                        </label>
                                    </div>
                                    <select
                                        value={selectedRole}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                        className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none font-medium text-slate-900 transition-all"
                                    >
                                        <option value="employee">👤 Employee</option>
                                        <option value="coordinator">👑 Coordinator</option>
                                        <option value="koordinator">👑 Koordinator</option>
                                        <option value="admin">🛡️ Admin</option>
                                    </select>
                                </div>
                            )}

                            {/* Step 3: Actions */}
                            {userClaims && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleSetClaims}
                                        disabled={loading || !searchUid.trim()}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black py-3.5 rounded-xl transition-all shadow-lg shadow-blue-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="animate-spin" size={18} />
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Shield size={18} />
                                                <span>Set Claims</span>
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleSyncClaims(searchUid)}
                                        disabled={syncing || !searchUid.trim()}
                                        className="px-5 py-3.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                                        title="Sync dari Database"
                                    >
                                        {syncing ? (
                                            <Loader2 className="animate-spin" size={18} />
                                        ) : (
                                            <RefreshCw size={18} />
                                        )}
                                    </button>


                                </div>
                            )}
                        </div>

                        {/* Current Claims Display */}
                        {userClaims && (
                            <div className="mt-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <CheckCircle className="text-blue-600" size={18} />
                                    <h3 className="text-sm font-black text-slate-900">Current Claims</h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                                        <span className="text-xs font-bold text-slate-600 uppercase">UID:</span>
                                        <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                                            {userClaims.uid.substring(0, 24)}...
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                                        <span className="text-xs font-bold text-slate-600 uppercase">Role:</span>
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                            userClaims.role === 'coordinator' || userClaims.role === 'koordinator'
                                                ? 'bg-purple-100 text-purple-700'
                                                : userClaims.role === 'admin'
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-green-100 text-green-700'
                                        }`}>
                                            {userClaims.role || '❌ Tidak ada'}
                                        </span>
                                    </div>
                                    {userClaims.claims && Object.keys(userClaims.claims).length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-blue-200">
                                            <span className="text-xs font-bold text-slate-600 uppercase mb-2 block">All Claims:</span>
                                            <pre className="text-xs bg-white/80 p-3 rounded-lg border border-blue-200 overflow-auto max-h-32 font-mono">
                                                {JSON.stringify(userClaims.claims, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sync All Section */}
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 lg:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-green-100 rounded-xl">
                                <Users className="text-green-600" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900">Bulk Operations</h2>
                                <p className="text-xs text-slate-500 mt-0.5">Sync semua users sekaligus</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                                <p className="text-sm text-slate-700 mb-4 font-medium">
                                    Sync custom claims untuk semua user dari database MongoDB ke Firebase. Proses ini akan
                                    mengambil role dari database dan meng-set sebagai custom claims.
                                </p>
                                <button
                                    onClick={() => handleSyncClaims()}
                                    disabled={syncing}
                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-black py-3.5 rounded-xl transition-all shadow-lg shadow-green-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {syncing ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} />
                                            <span>Syncing All Users...</span>
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw size={18} />
                                            <span>Sync All Users</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="text-amber-600 mt-0.5 shrink-0" size={20} />
                                    <div className="text-sm text-amber-800">
                                        <p className="font-bold mb-1.5">⚠️ Perhatian:</p>
                                        <p className="leading-relaxed">
                                            Setelah sync, user perlu <strong>refresh token</strong> untuk mendapatkan claims terbaru. 
                                            User bisa logout dan login lagi, atau refresh token secara manual.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setShowAllUsers(!showAllUsers)
                                    if (!showAllUsers && allUsers.length === 0) {
                                        fetchAllUsers()
                                    }
                                }}
                                className="w-full bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 font-bold py-3 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 border border-slate-300"
                            >
                                <Users size={18} />
                                <span>{showAllUsers ? 'Sembunyikan' : 'Tampilkan'} Semua Users</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* All Users List */}
                {showAllUsers && (
                    <div className="mt-6 bg-white rounded-2xl shadow-xl border border-slate-200 p-6 lg:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 rounded-xl">
                                    <Users className="text-indigo-600" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900">Daftar Semua Users</h2>
                                    <p className="text-xs text-slate-500 mt-0.5">{allUsers.length} users ditemukan</p>
                                </div>
                            </div>
                            <button
                                onClick={fetchAllUsers}
                                disabled={loading}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
                            >
                                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                                Refresh
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="animate-spin text-blue-600" size={40} />
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-xl border border-slate-200">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                                            <th className="text-left p-4 text-xs font-black text-slate-700 uppercase tracking-wider">User</th>
                                            <th className="text-left p-4 text-xs font-black text-slate-700 uppercase tracking-wider">DB Role</th>
                                            <th className="text-left p-4 text-xs font-black text-slate-700 uppercase tracking-wider">
                                                Firebase Claims
                                            </th>
                                            <th className="text-left p-4 text-xs font-black text-slate-700 uppercase tracking-wider">Status</th>
                                            <th className="text-left p-4 text-xs font-black text-slate-700 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allUsers.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="p-12 text-center">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <Users className="text-slate-300" size={48} />
                                                        <p className="text-slate-500 font-medium">Tidak ada user ditemukan</p>
                                                        <p className="text-sm text-slate-400">Pastikan ada employees yang sudah di-link ke Firebase</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            allUsers.map((u, idx) => {
                                                const hasClaims = !!u.role
                                                const isSynced = u.dbRole === u.role
                                                return (
                                                    <tr 
                                                        key={u.uid} 
                                                        className={`border-b border-slate-100 transition-colors ${
                                                            idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                                                        } hover:bg-blue-50/50`}
                                                    >
                                                        <td className="p-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-slate-900">{u.name || 'Unknown'}</span>
                                                                <span className="text-xs text-slate-500 mt-0.5">{u.email || '-'}</span>
                                                                <span className="text-xs font-mono text-slate-400 mt-1">
                                                                    {u.uid.substring(0, 16)}...
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <span
                                                                className={`inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-full ${
                                                                    u.dbRole === 'coordinator' || u.dbRole === 'koordinator'
                                                                        ? 'bg-purple-100 text-purple-700'
                                                                        : u.dbRole === 'admin'
                                                                        ? 'bg-red-100 text-red-700'
                                                                        : 'bg-slate-100 text-slate-700'
                                                                }`}
                                                            >
                                                                {u.dbRole || '❌ -'}
                                                            </span>
                                                        </td>
                                                        <td className="p-4">
                                                            {hasClaims ? (
                                                                <span
                                                                    className={`inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-full ${
                                                                        u.role === 'coordinator' || u.role === 'koordinator'
                                                                            ? 'bg-blue-100 text-blue-700'
                                                                            : u.role === 'admin'
                                                                            ? 'bg-red-100 text-red-700'
                                                                            : 'bg-green-100 text-green-700'
                                                                    }`}
                                                                >
                                                                    {u.role}
                                                                </span>
                                                            ) : (
                                                                <span className="text-xs text-slate-400 italic">Belum di-set</span>
                                                            )}
                                                        </td>
                                                        <td className="p-4">
                                                            {isSynced ? (
                                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded">
                                                                    <CheckCircle size={12} />
                                                                    Synced
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded">
                                                                    <AlertCircle size={12} />
                                                                    Out of sync
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="p-4">
                                                            <button
                                                                onClick={() => {
                                                                    setSearchUid(u.uid)
                                                                    handleGetClaims()
                                                                }}
                                                                className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-lg font-bold transition-colors mr-2"
                                                            >
                                                                View
                                                            </button>
                                                            <button
                                                                onClick={() => handleSyncClaims(u.uid)}
                                                                disabled={syncing}
                                                                className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1.5 rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center gap-1 inline-flex"
                                                            >
                                                                <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
                                                                Sync
                                                            </button>
                                                            {/* <button
                                                                onClick={() =>{
                                                                    setSelectedUid(u.uid) 
                                                                    setShowPhoneModal(true)}}
                                                                className="px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                                                            >
                                                                📱 Tambah No HP
                                                            </button> */}
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

{showPhoneModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in">
            
            <h3 className="text-lg font-black text-slate-900 mb-4">
                Tambah Nomor HP
            </h3>

            <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full p-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />

            <div className="flex justify-end gap-3 mt-6">
                <button
                    onClick={() => setShowPhoneModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold"
                >
                    Batal
                </button>

                {/* <button
                    onClick={handleSavePhone}
                    disabled={savingPhone}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
                >
                    {savingPhone && <Loader2 size={16} className="animate-spin" />}
                    Simpan
                </button> */}
            </div>
        </div>
    </div>
)}
        </div>
    )
}

