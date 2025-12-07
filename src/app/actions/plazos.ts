'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth'

export async function getPlazos() {
    try {
        const user = await getCurrentUser()
        const plazos = await prisma.plazo.findMany({
            where: { userId: user.id },
            orderBy: {
                fechaInicio: 'desc',
            },
        })
        return plazos
    } catch (error) {
        console.error('Error fetching plazos:', error)
        return []
    }
}

export async function addPlazo(formData: FormData) {
    try {
        const user = await getCurrentUser()
        const descripcion = formData.get('descripcion') as string
        const montoTotal = parseFloat(formData.get('montoTotal') as string)
        const totalCuotas = parseInt(formData.get('totalCuotas') as string)
        const fechaInicio = new Date(formData.get('fechaInicio') as string)

        if (!descripcion || !montoTotal || !totalCuotas || !fechaInicio) {
            return { success: false, error: 'Todos los campos son requeridos' }
        }

        const montoCuota = montoTotal / totalCuotas

        await prisma.plazo.create({
            data: {
                descripcion,
                montoTotal,
                totalCuotas,
                montoCuota,
                fechaInicio,
                cuotasPagadas: formData.get('cuotasPagadas') ? parseInt(formData.get('cuotasPagadas') as string) : 0,
                userId: user.id,
            },
        })

        revalidatePath('/plazos')
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error('Error adding plazo:', error)
        return { success: false, error: 'Error al crear el plazo' }
    }
}

export async function payCuota(id: number) {
    try {
        const user = await getCurrentUser()
        const plazo = await prisma.plazo.findUnique({ where: { id } })

        if (!plazo || plazo.userId !== user.id) return { success: false, error: 'Plazo no encontrado' }
        if (plazo.cuotasPagadas >= plazo.totalCuotas) return { success: false, error: 'Plazo ya pagado' }

        const updatedPlazo = await prisma.plazo.update({
            where: { id },
            data: {
                cuotasPagadas: { increment: 1 },
            },
        })

        // Crear gasto para este pago
        // 1. Buscar o crear la categoría "Compras a plazos"
        let categoria = await prisma.categoria.findFirst({
            where: { nombre: 'Compras a plazos', userId: user.id }
        })

        if (!categoria) {
            categoria = await prisma.categoria.create({
                data: {
                    nombre: 'Compras a plazos',
                    color: '#8b5cf6',
                    icono: 'CreditCard',
                    userId: user.id,
                }
            })
        }

        // 2. Crear el gasto
        await prisma.gasto.create({
            data: {
                monto: plazo.montoCuota,
                descripcion: `Cuota ${updatedPlazo.cuotasPagadas} de ${plazo.totalCuotas} - ${plazo.descripcion}`,
                categoriaId: categoria.id,
                fecha: new Date(),
                userId: user.id,
            }
        })

        revalidatePath('/plazos')
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error('Error paying cuota:', error)
        return { success: false, error: 'Error al pagar cuota' }
    }
}

export async function deletePlazo(id: number) {
    try {
        await prisma.plazo.delete({
            where: { id },
        })

        revalidatePath('/plazos')
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error('Error deleting plazo:', error)
        return { success: false, error: 'Error al eliminar el plazo' }
    }
}

export async function revertCuota(id: number) {
    try {
        const plazo = await prisma.plazo.findUnique({ where: { id } })

        if (!plazo) return { success: false, error: 'Plazo no encontrado' }
        if (plazo.cuotasPagadas <= 0) return { success: false, error: 'No hay cuotas para revertir' }

        // 1. Decrementar cuotasPagadas
        const updatedPlazo = await prisma.plazo.update({
            where: { id },
            data: {
                cuotasPagadas: { decrement: 1 },
            },
        })

        // 2. Buscar y eliminar el gasto correspondiente
        // Buscamos un gasto con la descripción exacta generada durante el pago
        // Formato descripción: `Cuota ${cuotasPagadas} de ${totalCuotas} - ${descripcion}`
        // Nota: Usamos las cuotasPagadas *originales* (antes de decrementar) que corresponden al gasto a borrar.
        // Como ya decrementamos, usamos updatedPlazo.cuotasPagadas + 1
        const cuotaRevertida = updatedPlazo.cuotasPagadas + 1
        const descripcionGasto = `Cuota ${cuotaRevertida} de ${plazo.totalCuotas} - ${plazo.descripcion}`

        const gasto = await prisma.gasto.findFirst({
            where: {
                descripcion: descripcionGasto,
                monto: plazo.montoCuota
            }
        })

        if (gasto) {
            await prisma.gasto.delete({
                where: { id: gasto.id }
            })
        }

        revalidatePath('/plazos')
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error('Error reverting cuota:', error)
        return { success: false, error: 'Error al revertir cuota' }
    }
}
