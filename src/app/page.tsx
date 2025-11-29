import Link from 'next/link'
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    PiggyBank,
    ArrowUpRight,
    MoreHorizontal,
    Calendar,
    DollarSign,
    Tag
} from 'lucide-react'
import { getIngresos } from './actions/ingresos'
import { getGastos } from './actions/gastos'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ExpensesDonutChart } from '@/components/ExpensesDonutChart'

import { MonthSelector } from '@/components/ui/MonthSelector'
import { getAvailableMonths } from './actions/general'
import { getSavingsAnalysis } from './actions/ahorros'
import { DownloadReportButton } from '@/components/DownloadReportButton'
import { NewTransactionButton } from '@/components/NewTransactionButton'

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedSearchParams = await searchParams
    const month = resolvedSearchParams.month ? parseInt(resolvedSearchParams.month as string) : new Date().getMonth()
    const year = resolvedSearchParams.year ? parseInt(resolvedSearchParams.year as string) : new Date().getFullYear()

    const [ingresos, gastos, availableMonths, savingsAnalysis] = await Promise.all([
        getIngresos(month, year),
        getGastos(month, year),
        getAvailableMonths(),
        getSavingsAnalysis(month, year)
    ])

    const totalIngresos = ingresos.reduce((sum, item) => sum + item.monto, 0)
    const totalGastos = gastos.reduce((sum, item) => sum + item.monto, 0)
    const balance = totalIngresos - totalGastos

    // Combine and sort transactions by date
    const recentTransactions = [
        ...ingresos.map(i => ({ ...i, type: 'ingreso' as const })),
        ...gastos.map(g => ({ ...g, type: 'gasto' as const }))
    ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        .slice(0, 5) // Show only last 5

    // Prepare chart data
    const expensesByCategory = gastos.reduce((acc, gasto) => {
        const categoryName = gasto.categoria.nombre
        const categoryColor = gasto.categoria.color

        if (!acc[categoryName]) {
            acc[categoryName] = { value: 0, color: categoryColor }
        }
        acc[categoryName].value += gasto.monto
        return acc
    }, {} as Record<string, { value: number, color: string }>)

    const chartData = Object.entries(expensesByCategory).map(([name, data]) => ({
        name,
        value: data.value,
        color: data.color
    }))

    return (
        <div className="animate-fade-in space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 tracking-tight">
                        Hola, <span className="text-gradient-primary">Esteban</span>
                    </h1>
                    <p className="text-muted text-lg">Aquí está el resumen de tus finanzas este mes.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <MonthSelector availableDates={availableMonths} />
                    <NewTransactionButton />
                    <DownloadReportButton
                        ingresos={ingresos}
                        gastos={gastos}
                        month={month}
                        year={year}
                    />
                </div>
            </div>

            {/* Summary Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Balance Card */}
                <div className="glass-card p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Wallet className="w-24 h-24 text-primary" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                <Wallet className="w-6 h-6" />
                            </div>
                            <span className="text-muted font-medium">Balance Total</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-foreground">€{balance.toFixed(2)}</span>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-sm text-success bg-success/10 w-fit px-2 py-1 rounded-lg">
                            <ArrowUpRight className="w-4 h-4" />
                            <span>+0% vs mes anterior</span>
                        </div>
                    </div>
                </div>

                {/* Income Card */}
                <div className="glass-card p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp className="w-24 h-24 text-success" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 rounded-xl bg-success/10 text-success">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <span className="text-muted font-medium">Ingresos</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-foreground">€{totalIngresos.toFixed(2)}</span>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-sm text-muted">
                            <span>Este mes</span>
                        </div>
                    </div>
                </div>

                {/* Expenses Card */}
                <div className="glass-card p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingDown className="w-24 h-24 text-danger" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 rounded-xl bg-danger/10 text-danger">
                                <TrendingDown className="w-6 h-6" />
                            </div>
                            <span className="text-muted font-medium">Gastos</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-foreground">€{totalGastos.toFixed(2)}</span>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-sm text-muted">
                            <span>Este mes</span>
                        </div>
                    </div>
                </div>

                {/* Savings Card */}
                <Link href="/ahorros" className="glass-card p-6 relative overflow-hidden group hover:ring-2 hover:ring-secondary/50 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <PiggyBank className="w-24 h-24 text-secondary" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 rounded-xl bg-secondary/10 text-secondary">
                                <PiggyBank className="w-6 h-6" />
                            </div>
                            <span className="text-muted font-medium">Ahorro Total</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-foreground">€{savingsAnalysis.totalAhorrado.toFixed(2)}</span>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-sm text-secondary bg-secondary/10 w-fit px-2 py-1 rounded-lg">
                            <span>{savingsAnalysis.percentageSaved.toFixed(1)}% de ingresos</span>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Charts Section */}
                <div className="lg:col-span-2 glass-panel p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-foreground">Análisis de Gastos</h3>
                        <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                            <MoreHorizontal className="w-5 h-5 text-muted" />
                        </button>
                    </div>

                    <div className="h-[300px] w-full">
                        <ExpensesDonutChart data={chartData} />
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="glass-panel p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-foreground">Recientes</h3>
                        <Link href="/ingresos" className="text-sm text-primary hover:text-primary-dark transition-colors">
                            Ver todo
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {recentTransactions.length === 0 ? (
                            <div className="text-center py-10">
                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Wallet className="w-6 h-6 text-muted" />
                                </div>
                                <p className="text-muted text-sm">No hay transacciones recientes</p>
                            </div>
                        ) : (
                            recentTransactions.map((tx, index) => (
                                <div key={`${tx.type}-${tx.id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className={`
                                            w-10 h-10 rounded-lg flex items-center justify-center
                                            ${tx.type === 'ingreso' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}
                                        `}>
                                            {tx.type === 'ingreso' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground text-sm">{tx.descripcion}</p>
                                            <div className="flex items-center gap-2 text-xs text-muted">
                                                <Calendar className="w-3 h-3" />
                                                {format(new Date(tx.fecha), "d MMM", { locale: es })}
                                                {tx.type === 'gasto' && 'categoria' in tx && (
                                                    <span className="flex items-center gap-1 ml-1">
                                                        <Tag className="w-3 h-3" />
                                                        {tx.categoria.nombre}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`font-bold ${tx.type === 'ingreso' ? 'text-success' : 'text-danger'}`}>
                                        {tx.type === 'ingreso' ? '+' : '-'}€{tx.monto.toFixed(2)}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div >
    )
}
