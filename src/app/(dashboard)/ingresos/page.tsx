import { getIngresos, addIngreso } from '@/app/actions/ingresos'
import { Plus, TrendingUp, DollarSign, FileText, Calendar } from 'lucide-react'
import { MonthSelector } from '@/components/ui/MonthSelector'
import { getAvailableMonths } from '@/app/actions/general'
import { IngresosList } from '@/components/IngresosList'

export default async function IngresosPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedSearchParams = await searchParams
    const month = resolvedSearchParams.month ? parseInt(resolvedSearchParams.month as string) : new Date().getMonth()
    const year = resolvedSearchParams.year ? parseInt(resolvedSearchParams.year as string) : new Date().getFullYear()

    const [ingresos, availableMonths] = await Promise.all([
        getIngresos(month, year),
        getAvailableMonths()
    ])

    const total = ingresos.reduce((sum, ing) => sum + ing.monto, 0)

    async function handleAddIngreso(formData: FormData) {
        'use server'
        await addIngreso(formData)
    }

    return (
        <div className="animate-fade-in space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 tracking-tight">Ingresos</h1>
                    <p className="text-muted text-lg">Gestiona y monitorea tus fuentes de ingresos.</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <MonthSelector availableDates={availableMonths} />
                    <div className="glass-panel px-6 py-3 rounded-xl flex items-center gap-4 border-success/20 bg-success/5 flex-1 md:flex-none justify-between md:justify-start">
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-success/20 text-success">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-success/80 font-medium">Total Mensual</p>
                                <p className="text-2xl font-bold text-success">€{total.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
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
                            Nuevo Ingreso
                        </h2>

                        <form action={handleAddIngreso} className="space-y-5">
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
                                        placeholder="Ej: Salario, Freelance..."
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

                            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 mt-4">
                                <Plus className="w-5 h-5" />
                                Añadir Ingreso
                            </button>
                        </form>
                    </div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2">
                    <IngresosList initialIngresos={ingresos} />
                </div>
            </div>
        </div>
    )
}
