'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { TrendingUp, TrendingDown, Plus, ChevronDown } from 'lucide-react'

export function NewTransactionButton() {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn-primary text-sm flex items-center justify-center gap-2 px-4 py-2"
            >
                <Plus className="w-4 h-4" />
                <span>Nueva Transacción</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-[#1a1b26] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-1 space-y-1">
                        <Link
                            href="/ingresos"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors group"
                        >
                            <div className="p-1.5 rounded-lg bg-success/10 text-success group-hover:bg-success/20 transition-colors">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                            Ingreso
                        </Link>
                        <Link
                            href="/gastos"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors group"
                        >
                            <div className="p-1.5 rounded-lg bg-danger/10 text-danger group-hover:bg-danger/20 transition-colors">
                                <TrendingDown className="w-4 h-4" />
                            </div>
                            Gasto
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}
