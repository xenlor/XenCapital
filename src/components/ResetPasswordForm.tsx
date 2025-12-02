'use client'

import { useState } from 'react'
import { resetPassword } from '@/app/actions/admin'
import { KeyRound, Check, X } from 'lucide-react'

export function ResetPasswordForm({ userId, userName }: { userId: string, userName: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [newPassword, setNewPassword] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setStatus('loading')
        const res = await resetPassword(userId, newPassword)
        if (res.success) {
            setStatus('success')
            setTimeout(() => {
                setIsOpen(false)
                setStatus('idle')
                setNewPassword('')
            }, 2000)
        } else {
            setStatus('error')
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/20 rounded-md transition-colors"
                title="Resetear contraseña"
            >
                <KeyRound className="h-4 w-4" />
            </button>
        )
    }

    return (
        <div className="absolute z-50 mt-2 p-4 bg-slate-900 border border-slate-700 rounded-xl shadow-xl w-64 right-0">
            <h3 className="text-sm font-medium text-white mb-2">Nueva contraseña para {userName}</h3>
            <form onSubmit={handleSubmit} className="space-y-2">
                <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nueva contraseña"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                    required
                    minLength={6}
                />
                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                        {status === 'loading' ? '...' : status === 'success' ? <Check className="w-3 h-3" /> : 'Guardar'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
                {status === 'success' && <p className="text-xs text-green-400">Contraseña actualizada</p>}
                {status === 'error' && <p className="text-xs text-red-400">Error al actualizar</p>}
            </form>
        </div>
    )
}
