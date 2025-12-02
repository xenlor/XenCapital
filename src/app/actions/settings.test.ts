import { describe, it, expect, vi, beforeEach } from 'vitest'
import { changePassword } from './settings'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import bcrypt from 'bcryptjs'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
            update: vi.fn()
        }
    }
}))

vi.mock('@/lib/auth', () => ({
    getCurrentUser: vi.fn()
}))

vi.mock('bcryptjs', () => ({
    default: {
        compare: vi.fn(),
        hash: vi.fn()
    }
}))

describe('changePassword', () => {
    const mockUser = { id: 'user-123', username: 'testuser' }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(getCurrentUser).mockResolvedValue(mockUser as any)
    })

    it('returns error if fields are missing', async () => {
        const formData = new FormData()
        formData.append('currentPassword', '123456')
        // Missing newPassword

        const result = await changePassword(null, formData)
        expect(result).toEqual({ success: false, error: 'Todos los campos son obligatorios' })
    })

    it('returns error if passwords do not match', async () => {
        const formData = new FormData()
        formData.append('currentPassword', '123456')
        formData.append('newPassword', 'newpass123')
        formData.append('confirmPassword', 'mismatch123')

        const result = await changePassword(null, formData)
        expect(result).toEqual({ success: false, error: 'Las contraseñas nuevas no coinciden' })
    })

    it('returns error if new password is too short', async () => {
        const formData = new FormData()
        formData.append('currentPassword', '123456')
        formData.append('newPassword', '123')
        formData.append('confirmPassword', '123')

        const result = await changePassword(null, formData)
        expect(result).toEqual({ success: false, error: 'La contraseña debe tener al menos 6 caracteres' })
    })

    it('returns error if user not found in DB', async () => {
        const formData = new FormData()
        formData.append('currentPassword', '123456')
        formData.append('newPassword', 'newpass123')
        formData.append('confirmPassword', 'newpass123')

        vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

        const result = await changePassword(null, formData)
        expect(result).toEqual({ success: false, error: 'Usuario no encontrado' })
    })

    it('returns error if current password is incorrect', async () => {
        const formData = new FormData()
        formData.append('currentPassword', 'wrongpass')
        formData.append('newPassword', 'newpass123')
        formData.append('confirmPassword', 'newpass123')

        vi.mocked(prisma.user.findUnique).mockResolvedValue({
            id: 'user-123',
            password: 'hashed_password'
        } as any)

        vi.mocked(bcrypt.compare).mockResolvedValue(false as any)

        const result = await changePassword(null, formData)
        expect(result).toEqual({ success: false, error: 'La contraseña actual es incorrecta' })
    })

    it('updates password successfully', async () => {
        const formData = new FormData()
        formData.append('currentPassword', 'correctpass')
        formData.append('newPassword', 'newpass123')
        formData.append('confirmPassword', 'newpass123')

        vi.mocked(prisma.user.findUnique).mockResolvedValue({
            id: 'user-123',
            password: 'hashed_password'
        } as any)

        vi.mocked(bcrypt.compare).mockResolvedValue(true as any)
        vi.mocked(bcrypt.hash).mockResolvedValue('new_hashed_password' as any)

        const result = await changePassword(null, formData)

        expect(prisma.user.update).toHaveBeenCalledWith({
            where: { id: 'user-123' },
            data: { password: 'new_hashed_password' }
        })
        expect(result).toEqual({ success: true })
    })
})
