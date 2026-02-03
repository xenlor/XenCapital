'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Search, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const router = useRouter()
    const [mounted, setMounted] = useState(false)

    const pages = [
        { name: 'Dashboard', href: '/' },
        { name: 'Ingresos', href: '/ingresos' },
        { name: 'Gastos', href: '/gastos' },
        { name: 'Ahorros', href: '/ahorros' },
        { name: 'Inversiones', href: '/inversiones' },
        { name: 'Préstamos', href: '/prestamos' },
        { name: 'Plazos', href: '/plazos' },
        { name: 'Configuración', href: '/settings' },
    ]

    useEffect(() => {
        setMounted(true)
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setIsOpen(prev => !prev)
            }
            if (e.key === 'Escape') setIsOpen(false)
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

    const filteredPages = pages.filter(page =>
        page.name.toLowerCase().includes(query.toLowerCase())
    )

    const handleSelect = (href: string) => {
        router.push(href)
        setIsOpen(false)
        setQuery('')
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-muted hover:text-foreground hover:bg-white/10 transition-all text-sm w-48 justify-between group"
            >
                <div className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    <span>Buscar...</span>
                </div>
                <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-muted-foreground group-hover:text-foreground">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            {/* Mobile Icon */}
            <button
                onClick={() => setIsOpen(true)}
                className="md:hidden p-2 text-muted hover:text-foreground"
            >
                <Search className="w-5 h-5" />
            </button>

            {isOpen && mounted && createPortal(
                <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[20vh] p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsOpen(false)}>
                    <div className="bg-[#0f172a] border border-white/10 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-white/5">
                            <Search className="w-5 h-5 text-muted" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Buscar página..."
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                className="flex-1 bg-transparent text-white focus:outline-none placeholder:text-muted/50"
                            />
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] text-muted border border-white/10 rounded px-1.5 py-0.5">ESC</span>
                            </div>
                        </div>

                        <div className="max-h-[300px] overflow-y-auto p-2">
                            {filteredPages.length > 0 ? (
                                <div className="space-y-1">
                                    <p className="px-2 py-1.5 text-xs font-medium text-muted uppercase tracking-wider">Navegación</p>
                                    {filteredPages.map(page => (
                                        <button
                                            key={page.href}
                                            onClick={() => handleSelect(page.href)}
                                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-primary/10 hover:text-primary transition-all group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                                                <span>{page.name}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="p-4 text-center text-sm text-muted">No se encontraron resultados.</p>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    )
}
