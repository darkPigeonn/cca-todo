import React from 'react'
import LoginForm from '../components/auth/LoginForm'

export default function LoginPage() {
    return (
        <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            {/* Subtle Background Pattern */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] grayscale">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            </div>

            <LoginForm />
        </main>
    )
}
