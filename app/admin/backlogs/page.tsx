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
    Table,
    Edit3,
    FolderOpen,
    Trash2,
} from 'lucide-react'
import { CardTask } from '@/src/domain/entities/Task'
import { useTaskBoard } from '@/app/hooks/useTaskBoard'
import { useAuth } from '@/app/providers/AuthContext'
import TaskModal from '@/app/components/TaskModal'
import ReasonModal from '@/app/components/ReasonModal'

interface UserClaims {
    uid: string
    email?: string
    name?: string
    role?: string
    claims?: Record<string, any>
    dbRole?: string
}
interface TableTask extends CardTask {
    listTitle: string
    listId: string
}

export default function CustomClaimsPage() {
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [allTasks, setAllTasks] = useState<TableTask[]>([])
    const { user, loading, logout } = useAuth()
    const isCoordinator = user?.role?.toLowerCase() === 'coordinator' || user?.role?.toLowerCase() === 'koordinator'
  

    const {showReasonModal,pendingDrop, handleReasonConfirm, handleModalCancel,  getBacklogsTasks, sendToBacklog } = useTaskBoard()

    useEffect(() => {
        if (loading) return

        if (!user) {
            setMessage({ type: 'error', text: 'User tidak ditemukan. Silakan login.' })
            return
        }

        // Fetch all tasks for the user's team
        const fetchTasks = async () => {
            try {
                const tasks = await getBacklogsTasks()
                setAllTasks(tasks)
            } catch (error) {               
                setMessage({ type: 'error', text: 'Gagal memuat tugas. Coba lagi nanti.' })
            }
        }

        fetchTasks()
    }, [user, loading])
 

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                        <Shield className="text-white" size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Backlogs Task</h1>
                        <p className="text-slate-600 font-medium">Kelola Backlogs Tim</p>
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


                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Tugas &amp; Tujuan
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Proyek
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Nama Karyawan
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Tenggat
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {allTasks.map((task) => {
                            const isOverdue =
                                task.dueDate &&
                                new Date(task.dueDate) < new Date() &&
                                task.listTitle !== 'Done'

                            return (
                                <tr
                                    key={task.id}
                                    // onClick={() => onOpenDetailModal(task.listId, task.listTitle, task)}
                                    className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                                >
                                   <td className="px-6 py-4">
                                    <div className="max-w-xs">
                                        <div className="font-bold text-slate-800 text-sm break-words">
                                        {task.title}
                                        </div>
                                        {task.goal && (
                                        <div className="text-[10px] text-emerald-600 font-bold italic break-words">
                                            Target: {task.goal}
                                        </div>
                                        )}
                                    </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs bg-blue-50 w-fit px-2.5 py-1 rounded-lg">
                                            <FolderOpen size={12} />
                                            {task.project}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {task.userName ? (
                                            <div className="flex items-center gap-2">
                                                <User size={12} className="text-slate-400" />
                                                <span className="text-xs font-bold text-slate-600">
                                                    {task.userName}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-xs font-bold text-slate-400 italic">
                                                Tidak ada penanggung jawab
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div
                                            className={`text-xs font-bold ${isOverdue ? 'text-red-500' : 'text-slate-600'}`}
                                        >
                                            {task.dueDate || '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                                            {task.status === 10 ? 'Eval' : task.status === 20 ? 'No Action' : 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => sendToBacklog(task)}
                                                className="text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-red-500 px-3 py-1 rounded-lg hover:from-rose-600 hover:to-red-600 transition-colors"
                                            >
                                                Kirim ke Eval
                                            </button>
                                           
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>

       {showReasonModal && pendingDrop && (
               <ReasonModal
                 title="Alasan Penundaan"
                 label="Alasan Penundaan"
                 placeholder="Mengapa tugas ini dipindahkan ke Eval? Jelaskan alasan penundaan..."
                 onConfirm={handleReasonConfirm}
                 onCancel={handleModalCancel}
                 required={true}
                 type='table'
               />
             )}
        </div>
    )
}

