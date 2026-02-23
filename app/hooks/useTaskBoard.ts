'use client'

import { useState, useEffect, useCallback } from 'react'
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
    const data = await res.json()
    console.log(data)
    return data
}

const INITIAL_LISTS: TaskList[] = [
    { id: 'list-1', title: 'Backlog', cards: [] },
    { id: 'list-2', title: 'To Do', cards: [] },
    { id: 'list-3', title: 'Doing', cards: [] },
    { id: 'list-4', title: 'Done', cards: [] },
]

import moment from 'moment';
import 'moment/locale/id';

async function generateWAText(tasks: any[], userTasks: any[], allTeamTasks: any[], userName: string, isCoordinator: boolean) {
  const today = moment().format('YYYY-MM-DD');
  const tanggalFormatted = moment().format('DD MMMM YYYY');

  // Calculate progress for Rio (coordinator)
  const rioTasks = userTasks || []
  const rioTotal = rioTasks.length
  const rioDone = rioTasks.filter(t => t.status === 40).length
  const rioProgress = rioTotal > 0 ? Math.round((rioDone / rioTotal) * 100) : 0

  // Calculate global team progress
  const teamTotal = allTeamTasks.length
  const teamDone = allTeamTasks.filter(t => t.status === 40).length
  const teamProgress = teamTotal > 0 ? Math.round((teamDone / teamTotal) * 100) : 0

  let text = `📊 *Laporan Harian Centrum Task Monitor*\n`;
  text += `📅 ${tanggalFormatted}\n\n`;

  if (isCoordinator) {
    text += `👤 *Progres Pribadi (Rio):*\n`;
    text += `✅ ${rioDone}/${rioTotal} tugas selesai (${rioProgress}%)\n\n`;

    text += `👥 *Progres Global Tim:*\n`;
    text += `✅ ${teamDone}/${teamTotal} tugas selesai (${teamProgress}%)\n\n`;
  }

  // Group tasks by user for team view
  if (isCoordinator && allTeamTasks.length > 0) {
    const tasksByUser = new Map<string, any[]>()
    allTeamTasks.forEach(task => {
      const userId = task.userId || 'unknown'
      const userName = task.userName || 'Unknown'
      if (!tasksByUser.has(userName)) {
        tasksByUser.set(userName, [])
      }
      tasksByUser.get(userName)!.push(task)
    })

    text += `📋 *Rincian Capaian & Kendala per Individu:*\n\n`;
    tasksByUser.forEach((userTasks, userName) => {
      const doneTasks = userTasks.filter(t => t.status === 40 && (t.capaian || t.kendala))
      if (doneTasks.length > 0) {
        text += `👤 *${userName}:*\n`;
        doneTasks.forEach((task, idx) => {
          text += `${idx + 1}. *${task.title}*\n`;
          if (task.capaian) {
            text += `   ✅ Capaian: ${task.capaian}\n`;
          }
          if (task.kendala) {
            text += `   ⚠️ Kendala: ${task.kendala}\n`;
          }
          text += `\n`;
        })
      }
    })
  } else {
    // Personal report
    const myDoneTasks = rioTasks.filter(t => t.status === 40 && (t.capaian || t.kendala))
    if (myDoneTasks.length > 0) {
      text += `📋 *Capaian & Kendala Hari Ini:*\n\n`;
      myDoneTasks.forEach((task, idx) => {
        text += `${idx + 1}. *${task.title}*\n`;
        if (task.capaian) {
          text += `   ✅ Capaian: ${task.capaian}\n`;
        }
        if (task.kendala) {
          text += `   ⚠️ Kendala: ${task.kendala}\n`;
        }
        text += `\n`;
      })
    }
  }

  return text.trim();
}

