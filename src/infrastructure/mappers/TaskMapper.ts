import { DbTask, CardTask, TaskStatus } from '../../domain/entities/Task'

export function mapTaskToCard(task: DbTask): CardTask {
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
        isStuck: task.status === TaskStatus.STUCK,
        hasDependency: !!task.dependencies && task.dependencies.length > 0,
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
    return new Date(date).toISOString().split('T')[0]
}
