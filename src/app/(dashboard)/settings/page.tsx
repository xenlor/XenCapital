import { getCurrentUser } from '@/lib/auth'
import { ProfileForm } from '@/components/ProfileForm'
import { ChangePasswordForm } from '@/components/ChangePasswordForm'
import { ShieldCheck, User } from 'lucide-react'

export default async function SettingsPage() {
    const user = await getCurrentUser()

    return (
        <div className="animate-fade-in space-y-8 max-w-2xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-foreground tracking-tight">Configuración</h1>
                <p className="text-muted text-lg">Gestiona tu cuenta y seguridad.</p>
            </div>

            {/* Perfil */}
            <div className="glass-panel p-8 rounded-2xl">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-xl bg-primary/20 text-primary">
                        <User className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Perfil</h2>
                        <p className="text-muted text-sm">Actualiza tu información personal.</p>
                    </div>
                </div>

                <ProfileForm user={{ ...user, name: user.name ?? null }} />
            </div>

            {/* Seguridad */}
            <div className="glass-panel p-8 rounded-2xl">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-xl bg-primary/20 text-primary">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Seguridad</h2>
                        <p className="text-muted text-sm">Cambia tu contraseña para mantener tu cuenta segura.</p>
                    </div>
                </div>

                <ChangePasswordForm />
            </div>
        </div>
    )
}
