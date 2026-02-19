'use client'

import React from 'react'
import { Trash2, Edit3, FolderOpen, CheckCircle } from 'lucide-react'
import { CardTask } from '@/src/domain/entities/Task'

interface TableTask extends CardTask {
    listTitle: string
    listId: string
}

interface TableViewProps {
    allTasks: TableTask[]
    onEdit: (listId: string, card: CardTask) => void
    onDelete: (listId: string, cardId: string) => void
    onOpenDetailModal: (listId: string, listTitle: string, card: CardTask) => void
}

export default function TableView({ allTasks, onEdit, onDelete, onOpenDetailModal }: TableViewProps) {
    return (
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
                                Bukti Selesai
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
                                task.listTitle !== 'Selesai'

                            return (
                                <tr
                                    key={task.id}
                                    onClick={() => onOpenDetailModal(task.listId, task.listTitle, task)}
                                    className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                                >
                                    <td className="px-6 py-4">
                                        <div className="max-w-xs">
                                            <div className="font-bold text-slate-800 text-sm truncate">
                                                {task.title}
                                            </div>
                                            {task.goal && (
                                                <div className="text-[10px] text-emerald-600 font-bold italic truncate">
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
                                        {task.proof ? (
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-100/50 px-2 py-1 rounded-lg w-fit">
                                                <CheckCircle size={12} />
                                                <span className="truncate max-w-[150px]">
                                                    {task.proof}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-300 text-xs italic">
                                                Belum ada bukti
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
                                            {task.listTitle}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => onEdit(task.listId, task)}
                                                className="text-slate-300 hover:text-blue-500 transition-colors"
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(task.listId, task.id)}
                                                className="text-slate-300 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
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
    )
}
