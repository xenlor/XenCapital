'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { checkRateLimit } from '@/lib/security'

const ProfileSchema = z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50),
    username: z.string()
        .min(3, 'El usuario debe tener al menos 3 caracteres')
        .max(30)
        .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos'),
})

export async function updateProfile(formData: FormData) {
    const user = await getCurrentUser()

    if (!checkRateLimit(user.id)) {
        return { success: false, error: 'Demasiadas solicitudes. Intenta más tarde.' }
    }

    const rawData = {
        name: formData.get('name'),
        username: formData.get('username'),
    }

    const validation = ProfileSchema.safeParse(rawData)

    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message }
    }

    const { name, username } = validation.data

    try {
        // Check if username is taken (if changed)
        if (username !== user.username) {
            const existingUser = await prisma.user.findUnique({
                where: { username }
            })
            if (existingUser) {
                return { success: false, error: 'El nombre de usuario ya está en uso' }
            }
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                name,
                username
            }
        })

        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error('Error updating profile:', error)
        return { success: false, error: 'Error al actualizar el perfil' }
    }
}
