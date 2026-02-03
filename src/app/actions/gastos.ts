'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth'
import { validateMonto, validateId, sanitizeDescription, checkRateLimit } from '@/lib/security'

export async function getGastos(month?: number, year?: number, categoryIds?: number[]) {
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

    if (categoryIds && categoryIds.length > 0) {
        where.categoriaId = {
            in: categoryIds
        }
    }

    return await prisma.gasto.findMany({
        where,
        orderBy: {
            fecha: 'desc',
        },
        include: {
            categoria: true,
        },
    })
}

export async function getCategorias() {
    try {
        const user = await getCurrentUser()
        console.log('ServerAction: getCategorias for user:', user.id)
        const categories = await prisma.categoria.findMany({
            where: {
                OR: [
                    { userId: user.id },
                    { userId: null }
                ]
            },
            orderBy: {
                nombre: 'asc',
            },
        })
        console.log('ServerAction: getCategorias found:', categories.length)
        return categories
    } catch (error) {
        console.error('ServerAction: Error in getCategorias:', error)
        throw error
    }
}

export async function addGasto(formData: FormData) {
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

    // Validar categoría
    const categoriaIdRaw = parseInt(formData.get('categoriaId') as string)
    const categoriaValidation = validateId(categoriaIdRaw)
    if (!categoriaValidation.valid) {
        return { success: false, error: 'Categoría inválida' }
    }

    // Validar fecha
    const fechaRaw = formData.get('fecha') as string
    const fecha = new Date(fechaRaw)
    if (isNaN(fecha.getTime())) {
        return { success: false, error: 'Fecha inválida' }
    }

    try {
        await prisma.gasto.create({
            data: {
                monto: montoValidation.value,
                descripcion,
                categoriaId: categoriaValidation.value,
                fecha,
                userId: user.id,
            },
        })
        revalidatePath('/gastos')
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Error al crear el gasto' }
    }
}

export async function deleteGasto(id: number) {
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
        const gasto = await prisma.gasto.findFirst({
            where: {
                id,
                userId: user.id
            },
            select: { gastoCompartidoId: true }
        })

        if (!gasto) {
            return { success: false, error: 'Gasto no encontrado o no tienes permisos' }
        }

        if (gasto?.gastoCompartidoId) {
            // Si está vinculado, eliminar el gasto compartido (lo cual eliminará en cascada este gasto)
            await prisma.gastoCompartido.delete({
                where: { id: gasto.gastoCompartidoId }
            })
        } else {
            // Si no está vinculado, solo eliminar el gasto
            await prisma.gasto.delete({
                where: { id },
            })
        }

        revalidatePath('/gastos')
        revalidatePath('/gastos-compartidos')
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error('Error deleting gasto:', error)
        return { success: false, error: 'Error al eliminar el gasto' }
    }
}

export async function addCategoria(formData: FormData) {
    const user = await getCurrentUser()
    const nombre = formData.get('nombre') as string
    const color = formData.get('color') as string || '#6366f1'

    if (!nombre) {
        return { success: false, error: 'El nombre es requerido' }
    }

    try {
        await prisma.categoria.create({
            data: {
                nombre,
                color,
                icono: 'Tag',
                userId: user.id,
            },
        })
        revalidatePath('/gastos')
        return { success: true }
    } catch (error) {
        console.error('Error creating categoria:', error)
        return { success: false, error: 'Error al crear la categoría' }
    }
}

export async function updateGasto(id: number, formData: FormData) {
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
        const existingGasto = await prisma.gasto.findUnique({
            where: { id: idValidation.value }
        })

        if (!existingGasto || existingGasto.userId !== user.id) {
            return { success: false, error: 'Gasto no encontrado o no tienes permisos' }
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

        // Validar categoría
        const categoriaIdRaw = parseInt(formData.get('categoriaId') as string)
        const categoriaValidation = validateId(categoriaIdRaw)
        if (!categoriaValidation.valid) {
            return { success: false, error: 'Categoría inválida' }
        }

        // Validar fecha
        const fechaRaw = formData.get('fecha') as string
        const fecha = new Date(fechaRaw)
        if (isNaN(fecha.getTime())) {
            return { success: false, error: 'Fecha inválida' }
        }

        // Si cambia el monto y es compartido, esto podría requerir lógica compleja adicional
        // Por ahora, actualización simple

        await prisma.gasto.update({
            where: { id: idValidation.value },
            data: {
                monto: montoValidation.value,
                descripcion,
                categoriaId: categoriaValidation.value,
                fecha,
            },
        })

        revalidatePath('/gastos')
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Error al actualizar el gasto' }
    }
}
