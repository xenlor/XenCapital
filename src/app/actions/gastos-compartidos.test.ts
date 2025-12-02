import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getGastosCompartidos, addGastoCompartido } from './gastos-compartidos'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

vi.mock('@/lib/prisma', () => ({
    prisma: {
        gastoCompartido: {
            findMany: vi.fn(),
            create: vi.fn(),
            delete: vi.fn(),
            findUnique: vi.fn()
        },
        miembro: {
            findMany: vi.fn()
        },
        user: {
            findMany: vi.fn()
        },
        miembroGastoCompartido: {
            create: vi.fn()
        },
        gasto: {
            create: vi.fn()
        },
        categoria: {
            findFirst: vi.fn(),
            create: vi.fn()
        }
    }
}))

vi.mock('@/lib/auth', () => ({
    getCurrentUser: vi.fn()
}))

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn()
}))

describe('Gastos Compartidos Actions', () => {
    const mockUser = { id: 'user-123' }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(getCurrentUser).mockResolvedValue(mockUser as any)
    })

    describe('addGastoCompartido', () => {
        it('creates shared expense successfully', async () => {
            const formData = new FormData()
            formData.append('descripcion', 'Dinner')
            formData.append('montoTotal', '100')

            vi.mocked(prisma.miembro.findMany).mockResolvedValue([
                { id: 1, nombre: 'User', ingresoMensual: 1000, esUsuario: true },
                { id: 2, nombre: 'Partner', ingresoMensual: 1000, esUsuario: false }
            ] as any)

            vi.mocked(prisma.gastoCompartido.create).mockResolvedValue({ id: 1 } as any)
            vi.mocked(prisma.categoria.findFirst).mockResolvedValue({ id: 1 } as any)

            await addGastoCompartido(formData)

            expect(prisma.gastoCompartido.create).toHaveBeenCalled()
        })
    })
})
