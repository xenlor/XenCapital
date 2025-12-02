import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getAhorros, addAhorro, deleteAhorro, getSavingsAnalysis } from './ahorros'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

vi.mock('@/lib/prisma', () => ({
    prisma: {
        ahorro: {
            findMany: vi.fn(),
            create: vi.fn(),
            deleteMany: vi.fn(), // deleteAhorro uses deleteMany
            aggregate: vi.fn()
        },
        user: {
            findUnique: vi.fn()
        },
        ingreso: {
            aggregate: vi.fn()
        },
        configuracion: {
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

describe('Ahorros Actions', () => {
    const mockUser = { id: 'user-123' }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(getCurrentUser).mockResolvedValue(mockUser as any)
    })

    describe('getSavingsAnalysis', () => {
        it('calculates savings percentage correctly', async () => {
            // Mock ahorro.aggregate to return different values based on whether fecha filter exists
            vi.mocked(prisma.ahorro.aggregate).mockImplementation((args: any) => {
                if (args.where.fecha) {
                    // Monthly savings (with date filter)
                    return Promise.resolve({ _sum: { monto: 200 } }) as any
                } else {
                    // Accumulated savings (no date filter)
                    return Promise.resolve({ _sum: { monto: 500 } }) as any
                }
            })

            vi.mocked(prisma.ingreso.aggregate).mockResolvedValue({ _sum: { monto: 1000 } } as any)
            vi.mocked(prisma.configuracion.findUnique).mockResolvedValue({
                porcentajeAhorro: 20
            } as any)

            const result = await getSavingsAnalysis(11, 2023)

            expect(result).toEqual({
                totalIngresos: 1000,
                totalAhorrado: 200,
                accumulatedSavings: 500, // All-time savings
                targetAhorro: 200, // 1000 * 0.20
                percentageSaved: 20 // (200 / 1000) * 100
            })
        })
    })

    describe('addAhorro', () => {
        it('creates savings entry', async () => {
            const formData = new FormData()
            formData.append('descripcion', 'Piggy Bank')
            formData.append('monto', '100')
            formData.append('fecha', '2023-11-01')

            await addAhorro(formData)

            expect(prisma.ahorro.create).toHaveBeenCalled()
        })
    })
})
