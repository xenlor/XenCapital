'use client'

import { useState } from 'react'
import { Tag, Calendar, Trash2, Edit2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { deleteGasto, updateGasto } from '@/app/actions/gastos'
import { EditTransactionModal } from '@/components/EditTransactionModal'

interface Category {
    id: number
    nombre: string
    color: string
    icono: string | null
}

interface Gasto {
    id: number
    monto: number
    descripcion: string
    fecha: Date
    categoriaId: number
    categoria: Category
}

interface GastosListProps {
    initialGastos: Gasto[]
    categories: Category[]
}

export function GastosList({ initialGastos, categories }: GastosListProps) {
    const [editingGasto, setEditingGasto] = useState<Gasto | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Nota: 'initialGastos' se actualiza automáticamente cuando el Server Component padre
    // revalidar el path '/gastos' tras una acción exitosa. React reconcilia el árbol.
    const gastos = initialGastos

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar este gasto?')) return
        await deleteGasto(id)
    }

    const handleEdit = (gasto: Gasto) => {
        setEditingGasto(gasto)
        setIsModalOpen(true)
    }

    const handleUpdate = async (id: number, formData: FormData) => {
        const result = await updateGasto(id, formData)
        if (result.success) {
            setIsModalOpen(false)
            setEditingGasto(null)
        }
        return result
    }

    if (gastos.length === 0) {
        return (
            <div className="glass-panel p-6 rounded-2xl min-h-[500px]">
                <h2 className="text-xl font-bold text-foreground mb-6">Historial de Gastos</h2>
                <div className="flex flex-col items-center justify-center h-[300px] text-center">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 animate-pulse-slow">
                        <Tag className="w-10 h-10 text-muted/50" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">Sin gastos registrados</h3>
                    <p className="text-muted max-w-xs">
                        Tus gastos aparecerán aquí. Comienza añadiendo uno desde el formulario.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="glass-panel p-6 rounded-2xl min-h-[500px]">
            <h2 className="text-xl font-bold text-foreground mb-6">Historial de Gastos</h2>

            <div className="space-y-3">
                {gastos.map((gasto) => (
                    <div
                        key={gasto.id}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 gap-4"
                    >
                        <div className="flex items-center gap-4 flex-1">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-white border border-white/10 shadow-sm shrink-0"
                                style={{ backgroundColor: `${gasto.categoria.color}20`, color: gasto.categoria.color, borderColor: `${gasto.categoria.color}40` }}
                            >
                                <Tag className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground text-lg truncate">{gasto.descripcion}</p>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm text-muted">
                                    <span
                                        className="px-2 py-0.5 rounded-md text-xs font-medium bg-white/5 border border-white/10 shrink-0"
                                        style={{ color: gasto.categoria.color }}
                                    >
                                        {gasto.categoria.nombre}
                                    </span>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Calendar className="w-3 h-3" />
                                        <span>{format(new Date(gasto.fecha), "d 'de' MMMM, yyyy", { locale: es })}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 w-full sm:w-auto pl-[4rem] sm:pl-0">
                            <p className="text-xl font-bold text-danger tracking-tight whitespace-nowrap">
                                -€{gasto.monto.toFixed(2)}
                            </p>

                            <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button
                                    onClick={() => handleEdit(gasto)}
                                    className="p-2 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                                    title="Editar"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(gasto.id)}
                                    className="p-2 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                                    title="Eliminar"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <EditTransactionModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    transaction={editingGasto}
                    type="gasto"
                    categories={categories}
                    onUpdate={handleUpdate}
                />
            )}
        </div>
    )
}
