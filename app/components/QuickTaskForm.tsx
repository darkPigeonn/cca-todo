'use client'

import React, { useState, useEffect } from 'react'
import { Plus, X, Target } from 'lucide-react'
import { FormData } from './TaskModal'
import { Project } from '@/src/domain/entities/Project'
import Select from 'react-select'

interface QuickTaskFormProps {
    formData: FormData
    onChange: (data: FormData) => void
    onSubmit: () => Promise<void> | void
    onCancel?: () => void
    onSuccess?: () => void
    alwaysExpanded?: boolean
    disabled?: boolean
}

export default function QuickTaskForm({
    formData,
    onChange,
    onSubmit,
    onCancel,
    onSuccess,
    alwaysExpanded = false,
    disabled = false,
}: QuickTaskFormProps) {
    const [projects, setProjects] = useState<Project[]>([])
    const [loadingProjects, setLoadingProjects] = useState(true)
    const [expanded, setExpanded] = useState(alwaysExpanded)

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (formData.title.trim() && formData.project.trim()) {
            await onSubmit()
            // Reset form akan dilakukan di parent component setelah submit berhasil
            onSuccess?.()
        }
    }

    if (!expanded && !alwaysExpanded) {
        return (
            <div className="mb-6">
                <button
                    onClick={() => setExpanded(true)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-200 hover:shadow-xl flex items-center justify-center gap-2"
                >
                    <Plus size={20} />
                    <span>Buat Tugas Baru</span>
                </button>
            </div>
        )
    }

   

    return (
        <div className={`${alwaysExpanded ? '' : 'mb-6'}`}>
            {alwaysExpanded && (
                <div className="mb-6">
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2 mb-1">
                        <Plus size={18} className="text-blue-600" />
                        Buat Tugas Baru
                    </h3>
                    <p className="text-xs text-slate-400">Isi form di bawah untuk menambah tugas</p>
                </div>
            )}
            
            {!alwaysExpanded && (
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <Plus size={20} className="text-blue-600" />
                        Buat Tugas Baru
                    </h3>
                    <button
                        onClick={() => {
                            setExpanded(false)
                            onCancel?.()
                        }}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className={`space-y-4 ${alwaysExpanded ? '' : ''}`}>
                {/* Project */}
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                        Proyek *
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
                        placeholder="Pilih proyek..."
                        className="text-sm"
                        styles={{
                            control: (base) => ({
                                ...base,
                                borderRadius: '0.75rem',
                                padding: '0.15rem',
                                backgroundColor: '#f8fafc',
                                borderColor: '#e2e8f0',
                                boxShadow: 'none',
                                color: '#0f172a',
                                minHeight: '40px',
                                '&:hover': {
                                    borderColor: '#94a3b8',
                                },
                            }),
                            singleValue: (base) => ({
                                ...base,
                                color: '#0f172a',
                            }),
                            input: (base) => ({
                                ...base,
                                color: '#0f172a',
                            }),
                            placeholder: (base) => ({
                                ...base,
                                color: '#94a3b8',
                            }),
                            option: (base, state) => ({
                                ...base,
                                backgroundColor: state.isSelected
                                    ? '#2563eb'
                                    : state.isFocused
                                        ? '#eff6ff'
                                        : 'white',
                                color: state.isSelected ? 'white' : '#475569',
                            }),
                        }}
                    />
                </div>

                {/* Title */}
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                        Judul Tugas *
                    </label>
                    <input
                        type="text"
                        placeholder="Nama tugas..."
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-sm text-slate-900 placeholder:text-slate-400"
                        value={formData.title}
                        onChange={(e) => set({ title: e.target.value })}
                        autoFocus
                    />
                </div>

                {/* Priority */}
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                        Prioritas
                    </label>
                    <div className="flex gap-1.5">
                        {(['Low', 'Medium', 'High'] as const).map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => set({ priority: p })}
                                className={`flex-1 py-2 rounded-lg text-xs font-black border transition-all ${
                                    formData.priority === p
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                        : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Goal - Optional */}
                <div>
                    <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                        <Target size={10} /> Tujuan 
                    </label>
                    <input
                        type="text"
                        placeholder="Apa hasil akhir yang ingin dicapai?"
                        className="w-full p-2.5 bg-emerald-50/30 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium text-sm text-slate-900 placeholder:text-slate-400"
                        value={formData.goal}
                        onChange={(e) => set({ goal: e.target.value })}
                    />
                </div>

                {/* Actions */}
                <div className="pt-2">
                 {disabled ? (
                        <p className="text-xs text-red-500 mb-2 font-bold">
                            ⚠️ Tidak bisa membuat tugas baru karena masih ada tugas di eval atau belum dikerjakan. Silahkan selesaikan dulu tugas yang ada di eval sebelum membuat tugas baru atau hubungi koordinator.
                        </p>
                    ) : (
                        <button
                            type="submit"
                            disabled={!formData.title.trim() || !formData.project.trim()}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:shadow-none text-white font-black py-3 rounded-xl transition-all shadow-lg shadow-blue-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Plus size={18} />
                            Simpan Tugas
                        </button>
                    )}
                    {!alwaysExpanded  && (
                        <button
                            type="button"
                            onClick={() => {
                                setExpanded(false)
                                onCancel?.()
                            }}
                           
                            className="w-full mt-2 py-2.5 rounded-xl text-slate-600 hover:text-slate-800 font-bold text-sm bg-slate-100 hover:bg-slate-200 transition-colors"
                        >
                            Batal
                        </button>
                    )}
                </div>
            </form>
        </div>
    )
}

