'use client'

import React from 'react'
import { TrendingUp, Users, CheckCircle2, AlertCircle } from 'lucide-react'
import { CardTask, TaskStatus } from '@/src/domain/entities/Task'
import { MonitoringService } from '@/src/application/services/MonitoringService'

interface Props {
    tasks: CardTask[]
}

export default function MonitoringDashboard({ tasks }: Props) {
    // Simulating pseudo-DbTasks for calculations
    const pseudoTasks = tasks.map(t => ({
        ...t,
        deadline: new Date(t.dueDate),
        createdAt: new Date(t.startDate),
        members: ['Leader'], // Simplified
        status: t.status,
    })) as any

    const velocity = Math.round(MonitoringService.calculateVelocity(pseudoTasks))
    const workload = MonitoringService.getWorkloadDistribution(pseudoTasks)

    const statusCounts = {
        total: tasks.length,
        todo: tasks.filter(t => t.status === TaskStatus.TODO).length,
        progress: tasks.filter(t => t.status === TaskStatus.ON_PROGRESS).length,
        stuck: tasks.filter(t => t.status === TaskStatus.STUCK).length,
        done: tasks.filter(t => t.status === TaskStatus.DONE).length,
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Overall Velocity"
                    value={`${velocity}%`}
                    subtitle="Completion rate"
                    icon={<TrendingUp className="text-blue-600" />}
                    color="bg-blue-50"
                />
                <MetricCard
                    title="Tasks Completed"
                    value={statusCounts.done.toString()}
                    subtitle={`Out of ${statusCounts.total} total`}
                    icon={<CheckCircle2 className="text-emerald-600" />}
                    color="bg-emerald-50"
                />
                <MetricCard
                    title="Blocked Tasks"
                    value={statusCounts.stuck.toString()}
                    subtitle="Awaiting resolution"
                    icon={<AlertCircle className="text-red-600" />}
                    color="bg-red-50"
                />
                <MetricCard
                    title="In Progress"
                    value={statusCounts.progress.toString()}
                    subtitle="Current active work"
                    icon={<Users className="text-amber-600" />}
                    color="bg-amber-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Workload Heatmap Placeholder */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                        <Users size={20} className="text-blue-600" />
                        Team Workload Distribution
                    </h3>
                    <div className="space-y-4">
                        {Object.entries(workload).length > 0 ? (
                            Object.entries(workload).map(([member, count]) => (
                                <div key={member} className="space-y-1">
                                    <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-tighter">
                                        <span>{member}</span>
                                        <span>{count} Tasks</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                                            style={{ width: `${Math.min((count / statusCounts.total) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-400 font-medium py-8 text-center bg-slate-50 rounded-2xl border border-dashed">
                                No active assignments currently tracking workload.
                            </p>
                        )}
                    </div>
                </div>

                {/* Status Breakdown */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-black text-slate-900 mb-4">Project Health Summary</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <StatusItem label="To Do" count={statusCounts.todo} total={statusCounts.total} color="bg-slate-400" />
                        <StatusItem label="In Progress" count={statusCounts.progress} total={statusCounts.total} color="bg-amber-500" />
                        <StatusItem label="Stuck" count={statusCounts.stuck} total={statusCounts.total} color="bg-red-500" />
                        <StatusItem label="Done" count={statusCounts.done} total={statusCounts.total} color="bg-emerald-500" />
                    </div>
                </div>
            </div>
        </div>
    )
}

function MetricCard({ title, value, subtitle, icon, color }: { title: string, value: string, subtitle: string, icon: React.ReactNode, color: string }) {
    return (
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl ${color} group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
            </div>
            <h4 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">{title}</h4>
            <p className="text-2xl font-black text-slate-900 leading-none mb-1">{value}</p>
            <p className="text-[10px] font-bold text-slate-400">{subtitle}</p>
        </div>
    )
}

function StatusItem({ label, count, total, color }: { label: string, count: number, total: number, color: string }) {
    const percentage = total > 0 ? (count / total) * 100 : 0
    return (
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
                <div className={`h-2 w-2 rounded-full ${color}`} />
                <span className="text-xs font-black text-slate-600 uppercase tracking-tighter">{label}</span>
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-slate-900">{count}</span>
                <span className="text-[10px] font-bold text-slate-400">({Math.round(percentage)}%)</span>
            </div>
        </div>
    )
}
