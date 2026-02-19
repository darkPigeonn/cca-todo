import { DbTask, TaskStatus, TaskEvent } from '../../domain/entities/Task'

export class MonitoringService {
    /**
     * Checks if a task should be escalated based on deadline and status.
     * Returns a string describing the escalation reason if it should be escalated.
     */
    static checkEscalation(task: DbTask): string | null {
        if (task.status === TaskStatus.DONE) return null

        const now = new Date()
        const deadline = new Date(task.deadline)
        const timeRemaining = deadline.getTime() - now.getTime()
        const hoursRemaining = timeRemaining / (1000 * 60 * 60)

        // 1. Overdue escalation
        if (timeRemaining < 0) {
            return `Task is OVERDUE by ${Math.abs(Math.round(hoursRemaining))} hours.`
        }

        // 2. High priority proximity escalation (within 24 hours and still TODO)
        if (task.priority === 'high' && hoursRemaining < 24 && task.status === TaskStatus.TODO) {
            return 'High priority task is within 24 hours of deadline but hasn\'t started.'
        }

        // 3. Stale task escalation (no update for > 3 days while in progress)
        const lastUpdated = task.timeline.length > 0
            ? new Date(task.timeline[task.timeline.length - 1].timestamp)
            : new Date(task.createdAt)

        const staleHours = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60)
        if (task.status === TaskStatus.ON_PROGRESS && staleHours > 72) {
            return `Task has been stagnant for ${Math.round(staleHours / 24)} days.`
        }

        return null
    }

    /**
     * Calculates velocity (completion rate) for a set of tasks.
     */
    static calculateVelocity(tasks: DbTask[]): number {
        if (tasks.length === 0) return 0
        const doneTasks = tasks.filter(t => t.status === TaskStatus.DONE).length
        return (doneTasks / tasks.length) * 100
    }

    /**
     * Identifies workload distribution across team members.
     */
    static getWorkloadDistribution(tasks: DbTask[]): Record<string, number> {
        const distribution: Record<string, number> = {}

        tasks.forEach(task => {
            if (task.status !== TaskStatus.DONE) {
                task.members.forEach(memberId => {
                    distribution[memberId] = (distribution[memberId] || 0) + 1
                })
            }
        })

        return distribution
    }
}
