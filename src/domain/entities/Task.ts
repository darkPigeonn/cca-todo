export enum TaskStatus {
    BACKLOG = 10, // Penampungan ide atau tugas jangka panjang
    TODO = 20, // Rencana kerja spesifik yang harus diselesaikan hari ini
    DOING = 30, // Tugas yang sedang dikerjakan
    DONE = 40, // Tugas yang sudah selesai
}

export interface TaskEvent {
    timestamp: Date
    action: string
    userId: string
    details?: string
}

export interface AlarmSettings {
    isOverdueAlertEnabled: boolean
    criticalThresholdHours: number
    lastNotifiedAt?: Date
}

/** Raw shape as stored in MongoDB */
export interface DbTask {
    _id: string
    id_project: string
    nama_task: string
    deskripsi: string
    deadline: Date
    priority: 'low' | 'mid' | 'high'
    project_type: string
    members: string[] // Changed from unknown[] for consistency
    id_leader: string
    partner: string
    status: number
    createdAt: Date
    createdBy: string
    timeline: TaskEvent[] // Typed
    note: string
    dependencies?: string[] // NEW: Task IDs this task depends on
    alarms?: AlarmSettings // NEW: Monitoring settings
    alasanPenundaan?: string // Alasan ketika dipindah ke Backlog
    capaian?: string // Capaian ketika dipindah ke Done
    kendala?: string // Kendala ketika dipindah ke Done
    userId?: string // User ID untuk tracking per individu
    fullName?: string // Nama user untuk display
}

/** UI-facing shape used by the presentation layer */
export interface CardTask {
    id: string
    title: string
    project: string
    goal: string
    description: string
    priority: 'Low' | 'Medium' | 'High'
    startDate: string
    dueDate: string
    proof: string
    status: number
    isStuck?: boolean // UI Flag
    hasDependency?: boolean // UI Flag
    alasanPenundaan?: string // Alasan ketika dipindah ke Backlog
    capaian?: string // Capaian ketika dipindah ke Done
    kendala?: string // Kendala ketika dipindah ke Done
    userId?: string // User ID untuk tracking per individu
    userName?: string // Nama user untuk display
}
