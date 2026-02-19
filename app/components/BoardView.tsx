'use client'

import React from 'react'
import { Plus, Trash2 } from 'lucide-react'
import TaskCard from './TaskCard'
import { CardTask } from '@/src/domain/entities/Task'

export interface TaskList {
    id: string
    title: string
    cards: CardTask[]
}

interface BoardViewProps {
    lists: TaskList[]
    isAddingList: boolean
    newListName: string
    onNewListNameChange: (name: string) => void
    onAddList: () => void
    onDeleteList: (listId: string) => void
    onOpenAddModal: (listId: string) => void
    onOpenEditModal: (listId: string, card: CardTask) => void
    onDeleteCard: (listId: string, cardId: string) => void
    onDragStart: (e: React.DragEvent<HTMLDivElement>, listId: string, cardId: string) => void
    onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void
    onDrop: (e: React.DragEvent<HTMLDivElement>, targetListId: string) => void
    setIsAddingList: (v: boolean) => void
    onOpenDetailModal: (listId: string, listTitle: string, card: CardTask) => void
}

export default function BoardView({
    lists,
    isAddingList,
    newListName,
    onNewListNameChange,
    onAddList,
    onDeleteList,
    onOpenAddModal,
    onOpenEditModal,
    onDeleteCard,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDrop,
    setIsAddingList,
    onOpenDetailModal,
}: BoardViewProps) {
    return (
        <div className="flex overflow-x-auto pb-6 gap-6 items-start custom-scrollbar">
            {lists.map((list) => (
                <div
                    key={list.id}
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop(e, list.id)}
                    className="flex-shrink-0 w-80 bg-slate-200/60 rounded-2xl p-4 flex flex-col max-h-[82vh]"
                >
                    <div className="flex items-center justify-between mb-4 px-1">
                        <div className="flex items-center gap-2">
                            <h2 className="font-bold text-slate-800 tracking-tight">
                                {list.title}
                            </h2>
                            <span className="bg-white/80 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                {list.cards.length}
                            </span>
                        </div>
                        <button
                            onClick={() => onDeleteList(list.id)}
                            className="p-1.5 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>

                    <div className="space-y-3 overflow-y-auto pr-1 flex-1 custom-scrollbar min-h-[50px]">
                        {list.cards.map((card) => (
                            <TaskCard
                                key={card.id}
                                card={card}
                                listTitle={list.title}
                                onEdit={() => onOpenEditModal(list.id, card)}
                                onDelete={() => onDeleteCard(list.id, card.id)}
                                onDragStart={(e) => onDragStart(e, list.id, card.id)}
                                onDragEnd={onDragEnd}
                                onClick={() => onOpenDetailModal(list.id, list.title, card)}
                            />
                        ))}
                    </div>

                    <button
                        onClick={() => onOpenAddModal(list.id)}
                        className="mt-4 flex items-center justify-center gap-2 text-slate-500 hover:text-blue-600 hover:bg-white p-2.5 rounded-xl transition-all text-xs font-bold"
                    >
                        <Plus size={16} />
                        Tambah Tugas
                    </button>
                </div>
            ))}

            {/* Add new list */}
            <div className="flex-shrink-0 w-80">
                {isAddingList ? (
                    <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-200">
                        <input
                            autoFocus
                            type="text"
                            placeholder="Nama status..."
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none mb-3 text-sm font-medium"
                            value={newListName}
                            onChange={(e) => onNewListNameChange(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && onAddList()}
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={onAddList}
                                className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-xs font-bold shadow-lg shadow-blue-100"
                            >
                                Simpan
                            </button>
                            <button
                                onClick={() => setIsAddingList(false)}
                                className="px-4 py-2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsAddingList(true)}
                        className="w-full flex items-center justify-center gap-2 bg-slate-200/40 hover:bg-slate-200/80 text-slate-500 p-4 rounded-2xl border-2 border-dashed border-slate-300 transition-all font-bold text-sm"
                    >
                        <Plus size={20} />
                        Tambah List
                    </button>
                )}
            </div>
        </div>
    )
}
