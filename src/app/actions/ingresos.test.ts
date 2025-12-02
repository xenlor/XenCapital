import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getIngresos, addIngreso, deleteIngreso } from './ingresos'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

vi.mock('@/lib/prisma', () => ({
    prisma: {
        ingreso: {
            findMany: vi.fn(),
            create: vi.fn(),
            deleteMany: vi.fn(),
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

describe('Ingresos Actions', () => {
    const mockUser = { id: 'user-123' }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(getCurrentUser).mockResolvedValue(mockUser as any)
    })

    describe('getIngresos', () => {
        it('fetches incomes for specific month and year', async () => {
            const mockIngresos = [{ id: 1, monto: 100 }]
            vi.mocked(prisma.ingreso.findMany).mockResolvedValue(mockIngresos as any)

            const result = await getIngresos(11, 2023)

            expect(prisma.ingreso.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: {
                    userId: 'user-123',
                    fecha: {
                        gte: expect.any(Date),
                        lte: expect.any(Date)
                    }
                }
            }))
            expect(result).toEqual(mockIngresos)
        })
    })

    describe('addIngreso', () => {
        it('creates income successfully', async () => {
            const formData = new FormData()
            formData.append('descripcion', 'Salary')
            formData.append('monto', '1000')
            formData.append('fecha', '2023-11-01')

            await addIngreso(formData)

            expect(prisma.ingreso.create).toHaveBeenCalledWith({
                data: {
                    descripcion: 'Salary',
                    monto: 1000,
                    fecha: expect.any(Date),
                    userId: 'user-123'
                }
            })
        })
    })

    describe('deleteIngreso', () => {
        it('deletes income successfully', async () => {
            vi.mocked(prisma.ingreso.deleteMany).mockResolvedValue({ count: 1 } as any)

            await deleteIngreso(1)

            expect(prisma.ingreso.deleteMany).toHaveBeenCalledWith({
                where: { id: 1, userId: 'user-123' }
            })
        })
    })
})
