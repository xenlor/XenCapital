'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Shield, Settings, LogOut, ChevronDown, User } from 'lucide-react'
import { logout } from '@/app/actions/auth'

interface UserMenuProps {
    user: {
        name: string
        username: string
        role: string
        image?: string | null
    }
}

export function UserMenu({ user }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Get initials
    const initials = user.name
        ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : user.username.slice(0, 2).toUpperCase()

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 p-1.5 pr-3 rounded-full border border-transparent hover:border-white/10 hover:bg-white/5 transition-all group"
            >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-primary/20 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                    {user.image ? (
                        <img src={user.image} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <span>{initials}</span>
                    )}
                </div>
                <div className="flex flex-col items-start text-xs hidden lg:flex">
                    <span className="font-medium text-foreground max-w-[100px] truncate">{user.name || user.username}</span>
                    <span className="text-muted text-[10px] capitalize">{user.role.toLowerCase()}</span>
                </div>
                <ChevronDown className={`w-3 h-3 text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            <div
                className={`absolute top-full right-0 mt-2 w-56 bg-[#0f172a] border border-white/10 rounded-xl shadow-xl shadow-black/50 overflow-hidden transition-all duration-200 origin-top-right z-50 ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 invisible'
                    }`}
            >
                <div className="p-4 border-b border-white/5 bg-white/5">
                    <p className="font-medium text-white truncate">{user.name}</p>
                    <p className="text-xs text-muted truncate">@{user.username}</p>
                </div>

                <div className="p-1.5 space-y-0.5">
                    {user.role === 'ADMIN' && (
                        <Link
                            href="/admin/users"
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <Shield className="w-4 h-4" />
                            Administración
                        </Link>
                    )}

                    <Link
                        href="/settings"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        onClick={() => setIsOpen(false)}
                    >
                        <Settings className="w-4 h-4" />
                        Configuración
                    </Link>

                    <div className="h-px bg-white/5 my-1" />

                    <form action={logout} className="w-full">
                        <button
                            type="submit"
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                        >
                            <LogOut className="w-4 h-4" />
                            Cerrar Sesión
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
