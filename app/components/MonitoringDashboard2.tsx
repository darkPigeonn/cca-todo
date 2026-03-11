'use client'

import React from 'react'
import { Target, LayoutGrid, Briefcase } from 'lucide-react'
import { CardTask, TaskStatus } from '@/src/domain/entities/Task'

interface Props {
    tasks: CardTask[]
}

const DONE_STATUS = TaskStatus.DONE; 

export default function MonitoringDashboard2({ tasks }: Props) {
    
    // 1. Data Per User (Kiri)
    const userProgress = tasks.reduce((acc, task) => {
        const name = task.userName || 'Tanpa Nama';
        if (!acc[name]) acc[name] = { total: 0, completed: 0 };
        acc[name].total += 1;
        if (task.status >= DONE_STATUS) acc[name].completed += 1;
        return acc;
    }, {} as Record<string, { total: number; completed: number }>);

    // 2. Data Per Projek (Kanan)
    const projectProgress = tasks.reduce((acc, task) => {
        const projectName = task.project || 'Projek Umum';
        if (!acc[projectName]) acc[projectName] = { total: 0, completed: 0 };
        acc[projectName].total += 1;
        if (task.status >= DONE_STATUS) acc[projectName].completed += 1;
        return acc;
    }, {} as Record<string, { total: number; completed: number }>);

    const ProgressBar = ({ label, completed, total, colorClass = "bg-blue-600" }: any) => {
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        return (
            <div className="space-y-1.5 mb-4 last:mb-0">
                <div className="flex justify-between items-end">
                    <p className="text-[11px] font-bold text-slate-700 truncate max-w-[180px] uppercase tracking-tight">
                        {label}
                    </p>
                    <span className="text-[11px] font-black text-slate-500">
                        {percentage}%
                    </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ${percentage === 100 ? 'bg-green-500' : colorClass}`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="w-full animate-in fade-in duration-500 mb-2">
            {/* Main Grid Container: Kiri (User) | Kanan (Project) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* KOLOM KIRI: PROGRESS USER */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <Target size={18} />
                        </div>
                        <h3 className="text-md font-black text-slate-900 tracking-tight">Capaian Tim</h3>
                    </div>
                    <div className="space-y-2 flex-grow">
                        {Object.entries(userProgress).map(([name, stats]) => (
                            <ProgressBar key={name} label={name} completed={stats.completed} total={stats.total} />
                        ))}
                    </div>
                </div>

                {/* KOLOM KANAN: PROGRESS PROJEK */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                            <Briefcase size={18} />
                        </div>
                        <h3 className="text-md font-black text-slate-900 tracking-tight">Monitoring Projek</h3>
                    </div>
                    <div className="space-y-2 flex-grow">
                        {Object.entries(projectProgress).length > 0 ? (
                            Object.entries(projectProgress).map(([project, stats]) => (
                                <ProgressBar 
                                    key={project} 
                                    label={project} 
                                    completed={stats.completed} 
                                    total={stats.total} 
                                    colorClass="bg-indigo-600"
                                />
                            ))
                        ) : (
                            <p className="text-xs text-slate-400 italic">Data projek belum tersedia.</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}