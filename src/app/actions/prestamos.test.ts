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
            findUnique: vi.fn(),
            update: vi.fn()
        },
        categoria: {
            findFirst: vi.fn(),
            create: vi.fn()
        },
        gasto: {
            create: vi.fn(),
            delete: vi.fn()
        },
        ingreso: {
            create: vi.fn(),
            delete: vi.fn()
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

        // Mock categoria findFirst/create
        vi.mocked(prisma.categoria.findFirst).mockResolvedValue({
            id: 1,
            nombre: 'Préstamos',
            color: '#64748B',
            icono: 'HandCoins',
            userId: 'user-123',
            createdAt: new Date(),
            updatedAt: new Date()
        } as any)

        // Mock gasto create
        vi.mocked(prisma.gasto.create).mockResolvedValue({
            id: 1,
            monto: 500,
            descripcion: 'Préstamo a John Doe',
            categoriaId: 1,
            fecha: new Date('2023-11-01'),
            userId: 'user-123'
        } as any)

        // Mock prestamo create
        vi.mocked(prisma.prestamo.create).mockResolvedValue({
            id: 1,
            persona: 'John Doe',
            monto: 500,
            fechaPrestamo: new Date('2023-11-01'),
            fechaRecordatorio: new Date('2023-12-01'),
            pagado: false,
            gastoId: 1,
            ingresoId: null,
            userId: 'user-123'
        } as any)
    })

    describe('addPrestamo', () => {
        it('creates loan successfully', async () => {
            const formData = new FormData()
            formData.append('persona', 'John Doe')
            formData.append('monto', '500')
            formData.append('fechaPrestamo', '2023-11-01')
            formData.append('fechaRecordatorio', '2023-12-01')

            await addPrestamo(formData)

            expect(prisma.categoria.findFirst).toHaveBeenCalled()
            expect(prisma.gasto.create).toHaveBeenCalled()
            expect(prisma.prestamo.create).toHaveBeenCalled()
        })
    })
})
