'use client'

import React, { useState } from 'react'
import { X, CheckCircle, AlertTriangle } from 'lucide-react'

interface AchievementModalProps {
    taskTitle: string
    onConfirm: (capaian: string, kendala: string) => void
    onCancel: () => void
}

export default function AchievementModal({
    taskTitle,
    onConfirm,
    onCancel,
}: AchievementModalProps) {
    const [capaian, setCapaian] = useState('')
    const [kendala, setKendala] = useState('')

    const handleSubmit = () => {
        if (!capaian.trim()) {
            alert('Mohon isi Capaian terlebih dahulu')
            return
        }
        onConfirm(capaian.trim(), kendala.trim())
    }

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 rounded-xl">
                        <CheckCircle className="text-green-600" size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900">Finalisasi Tugas</h2>
                        <p className="text-sm text-slate-500 font-medium">{taskTitle}</p>
                    </div>
                </div>

                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                            <CheckCircle size={16} className="text-green-600" />
                            Capaian <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            autoFocus
                            value={capaian}
                            onChange={(e) => setCapaian(e.target.value)}
                            placeholder="Apa yang berhasil dicapai? Jelaskan hasil kerja yang telah diselesaikan..."
                            rows={4}
                            className="w-full p-3 bg-green-50/50 text-black border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none font-medium text-sm resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                            <AlertTriangle size={16} className="text-orange-600" />
                            Kendala (Opsional)
                        </label>
                        <textarea
                            value={kendala}
                            onChange={(e) => setKendala(e.target.value)}
                            placeholder="Apakah ada kendala yang dihadapi? Jika tidak ada, bisa dikosongkan..."
                            rows={3}
                            className="w-full p-3 bg-orange-50/50 text-black border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none font-medium text-sm resize-none"
                        />
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-3 rounded-xl text-slate-600 hover:text-slate-800 font-bold text-sm bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex-1 px-4 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-black text-sm transition-all shadow-lg shadow-green-200"
                    >
                        Simpan & Selesai
                    </button>
                </div>
            </div>
        </div>
    )
}

