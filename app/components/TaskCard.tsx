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
    Edit3,
} from 'lucide-react'
import { CardTask } from '@/src/domain/entities/Task'

interface TaskCardProps {
    card: CardTask
    listTitle: string
    onEdit: () => void
    onDelete: () => void
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => void
    onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void
    onClick: () => void
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
        month: 'short',
    })
}

export default function TaskCard({
    card,
    listTitle,
    onEdit,
    onDelete,
    onDragStart,
    onDragEnd,
    onClick,
}: TaskCardProps) {
    const isOverdue =
        card.dueDate &&
        new Date(card.dueDate) < new Date() &&
        listTitle !== 'Selesai'

    return (
        <div
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onClick={onClick}
            className="group bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:border-blue-300 transition-all duration-200"
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col gap-1.5">
                    <div className="flex gap-1.5">
                        <span
                            className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded border ${getPriorityColor(card.priority)}`}
                        >
                            {card.priority}
                        </span>
                        {card.proof && (
                            <span className="bg-blue-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded flex items-center gap-1">
                                <CheckCircle size={10} /> TERVERIFIKASI
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[10px] font-bold w-fit">
                        <FolderOpen size={10} />
                        {card.project}
                    </div>
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-blue-500 transition-opacity"
                    >
                        <Edit3 size={14} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            <h3 className="font-bold text-slate-800 leading-tight mb-2">
                {card.title}
            </h3>

            {card.goal && (
                <div className="flex items-start gap-2 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100 mb-2">
                    <Target className="text-emerald-500 mt-0.5 shrink-0" size={12} />
                    <p className="text-[10px] text-emerald-700 font-semibold leading-relaxed italic">
                        &quot;{card.goal}&quot;
                    </p>
                </div>
            )}

            <div
                className="text-xs text-slate-500 line-clamp-2 mb-3"
                dangerouslySetInnerHTML={{ __html: card.description }}
            />

            {card.proof && (
                <div className="bg-blue-50/50 p-2 rounded-lg border border-blue-100 mb-3 flex items-center gap-2">
                    <FileText className="text-blue-500 shrink-0" size={12} />
                    <p className="text-[10px] text-blue-700 font-medium truncate">
                        {card.proof}
                    </p>
                </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-50 mt-auto">
                <div className="flex items-center text-slate-400 gap-1">
                    <Calendar size={12} />
                    <span className="text-[10px] font-medium">
                        {formatDate(card.startDate)}
                    </span>
                </div>
                <div className="flex items-center text-slate-400 gap-1">
                    <Clock size={12} />
                    <span
                        className={`text-[10px] font-bold ${isOverdue ? 'text-red-500' : ''}`}
                    >
                        {formatDate(card.dueDate)}
                    </span>
                </div>
            </div>
        </div>
    )
}
