'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth'

export async function getInversiones(month?: number, year?: number) {
    try {
        const user = await getCurrentUser()
        const where: any = { userId: user.id }

        if (month !== undefined && year !== undefined) {
            const startDate = new Date(year, month, 1)
            const endDate = new Date(year, month + 1, 0, 23, 59, 59)

            where.fecha = {
                gte: startDate,
                lte: endDate
            }
        }

        const inversiones = await prisma.inversion.findMany({
            where,
            orderBy: { fecha: 'desc' },
        })
        return inversiones
    } catch (error) {
        console.error('Error fetching inversiones:', error)
        return []
    }
}

export async function addInversion(formData: FormData) {
    try {
        const user = await getCurrentUser()
        const tipo = formData.get('tipo') as string
        const nombre = formData.get('nombre') as string
        const monto = parseFloat(formData.get('monto') as string)
        const notas = formData.get('notas') as string || null
        const fechaStr = formData.get('fecha') as string
        const fecha = fechaStr ? new Date(fechaStr) : new Date()

        if (!tipo || !nombre || isNaN(monto)) {
            return { success: false, error: 'Todos los campos son requeridos' }
        }

        await prisma.inversion.create({
            data: {
                tipo,
                nombre,
                monto,
                fecha,
                notas,
                userId: user.id,
            },
        })

        revalidatePath('/inversiones')
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error('Error adding inversion:', error)
        return { success: false, error: 'Error al añadir inversión' }
    }
}

export async function deleteInversion(id: number) {
    try {
        const user = await getCurrentUser()
        await prisma.inversion.deleteMany({
            where: { id, userId: user.id }
        })

        revalidatePath('/inversiones')
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error('Error deleting inversion:', error)
        return { success: false, error: 'Error al eliminar inversión' }
    }
}

export async function getInvestmentSummary(month?: number, year?: number) {
    try {
        const user = await getCurrentUser()

        // Obtener todas las inversiones
        const allInversiones = await prisma.inversion.findMany({
            where: { userId: user.id }
        })

        // Obtener inversiones mensuales si se provee mes/año
        let monthlyInversiones = allInversiones
        if (month !== undefined && year !== undefined) {
            const startDate = new Date(year, month, 1)
            const endDate = new Date(year, month + 1, 0, 23, 59, 59)

            monthlyInversiones = allInversiones.filter(inv => {
                const invDate = new Date(inv.fecha)
                return invDate >= startDate && invDate <= endDate
            })
        }

        // Calcular totales
        const totalInvertido = allInversiones.reduce((sum, inv) => sum + inv.monto, 0)
        const invertidoEsteMes = monthlyInversiones.reduce((sum, inv) => sum + inv.monto, 0)

        return {
            totalInvertido,
            invertidoEsteMes,
            count: allInversiones.length
        }
    } catch (error) {
        console.error('Error getting investment summary:', error)
        return {
            totalInvertido: 0,
            invertidoEsteMes: 0,
            count: 0
        }
    }
}
