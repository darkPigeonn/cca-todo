export enum TaskStatus {
    TODO = 0,
    ON_PROGRESS = 30,
    STUCK = 45, // NEW: For monitoring "blocked" tasks
    VERIFYING = 50, // NEW: For proof verification workflow
    DONE = 60,
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
}
