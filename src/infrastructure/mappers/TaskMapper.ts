import { DbTask, CardTask, TaskStatus } from '../../domain/entities/Task'

export function mapTaskToCard(task: DbTask, userName?: string): CardTask {
    return {
        id: task._id,
        title: task.nama_task,
        project: task.project_type,
        goal: task.partner ?? '',
        description: task.deskripsi,
        priority: mapPriority(task.priority),
        startDate: formatDate(task.createdAt),
        dueDate: formatDate(task.deadline),
        proof: task.note ?? '',
        status: task.status,
        isStuck: task.status === TaskStatus.EVAL,
        hasDependency: !!task.dependencies && task.dependencies.length > 0,
        alasanPenundaan: task.alasanPenundaan,
        capaian: task.capaian,
        kendala: task.kendala,
        userId: task.userId || task.id_leader,
        userName: userName,
        updatedAt: task.updatedAt?.toISOString()
    }
}

function mapPriority(priority: string): 'Low' | 'Medium' | 'High' {
    switch (priority) {
        case 'high':
            return 'High'
        case 'mid':
            return 'Medium'
        default:
            return 'Low'
    }
}

function formatDate(date: Date): string {
    // Use UTC methods to match how dates are stored (in UTC)
    const d = new Date(date)
    const year = d.getUTCFullYear()
    const month = String(d.getUTCMonth() + 1).padStart(2, '0')
    const day = String(d.getUTCDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}
