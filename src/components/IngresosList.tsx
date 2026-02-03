'use client'

import { useState } from 'react'
import { TrendingUp, Calendar, Trash2, Edit2, DollarSign } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { deleteIngreso, updateIngreso } from '@/app/actions/ingresos'
import { EditTransactionModal } from '@/components/EditTransactionModal'

interface Ingreso {
    id: number
    monto: number
    descripcion: string
    fecha: Date
}

interface IngresosListProps {
    initialIngresos: Ingreso[]
}

export function IngresosList({ initialIngresos }: IngresosListProps) {
    const [editingIngreso, setEditingIngreso] = useState<Ingreso | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Referencias a datos iniciales que se actualizan via revalidatePath del padre
    // React reconcilia el árbol cuando el padre re-renderiza con nuevos datos.
    const ingresos = initialIngresos

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar este ingreso?')) return
        await deleteIngreso(id)
    }

    const handleEdit = (ingreso: Ingreso) => {
        setEditingIngreso(ingreso)
        setIsModalOpen(true)
    }

    const handleUpdate = async (id: number, formData: FormData) => {
        const result = await updateIngreso(id, formData)
        if (result.success) {
            setIsModalOpen(false)
            setEditingIngreso(null)
        }
        return result
    }

    if (ingresos.length === 0) {
        return (
            <div className="glass-panel p-6 rounded-2xl min-h-[500px]">
                <h2 className="text-xl font-bold text-foreground mb-6">Historial de Transacciones</h2>
                <div className="flex flex-col items-center justify-center h-[300px] text-center">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 animate-pulse-slow">
                        <TrendingUp className="w-10 h-10 text-muted/50" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Sin ingresos registrados</h3>
                    <p className="text-muted max-w-xs">
                        Tus ingresos aparecerán aquí. Comienza añadiendo uno desde el formulario.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="glass-panel p-6 rounded-2xl min-h-[500px]">
            <h2 className="text-xl font-bold text-foreground mb-6">Historial de Transacciones</h2>

            <div className="space-y-3">
                {ingresos.map((ingreso) => (
                    <div
                        key={ingreso.id}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 gap-4"
                    >
                        <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success/20 to-emerald-500/10 flex items-center justify-center text-success border border-success/10 group-hover:border-success/30 transition-colors shrink-0">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground text-lg truncate">{ingreso.descripcion}</p>
                                <div className="flex items-center gap-2 text-sm text-muted">
                                    <Calendar className="w-3 h-3" />
                                    <span>{format(new Date(ingreso.fecha), "d 'de' MMMM, yyyy", { locale: es })}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 w-full sm:w-auto pl-[4rem] sm:pl-0">
                            <p className="text-xl font-bold text-success tracking-tight whitespace-nowrap">
                                +€{ingreso.monto.toFixed(2)}
                            </p>

                            <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button
                                    onClick={() => handleEdit(ingreso)}
                                    className="p-2 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                                    title="Editar"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(ingreso.id)}
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
                    transaction={editingIngreso}
                    type="ingreso"
                    onUpdate={handleUpdate}
                />
            )}
        </div>
    )
}
