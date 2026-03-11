'use client'

import React, { useState } from 'react'
import { X, AlertCircle } from 'lucide-react'

interface ReasonModalProps {
    title: string
    label: string
    placeholder: string
    onConfirm: (reason: string, type: 'card' | 'table') => void
    onCancel: () => void
    required?: boolean
    type?: 'card' | 'table'
}

export default function ReasonModal({
    title,
    label,
    placeholder,
    onConfirm,
    onCancel,
    required = true,
    type,
}: ReasonModalProps) {
    const [reason, setReason] = useState('')

    const handleSubmit = () => {
        if (required && !reason.trim()) {
            alert('Mohon isi ' + label.toLowerCase() + ' terlebih dahulu')
            return
        }
        onConfirm(reason.trim(), type || 'card')
    }

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-orange-100 rounded-xl">
                        <AlertCircle className="text-orange-600" size={20} />
                    </div>
                    <h2 className="text-xl font-black text-slate-900">{title}</h2>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                        {label} {required && <span className="text-red-500">*</span>}
                    </label>
                    <textarea
                        autoFocus
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder={placeholder}
                        rows={4}
                        className="w-full text-black p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none font-medium text-sm resize-none"
                    />
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
                        className="flex-1 px-4 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-sm transition-all shadow-lg shadow-orange-200"
                    >
                        Konfirmasi
                    </button>
                </div>
            </div>
        </div>
    )
}

