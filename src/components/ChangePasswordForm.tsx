'use client'

import { useActionState } from 'react'
import { changePassword } from '@/app/actions/settings'
import { Input } from '@/components/ui/Input'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { Lock, CheckCircle, AlertCircle } from 'lucide-react'

const initialState = {
    success: false,
    error: '',
    message: ''
}

export function ChangePasswordForm() {
    const [state, formAction] = useActionState(changePassword, initialState)

    return (
        <form action={formAction} className="space-y-6">
            {state?.success && (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3 text-green-400">
                    <CheckCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">Contraseña actualizada correctamente</p>
                </div>
            )}

            {state?.error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">{state.error}</p>
                </div>
            )}

            <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                label="Contraseña Actual"
                icon={<Lock className="w-5 h-5" />}
                required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    label="Nueva Contraseña"
                    icon={<Lock className="w-5 h-5" />}
                    required
                    minLength={6}
                />
                <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    label="Confirmar Nueva Contraseña"
                    icon={<Lock className="w-5 h-5" />}
                    required
                    minLength={6}
                />
            </div>

            <div className="pt-4">
                <SubmitButton>
                    Actualizar Contraseña
                </SubmitButton>
            </div>
        </form>
    )
}
