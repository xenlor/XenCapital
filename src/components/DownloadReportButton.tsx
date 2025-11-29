'use client'

import { Download } from 'lucide-react'
import * as XLSX from 'xlsx'

interface DownloadReportButtonProps {
    ingresos: any[]
    gastos: any[]
    month: number
    year: number
}

export function DownloadReportButton({ ingresos, gastos, month, year }: DownloadReportButtonProps) {
    const handleDownload = () => {
        // Combine data
        const allTransactions = [
            ...ingresos.map(i => ({
                Fecha: new Date(i.fecha),
                Tipo: 'Ingreso',
                Descripción: i.descripcion,
                Categoría: 'Ingreso',
                Monto: i.monto
            })),
            ...gastos.map(g => ({
                Fecha: new Date(g.fecha),
                Tipo: 'Gasto',
                Descripción: g.descripcion,
                Categoría: g.categoria?.nombre || 'Sin categoría',
                Monto: -g.monto // Negative for expenses
            }))
        ].sort((a, b) => b.Fecha.getTime() - a.Fecha.getTime())

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(allTransactions.map(t => ({
            ...t,
            Fecha: t.Fecha.toLocaleDateString()
        })))

        // Create workbook
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Reporte Financiero")

        // Generate Excel file
        XLSX.writeFile(wb, `reporte_financiero_${month + 1}_${year}.xlsx`)
    }

    return (
        <button
            onClick={handleDownload}
            title="Descargar Reporte Excel"
            className="p-2 text-muted hover:text-foreground hover:bg-white/5 rounded-lg transition-colors"
        >
            <Download className="w-5 h-5" />
        </button>
    )
}
