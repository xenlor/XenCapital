'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth'
import { validateMonto, validateId, sanitizeDescription, checkRateLimit } from '@/lib/security'

export async function getAhorros(month?: number, year?: number) {
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

        const ahorros = await prisma.ahorro.findMany({
            where,
            orderBy: { fecha: 'desc' },
        })
        return ahorros
    } catch (error) {
        console.error('Error fetching ahorros:', error)
        return []
    }
}

export async function addAhorro(formData: FormData) {
    try {
        const user = await getCurrentUser()

        // Rate limiting
        if (!checkRateLimit(user.id)) {
            return { success: false, error: 'Demasiadas solicitudes. Intenta más tarde.' }
        }

        // Sanitizar descripción
        const descripcionRaw = formData.get('descripcion') as string
        const descripcion = sanitizeDescription(descripcionRaw)
        if (!descripcion) {
            return { success: false, error: 'La descripción es requerida' }
        }

        // Validar monto
        const montoRaw = formData.get('monto') as string
        const montoValidation = validateMonto(montoRaw)
        if (!montoValidation.valid) {
            return { success: false, error: montoValidation.error }
        }

        const fechaStr = formData.get('fecha') as string
        const fecha = fechaStr ? new Date(fechaStr) : new Date()

        await prisma.ahorro.create({
            data: {
                descripcion,
                monto: montoValidation.value,
                fecha,
                userId: user.id,
            },
        })

        revalidatePath('/ahorros')
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Error al añadir ahorro' }
    }
}

export async function deleteAhorro(id: number) {
    const idValidation = validateId(id)
    if (!idValidation.valid) {
        return { success: false, error: idValidation.error }
    }

    try {
        const user = await getCurrentUser()

        if (!checkRateLimit(user.id)) {
            return { success: false, error: 'Demasiadas solicitudes. Intenta más tarde.' }
        }

        const result = await prisma.ahorro.deleteMany({
            where: {
                id: idValidation.value,
                userId: user.id
            },
        })

        if (result.count === 0) {
            return { success: false, error: 'Registro no encontrado' }
        }

        revalidatePath('/ahorros')
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Error al eliminar ahorro' }
    }
}

export async function getSavingsAnalysis(month: number, year: number) {
    try {
        const user = await getCurrentUser()
        const startDate = new Date(year, month, 1)
        const endDate = new Date(year, month + 1, 0, 23, 59, 59)

        const [ingresos, ahorros, accumulatedSavings] = await Promise.all([
            prisma.ingreso.aggregate({
                where: {
                    userId: user.id,
                    fecha: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                _sum: { monto: true }
            }),
            prisma.ahorro.aggregate({
                where: {
                    userId: user.id,
                    fecha: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                _sum: { monto: true }
            }),
            prisma.ahorro.aggregate({
                where: {
                    userId: user.id
                },
                _sum: { monto: true }
            })
        ])

        const totalIngresos = ingresos._sum.monto || 0
        const totalAhorrado = ahorros._sum.monto || 0
        const accumulatedTotal = accumulatedSavings._sum.monto || 0

        // Get user configuration for savings percentage
        const config = await prisma.configuracion.findUnique({
            where: { userId: user.id }
        })
        const porcentaje = config?.porcentajeAhorro || 20.0

        const targetAhorro = totalIngresos * (porcentaje / 100)

        return {
            totalIngresos,
            totalAhorrado,
            accumulatedSavings: accumulatedTotal,
            targetAhorro,
            percentageSaved: totalIngresos > 0 ? (totalAhorrado / totalIngresos) * 100 : 0
        }
    } catch (error) {
        console.error('Error getting savings analysis:', error)
        return {
            totalIngresos: 0,
            totalAhorrado: 0,
            accumulatedSavings: 0,
            targetAhorro: 0,
            percentageSaved: 0
        }
    }
}
