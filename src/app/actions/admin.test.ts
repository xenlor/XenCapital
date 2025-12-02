import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createUser, deleteUser, resetPassword } from './admin'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
            create: vi.fn(),
            delete: vi.fn(),
            update: vi.fn()
        }
    }
}))

vi.mock('bcryptjs', () => ({
    default: {
        hash: vi.fn()
    }
}))

// Mock revalidatePath
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn()
}))

vi.mock('@/lib/auth', () => ({
    getCurrentUser: vi.fn()
}))

import { getCurrentUser } from '@/lib/auth'

describe('Admin Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(getCurrentUser).mockResolvedValue({
            id: 'admin-id',
            role: 'ADMIN'
        } as any)
    })

    describe('createUser', () => {
        it('returns error if username already exists', async () => {
            const userData = {
                username: 'existinguser',
                password: '123456',
                name: 'Test User',
                role: 'USER'
            }

            vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'existing' } as any)

            const result = await createUser(userData)
            expect(result).toEqual({ success: false, error: 'Username already taken' })
        })

        it('creates user successfully', async () => {
            const userData = {
                username: 'newuser',
                password: '123456',
                name: 'New User',
                role: 'USER'
            }

            vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
            vi.mocked(bcrypt.hash).mockResolvedValue('hashed_password' as any)

            const result = await createUser(userData)

            expect(prisma.user.create).toHaveBeenCalledWith({
                data: {
                    username: 'newuser',
                    password: 'hashed_password',
                    name: 'New User',
                    role: 'USER',
                    configuracion: {
                        create: {
                            porcentajeAhorro: 20.0
                        }
                    }
                }
            })
            expect(result).toEqual({ success: true })
        })
    })

    describe('deleteUser', () => {
        it('deletes user successfully', async () => {
            await deleteUser('user-to-delete')

            expect(prisma.user.delete).toHaveBeenCalledWith({
                where: { id: 'user-to-delete' }
            })
        })
    })

    describe('resetPassword', () => {
        it('resets password successfully', async () => {
            vi.mocked(bcrypt.hash).mockResolvedValue('new_hashed_password' as any)

            const result = await resetPassword('user-123', 'newpass123')

            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: 'user-123' },
                data: { password: 'new_hashed_password' }
            })
            expect(result).toEqual({ success: true })
        })
    })
})
