'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { checkRateLimit } from '@/lib/security'

// Schema de validación para crear usuarios
const CreateUserSchema = z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50),
    username: z.string()
        .min(3, 'El usuario debe tener al menos 3 caracteres')
        .max(30)
        .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos'),
    password: z.string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .regex(/[a-zA-Z]/, 'Debe contener al menos una letra')
        .regex(/[0-9]/, 'Debe contener al menos un número'),
    role: z.enum(['USER', 'ADMIN']).default('USER')
})

// Middleware-like check for admin role (case-insensitive)
async function requireAdmin() {
    const user = await getCurrentUser()
    if (!user || user.role?.toUpperCase() !== 'ADMIN') {
        throw new Error('Unauthorized: Admin access required')
    }
    return user
}

export async function getUsers() {
    const admin = await requireAdmin()

    if (!checkRateLimit(admin.id)) {
        return { success: false, error: 'Demasiadas solicitudes. Intenta más tarde.' }
    }

    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                username: true,
                role: true,
                createdAt: true,
                _count: {
                    select: {
                        gastos: true,
                        ingresos: true
                    }
                }
            }
        })
        return { success: true, data: users }
    } catch (error) {
        console.error('Error fetching users:', error)
        return { success: false, error: 'Failed to fetch users' }
    }
}

export async function deleteUser(userId: string) {
    const admin = await requireAdmin()

    if (!checkRateLimit(admin.id)) {
        return { success: false, error: 'Demasiadas solicitudes. Intenta más tarde.' }
    }

    if (userId === admin.id) {
        return { success: false, error: 'Cannot delete your own admin account' }
    }

    try {
        await prisma.user.delete({
            where: { id: userId }
        })
        revalidatePath('/admin/users')
        return { success: true }
    } catch (error) {
        console.error('Error deleting user:', error)
        return { success: false, error: 'Failed to delete user' }
    }
}

export async function createUser(data: unknown) {
    const admin = await requireAdmin()

    if (!checkRateLimit(admin.id)) {
        return { success: false, error: 'Demasiadas solicitudes. Intenta más tarde.' }
    }

    // Validar entrada con Zod
    const validationResult = CreateUserSchema.safeParse(data)
    if (!validationResult.success) {
        const errors = validationResult.error.flatten().fieldErrors
        const firstError = Object.values(errors)[0]?.[0] || 'Datos inválidos'
        return { success: false, error: firstError }
    }

    const validatedData = validationResult.data

    try {
        const hashedPassword = await bcrypt.hash(validatedData.password, 10)

        // Check if username exists
        const existingUser = await prisma.user.findUnique({
            where: { username: validatedData.username }
        })

        if (existingUser) {
            return { success: false, error: 'Username already taken' }
        }

        await prisma.user.create({
            data: {
                name: validatedData.name,
                username: validatedData.username,
                password: hashedPassword,
                role: validatedData.role,
                configuracion: {
                    create: {
                        porcentajeAhorro: 20.0
                    }
                },
                categorias: {
                    createMany: {
                        data: [
                            { nombre: 'Comida', color: '#EF4444', icono: 'UtensilsCrossed' },
                            { nombre: 'Transporte', color: '#3B82F6', icono: 'Car' },
                            { nombre: 'Vivienda', color: '#10B981', icono: 'Home' },
                            { nombre: 'Ocio', color: '#F59E0B', icono: 'Sparkles' },
                            { nombre: 'Salud', color: '#EC4899', icono: 'Heart' },
                            { nombre: 'Educación', color: '#8B5CF6', icono: 'GraduationCap' },
                            { nombre: 'Préstamos', color: '#64748B', icono: 'HandCoins' },
                            { nombre: 'Plazos', color: '#F43F5E', icono: 'CreditCard' },
                            { nombre: 'Gastos Compartidos', color: '#EC4899', icono: 'Users' }
                        ]
                    }
                }
            }
        })
        revalidatePath('/admin/users')
        return { success: true }
    } catch (error) {
        console.error('Error creating user:', error)
        return { success: false, error: 'Failed to create user' }
    }
}

export async function resetPassword(userId: string, newPassword: string) {
    const admin = await requireAdmin()

    if (!checkRateLimit(admin.id)) {
        return { success: false, error: 'Demasiadas solicitudes. Intenta más tarde.' }
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        })

        revalidatePath('/admin/users')
        return { success: true }
    } catch (error) {
        console.error('Error resetting password:', error)
        return { success: false, error: 'Failed to reset password' }
    }
}
