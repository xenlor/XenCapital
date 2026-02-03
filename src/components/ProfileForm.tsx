'use client'

import { useState } from 'react'
import { updateProfile } from '@/app/actions/user'
import { Save, User, Loader2 } from 'lucide-react'

interface UserData {
    name: string | null
    username: string
}

export function ProfileForm({ user }: { user: UserData }) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true)
        setMessage(null)

        const result = await updateProfile(formData)

        if (result.success) {
            setMessage({ type: 'success', text: 'Perfil actualizado correctamente' })
        } else {
            setMessage({ type: 'error', text: result.error || 'Error al actualizar' })
        }
        setIsSubmitting(false)
    }

    return (
        <form action={handleSubmit} className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-muted-foreground ml-1">
                        Nombre completo
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            id="name"
                            name="name"
                            defaultValue={user.name || ''}
                            className="flex h-12 w-full rounded-xl border border-input bg-background/50 px-10 py-2 text-sm text-foreground shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Tu nombre"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="username" className="text-sm font-medium text-muted-foreground ml-1">
                        Nombre de usuario
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">@</span>
                        <input
                            id="username"
                            name="username"
                            defaultValue={user.username}
                            className="flex h-12 w-full rounded-xl border border-input bg-background/50 px-8 py-2 text-sm text-foreground shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="usuario"
                        />
                    </div>
                </div>
            </div>

            {message && (
                <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                    {message.text}
                </div>
            )}

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 transition-all custom-shadow"
                >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar Cambios
                </button>
            </div>
        </form>
    )
}
