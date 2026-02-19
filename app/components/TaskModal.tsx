'use client'

import React from 'react'
import { X, CheckCircle, Target, Calendar, Clock, Loader2 } from 'lucide-react'
import { CardTask } from '@/src/domain/entities/Task'
import { Project } from '@/src/domain/entities/Project'
import { useEffect, useState } from 'react'
import Select from 'react-select'

export type FormData = {
    title: string
    project: string
    goal: string
    description: string
    priority: 'Low' | 'Medium' | 'High'
    startDate: string
    dueDate: string
    proof: string
}

interface TaskModalProps {
    mode: 'add' | 'edit'
    formData: FormData
    onChange: (data: FormData) => void
    onSubmit: () => void
    onClose: () => void
}

export default function TaskModal({
    mode,
    formData,
    onChange,
    onSubmit,
    onClose,
}: TaskModalProps) {
    const [projects, setProjects] = useState<Project[]>([])
    const [loadingProjects, setLoadingProjects] = useState(true)

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await fetch('/api/projects')
                if (res.ok) {
                    const data = await res.json()
                    setProjects(data)
                }
            } catch (err) {
                console.error('Failed to fetch projects:', err)
            } finally {
                setLoadingProjects(false)
            }
        }
        fetchProjects()
    }, [])

    const set = (partial: Partial<FormData>) =>
        onChange({ ...formData, ...partial })

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl p-8 overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-slate-900">
                        {mode === 'add' ? 'Buat Tugas' : 'Edit Tugas'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Project + Title */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                Nama Proyek
                            </label>
                            <Select
                                options={projects.map((p) => ({ value: p.name, label: p.name }))}
                                value={
                                    formData.project
                                        ? { value: formData.project, label: formData.project }
                                        : null
                                }
                                onChange={(option) => set({ project: option?.value || '' })}
                                isLoading={loadingProjects}
                                placeholder="Pilih Proyek..."
                                className="text-sm font-medium"
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        borderRadius: '0.75rem',
                                        padding: '0.2rem',
                                        backgroundColor: '#f8fafc',
                                        borderColor: '#e2e8f0',
                                        boxShadow: 'none',
                                        '&:hover': {
                                            borderColor: '#94a3b8',
                                        },
                                    }),
                                    option: (base, state) => ({
                                        ...base,
                                        backgroundColor: state.isSelected
                                            ? '#2563eb'
                                            : state.isFocused
                                                ? '#eff6ff'
                                                : 'white',
                                        color: state.isSelected ? 'white' : '#475569',
                                        '&:active': {
                                            backgroundColor: '#dbeafe',
                                        },
                                    }),
                                }}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                Judul Tugas
                            </label>
                            <input
                                type="text"
                                placeholder="Selesaikan mockup..."
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-sm"
                                value={formData.title}
                                onChange={(e) => set({ title: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Goal */}
                    <div>
                        <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <Target size={12} /> Tujuan Utama (Goal)
                        </label>
                        <input
                            type="text"
                            placeholder="Apa hasil akhir yang ingin dicapai?"
                            className="w-full p-3 bg-emerald-50/30 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium text-sm"
                            value={formData.goal}
                            onChange={(e) => set({ goal: e.target.value })}
                        />
                    </div>

                    {/* Proof */}
                    <div>
                        <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <CheckCircle size={12} /> Bukti Selesai (Link/Catatan)
                        </label>
                        <textarea
                            placeholder="Lampirkan tautan dokumen, folder, atau ringkasan hasil kerja..."
                            rows={2}
                            className="w-full p-3 bg-blue-50/30 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-sm"
                            value={formData.proof}
                            onChange={(e) => set({ proof: e.target.value })}
                        />
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <Calendar size={12} /> Mulai
                            </label>
                            <input
                                type="date"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-sm"
                                value={formData.startDate}
                                onChange={(e) => set({ startDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <Clock size={12} /> Tenggat
                            </label>
                            <input
                                type="date"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-sm"
                                value={formData.dueDate}
                                min={formData.startDate}
                                onChange={(e) => set({ dueDate: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            Prioritas
                        </label>
                        <div className="flex gap-2">
                            {(['Low', 'Medium', 'High'] as const).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => set({ priority: p })}
                                    className={`flex-1 py-2.5 rounded-xl text-xs font-black border transition-all ${formData.priority === p
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                                        : 'bg-white text-slate-500 border-slate-200'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-4">
                        <button
                            onClick={onSubmit}
                            disabled={!!(!formData.title || !formData.project || (formData.dueDate && formData.dueDate < formData.startDate))}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:shadow-none text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-200"
                        >
                            {formData.dueDate && formData.dueDate < formData.startDate
                                ? 'Tenggat tidak boleh kurang dari Mulai'
                                : mode === 'add' ? 'Simpan Tugas' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
