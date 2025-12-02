import { getUsers, deleteUser, createUser, resetPassword } from '@/app/actions/admin'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Trash2, UserPlus, Shield, KeyRound } from 'lucide-react'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { ResetPasswordForm } from '@/components/ResetPasswordForm'

// Define type for the user returned by getUsers
type AdminUser = {
    id: string
    name: string | null
    username: string
    role: string
    createdAt: Date
    _count: {
        gastos: number
        ingresos: number
    }
}

export default async function AdminUsersPage() {
    const user = await getCurrentUser()

    if (user.role !== 'ADMIN') {
        redirect('/')
    }

    const { data, error } = await getUsers()

    // Cast data to our defined type
    const users = data as unknown as AdminUser[]

    if (error || !users) {
        return <div className="p-8 text-red-500">Error loading users</div>
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Gestión de Usuarios</h1>
            </div>

            {/* Users List Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-indigo-400" />
                    <h2 className="text-xl font-semibold text-white">Usuarios Registrados</h2>
                </div>
                <div className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-950/50 text-slate-400">
                                <tr>
                                    <th className="p-4 font-medium">Nombre</th>
                                    <th className="p-4 font-medium">Usuario</th>
                                    <th className="p-4 font-medium">Rol</th>
                                    <th className="p-4 font-medium">Registro</th>
                                    <th className="p-4 font-medium">Datos</th>
                                    <th className="p-4 font-medium text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="p-4 font-medium text-slate-200">{u.name}</td>
                                        <td className="p-4 text-slate-400">{u.username}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === 'ADMIN'
                                                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                                : 'bg-slate-700 text-slate-300'
                                                }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-400">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-slate-400 text-xs">
                                            {u._count.ingresos} Ingresos, {u._count.gastos} Gastos
                                        </td>
                                        <td className="p-4 text-right flex justify-end items-center gap-2">
                                            <ResetPasswordForm userId={u.id} userName={u.username} />

                                            {u.id !== user.id && (
                                                <form action={async () => {
                                                    'use server'
                                                    await deleteUser(u.id)
                                                }}>
                                                    <button
                                                        type="submit"
                                                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-md transition-colors"
                                                        title="Eliminar usuario"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </form>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create User Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-emerald-400" />
                    <h2 className="text-xl font-semibold text-white">Crear Nuevo Usuario</h2>
                </div>
                <div className="p-6">
                    <form action={async (formData) => {
                        'use server'
                        const name = formData.get('name')
                        const username = formData.get('username')
                        const password = formData.get('password')
                        const role = formData.get('role')

                        if (name && username && password) {
                            await createUser({ name, username, password, role })
                        }
                    }} className="space-y-4">
                        <Input
                            id="name"
                            name="name"
                            label="Nombre"
                            placeholder="Ej: Juan Pérez"
                            required
                        />
                        <Input
                            id="username"
                            name="username"
                            label="Usuario"
                            placeholder="juanperez"
                            required
                        />
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            label="Contraseña"
                            required
                        />
                        <div className="space-y-2">
                            <label htmlFor="role" className="text-sm font-medium text-slate-400 ml-1">Rol</label>
                            <select
                                name="role"
                                id="role"
                                className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            >
                                <option value="USER" className="bg-slate-900">Usuario Normal</option>
                                <option value="ADMIN" className="bg-slate-900">Administrador</option>
                            </select>
                        </div>
                        <SubmitButton loadingText="Creando...">Crear Usuario</SubmitButton>
                    </form>
                </div>
            </div>
        </div>
    )
}
