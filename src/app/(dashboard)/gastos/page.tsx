import { getGastos, addGasto, getCategorias } from '@/app/actions/gastos'
import { TrendingDown, Plus, Calendar, DollarSign, FileText, Tag } from 'lucide-react'
import { NewCategoryForm } from '@/components/NewCategoryForm'
import { MonthSelector } from '@/components/ui/MonthSelector'
import { GastosList } from '@/components/GastosList'
import { getAvailableMonths } from '@/app/actions/general'
import { CategoryFilter } from '@/components/CategoryFilter'

export default async function GastosPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedSearchParams = await searchParams
    const month = resolvedSearchParams.month ? parseInt(resolvedSearchParams.month as string) : new Date().getMonth()
    const year = resolvedSearchParams.year ? parseInt(resolvedSearchParams.year as string) : new Date().getFullYear()

    // Parse category IDs from URL
    const categoryIds = resolvedSearchParams.categories
        ? (resolvedSearchParams.categories as string).split(',').map(Number)
        : []

    const [gastos, categorias, availableMonths] = await Promise.all([
        getGastos(month, year, categoryIds),
        getCategorias(),
        getAvailableMonths()
    ])

    const total = gastos.reduce((sum, gasto) => sum + gasto.monto, 0)

    async function handleAddGasto(formData: FormData) {
        'use server'
        await addGasto(formData)
    }

    return (
        <div className="animate-fade-in space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 tracking-tight">Gastos</h1>
                    <p className="text-muted text-lg">Controla tus gastos y categorízalos.</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <MonthSelector availableDates={availableMonths} />
                    <CategoryFilter categorias={categorias} />
                    <div className="glass-panel px-6 py-3 rounded-xl flex items-center gap-4 border-danger/20 bg-danger/5 flex-1 md:flex-none justify-between md:justify-start">
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-danger/20 text-danger">
                                <TrendingDown className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-danger/80 font-medium">Total Mensual</p>
                                <p className="text-2xl font-bold text-danger">€{total.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-1">
                    <div className="sticky top-28 space-y-6">
                        <div className="glass-panel p-6 rounded-2xl">
                            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-primary/20 text-primary">
                                    <Plus className="w-5 h-5" />
                                </div>
                                Nuevo Gasto
                            </h2>

                            <form action={handleAddGasto} className="space-y-5">
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
                                            placeholder="Ej: Supermercado, Netflix..."
                                        />
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="categoriaId" className="text-sm font-medium text-muted ml-1">
                                        Categoría
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="categoriaId"
                                            name="categoriaId"
                                            required
                                            className="input-modern !pl-12 appearance-none"
                                            defaultValue=""
                                        >
                                            <option value="" disabled className="bg-card text-foreground">Seleccionar categoría</option>
                                            {categorias.map((cat) => (
                                                <option key={cat.id} value={cat.id} className="bg-card text-foreground">
                                                    {cat.nombre}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
                                            <Tag className="w-5 h-5" />
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
                                    Añadir Gasto
                                </button>
                            </form>
                        </div>

                        <NewCategoryForm />
                    </div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2">
                    <GastosList initialGastos={gastos} categories={categorias} />
                </div>
            </div>
        </div>
    )
}
