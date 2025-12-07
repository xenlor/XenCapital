'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'

export async function changePassword(prevState: any, formData: FormData) {
    const user = await getCurrentUser()

    const currentPassword = formData.get('currentPassword') as string
    const newPassword = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!currentPassword || !newPassword || !confirmPassword) {
        return { success: false, error: 'Todos los campos son obligatorios' }
    }

    if (newPassword !== confirmPassword) {
        return { success: false, error: 'Las contraseñas nuevas no coinciden' }
    }

    if (newPassword.length < 6) {
        return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' }
    }

    // Verificar contraseña actual
    const dbUser = await prisma.user.findUnique({
        where: { id: user.id }
    })

    if (!dbUser) {
        return { success: false, error: 'Usuario no encontrado' }
    }

    const isValid = await bcrypt.compare(currentPassword, dbUser.password)

    if (!isValid) {
        return { success: false, error: 'La contraseña actual es incorrecta' }
    }

    // Actualizar contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
    })

    return { success: true }
}
