'use client'

import { useState, useEffect } from 'react'
import { CardTask, TaskStatus } from '@/src/domain/entities/Task'
import { FormData } from '@/app/components/TaskModal'
import { MonitoringService } from '@/src/application/services/MonitoringService'

export interface TaskList {
    id: string
    title: string
    cards: CardTask[]
}

interface DraggedCard {
    listId: string
    cardId: string
}

export interface SelectedCard {
    card: CardTask
    listId: string
    listTitle: string
}

async function fetchTasksFromApi(employeeId?: string): Promise<CardTask[]> {
    const url = employeeId ? `/api/tasks?employeeId=${employeeId}` : '/api/tasks'
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch tasks')
    return res.json()
}

const INITIAL_LISTS: TaskList[] = [
    { id: 'list-1', title: 'To Do', cards: [] },
    { id: 'list-2', title: 'Sedang Dikerjakan', cards: [] },
    { id: 'list-3', title: 'Selesai', cards: [] },
]

export function useTaskBoard(employeeId?: string) {
    const [lists, setLists] = useState<TaskList[]>(INITIAL_LISTS)
    const [view, setView] = useState<'board' | 'table'>('board')
    const [newListName, setNewListName] = useState('')
    const [isAddingList, setIsAddingList] = useState(false)
    const [draggedCard, setDraggedCard] = useState<DraggedCard | null>(null)

    const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null)
    const [activeListId, setActiveListId] = useState<string | null>(null)
    const [activeCardId, setActiveCardId] = useState<string | null>(null)
    const [alarms, setAlarms] = useState<string[]>([])
    const [formData, setFormData] = useState<FormData>({
        title: '',
        project: '',
        goal: '',
        description: '',
        priority: 'Medium',
        startDate: '',
        dueDate: '',
        proof: '',
    })

    // Detail modal state
    const [selectedCard, setSelectedCard] = useState<SelectedCard | null>(null)

    // Fetch tasks on mount and when employeeId changes
    useEffect(() => {
        fetchTasksFromApi(employeeId)
            .then((data) => {
                setLists([
                    {
                        id: 'list-1',
                        title: 'To Do',
                        cards: data.filter((t) => t.status === TaskStatus.TODO),
                    },
                    {
                        id: 'list-2',
                        title: 'Sedang Dikerjakan',
                        cards: data.filter((t) => t.status === TaskStatus.ON_PROGRESS),
                    },
                    {
                        id: 'list-3',
                        title: 'Selesai',
                        cards: data.filter((t) => t.status === TaskStatus.DONE),
                    },
                ])
            })
            .catch(console.error)
    }, [employeeId])

    // Monitor for escalations
    useEffect(() => {
        const currentAlarms: string[] = []
        allTasks.forEach(task => {
            // Mapping back simplified CardTask to "enough" of a DbTask for service-side checking
            // In a real prod app, you'd fetch the full DbTask or have the API return alarms.
            const pseudoDbTask = {
                ...task,
                deadline: new Date(task.dueDate),
                createdAt: new Date(task.startDate),
                timeline: [], // Simplified for UI-side monitoring
            } as any

            const escalation = MonitoringService.checkEscalation(pseudoDbTask)
            if (escalation) {
                currentAlarms.push(`${task.title}: ${escalation}`)
            }
        })
        setAlarms(currentAlarms)
    }, [lists])

    // Derived: flat list for table view
    const allTasks = lists.flatMap((list) =>
        list.cards.map((card) => ({
            ...card,
            listTitle: list.title,
            listId: list.id,
        }))
    )

    // ── Drag & Drop ──────────────────────────────────────────────────────────────
    const handleDragStart = (
        e: React.DragEvent<HTMLDivElement>,
        listId: string,
        cardId: string
    ) => {
        setDraggedCard({ listId, cardId })
        e.dataTransfer.setData('text/plain', cardId)
            ; (e.target as HTMLDivElement).style.opacity = '0.5'
    }

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        ; (e.target as HTMLDivElement).style.opacity = '1'
        setDraggedCard(null)
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) =>
        e.preventDefault()

    const handleDrop = async (
        e: React.DragEvent<HTMLDivElement>,
        targetListId: string
    ) => {
        e.preventDefault()
        if (!draggedCard) return
        const sourceList = lists.find((l) => l.id === draggedCard.listId)
        const card = sourceList?.cards.find((c) => c.id === draggedCard.cardId)
        if (!card || draggedCard.listId === targetListId) return

        // Map list ID to TaskStatus
        let newStatus = TaskStatus.TODO
        if (targetListId === 'list-2') newStatus = TaskStatus.ON_PROGRESS
        else if (targetListId === 'list-3') newStatus = TaskStatus.DONE

        // Persist to DB
        const res = await fetch('/api/tasks', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: card.id, status: newStatus }),
        })

        if (res.ok) {
            const updatedCard = await res.json()
            setLists(
                lists.map((list) => {
                    if (list.id === draggedCard.listId)
                        return {
                            ...list,
                            cards: list.cards.filter((c) => c.id !== draggedCard.cardId),
                        }
                    if (list.id === targetListId)
                        return { ...list, cards: [...list.cards, updatedCard] }
                    return list
                })
            )
        }
    }

    // ── List operations ──────────────────────────────────────────────────────────
    const addList = () => {
        if (!newListName.trim()) return
        setLists([
            ...lists,
            { id: `list-${Date.now()}`, title: newListName, cards: [] },
        ])
        setNewListName('')
        setIsAddingList(false)
    }

    const deleteList = (listId: string) =>
        setLists(lists.filter((l) => l.id !== listId))

    // ── Modal operations ─────────────────────────────────────────────────────────
    const openAddModal = (listId: string) => {
        setModalMode('add')
        setActiveListId(listId)
        setFormData({
            title: '',
            project: '',
            goal: '',
            description: '',
            priority: 'Medium',
            startDate: new Date().toISOString().split('T')[0],
            dueDate: '',
            proof: '',
        })
    }

    const openEditModal = (listId: string, card: CardTask) => {
        setModalMode('edit')
        setActiveListId(listId)
        setActiveCardId(card.id)
        setFormData({ ...card } as FormData)
    }

    const closeModal = () => setModalMode(null)

    // Detail modal
    const openDetailModal = (listId: string, listTitle: string, card: CardTask) => {
        setSelectedCard({ card, listId, listTitle })
    }

    const closeDetailModal = () => setSelectedCard(null)

    const openEditFromDetail = () => {
        if (!selectedCard) return
        closeDetailModal()
        openEditModal(selectedCard.listId, selectedCard.card)
    }

    const handleFormSubmit = async () => {
        if (!formData.title.trim() || !formData.project.trim()) return

        if (modalMode === 'add') {
            const taskData = {
                nama_task: formData.title,
                project_type: formData.project,
                partner: formData.goal,
                deskripsi: formData.description,
                priority: formData.priority.toLowerCase() as any,
                deadline: new Date(formData.dueDate),
                id_leader: employeeId,
                status: TaskStatus.TODO,
            }

            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData),
            })

            if (res.ok) {
                const newCard = await res.json()
                setLists(
                    lists.map((list) =>
                        list.id === activeListId
                            ? { ...list, cards: [...list.cards, newCard] }
                            : list
                    )
                )
            }
        } else {
            const taskData = {
                id: activeCardId,
                nama_task: formData.title,
                project_type: formData.project,
                partner: formData.goal,
                deskripsi: formData.description,
                priority: formData.priority.toLowerCase() as any,
                deadline: new Date(formData.dueDate),
            }

            const res = await fetch('/api/tasks', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData),
            })

            if (res.ok) {
                const updatedCard = await res.json()
                setLists(
                    lists.map((list) => {
                        if (list.id !== activeListId) return list
                        return {
                            ...list,
                            cards: list.cards.map((c) =>
                                c.id === activeCardId ? updatedCard : c
                            ),
                        }
                    })
                )
            }
        }
        closeModal()
    }

    // ── Card operations ──────────────────────────────────────────────────────────
    const deleteCard = async (listId: string, cardId: string) => {
        const res = await fetch(`/api/tasks?id=${cardId}`, { method: 'DELETE' })
        if (res.ok) {
            setLists(
                lists.map((list) =>
                    list.id === listId
                        ? { ...list, cards: list.cards.filter((c) => c.id !== cardId) }
                        : list
                )
            )
        }
    }

    return {
        // State
        lists,
        view,
        setView,
        newListName,
        setNewListName,
        isAddingList,
        setIsAddingList,
        modalMode,
        formData,
        setFormData,
        allTasks,
        alarms,
        setAlarms,
        // Handlers
        handleDragStart,
        handleDragEnd,
        handleDragOver,
        handleDrop,
        addList,
        deleteList,
        openAddModal,
        openEditModal,
        closeModal,
        handleFormSubmit,
        deleteCard,
        selectedCard,
        openDetailModal,
        closeDetailModal,
        openEditFromDetail,
    }
}