export function useTaskBoard(employeeId?: string, teamMode: boolean = false) {
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

    // Modal states for Backlog and Done
    const [showReasonModal, setShowReasonModal] = useState(false)
    const [showAchievementModal, setShowAchievementModal] = useState(false)
    const [pendingDrop, setPendingDrop] = useState<{ card: CardTask, sourceListId: string, targetListId: string } | null>(null)

    // Function to fetch and update tasks (using useCallback to ensure latest values)
    const fetchAndUpdateTasks = useCallback(async () => {
        // For team mode, fetch all tasks (no employeeId filter)
        const fetchId = teamMode ? undefined : employeeId
     
        try {
            const data = await fetchTasksFromApi(fetchId)
            // Update lists - allTasks will be automatically derived from lists
            console.log(data)
            setLists([
                {
                    id: 'list-1',
                    title: 'Backlog',
                    cards: data.filter((t) => t.status === TaskStatus.BACKLOG),
                },
                {
                    id: 'list-2',
                    title: 'To Do',
                    cards: data.filter((t) => t.status === TaskStatus.TODO),
                },
                {
                    id: 'list-3',
                    title: 'Doing',
                    cards: data.filter((t) => t.status === TaskStatus.DOING),
                },
                {
                    id: 'list-4',
                    title: 'Done',
                    cards: data.filter((t) => t.status === TaskStatus.DONE),
                },
            ])
        } catch (error) {
            console.error('Failed to fetch tasks:', error)
        }
    }, [employeeId, teamMode])

    // Fetch tasks on mount and when employeeId or teamMode changes
    useEffect(() => {
        fetchAndUpdateTasks()
    }, [fetchAndUpdateTasks])

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

        // Check if moving to Backlog or Done - show modal first
        if (targetListId === 'list-1') {
            // Moving to Backlog - require alasan penundaan
            setPendingDrop({ card, sourceListId: draggedCard.listId, targetListId })
            setShowReasonModal(true)
            return
        } else if (targetListId === 'list-4') {
            // Moving to Done - require capaian and kendala
            setPendingDrop({ card, sourceListId: draggedCard.listId, targetListId })
            setShowAchievementModal(true)
            return
        }

        // For other columns, proceed directly
        await performDrop(card, draggedCard.listId, targetListId)
    }

    const performDrop = async (card: CardTask, sourceListId: string, targetListId: string, additionalData?: { alasanPenundaan?: string, capaian?: string, kendala?: string }) => {
        // Map list ID to TaskStatus
        let newStatus = TaskStatus.BACKLOG
        if (targetListId === 'list-2') newStatus = TaskStatus.TODO
        else if (targetListId === 'list-3') newStatus = TaskStatus.DOING
        else if (targetListId === 'list-4') newStatus = TaskStatus.DONE

        // Prepare update data
        const updateData: any = { id: card.id, status: newStatus }
        if (additionalData?.alasanPenundaan) updateData.alasanPenundaan = additionalData.alasanPenundaan
        if (additionalData?.capaian) updateData.capaian = additionalData.capaian
        if (additionalData?.kendala) updateData.kendala = additionalData.kendala

        // Persist to DB
        const res = await fetch('/api/tasks', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData),
        })

        if (res.ok) {
            // Refresh tasks from API to ensure data consistency
            await fetchAndUpdateTasks()
        }
    }

    const handleReasonConfirm = async (reason: string) => {
        if (!pendingDrop) return
        setShowReasonModal(false)
        await performDrop(pendingDrop.card, pendingDrop.sourceListId, pendingDrop.targetListId, { alasanPenundaan: reason })
        setPendingDrop(null)
    }

    const handleAchievementConfirm = async (capaian: string, kendala: string) => {
        if (!pendingDrop) return
        setShowAchievementModal(false)
        await performDrop(pendingDrop.card, pendingDrop.sourceListId, pendingDrop.targetListId, { capaian, kendala })
        setPendingDrop(null)
    }

    const handleModalCancel = () => {
        setShowReasonModal(false)
        setShowAchievementModal(false)
        setPendingDrop(null)
        setDraggedCard(null)
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

    // Submit task directly without opening modal (for QuickTaskForm)
    const submitQuickTask = async (taskFormData: FormData) => {
        if (!taskFormData.title.trim() || !taskFormData.project.trim()) return false

        // Untuk daily task, otomatis set tanggal hari ini dalam format YYYY-MM-DD
        const today = new Date()
        const todayString = today.getFullYear() + '-' + 
                          String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                          String(today.getDate()).padStart(2, '0')
        
        // Helper function to ensure date is in YYYY-MM-DD format
        const ensureDateFormat = (date: string | Date | undefined): string => {
            if (!date) return todayString
            if (typeof date === 'string') {
                // If it's already YYYY-MM-DD, return as is
                if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date
                // If it's ISO string, extract date part
                if (date.includes('T')) return date.split('T')[0]
                return date
            }
            if (date instanceof Date) {
                // Convert Date to YYYY-MM-DD string using local timezone
                return date.getFullYear() + '-' + 
                       String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                       String(date.getDate()).padStart(2, '0')
            }
            return todayString
        }
        
        const deadlineDate = ensureDateFormat(taskFormData.dueDate)
        const createdAtDate = ensureDateFormat(taskFormData.startDate)
        
        const taskData = {
            nama_task: taskFormData.title,
            project_type: taskFormData.project,
            partner: taskFormData.goal,
            deskripsi: taskFormData.description,
            priority: taskFormData.priority.toLowerCase() as any,
            deadline: deadlineDate, // Always string YYYY-MM-DD
            createdAt: createdAtDate, // Always string YYYY-MM-DD
            id_leader: employeeId,
            userId: employeeId,
            status: TaskStatus.TODO,
        }
        
        console.log('submitQuickTask - sending dates:', { deadline: deadlineDate, createdAt: createdAtDate })

        const res = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData),
        })

        if (res.ok) {
            const newCard = await res.json()
            // Ensure the card has the correct status
            if (!newCard.status) {
                newCard.status = TaskStatus.TODO
            }
            // Optimistically add to UI first for immediate feedback
            setLists(prevLists =>
                prevLists.map(list =>
                    list.id === 'list-2' || list.title === 'To Do'
                        ? { ...list, cards: [...list.cards, newCard] }
                        : list
                )
            )
            // Then refresh from API to ensure data consistency (with small delay to allow DB to update)
            setTimeout(async () => {
                await fetchAndUpdateTasks()
            }, 500)
            return true
        } else {
            const errorText = await res.text().catch(() => 'Unknown error')
            console.error('Failed to create task:', res.status, errorText)
        }
        return false
    }

    const handleFormSubmit = async () => {
        if (!formData.title.trim() || !formData.project.trim()) return

        if (modalMode === 'add') {
            // Untuk daily task, otomatis set tanggal hari ini dalam format YYYY-MM-DD
            // Menggunakan timezone lokal untuk mendapatkan tanggal hari ini yang user lihat
            const today = new Date()
            const todayString = today.getFullYear() + '-' + 
                              String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                              String(today.getDate()).padStart(2, '0')
            
            // Helper function to ensure date is in YYYY-MM-DD format
            const ensureDateFormat = (date: string | Date | undefined): string => {
                if (!date) return todayString
                if (typeof date === 'string') {
                    // If it's already YYYY-MM-DD, return as is
                    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date
                    // If it's ISO string, extract date part
                    if (date.includes('T')) return date.split('T')[0]
                    return date
                }
                if (date instanceof Date) {
                    // Convert Date to YYYY-MM-DD string using local timezone
                    return date.getFullYear() + '-' + 
                           String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                           String(date.getDate()).padStart(2, '0')
                }
                return todayString
            }
            
            const deadlineDate = ensureDateFormat(formData.dueDate)
            const createdAtDate = ensureDateFormat(formData.startDate)
            
            // Ensure both are strings in YYYY-MM-DD format (not Date objects or ISO strings)
            const finalDeadline = typeof deadlineDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(deadlineDate) 
                ? deadlineDate 
                : todayString
            const finalCreatedAt = typeof createdAtDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(createdAtDate)
                ? createdAtDate
                : todayString
            
            console.log('Frontend creating task - today local:', todayString)
            console.log('Form dates - dueDate:', formData.dueDate, 'startDate:', formData.startDate)
            console.log('Final dates - deadline:', finalDeadline, 'createdAt:', finalCreatedAt)
            
            const taskData = {
                nama_task: formData.title,
                project_type: formData.project,
                partner: formData.goal,
                deskripsi: formData.description,
                priority: formData.priority.toLowerCase() as any,
                deadline: finalDeadline, // Always string YYYY-MM-DD
                createdAt: finalCreatedAt, // Always string YYYY-MM-DD
                id_leader: employeeId,
                userId: employeeId, // Track user for team view
                status: TaskStatus.TODO, // Default to TODO, not BACKLOG
            }
            
            // Verify taskData before sending
            console.log('Frontend sending taskData:', {
                ...taskData,
                deadline_type: typeof taskData.deadline,
                createdAt_type: typeof taskData.createdAt
            })

            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData),
            })

            if (res.ok) {
                // Refresh tasks from API to ensure data consistency
                await fetchAndUpdateTasks()
            }
        } else {
            const taskData: any = {
                id: activeCardId,
                nama_task: formData.title,
                project_type: formData.project,
                partner: formData.goal,
                deskripsi: formData.description,
                priority: formData.priority.toLowerCase() as any,
                deadline: new Date(formData.dueDate),
                proof: formData.proof
            }
            
            // Update createdAt jika startDate diubah
            if (formData.startDate) {
                taskData.createdAt = new Date(formData.startDate)
            }

            const res = await fetch('/api/tasks', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData),
            })

            if (res.ok) {
                // Refresh tasks from API to ensure data consistency
                await fetchAndUpdateTasks()
            }
        }
        closeModal()
    }

    // ── Card operations ──────────────────────────────────────────────────────────
    const deleteCard = async (listId: string, cardId: string) => {
        const res = await fetch(`/api/tasks?id=${cardId}`, { method: 'DELETE' })
        if (res.ok) {
            // Refresh tasks from API to ensure data consistency
            await fetchAndUpdateTasks()
        }
    }


    const [allTeamTasks, setAllTeamTasks] = useState<CardTask[]>([])

    // Fetch all team tasks for coordinator view
    useEffect(() => {
        if (teamMode) {
            fetchTasksFromApi(undefined)
                .then((data) => {
                    setAllTeamTasks(data)
                })
                .catch(console.error)
        } else {
            setAllTeamTasks([])
        }
    }, [teamMode])

    const sendToWa = async (userName: string = 'User', isCoordinator: boolean = false) => {
        const tasksForReport = teamMode ? allTeamTasks : allTasks
        const message = await generateWAText(
            allTasks,
            allTasks,
            teamMode ? allTeamTasks : allTasks,
            userName,
            isCoordinator
        )
        try {
            await navigator.clipboard.writeText(message)
            alert('Laporan berhasil disalin ke clipboard ✅\nSiap dikirim ke WhatsApp!')
        } catch (e) {
            alert('Gagal menyalin: ' + e)
        }
    }

    const sendTaskToday = async (userName:string)=>{
        const taskMe = allTasks;
        //
        moment.locale('id');

        const today = moment().format('YYYY-MM-DD');
        const tanggalFormatted = moment().format('DD MMMM YYYY');

        if (taskMe.length === 0) {
            return `Rencana Kerja ${userName} tanggal ${tanggalFormatted}:\n\nTidak ada task hari ini.`;
          }
        
        let text = `Rencana Kerja ${userName} tanggal ${tanggalFormatted}:\n\n`;
    
        taskMe.forEach((task, index) => {
            text += `${index + 1}. Projek ${task.project} :\n`;
            text += `Task : ${task.title}\n`;
            text += `Tujuan : ${task.goal}\n\n`;
        });
    
        // ✅ COPY DENGAN FALLBACK (AMAN DI SEMUA BROWSER)
        try {
            if (navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            } else {
            const textarea = document.createElement("textarea");
            textarea.value = text;
            textarea.style.position = "fixed";
            textarea.style.opacity = "0";
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
            }

            alert("Berhasil disalin ke clipboard ✅");
        } catch (err) {
            console.error("Gagal copy:", err);
        }
        
        
    }
    return {
        // Quick submit function
        submitQuickTask,
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
        sendToWa,
        allTeamTasks,
        // Modal states
        showReasonModal,
        showAchievementModal,
        pendingDrop,
        handleReasonConfirm,
        handleAchievementConfirm,
        handleModalCancel,
        sendTaskToday
    }
}
