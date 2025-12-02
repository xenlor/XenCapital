import { getInversiones, addInversion, deleteInversion, getInvestmentSummary } from '@/app/actions/inversiones'
import { TrendingUp, Plus, Trash2, LineChart, Calendar, DollarSign, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { MonthSelector } from '@/components/ui/MonthSelector'
import { getAvailableMonths } from '@/app/actions/general'

type Inversion = {
    id: number
    tipo: string
    nombre: string
    monto: number
    fecha: Date
    notas: string | null
    userId: string
    createdAt: Date
    updatedAt: Date
}

export default async function InversionesPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedSearchParams = await searchParams
    const month = resolvedSearchParams.month ? parseInt(resolvedSearchParams.month as string) : new Date().getMonth()
    const year = resolvedSearchParams.year ? parseInt(resolvedSearchParams.year as string) : new Date().getFullYear()

    const [inversiones, summary, availableMonths] = await Promise.all([
        getInversiones(month, year),
        getInvestmentSummary(month, year),
        getAvailableMonths()
    ])

    async function handleAddInversion(formData: FormData) {
        'use server'
        await addInversion(formData)
    }

    async function handleDeleteInversion(id: number) {
        'use server'
        await deleteInversion(id)
    }

    // Group inversiones by tipo
    const inversionesPorTipo = inversiones.reduce((acc: Record<string, Inversion[]>, inv) => {
        if (!acc[inv.tipo]) acc[inv.tipo] = []
        acc[inv.tipo].push(inv as Inversion)
        return acc
    }, {})

    const tipoIcons: Record<string, any> = {
        'ETF': LineChart,
        'Cripto': TrendingUp,
        'Accion': TrendingUp,
        'Fondo': LineChart
    }

    return (
        <div className="animate-fade-in space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 tracking-tight">Inversiones</h1>
                    <p className="text-muted text-lg">Gestiona tu portafolio de inversiones.</p>
                </div>
                <div className="flex items-center gap-4">
                    <MonthSelector availableDates={availableMonths} />
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp className="w-24 h-24 text-primary" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-muted mb-1">Total Invertido</p>
                        <h3 className="text-3xl font-bold text-foreground">€{summary.totalInvertido.toFixed(2)}</h3>
                        <p className="text-xs text-muted mt-2">{summary.count} inversiones</p>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <LineChart className="w-24 h-24 text-secondary" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-muted mb-1">Invertido Este Mes</p>
                        <h3 className="text-3xl font-bold text-foreground">€{summary.invertidoEsteMes.toFixed(2)}</h3>
                        <p className="text-xs text-muted mt-2">{format(new Date(year, month), 'MMMM yyyy', { locale: es })}</p>
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
                            Añadir Inversión
                        </h2>

                        <form action={handleAddInversion} className="space-y-5">
                            <div className="space-y-2">
                                <label htmlFor="tipo" className="text-sm font-medium text-muted ml-1">Tipo</label>
                                <select
                                    id="tipo"
                                    name="tipo"
                                    required
                                    className="w-full h-12 rounded-xl border border-input bg-background/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                >
                                    <option value="ETF">ETF</option>
                                    <option value="Cripto">Criptomoneda</option>
                                    <option value="Accion">Acción</option>
                                    <option value="Fondo">Fondo</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="nombre" className="text-sm font-medium text-muted ml-1">Nombre</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="nombre"
                                        name="nombre"
                                        required
                                        className="input-modern !pl-12"
                                        placeholder="Ej: VWCE, Bitcoin..."
                                    />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="monto" className="text-sm font-medium text-muted ml-1">Monto (€)</label>
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
                                <label htmlFor="fecha" className="text-sm font-medium text-muted ml-1">Fecha</label>
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

                            <div className="space-y-2">
                                <label htmlFor="notas" className="text-sm font-medium text-muted ml-1">Notas (Opcional)</label>
                                <textarea
                                    id="notas"
                                    name="notas"
                                    rows={2}
                                    className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                                    placeholder="Notas adicionales..."
                                />
                            </div>

                            <SubmitButton>
                                <Plus className="w-5 h-5" />
                                Registrar Inversión
                            </SubmitButton>
                        </form>
                    </div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2">
                    <div className="glass-panel p-6 rounded-2xl min-h-[500px]">
                        <h2 className="text-xl font-bold text-foreground mb-6">Portafolio</h2>

                        {inversiones.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[300px] text-center">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 animate-pulse-slow">
                                    <LineChart className="w-10 h-10 text-muted/50" />
                                </div>
                                <h3 className="text-lg font-medium text-white mb-2">Sin inversiones registradas</h3>
                                <p className="text-muted max-w-xs">
                                    Comienza a construir tu portafolio registrando tu primera inversión.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {Object.entries(inversionesPorTipo).map(([tipo, invs]) => {
                                    const Icon = tipoIcons[tipo] || LineChart
                                    return (
                                        <div key={tipo}>
                                            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                                                <Icon className="w-4 h-4" />
                                                {tipo}
                                            </h3>
                                            <div className="space-y-3">
                                                {(invs as Inversion[]).map((inv) => {
                                                    return (
                                                        <div
                                                            key={inv.id}
                                                            className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 gap-4"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/10 shadow-sm shrink-0">
                                                                    <Icon className="w-6 h-6" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-foreground text-lg">{inv.nombre}</p>
                                                                    <div className="flex items-center gap-1 text-sm text-muted">
                                                                        <Calendar className="w-3 h-3" />
                                                                        {format(new Date(inv.fecha), "d 'de' MMMM, yyyy", { locale: es })}
                                                                    </div>
                                                                    {inv.notas && (
                                                                        <p className="text-xs text-muted mt-1">{inv.notas}</p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pl-[4rem] sm:pl-0">
                                                                <div className="text-right">
                                                                    <p className="text-xl font-bold text-foreground tracking-tight">
                                                                        €{inv.monto.toFixed(2)}
                                                                    </p>
                                                                </div>
                                                                <form action={handleDeleteInversion.bind(null, inv.id)}>
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
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
