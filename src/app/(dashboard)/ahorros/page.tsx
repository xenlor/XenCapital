import { getAhorros, addAhorro, deleteAhorro, getSavingsAnalysis } from '@/app/actions/ahorros'
import { PiggyBank, Plus, Trash2, TrendingUp, Target, Calendar, DollarSign, FileText, TrendingDown } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Input } from '@/components/ui/Input'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { MonthSelector } from '@/components/ui/MonthSelector'
import { getAvailableMonths } from '@/app/actions/general'

import { Ahorro } from '@prisma/client'

export default async function AhorrosPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedSearchParams = await searchParams
    const month = resolvedSearchParams.month ? parseInt(resolvedSearchParams.month as string) : new Date().getMonth()
    const year = resolvedSearchParams.year ? parseInt(resolvedSearchParams.year as string) : new Date().getFullYear()

    const [ahorros, analysis, availableMonths] = await Promise.all([
        getAhorros(month, year),
        getSavingsAnalysis(month, year),
        getAvailableMonths()
    ])

    async function handleAddAhorro(formData: FormData) {
        'use server'
        await addAhorro(formData)
    }

    async function handleDeleteAhorro(id: number) {
        'use server'
        await deleteAhorro(id)
    }

    const percentage = Math.min(analysis.percentageSaved, 100)
    const isTargetMet = analysis.percentageSaved >= 20

    return (
        <div className="animate-fade-in space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 tracking-tight">Ahorros</h1>
                    <p className="text-muted text-lg">Gestiona tus ahorros y cumple tus metas.</p>
                </div>
                <div className="flex items-center gap-4">
                    <MonthSelector availableDates={availableMonths} />
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <PiggyBank className="w-24 h-24 text-primary" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-muted mb-1">Total Ahorrado</p>
                        <h3 className="text-3xl font-bold text-foreground">€{analysis.totalAhorrado.toFixed(2)}</h3>
                        <div className="mt-4 flex items-center gap-2">
                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-1000 ease-out"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <span className="text-xs font-medium text-primary">{analysis.percentageSaved.toFixed(1)}%</span>
                        </div>
                        <p className="text-xs text-muted mt-2">del total de ingresos (€{analysis.totalIngresos.toFixed(2)})</p>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Target className="w-24 h-24 text-secondary" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-muted mb-1">Meta Mensual (20%)</p>
                        <h3 className="text-3xl font-bold text-foreground">€{analysis.targetAhorro.toFixed(2)}</h3>
                        <p className={`text-sm mt-2 font-medium ${isTargetMet ? 'text-green-400' : 'text-orange-400'}`}>
                            {isTargetMet
                                ? '¡Objetivo cumplido! 🎉'
                                : `Faltan €${Math.max(0, analysis.targetAhorro - analysis.totalAhorrado).toFixed(2)}`
                            }
                        </p>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl flex flex-col justify-center items-center text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isTargetMet ? 'bg-green-500/20 text-green-500' : 'bg-orange-500/20 text-orange-500'}`}>
                        {isTargetMet ? <TrendingUp className="w-8 h-8" /> : <Target className="w-8 h-8" />}
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-1">
                        {isTargetMet ? 'Excelente Trabajo' : 'Sigue Ahorrando'}
                    </h3>
                    <p className="text-sm text-muted">
                        {isTargetMet
                            ? 'Has superado el 20% de ahorro recomendado.'
                            : 'Intenta reducir gastos innecesarios para llegar a la meta.'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-1">
                    <div className="glass-panel p-6 rounded-2xl sticky top-28">
                        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-primary/20 text-primary">
                                <Plus className="w-5 h-5" />
                            </div>
                            Añadir Ahorro
                        </h2>

                        <form action={handleAddAhorro} className="space-y-5">
                            <div className="space-y-2">
                                <label htmlFor="monto" className="text-sm font-medium text-muted ml-1">
                                    Monto (€)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        id="monto"
                                        name="monto"
                                        step="0.01"
                                        required
                                        className="input-modern !pl-12"
                                        placeholder="0.00"
                                    />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
                                        <DollarSign className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="descripcion" className="text-sm font-medium text-muted ml-1">
                                    Descripción
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="descripcion"
                                        name="descripcion"
                                        required
                                        className="input-modern !pl-12"
                                        placeholder="Ej: Hucha vacaciones, Fondo emergencia..."
                                    />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="fecha" className="text-sm font-medium text-muted ml-1">
                                    Fecha
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        id="fecha"
                                        name="fecha"
                                        defaultValue={new Date().toISOString().split('T')[0]}
                                        className="input-modern !pl-12"
                                    />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            <SubmitButton>
                                <Plus className="w-5 h-5" />
                                Registrar Ahorro
                            </SubmitButton>
                        </form>
                    </div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2">
                    <div className="glass-panel p-6 rounded-2xl min-h-[500px]">
                        <h2 className="text-xl font-bold text-foreground mb-6">Historial de Ahorros</h2>

                        {ahorros.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[300px] text-center">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 animate-pulse-slow">
                                    <PiggyBank className="w-10 h-10 text-muted/50" />
                                </div>
                                <h3 className="text-lg font-medium text-white mb-2">Sin ahorros registrados</h3>
                                <p className="text-muted max-w-xs">
                                    Comienza a construir tu futuro financiero registrando tu primer ahorro.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {ahorros.map((ahorro: Ahorro) => (
                                    <div
                                        key={ahorro.id}
                                        className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 gap-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/10 shadow-sm shrink-0">
                                                <PiggyBank className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-foreground text-lg">{ahorro.descripcion}</p>
                                                <div className="flex items-center gap-1 text-sm text-muted">
                                                    <Calendar className="w-3 h-3" />
                                                    {format(new Date(ahorro.fecha), "d 'de' MMMM, yyyy", { locale: es })}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pl-[4rem] sm:pl-0">
                                            <p className="text-xl font-bold text-green-500 tracking-tight">
                                                +€{ahorro.monto.toFixed(2)}
                                            </p>
                                            <form action={handleDeleteAhorro.bind(null, ahorro.id)}>
                                                <button
                                                    type="submit"
                                                    className="p-2.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-all duration-200 opacity-100 sm:opacity-0 group-hover:opacity-100"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
