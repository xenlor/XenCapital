'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export type AvailableDate = {
    month: number
    year: number
}

interface MonthSelectorProps {
    availableDates: AvailableDate[]
}

export function MonthSelector({ availableDates }: MonthSelectorProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Obtener selección actual de la URL o usar fecha actual por defecto
    const currentMonth = searchParams.get('month')
        ? parseInt(searchParams.get('month')!)
        : new Date().getMonth()

    const currentYear = searchParams.get('year')
        ? parseInt(searchParams.get('year')!)
        : new Date().getFullYear()

    // Encontrar índice de la selección actual en las fechas disponibles
    // Si no se encuentra (ej. URL introducida manualmente), por defecto 0 (más reciente)
    const currentIndex = availableDates.findIndex(
        d => d.month === currentMonth && d.year === currentYear
    )

    // Si los params actuales no coinciden con ninguna fecha disponible,
    // podríamos querer redirigir o mostrar la más cercana.
    // Por ahora, usaremos la fecha de los params para mostrar,
    // pero la navegación saltará a las disponibles.
    const displayDate = new Date(currentYear, currentMonth)

    const handlePrev = () => {
        // "Prev" significa ir hacia atrás en el tiempo (fechas más antiguas)
        // En nuestra lista ordenada descendente, "más antiguo" significa índice mayor
        const nextIndex = currentIndex === -1 ? 0 : currentIndex + 1
        if (nextIndex < availableDates.length) {
            updateParams(availableDates[nextIndex])
        }
    }

    const handleNext = () => {
        // "Next" significa ir hacia adelante en el tiempo (fechas más nuevas)
        // En nuestra lista ordenada descendente, "más nuevo" significa índice menor
        const nextIndex = currentIndex === -1 ? 0 : currentIndex - 1
        if (nextIndex >= 0) {
            updateParams(availableDates[nextIndex])
        }
    }

    const updateParams = (date: AvailableDate) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('month', date.month.toString())
        params.set('year', date.year.toString())
        router.push(`?${params.toString()}`)
    }

    const isOldest = currentIndex === availableDates.length - 1
    const isNewest = currentIndex === 0 || currentIndex === -1

    return (
        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-xl border border-white/10">
            <button
                onClick={handlePrev}
                disabled={isOldest}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                title="Mes anterior con datos"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 min-w-[140px] justify-center">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-foreground font-medium capitalize">
                    {format(displayDate, 'MMMM yyyy', { locale: es })}
                </span>
            </div>

            <button
                onClick={handleNext}
                disabled={isNewest}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                title="Mes siguiente con datos"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    )
}
