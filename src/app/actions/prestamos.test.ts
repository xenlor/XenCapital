import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getPrestamos, addPrestamo, deletePrestamo } from './prestamos'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

vi.mock('@/lib/prisma', () => ({
    prisma: {
        prestamo: {
            findMany: vi.fn(),
            create: vi.fn(),
            delete: vi.fn(),
            findUnique: vi.fn()
        }
    }
}))

vi.mock('@/lib/auth', () => ({
    getCurrentUser: vi.fn()
}))

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn()
}))

describe('Prestamos Actions', () => {
    const mockUser = { id: 'user-123' }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(getCurrentUser).mockResolvedValue(mockUser as any)
    })

    describe('addPrestamo', () => {
        it('creates loan successfully', async () => {
            const formData = new FormData()
            formData.append('persona', 'John Doe')
            formData.append('monto', '500')
            formData.append('fechaPrestamo', '2023-11-01')
            formData.append('fechaRecordatorio', '2023-12-01')

            await addPrestamo(formData)

            expect(prisma.prestamo.create).toHaveBeenCalled()
        })
    })
})
