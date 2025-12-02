import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getPlazos, addPlazo, deletePlazo } from './plazos'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

vi.mock('@/lib/prisma', () => ({
    prisma: {
        plazo: {
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

describe('Plazos Actions', () => {
    const mockUser = { id: 'user-123' }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(getCurrentUser).mockResolvedValue(mockUser as any)
    })

    describe('addPlazo', () => {
        it('creates installment plan successfully', async () => {
            const formData = new FormData()
            formData.append('descripcion', 'Laptop')
            formData.append('montoTotal', '1200')
            formData.append('totalCuotas', '12')
            formData.append('fechaInicio', '2023-01-01')

            await addPlazo(formData)

            expect(prisma.plazo.create).toHaveBeenCalled()
        })
    })
})
