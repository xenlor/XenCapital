'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

// Middleware-like check for admin role
async function requireAdmin() {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
        throw new Error('Unauthorized: Admin access required')
    }
    return user
}

export async function getUsers() {
    await requireAdmin()

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

export async function createUser(data: any) {
    await requireAdmin()

    try {
        const hashedPassword = await bcrypt.hash(data.password, 10)

        // Check if username exists
        const existingUser = await prisma.user.findUnique({
            where: { username: data.username }
        })

        if (existingUser) {
            return { success: false, error: 'Username already taken' }
        }

        await prisma.user.create({
            data: {
                name: data.name,
                username: data.username,
                password: hashedPassword,
                role: data.role || 'USER',
                configuracion: {
                    create: {
                        porcentajeAhorro: 20.0
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
    await requireAdmin()

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
