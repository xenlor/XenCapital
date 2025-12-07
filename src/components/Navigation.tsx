'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    TrendingUp,
    TrendingDown,
    UserRound,
    CreditCard,
    Users,
    Wallet,
    PiggyBank,
    HandCoins,
    LogOut,
    Shield,
    Settings,
    LineChart,
    Menu,
    ChevronDown
} from 'lucide-react'

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
    userRole?: string
}

export default function Navigation({ userRole }: NavigationProps) {
    const pathname = usePathname()
    // Initialize with ALL items visible to ensure first render measures them
    const [visibleItems, setVisibleItems] = useState<string[]>(navItems.map(i => i.href))
    const [overflowItems, setOverflowItems] = useState<string[]>([])
    const [showOverflow, setShowOverflow] = useState(false)
    const navRef = useRef<HTMLDivElement>(null)
    const itemRefs = useRef<Map<string, HTMLElement>>(new Map())
    const itemWidths = useRef<Map<string, number>>(new Map())

    // Detect overflow items
    useEffect(() => {
        const calculateOverflow = () => {
            if (!navRef.current) return

            const containerWidth = navRef.current.offsetWidth
            // Buffer for the "More" button (approx width + margin + safety)
            const moreButtonWidth = 120
            const safetyBuffer = 20

            // First pass: Measure any items that are currently rendered and don't have a stored width
            navItems.forEach(item => {
                const element = itemRefs.current.get(item.href)
                if (element && !itemWidths.current.has(item.href)) {
                    // Store the width including margin/padding
                    // We use a slightly larger gap estimate to be safe
                    itemWidths.current.set(item.href, element.offsetWidth + 8)
                }
            })

            let currentWidth = 0
            const visible: string[] = []
            const overflow: string[] = []
            const allItemsWidth = navItems.reduce((sum, item) => sum + (itemWidths.current.get(item.href) || 0), 0)

            // Check if EVERYTHING fits without the "More" button
            // We subtract a safety buffer from the container width
            if (allItemsWidth <= (containerWidth - safetyBuffer)) {
                setVisibleItems(navItems.map(i => i.href))
                setOverflowItems([])
                return
            }

            // If not, we need the "More" button, so reduce available space
            const availableWidth = containerWidth - moreButtonWidth - safetyBuffer

            navItems.forEach((item) => {
                const width = itemWidths.current.get(item.href) || 120 // Fallback width if not measured yet

                if (currentWidth + width <= availableWidth) {
                    visible.push(item.href)
                    currentWidth += width
                } else {
                    overflow.push(item.href)
                }
            })

            setVisibleItems(visible)
            setOverflowItems(overflow)
        }

        // Initial measurement
        calculateOverflow()

        // Re-calculate on resize
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
                <div className="absolute inset-0 bg-background/80 backdrop-blur-md border-b border-white/5"></div>
                <div className="max-w-7xl mx-auto px-6 relative">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 group shrink-0">
                            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300 shrink-0">
                                <Image
                                    src="/logo.png"
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

                        {/* Desktop Menu with overflow detection */}
                        <div ref={navRef} className="flex-1 flex items-center min-w-0 mx-4">
                            <div className="flex items-center gap-1 overflow-hidden">
                                {navItems.map((item) => {
                                    const Icon = item.icon
                                    const isActive = pathname === item.href || ('submenu' in item && item.submenu?.some(sub => pathname === sub.href))
                                    const isVisible = visibleItems.includes(item.href)

                                    // Always render to ref if visible, but if not visible we don't render in main bar
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
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-medium shrink-0 whitespace-nowrap ${isActive ? 'text-primary bg-primary/10' : 'text-muted hover:text-foreground hover:bg-white/5'}`}
                                                >
                                                    <Icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                                    <span className="text-sm tracking-wide">{item.label}</span>
                                                    <ChevronDown className="w-3 h-3 opacity-60" />
                                                </Link>
                                                <div className="absolute top-full left-0 mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                                    <div className="bg-background/95 backdrop-blur-md border border-border rounded-xl shadow-lg p-2 min-w-[200px]">
                                                        {item.submenu.map((subItem) => {
                                                            const SubIcon = subItem.icon
                                                            const isSubActive = pathname === subItem.href
                                                            return (
                                                                <Link
                                                                    key={subItem.href}
                                                                    href={subItem.href}
                                                                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${isSubActive ? 'text-primary bg-primary/10' : 'text-muted hover:text-foreground hover:bg-white/5'}`}
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
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 group font-medium shrink-0 whitespace-nowrap ${isActive ? 'text-primary bg-primary/10' : 'text-muted hover:text-foreground hover:bg-white/5'}`}
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
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-muted hover:text-foreground hover:bg-white/5 transition-all"
                                    >
                                        <Menu className="w-4 h-4" />
                                        <span className="text-sm font-medium">Más</span>
                                    </button>

                                    {showOverflow && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setShowOverflow(false)} />
                                            <div className="absolute top-full right-0 mt-2 bg-background/95 backdrop-blur-md border border-border rounded-xl shadow-lg p-2 min-w-[200px] z-50">
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
                                                                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${isActive ? 'text-primary bg-primary/10' : 'text-muted hover:text-foreground hover:bg-white/5'}`}
                                                                >
                                                                    <Icon className="w-4 h-4" />
                                                                    <span className="text-sm font-medium">{item.label}</span>
                                                                </Link>
                                                                {item.submenu.map((subItem) => {
                                                                    const SubIcon = subItem.icon
                                                                    const isSubActive = pathname === subItem.href
                                                                    return (
                                                                        <Link
                                                                            key={subItem.href}
                                                                            href={subItem.href}
                                                                            onClick={() => setShowOverflow(false)}
                                                                            className={`flex items-center gap-3 px-8 py-3 transition-colors ${isSubActive ? 'text-primary bg-primary/10' : 'text-muted hover:text-foreground hover:bg-white/5'}`}
                                                                        >
                                                                            <SubIcon className="w-4 h-4" />
                                                                            <span className="text-sm font-medium">{subItem.label}</span>
                                                                        </Link>
                                                                    )
                                                                })}
                                                            </div>
                                                        )
                                                    }

                                                    return (
                                                        <Link
                                                            key={href}
                                                            href={href}
                                                            onClick={() => setShowOverflow(false)}
                                                            className={`flex items-center gap-3 px-4 py-3 transition-colors ${isActive ? 'text-primary bg-primary/10' : 'text-muted hover:text-foreground hover:bg-white/5'}`}
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

                        {/* User Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                            {userRole === 'ADMIN' && (
                                <Link
                                    href="/admin/users"
                                    className="p-2 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                                    title="Panel de Admin"
                                >
                                    <Shield className="w-5 h-5" />
                                </Link>
                            )}
                            <Link
                                href="/settings"
                                className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-white/5 transition-colors"
                                title="Configuración"
                            >
                                <Settings className="w-5 h-5" />
                            </Link>
                            <form action="/api/auth/signout" method="POST">
                                <button
                                    type="submit"
                                    className="p-2 rounded-lg text-danger hover:bg-danger/10 transition-colors"
                                    title="Cerrar Sesión"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    )
}
