'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth'

export async function getPrestamos() {
    try {
        const user = await getCurrentUser()
        const prestamos = await prisma.prestamo.findMany({
            where: { userId: user.id },
            orderBy: {
                fechaPrestamo: 'desc',
            },
        })
        return prestamos
    } catch (error) {
        console.error('Error fetching prestamos:', error)
        return []
    }
}

export async function addPrestamo(formData: FormData) {
    try {
        const user = await getCurrentUser()
        const persona = formData.get('persona') as string
        const monto = parseFloat(formData.get('monto') as string)
        const fechaPrestamo = new Date(formData.get('fechaPrestamo') as string)
        const fechaRecordatorioStr = formData.get('fechaRecordatorio') as string

        // Hacer fechaRecordatorio opcional
        const fechaRecordatorio = fechaRecordatorioStr && fechaRecordatorioStr.trim()
            ? new Date(fechaRecordatorioStr)
            : null

        if (!persona || !monto || !fechaPrestamo) {
            return { success: false, error: 'Campos requeridos faltantes' }
        }

        // 1. Buscar o Crear Categoría "Préstamos"
        let categoria = await prisma.categoria.findFirst({
            where: {
                nombre: 'Préstamos',
                userId: user.id
            }
        })

        if (!categoria) {
            // Intentar encontrar categoría global o crear específica para el usuario
            categoria = await prisma.categoria.create({
                data: {
                    nombre: 'Préstamos',
                    color: '#64748B',
                    icono: 'HandCoins',
                    userId: user.id
                }
            })
        }

        // 2. Crear Gasto (Salida por Préstamo)
        const gasto = await prisma.gasto.create({
            data: {
                descripcion: `Préstamo a ${persona}`,
                monto: monto,
                categoriaId: categoria.id,
                fecha: fechaPrestamo,
                userId: user.id
            }
        })

        // 3. Crear Préstamo vinculado al Gasto
        await prisma.prestamo.create({
            data: {
                persona,
                monto,
                fechaPrestamo,
                fechaRecordatorio,
                pagado: false,
                userId: user.id,
                gastoId: gasto.id
            },
        })

        revalidatePath('/prestamos')
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error('Error adding prestamo:', error)
        return { success: false, error: 'Error al crear el préstamo' }
    }
}

export async function togglePrestamoPagado(id: number, pagado: boolean) {
    try {
        const user = await getCurrentUser()
        const prestamo = await prisma.prestamo.findUnique({
            where: { id }
        })

        if (!prestamo || prestamo.userId !== user.id) {
            return { success: false, error: 'Préstamo no encontrado' }
        }

        if (!prestamo || prestamo.userId !== user.id) {
            return { success: false, error: 'Préstamo no encontrado' }
        }

        if (pagado) {
            // Crear Ingreso (Devolución del Préstamo)
            const ingreso = await prisma.ingreso.create({
                data: {
                    descripcion: `Devolución préstamo ${prestamo.persona}`,
                    monto: prestamo.monto,
                    fecha: new Date(),
                    userId: user.id
                }
            })

            await prisma.prestamo.update({
                where: { id },
                data: {
                    pagado: true,
                    ingresoId: ingreso.id
                }
            })
        } else {
            // Eliminar Ingreso si existe
            if (prestamo.ingresoId) {
                await prisma.ingreso.delete({
                    where: { id: prestamo.ingresoId }
                })
            }

            await prisma.prestamo.update({
                where: { id },
                data: {
                    pagado: false,
                    ingresoId: null
                }
            })
        }

        revalidatePath('/prestamos')
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error('Error toggling prestamo status:', error)
        return { success: false, error: 'Error al actualizar el estado' }
    }
}

export async function deletePrestamo(id: number) {
    try {
        const prestamo = await prisma.prestamo.findUnique({
            where: { id }
        })

        if (prestamo) {
            // Eliminar transacciones asociadas
            if (prestamo.gastoId) {
                await prisma.gasto.delete({
                    where: { id: prestamo.gastoId }
                })
            }
            if (prestamo.ingresoId) {
                await prisma.ingreso.delete({
                    where: { id: prestamo.ingresoId }
                })
            }
        }

        await prisma.prestamo.delete({
            where: { id },
        })

        revalidatePath('/prestamos')
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error('Error deleting prestamo:', error)
        return { success: false, error: 'Error al eliminar el préstamo' }
    }
}
