'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Plus, TrendingDown, TrendingUp, X } from 'lucide-react'
import { getCategorias, addGasto } from '@/app/actions/gastos'
import { addIngreso } from '@/app/actions/ingresos'
import { EditTransactionModal } from './EditTransactionModal'

interface Category {
    id: number
    nombre: string
    color: string
    icono: string | null
}

export function GlobalAddButton() {
    const [isSelectionOpen, setIsSelectionOpen] = useState(false)
    const [formType, setFormType] = useState<'gasto' | 'ingreso' | null>(null)
    const [categories, setCategories] = useState<Category[]>([])
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        // Cargar categorías en segundo plano
        const loadCategories = async () => {
            try {
                const cats = await getCategorias()
                console.log('GlobalAddButton: Categories loaded:', cats)
                setCategories(cats)
            } catch (error) {
                console.error('GlobalAddButton: Error loading categories:', error)
            }
        }
        loadCategories()
    }, [])

    const handleSelect = (type: 'gasto' | 'ingreso') => {
        setFormType(type)
        setIsSelectionOpen(false)
    }

    const handleCloseForm = () => {
        setFormType(null)
    }

    const handleCreateGasto = async (formData: FormData) => {
        const result = await addGasto(formData)
        return result
    }

    const handleCreateIngreso = async (formData: FormData) => {
        const result = await addIngreso(formData)
        return result
    }

    return (
        <>
            <button
                onClick={() => setIsSelectionOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl shadow-lg shadow-primary/20 transition-all transform hover:scale-105 active:scale-95 font-medium"
            >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Nuevo</span>
            </button>

            {/* Modal de Selección */}
            {isSelectionOpen && mounted && createPortal(
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl p-6 relative animate-scale-in">
                        <button
                            onClick={() => setIsSelectionOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-xl font-bold text-white mb-6 text-center">¿Qué deseas añadir?</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleSelect('gasto')}
                                className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-white/5 border border-white/5 hover:bg-red-500/20 hover:border-red-500/30 transition-all group"
                            >
                                <div className="p-3 rounded-full bg-white/5 text-red-400 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                    <TrendingDown className="w-8 h-8" />
                                </div>
                                <span className="font-medium text-gray-300 group-hover:text-white">Gasto</span>
                            </button>

                            <button
                                onClick={() => handleSelect('ingreso')}
                                className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-white/5 border border-white/5 hover:bg-green-500/20 hover:border-green-500/30 transition-all group"
                            >
                                <div className="p-3 rounded-full bg-white/5 text-green-400 group-hover:bg-green-500 group-hover:text-white transition-colors">
                                    <TrendingUp className="w-8 h-8" />
                                </div>
                                <span className="font-medium text-gray-300 group-hover:text-white">Ingreso</span>
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Modal de Formulario */}
            {formType && (
                <EditTransactionModal
                    isOpen={true}
                    onClose={handleCloseForm}
                    type={formType}
                    categories={categories}
                    onCreate={formType === 'gasto' ? handleCreateGasto : handleCreateIngreso}
                />
            )}
        </>
    )
}
