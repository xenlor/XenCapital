'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth'

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
    const user = await getCurrentUser()
    return await prisma.categoria.findMany({
        where: { userId: user.id },
        orderBy: {
            nombre: 'asc',
        },
    })
}

export async function addGasto(formData: FormData) {
    const user = await getCurrentUser()
    const monto = parseFloat(formData.get('monto') as string)
    const descripcion = formData.get('descripcion') as string
    const categoriaId = parseInt(formData.get('categoriaId') as string)
    const fecha = new Date(formData.get('fecha') as string)

    if (!monto || !descripcion || !categoriaId || !fecha) {
        return { success: false, error: 'Faltan campos requeridos' }
    }

    try {
        await prisma.gasto.create({
            data: {
                monto,
                descripcion,
                categoriaId,
                fecha,
                userId: user.id,
            },
        })
        revalidatePath('/gastos')
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error('Error creating gasto:', error)
        return { success: false, error: 'Error al crear el gasto' }
    }
}

export async function deleteGasto(id: number) {
    try {
        // Comprobar si este gasto está vinculado a un gasto compartido
        const user = await getCurrentUser()
        // Comprobar si este gasto está vinculado y pertenece al usuario
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
