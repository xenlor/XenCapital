'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Save, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

interface Category {
    id: number
    nombre: string
    color: string
    icono: string | null
}

interface Transaction {
    id: number
    monto: number
    descripcion: string
    fecha: Date | string
    categoriaId?: number // Solo para gastos
}

interface EditTransactionModalProps {
    isOpen: boolean
    onClose: () => void
    transaction?: Transaction | null
    type: 'gasto' | 'ingreso'
    categories?: Category[] // Solo para gastos
    onUpdate?: (id: number, formData: FormData) => Promise<{ success: boolean; error?: string }>
    onCreate?: (formData: FormData) => Promise<{ success: boolean; error?: string }>
}

export function EditTransactionModal({
    isOpen,
    onClose,
    transaction,
    type,
    categories = [],
    onUpdate,
    onCreate
}: EditTransactionModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)

    // Form states
    const [monto, setMonto] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [fecha, setFecha] = useState('')
    const [categoriaId, setCategoriaId] = useState('')

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (isOpen) {
            setError(null)
            if (transaction) {
                // Modo Edición
                setMonto(transaction.monto.toString())
                setDescripcion(transaction.descripcion)
                const dateObj = new Date(transaction.fecha)
                const formattedDate = format(dateObj, "yyyy-MM-dd'T'HH:mm")
                setFecha(formattedDate)
                if (type === 'gasto' && transaction.categoriaId) {
                    setCategoriaId(transaction.categoriaId.toString())
                }
            } else {
                // Modo Creación: Resetear campos
                setMonto('')
                setDescripcion('')
                setFecha(format(new Date(), "yyyy-MM-dd'T'HH:mm"))
                setCategoriaId('')
            }
        }
    }, [isOpen, transaction, type])

    if (!isOpen || !mounted) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsSubmitting(true)

        const formData = new FormData()
        formData.append('monto', monto)
        formData.append('descripcion', descripcion)
        formData.append('fecha', fecha)

        if (type === 'gasto') {
            formData.append('categoriaId', categoriaId)
        }

        try {
            let result;
            if (transaction && onUpdate) {
                result = await onUpdate(transaction.id, formData)
            } else if (onCreate) {
                result = await onCreate(formData)
            } else {
                throw new Error('No action defined')
            }

            if (result.success) {
                onClose()
                // Opcional: limpiar form si es creación
                if (!transaction) {
                    setMonto('')
                    setDescripcion('')
                }
            } else {
                setError(result.error || 'Error al guardar')
            }
        } catch (err) {
            setError('Error inesperado')
        } finally {
            setIsSubmitting(false)
        }
    }

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <h2 className="text-xl font-bold text-white">
                        {transaction ? 'Editar' : 'Nuevo'} {type === 'gasto' ? 'Gasto' : 'Ingreso'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                        disabled={isSubmitting}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Monto</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                            <input
                                type="number"
                                step="0.01"
                                value={monto}
                                onChange={(e) => setMonto(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-8 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                placeholder="0.00"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Descripción</label>
                        <input
                            type="text"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            placeholder="Descripción"
                            required
                        />
                    </div>

                    {type === 'gasto' && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Categoría</label>
                            <select
                                value={categoriaId}
                                onChange={(e) => setCategoriaId(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
                                required
                            >
                                <option value="" disabled>Seleccionar categoría</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id} className="bg-[#0f172a]">
                                        {cat.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Fecha y Hora</label>
                        <input
                            type="datetime-local"
                            value={fecha}
                            onChange={(e) => setFecha(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all [color-scheme:dark]"
                            required
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 py-2.5 px-4 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition-colors font-medium disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/25 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>Guardar</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    )
}
