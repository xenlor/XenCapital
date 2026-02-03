'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    TrendingUp,
    TrendingDown,
    CreditCard,
    Users,
    PiggyBank,
    HandCoins,
    LineChart,
    Menu,
    ChevronDown
} from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { useTheme } from './ThemeProvider'
import { UserMenu } from './UserMenu'
import { GlobalAddButton } from './GlobalAddButton'
import { CommandPalette } from './CommandPalette'

const navItems = [
    { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/ingresos', icon: TrendingUp, label: 'Ingresos' },
    {
        href: '/gastos',
        icon: TrendingDown,
        label: 'Gastos',
        submenu: [
            { href: '/gastos-compartidos', icon: Users, label: 'Compartidos' }
        ]
    },
    { href: '/ahorros', icon: PiggyBank, label: 'Ahorros' },
    { href: '/inversiones', icon: LineChart, label: 'Inversiones' },
    { href: '/prestamos', icon: HandCoins, label: 'Préstamos' },
    { href: '/plazos', icon: CreditCard, label: 'Plazos' },
]

interface NavigationProps {
    user: any
}

export default function Navigation({ user }: NavigationProps) {
    const pathname = usePathname()
    const { theme } = useTheme()
    // Inicializar con TODOS los ítems visibles para asegurar que el primer render los mida
    const [visibleItems, setVisibleItems] = useState<string[]>(navItems.map(i => i.href))
    const [overflowItems, setOverflowItems] = useState<string[]>([])
    const [showOverflow, setShowOverflow] = useState(false)
    const navRef = useRef<HTMLDivElement>(null)
    const itemRefs = useRef<Map<string, HTMLElement>>(new Map())
    const itemWidths = useRef<Map<string, number>>(new Map())

    // Detectar ítems desbordados
    useEffect(() => {
        const calculateOverflow = () => {
            if (!navRef.current) return

            const containerWidth = navRef.current.offsetWidth
            // Margen para el bloque derecho (buscar + nuevo + tema + user)
            // Aprox: 200 (search) + 100 (new) + 40 (theme) + 60 (user) = 400
            // Pero el contenedor es flex-1, así que esto es el espacio disponible DENTRO del div flexible
            // El problema es que "Actions" están FUERA de este div.
            // Solo necesitamos reservar espacio si el div flexible se encoge demasiado.

            // Simplificación: Usar observer simple, si el contenedor se hace pequeño, mover a overflow.
            // Para mantener la lógica existente:
            const rightActionsWidth = 0 // El contenedor navRef no incluye las acciones derechas
            const safetyBuffer = 20

            // Primera pasada: Medir ítems que están renderizados y no tienen ancho guardado
            navItems.forEach(item => {
                const element = itemRefs.current.get(item.href)
                if (element && !itemWidths.current.has(item.href)) {
                    itemWidths.current.set(item.href, element.offsetWidth + 8)
                }
            })

            let currentWidth = 0
            const visible: string[] = []
            const overflow: string[] = []
            const allItemsWidth = navItems.reduce((sum, item) => sum + (itemWidths.current.get(item.href) || 0), 0)

            if (allItemsWidth <= (containerWidth - safetyBuffer)) {
                setVisibleItems(navItems.map(i => i.href))
                setOverflowItems([])
                return
            }

            const availableWidth = containerWidth - 120 - safetyBuffer // 120 para botón "Más"

            let hasOverflowed = false

            navItems.forEach((item) => {
                const width = itemWidths.current.get(item.href) || 120

                if (!hasOverflowed && currentWidth + width <= availableWidth) {
                    visible.push(item.href)
                    currentWidth += width
                } else {
                    hasOverflowed = true
                    overflow.push(item.href)
                }
            })

            setVisibleItems(visible)
            setOverflowItems(overflow)
        }

        calculateOverflow()

        const observer = new ResizeObserver(calculateOverflow)
        if (navRef.current) {
            observer.observe(navRef.current)
        }

        return () => observer.disconnect()
    }, [])

    const getItemByHref = (href: string) => navItems.find(item => item.href === href)

    return (
        <>
            {/* Desktop Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 hidden md:block">
                <div className="absolute inset-0 bg-background/80 backdrop-blur-md border-b border-white/5 shadow-sm"></div>
                <div className="max-w-7xl mx-auto px-6 relative">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 group shrink-0 mr-8">
                            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300 shrink-0">
                                <Image
                                    src={theme === 'light' ? '/logo-light.png' : '/logo.png'}
                                    alt="XenCapital Logo"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex flex-col shrink-0">
                                <span className="font-bold text-lg tracking-tight text-foreground whitespace-nowrap">XenCapital</span>
                                <span className="text-[10px] text-muted font-medium uppercase tracking-wider whitespace-nowrap">Finanzas Personales</span>
                            </div>
                        </Link>

                        {/* Desktop Menu */}
                        <div ref={navRef} className="flex-1 flex items-center min-w-0 mr-4">
                            <div className="flex items-center gap-1">
                                {navItems.map((item) => {
                                    const Icon = item.icon
                                    const isActive = pathname === item.href || ('submenu' in item && item.submenu?.some(sub => pathname === sub.href))
                                    const isVisible = visibleItems.includes(item.href)

                                    if (!isVisible) return null

                                    if ('submenu' in item && item.submenu) {
                                        return (
                                            <div
                                                key={item.href}
                                                ref={(el) => { if (el) itemRefs.current.set(item.href, el) }}
                                                className="relative group"
                                            >
                                                <Link
                                                    href={item.href}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 font-medium shrink-0 whitespace-nowrap ${isActive ? 'text-primary bg-primary/10' : 'text-muted hover:text-foreground hover:bg-white/5'}`}
                                                >
                                                    <Icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                                    <span className="text-sm tracking-wide">{item.label}</span>
                                                    <ChevronDown className="w-3 h-3 opacity-60" />
                                                </Link>
                                                {/* Dropdown menu styling enhanced */}
                                                <div className="absolute top-full left-0 mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pt-2">
                                                    <div className="bg-[#0f172a] border border-white/10 rounded-xl shadow-xl p-1.5 min-w-[200px] overflow-hidden">
                                                        {item.submenu.map((subItem) => {
                                                            const SubIcon = subItem.icon
                                                            const isSubActive = pathname === subItem.href
                                                            return (
                                                                <Link
                                                                    key={subItem.href}
                                                                    href={subItem.href}
                                                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isSubActive ? 'text-primary bg-primary/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                                                >
                                                                    <SubIcon className="w-4 h-4" />
                                                                    <span className="text-sm font-medium">{subItem.label}</span>
                                                                </Link>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }

                                    return (
                                        <Link
                                            key={item.href}
                                            ref={(el) => { if (el) itemRefs.current.set(item.href, el) }}
                                            href={item.href}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 group font-medium shrink-0 whitespace-nowrap ${isActive ? 'text-primary bg-primary/10' : 'text-muted hover:text-foreground hover:bg-white/5'}`}
                                        >
                                            <Icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                            <span className="text-sm tracking-wide">{item.label}</span>
                                        </Link>
                                    )
                                })}
                            </div>

                            {/* Overflow Menu */}
                            {overflowItems.length > 0 && (
                                <div className="relative ml-2 shrink-0">
                                    <button
                                        onClick={() => setShowOverflow(!showOverflow)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-muted hover:text-foreground hover:bg-white/5 transition-all"
                                    >
                                        <Menu className="w-4 h-4" />
                                        <span className="text-sm font-medium">Más</span>
                                    </button>

                                    {showOverflow && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setShowOverflow(false)} />
                                            <div className="absolute top-full right-0 mt-2 bg-[#0f172a] border border-white/10 rounded-xl shadow-xl p-1.5 min-w-[200px] z-50">
                                                {overflowItems.map((href) => {
                                                    const item = getItemByHref(href)
                                                    if (!item) return null
                                                    const Icon = item.icon
                                                    const isActive = pathname === href

                                                    if ('submenu' in item && item.submenu) {
                                                        return (
                                                            <div key={href}>
                                                                <Link
                                                                    href={item.href}
                                                                    onClick={() => setShowOverflow(false)}
                                                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'text-primary bg-primary/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                                                >
                                                                    <Icon className="w-4 h-4" />
                                                                    <span className="text-sm font-medium">{item.label}</span>
                                                                </Link>
                                                                {item.submenu.map((subItem) => (
                                                                    <Link
                                                                        key={subItem.href}
                                                                        href={subItem.href}
                                                                        onClick={() => setShowOverflow(false)}
                                                                        className={`flex items-center gap-3 px-6 py-2.5 rounded-lg transition-colors ${pathname === subItem.href ? 'text-primary bg-primary/10' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                                                                    >
                                                                        <subItem.icon className="w-4 h-4" />
                                                                        <span className="text-sm font-medium">{subItem.label}</span>
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        )
                                                    }

                                                    return (
                                                        <Link
                                                            key={href}
                                                            href={href}
                                                            onClick={() => setShowOverflow(false)}
                                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'text-primary bg-primary/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                                        >
                                                            <Icon className="w-4 h-4" />
                                                            <span className="text-sm font-medium">{item.label}</span>
                                                        </Link>
                                                    )
                                                })}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* User Actions & Global Tools */}
                        <div className="flex items-center gap-3 shrink-0">
                            <CommandPalette />

                            <div className="h-8 w-px bg-white/10 mx-1 hidden lg:block" />

                            <GlobalAddButton />

                            <div className="flex items-center gap-2 ml-2">
                                <ThemeToggle />
                                <UserMenu user={user} />
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    )
}
