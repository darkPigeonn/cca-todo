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
    showUserNames?: boolean
}

function getListColor(listId: string, title: string) {
    // Color scheme based on status
    if (listId === 'list-1' || title === 'Backlog') {
        return {
            bg: 'bg-orange-50',
            border: 'border-orange-200',
            headerBg: 'bg-orange-100',
            headerText: 'text-orange-800',
            accent: 'orange'
        }
    }
    if (listId === 'list-2' || title === 'To Do') {
        return {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            headerBg: 'bg-blue-100',
            headerText: 'text-blue-800',
            accent: 'blue'
        }
    }
    if (listId === 'list-3' || title === 'Doing') {
        return {
            bg: 'bg-purple-50',
            border: 'border-purple-200',
            headerBg: 'bg-purple-100',
            headerText: 'text-purple-800',
            accent: 'purple'
        }
    }
    if (listId === 'list-4' || title === 'Done') {
        return {
            bg: 'bg-green-50',
            border: 'border-green-200',
            headerBg: 'bg-green-100',
            headerText: 'text-green-800',
            accent: 'green'
        }
    }
    // Default
    return {
        bg: 'bg-slate-50',
        border: 'border-slate-200',
        headerBg: 'bg-slate-100',
        headerText: 'text-slate-800',
        accent: 'slate'
    }
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
    showUserNames = false,
}: BoardViewProps) {
    return (
        <div className="flex overflow-x-auto pb-6 gap-6 items-start custom-scrollbar">
            
            {lists.map((list) => {
                const colors = getListColor(list.id, list.title)
                return (
                    <div
                        key={list.id}
                        onDragOver={onDragOver}
                        onDrop={(e) => onDrop(e, list.id)}
                        className={`flex-shrink-0 w-80 ${colors.bg} border-2 ${colors.border} rounded-2xl p-4 flex flex-col max-h-[82vh] shadow-sm`}
                    >
                    <div className={`flex items-center justify-between mb-4 px-3 py-2 ${colors.headerBg} rounded-xl -mx-1`}>
                        <div className="flex items-center gap-2">
                            <h2 className={`font-black ${colors.headerText} tracking-tight text-sm`}>
                                {list.title}
                            </h2>
                            <span className={`bg-white ${colors.headerText} text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm border ${colors.border}`}>
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
                                showUserName={showUserNames}
                            />
                        ))}
                    </div>

                    {list.title === 'Backlog' && (
                        <button
                            onClick={() => onOpenAddModal(list.id)}
                            className={`mt-4 flex items-center justify-center gap-2 hover:bg-white/80 p-2.5 rounded-xl transition-all text-xs font-bold border ${colors.border} ${
                            colors.accent === 'orange' ? 'text-orange-600 hover:text-orange-700' :
                            colors.accent === 'blue' ? 'text-blue-600 hover:text-blue-700' :
                            colors.accent === 'purple' ? 'text-purple-600 hover:text-purple-700' :
                            colors.accent === 'green' ? 'text-green-600 hover:text-green-700' :
                            'text-slate-600 hover:text-slate-700'
                            }`}
                        >
                            <Plus size={16} />
                            Tambah Tugas
                        </button>
                        )}
                    </div>
                )
            })}

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
                    // <button
                    //     onClick={() => setIsAddingList(true)}
                    //     className="w-full flex items-center justify-center gap-2 bg-slate-200/40 hover:bg-slate-200/80 text-slate-500 p-4 rounded-2xl border-2 border-dashed border-slate-300 transition-all font-bold text-sm"
                    // >
                    //     <Plus size={20} />
                    //     Tambah List
                    // </button>
                    <div/>
                )}
            </div>
        </div>
    )
}
