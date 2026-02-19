'use client'

import React from 'react'
import {
    X,
    CheckCircle,
    FolderOpen,
    Calendar,
    Clock,
    Target,
    FileText,
    AlertTriangle,
    Edit3,
    History,
    ClipboardCheck,
    MessageSquare,
} from 'lucide-react'
import { CardTask } from '@/src/domain/entities/Task'

interface TaskDetailModalProps {
    card: CardTask
    listTitle: string
    onClose: () => void
    onEdit: () => void
}

function getPriorityColor(priority: string) {
    switch (priority) {
        case 'High':
            return 'bg-red-100 text-red-700 border-red-200'
        case 'Medium':
            return 'bg-yellow-100 text-yellow-700 border-yellow-200'
        case 'Low':
            return 'bg-green-100 text-green-700 border-green-200'
        default:
            return 'bg-gray-100 text-gray-700 border-gray-200'
    }
}

function formatDate(dateStr: string) {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })
}

export default function TaskDetailModal({
    card,
    listTitle,
    onClose,
    onEdit,
}: TaskDetailModalProps) {
    const isOverdue =
        card.dueDate &&
        new Date(card.dueDate) < new Date() &&
        listTitle !== 'Selesai'

    return (
        <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
                {/* Header strip */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-8 py-6">
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex flex-col gap-2 flex-1 min-w-0">
                            <div className="flex flex-wrap gap-2">
                                <span
                                    className={`text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full border ${getPriorityColor(card.priority)}`}
                                >
                                    {card.priority}
                                </span>
                                <span className="bg-white/20 text-white text-[9px] font-bold px-2.5 py-1 rounded-full">
                                    {listTitle}
                                </span>
                                {card.proof && (
                                    <span className="bg-blue-500 text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
                                        <CheckCircle size={9} /> TERVERIFIKASI
                                    </span>
                                )}
                            </div>
                            <h2 className="text-xl font-black text-white leading-tight">
                                {card.title}
                            </h2>
                            <div className="flex items-center gap-1.5 text-blue-300 text-xs font-bold">
                                <FolderOpen size={12} />
                                {card.project}
                            </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                            <button
                                onClick={onEdit}
                                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                                title="Edit tugas"
                            >
                                <Edit3 size={16} />
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="px-8 py-6 space-y-5 overflow-y-auto max-h-[60vh]">
                    {/* Goal */}
                    {card.goal && (
                        <div className="flex items-start gap-3 bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                            <Target className="text-emerald-500 mt-0.5 shrink-0" size={16} />
                            <div>
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">
                                    Tujuan Utama
                                </p>
                                <p className="text-sm text-emerald-800 font-semibold italic leading-relaxed">
                                    &quot;{card.goal}&quot;
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    {card.description && (
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                Deskripsi
                            </p>
                            <div
                                className="text-sm text-slate-600 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: card.description }}
                            />
                        </div>
                    )}

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 rounded-2xl p-4">
                            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                                <Calendar size={13} />
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                    Mulai
                                </span>
                            </div>
                            <p className="text-sm font-bold text-slate-700">
                                {formatDate(card.startDate)}
                            </p>
                        </div>
                        <div
                            className={`rounded-2xl p-4 ${isOverdue ? 'bg-red-50 border border-red-100' : 'bg-slate-50'}`}
                        >
                            <div
                                className={`flex items-center gap-1.5 mb-1 ${isOverdue ? 'text-red-400' : 'text-slate-400'}`}
                            >
                                {isOverdue ? (
                                    <AlertTriangle size={13} />
                                ) : (
                                    <Clock size={13} />
                                )}
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                    Tenggat
                                </span>
                            </div>
                            <p
                                className={`text-sm font-bold ${isOverdue ? 'text-red-600' : 'text-slate-700'}`}
                            >
                                {formatDate(card.dueDate)}
                                {isOverdue && (
                                    <span className="block text-[10px] font-bold text-red-400 mt-0.5">
                                        Melewati tenggat!
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Proof & Verification */}
                    <div className="space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Audit & Verifikasi
                        </p>
                        {card.proof ? (
                            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 space-y-4">
                                <div className="flex items-start gap-3">
                                    <FileText className="text-blue-500 mt-0.5 shrink-0" size={16} />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">
                                            Bukti Selesai
                                        </p>
                                        <p className="text-sm text-blue-800 font-medium break-words leading-relaxed">
                                            {card.proof}
                                        </p>
                                    </div>
                                </div>

                                {/* Verification Workflow Actions */}
                                <div className="flex gap-2 pt-2 border-t border-blue-100">
                                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider">
                                        <ClipboardCheck size={14} /> Terbitkan Persetujuan
                                    </button>
                                    <button className="px-4 bg-white hover:bg-red-50 text-red-600 text-[10px] font-black py-2 rounded-xl transition-all border border-blue-100 border-dashed uppercase tracking-wider">
                                        Revisi
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200">
                                <FileText className="text-slate-300 shrink-0" size={16} />
                                <p className="text-sm text-slate-400 italic">
                                    Belum ada bukti yang diajukan untuk verifikasi
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Visual Audit Timeline */}
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <History size={12} /> Riwayat Audit (Timeline)
                        </p>
                        <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
                            <TimelineEvent
                                date="Baru saja"
                                action="Dilihat oleh Manajer"
                                user="Sistem Monitor"
                                isLast
                            />
                            <TimelineEvent
                                date={formatDate(card.startDate)}
                                action="Tugas Dibuat"
                                user="Sistem"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-4 border-t border-slate-100 flex gap-3">
                    <button
                        onClick={onEdit}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-2xl transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 text-sm"
                    >
                        <Edit3 size={15} />
                        Edit Tugas
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-2xl text-slate-500 hover:text-slate-700 font-bold text-sm bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    )
}

function TimelineEvent({ date, action, user, isLast = false }: { date: string, action: string, user: string, isLast?: boolean }) {
    return (
        <div className="relative">
            <div className={`absolute -left-[19px] top-1 h-3 w-3 rounded-full border-2 border-white ${isLast ? 'bg-blue-600 shadow-[0_0_0_4px_rgba(37,99,235,0.15)]' : 'bg-slate-300'}`} />
            <div>
                <p className="text-[11px] font-black text-slate-800 leading-none">{action}</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-bold text-slate-400">{date}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-200" />
                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-tighter">{user}</span>
                </div>
            </div>
        </div>
    )
}
