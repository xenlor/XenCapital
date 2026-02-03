'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth'
import { validateMonto, validateId, sanitizeDescription, checkRateLimit } from '@/lib/security'

export async function getIngresos(month?: number, year?: number) {
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

        const ingresos = await prisma.ingreso.findMany({
            where,
            orderBy: { fecha: 'desc' },
        })
        return ingresos
    } catch (error) {
        console.error('Error fetching ingresos:', error)
        return []
    }
}

export async function addIngreso(formData: FormData) {
    try {
        const user = await getCurrentUser()

        // Rate limiting
        if (!checkRateLimit(user.id)) {
            return { success: false, error: 'Demasiadas solicitudes. Intenta más tarde.' }
        }

        // Validar monto
        const montoRaw = formData.get('monto') as string
        const montoValidation = validateMonto(montoRaw)
        if (!montoValidation.valid) {
            return { success: false, error: montoValidation.error }
        }

        // Sanitizar descripción
        const descripcionRaw = formData.get('descripcion') as string
        const descripcion = sanitizeDescription(descripcionRaw)
        if (!descripcion) {
            return { success: false, error: 'La descripción es requerida' }
        }

        const fecha = formData.get('fecha') as string

        await prisma.ingreso.create({
            data: {
                monto: montoValidation.value,
                descripcion,
                fecha: fecha ? new Date(fecha) : new Date(),
                userId: user.id,
            },
        })

        revalidatePath('/ingresos')
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Error al agregar ingreso' }
    }
}

export async function deleteIngreso(id: number) {
    // Validar ID
    const idValidation = validateId(id)
    if (!idValidation.valid) {
        return { success: false, error: idValidation.error }
    }

    try {
        const user = await getCurrentUser()

        // Rate limiting
        if (!checkRateLimit(user.id)) {
            return { success: false, error: 'Demasiadas solicitudes. Intenta más tarde.' }
        }

        const result = await prisma.ingreso.deleteMany({
            where: {
                id: idValidation.value,
                userId: user.id
            },
        })

        if (result.count === 0) {
            return { success: false, error: 'Registro no encontrado' }
        }

        revalidatePath('/ingresos')
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Error al eliminar' }
    }
}

export async function getTotalIngresos() {
    try {
        const user = await getCurrentUser()
        const currentMonth = new Date()
        currentMonth.setDate(1)
        currentMonth.setHours(0, 0, 0, 0)

        const ingresos = await prisma.ingreso.findMany({
            where: {
                userId: user.id,
                fecha: {
                    gte: currentMonth,
                },
            },
        })

        const total = ingresos.reduce((sum, ing) => sum + ing.monto, 0)
        return total
    } catch (error) {
        console.error('Error calculating total ingresos:', error)
        return 0
    }
}

export async function updateIngreso(id: number, formData: FormData) {
    // Validar ID
    const idValidation = validateId(id)
    if (!idValidation.valid) {
        return { success: false, error: idValidation.error }
    }

    try {
        const user = await getCurrentUser()

        // Rate limiting
        if (!checkRateLimit(user.id)) {
            return { success: false, error: 'Demasiadas solicitudes. Intenta más tarde.' }
        }

        // Verificar propiedad
        const existingIngreso = await prisma.ingreso.findUnique({
            where: { id: idValidation.value }
        })

        if (!existingIngreso || existingIngreso.userId !== user.id) {
            return { success: false, error: 'Ingreso no encontrado o no tienes permisos' }
        }

        // Validar monto
        const montoRaw = formData.get('monto') as string
        const montoValidation = validateMonto(montoRaw)
        if (!montoValidation.valid) {
            return { success: false, error: montoValidation.error }
        }

        // Sanitizar descripción
        const descripcionRaw = formData.get('descripcion') as string
        const descripcion = sanitizeDescription(descripcionRaw)
        if (!descripcion) {
            return { success: false, error: 'La descripción es requerida' }
        }

        const fechaRaw = formData.get('fecha') as string
        const fecha = fechaRaw ? new Date(fechaRaw) : new Date()
        if (isNaN(fecha.getTime())) {
            return { success: false, error: 'Fecha inválida' }
        }

        await prisma.ingreso.update({
            where: { id: idValidation.value },
            data: {
                monto: montoValidation.value,
                descripcion,
                fecha,
            },
        })

        revalidatePath('/ingresos')
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Error al actualizar el ingreso' }
    }
}
