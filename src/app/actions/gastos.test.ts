import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getGastos, addGasto, deleteGasto } from './gastos'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

vi.mock('@/lib/prisma', () => ({
    prisma: {
        gasto: {
            findMany: vi.fn(),
            create: vi.fn(),
            delete: vi.fn(),
            findUnique: vi.fn(),
            findFirst: vi.fn()
        }
    }
}))

vi.mock('@/lib/auth', () => ({
    getCurrentUser: vi.fn()
}))

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn()
}))

describe('Gastos Actions', () => {
    const mockUser = { id: 'user-123' }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(getCurrentUser).mockResolvedValue(mockUser as any)
    })

    describe('getGastos', () => {
        it('fetches expenses', async () => {
            const mockGastos = [{ id: 1, monto: 50 }]
            vi.mocked(prisma.gasto.findMany).mockResolvedValue(mockGastos as any)

            const result = await getGastos(11, 2023)
            expect(result).toEqual(mockGastos)
        })
    })

    describe('addGasto', () => {
        it('creates expense successfully', async () => {
            const formData = new FormData()
            formData.append('descripcion', 'Food')
            formData.append('monto', '50')
            formData.append('fecha', '2023-11-01')
            formData.append('categoriaId', '1')

            await addGasto(formData)

            expect(prisma.gasto.create).toHaveBeenCalledWith({
                data: {
                    descripcion: 'Food',
                    monto: 50,
                    fecha: expect.any(Date),
                    userId: 'user-123',
                    categoriaId: 1
                }
            })
        })
    })

    describe('deleteGasto', () => {
        it('deletes expense successfully', async () => {
            vi.mocked(prisma.gasto.findFirst).mockResolvedValue({ id: 1, gastoCompartidoId: null } as any)

            await deleteGasto(1)

            expect(prisma.gasto.delete).toHaveBeenCalledWith({
                where: { id: 1 }
            })
        })
    })
})
