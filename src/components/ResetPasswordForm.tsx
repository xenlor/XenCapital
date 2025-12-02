'use client'

import { useState, useEffect, useRef } from 'react'
import { resetPassword } from '@/app/actions/admin'
import { KeyRound, Check, X } from 'lucide-react'

export function ResetPasswordForm({ userId, userName }: { userId: string, userName: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [newPassword, setNewPassword] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const containerRef = useRef<HTMLDivElement>(null)

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

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

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-secondary hover:text-secondary/80 hover:bg-secondary/10 rounded-md transition-colors"
                title="Resetear contraseña"
            >
                <KeyRound className="h-4 w-4" />
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-2 p-4 bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-lg w-64 right-0">
                    <h3 className="text-sm font-medium text-foreground mb-2">Nueva contraseña para {userName}</h3>
                    <form onSubmit={handleSubmit} className="space-y-2">
                        <input
                            type="text"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Nueva contraseña"
                            className="w-full px-3 py-2 bg-background/50 border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                            required
                            minLength={6}
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                            >
                                {status === 'loading' ? 'Guardando...' : status === 'success' ? <><Check className="w-3 h-3" /> Guardado</> : 'Guardar'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="px-3 py-2 bg-muted hover:bg-muted/80 text-muted-foreground text-xs font-medium rounded-lg transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                        {status === 'success' && <p className="text-xs text-success">Contraseña actualizada</p>}
                        {status === 'error' && <p className="text-xs text-danger">Error al actualizar</p>}
                    </form>
                </div>
            )}
        </div>
    )
}
