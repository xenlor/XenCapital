'use client'

import { Download } from 'lucide-react'
import ExcelJS from 'exceljs'

interface DownloadReportButtonProps {
    ingresos: any[]
    gastos: any[]
    month: number
    year: number
}

export function DownloadReportButton({ ingresos, gastos, month, year }: DownloadReportButtonProps) {
    const handleDownload = async () => {
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

        // Create workbook and worksheet
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Reporte Financiero')

        // Define columns
        worksheet.columns = [
            { header: 'Fecha', key: 'Fecha', width: 15 },
            { header: 'Tipo', key: 'Tipo', width: 12 },
            { header: 'Descripción', key: 'Descripción', width: 30 },
            { header: 'Categoría', key: 'Categoría', width: 20 },
            { header: 'Monto', key: 'Monto', width: 15 }
        ]

        // Style header row
        worksheet.getRow(1).font = { bold: true }
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1F2937' }
        }
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }

        // Add data rows
        allTransactions.forEach(t => {
            const row = worksheet.addRow({
                Fecha: t.Fecha.toLocaleDateString(),
                Tipo: t.Tipo,
                Descripción: t.Descripción,
                Categoría: t.Categoría,
                Monto: t.Monto
            })

            // Color code: green for income, red for expenses
            const montoCell = row.getCell('Monto')
            montoCell.numFmt = '€#,##0.00'
            if (t.Monto >= 0) {
                montoCell.font = { color: { argb: 'FF10B981' } }
            } else {
                montoCell.font = { color: { argb: 'FFEF4444' } }
            }
        })

        // Generate Excel file and trigger download
        const buffer = await workbook.xlsx.writeBuffer()
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `reporte_financiero_${month + 1}_${year}.xlsx`
        link.click()
        window.URL.revokeObjectURL(url)
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
