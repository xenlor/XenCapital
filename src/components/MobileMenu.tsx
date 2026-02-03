'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    TrendingUp,
    TrendingDown,
    PiggyBank,
    LineChart,
    HandCoins,
    CreditCard,
    Users,
    Shield,
    Settings,
    LogOut
} from 'lucide-react'
import { logout } from '@/app/actions/auth'
import { useTheme } from './ThemeProvider'
import { GlobalAddButton } from './GlobalAddButton'
import { CommandPalette } from './CommandPalette'

interface MobileMenuProps {
    isOpen: boolean
    onClose: () => void
    userName: string
    userRole: string
}

export function MobileMenu({ isOpen, onClose, userName, userRole }: MobileMenuProps) {
    const pathname = usePathname()
    const { theme } = useTheme()

    // Cerrar con tecla escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
            return () => {
                document.removeEventListener('keydown', handleEscape)
                document.body.style.overflow = 'unset'
            }
        }
    }, [isOpen, onClose])

    const mainItems = [
        { href: '/prestamos', label: 'Préstamos', icon: HandCoins },
        { href: '/plazos', label: 'Plazos', icon: CreditCard },
    ]

    const adminItems = [
        { href: '/admin/users', label: 'Administración', icon: Shield },
    ]

    const systemItems = [
        { href: '/settings', label: 'Configuración', icon: Settings },
    ]

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            {/* Side Menu */}
            <div
                className={`fixed top-0 left-0 bottom-0 w-[85vw] max-w-[300px] bg-background border-r border-border z-50 md:hidden transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header Profile */}
                    <div className="p-6 border-b border-border bg-muted/10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
                                {userName?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg truncate">{userName}</h3>
                                <p className="text-xs text-muted-foreground capitalize">{userRole?.toLowerCase()}</p>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex items-center gap-2">
                            <GlobalAddButton />
                            <div className="flex-1" />
                            <CommandPalette />
                        </div>
                    </div>

                    {/* Navigation Groups */}
                    <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
                        {/* Main Section */}
                        <div>
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Operaciones</h4>
                            <div className="space-y-1">
                                {mainItems.map((item) => {
                                    const Icon = item.icon
                                    const isActive = pathname === item.href
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={onClose}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                                ? 'bg-primary/10 text-primary font-medium'
                                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span>{item.label}</span>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Admin Section */}
                        {userRole?.toUpperCase() === 'ADMIN' && (
                            <div>
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Administración</h4>
                                <div className="space-y-1">
                                    {adminItems.map((item) => {
                                        const Icon = item.icon
                                        const isActive = pathname.startsWith(item.href)
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={onClose}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                                    ? 'bg-primary/10 text-primary font-medium'
                                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                    }`}
                                            >
                                                <Icon className="w-5 h-5" />
                                                <span>{item.label}</span>
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* System Section */}
                        <div>
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Sistema</h4>
                            <div className="space-y-1">
                                {systemItems.map((item) => {
                                    const Icon = item.icon
                                    const isActive = pathname === item.href
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={onClose}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                                ? 'bg-primary/10 text-primary font-medium'
                                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span>{item.label}</span>
                                        </Link>
                                    )
                                })}
                                <form action={logout}>
                                    <button
                                        type="submit"
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-danger hover:bg-danger/10 transition-all w-full text-left"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        <span className="font-medium">Cerrar Sesión</span>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </nav>

                    {/* Footer Branding */}
                    <div className="p-6 border-t border-border">
                        <div className="flex items-center justify-center gap-2 opacity-50">
                            <div className="relative w-6 h-6 rounded-lg overflow-hidden">
                                <Image
                                    src={theme === 'light' ? '/logo-light.png' : '/logo.png'}
                                    alt="XenCapital Logo"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <span className="text-xs font-medium">XenCapital</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
