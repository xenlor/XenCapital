'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth'

// --- Miembros ---

export async function getMiembros() {
    try {
        const user = await getCurrentUser()
        const miembros = await prisma.miembro.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'asc' },
        })
        return miembros
    } catch (error) {
        console.error('Error fetching miembros:', error)
        return []
    }
}

export async function addMiembro(formData: FormData) {
    try {
        const user = await getCurrentUser()
        const nombre = formData.get('nombre') as string
        const ingresoMensual = parseFloat(formData.get('ingresoMensual') as string)
        const esUsuario = formData.get('esUsuario') === 'on'

        if (!nombre || isNaN(ingresoMensual)) {
            return { success: false, error: 'Nombre e ingreso mensual son requeridos' }
        }

        await prisma.miembro.create({
            data: {
                nombre,
                ingresoMensual,
                esUsuario,
                userId: user.id,
            },
        })

        revalidatePath('/gastos-compartidos')
        return { success: true }
    } catch (error) {
        console.error('Error adding miembro:', error)
        return { success: false, error: 'Error al agregar miembro' }
    }
}

export async function deleteMiembro(id: number) {
    try {
        await prisma.miembro.delete({
            where: { id },
        })

        revalidatePath('/gastos-compartidos')
        return { success: true }
    } catch (error) {
        console.error('Error deleting miembro:', error)
        return { success: false, error: 'Error al eliminar miembro' }
    }
}

// --- Gastos Compartidos ---

export async function getGastosCompartidos(month?: number, year?: number) {
    try {
        const user = await getCurrentUser()
        const where: any = { userId: user.id }

        if (month !== undefined && year !== undefined) {
            const startDate = new Date(year, month, 1)
            const endDate = new Date(year, month + 1, 0, 23, 59, 59)

            where.fecha = {
                gte: startDate,
                lte: endDate
            }
        }

        const gastos = await prisma.gastoCompartido.findMany({
            where,
            include: {
                miembros: true,
            },
            orderBy: { fecha: 'desc' },
        })
        return gastos
    } catch (error) {
        console.error('Error fetching gastos compartidos:', error)
        return []
    }
}

export async function addGastoCompartido(formData: FormData) {
    try {
        const user = await getCurrentUser()
        const descripcion = formData.get('descripcion') as string
        const montoTotal = parseFloat(formData.get('montoTotal') as string)
        const fecha = new Date()

        if (!descripcion || isNaN(montoTotal)) {
            return { success: false, error: 'Descripción y monto son requeridos' }
        }

        // 1. Obtener miembros actuales para calcular la división
        const miembros = await prisma.miembro.findMany({
            where: { userId: user.id }
        })
        if (miembros.length === 0) {
            return { success: false, error: 'No hay miembros registrados para dividir el gasto' }
        }

        const totalIngresos = miembros.reduce((sum, m) => sum + m.ingresoMensual, 0)
        if (totalIngresos === 0) {
            return { success: false, error: 'El ingreso total de los miembros es 0' }
        }

        // 2. Crear GastoCompartido
        const gastoCompartido = await prisma.gastoCompartido.create({
            data: {
                descripcion,
                montoTotal,
                fecha,
                userId: user.id,
            },
        })

        // 3. Crear MiembroGastoCompartido (instantáneas) y Gasto individual para el usuario
        for (const miembro of miembros) {
            // Calcular partición
            const porcentaje = miembro.ingresoMensual / totalIngresos
            const montoCorrespondiente = montoTotal * porcentaje

            // Crear instantánea vinculada a este gasto
            await prisma.miembroGastoCompartido.create({
                data: {
                    nombre: miembro.nombre,
                    ingresoMensual: miembro.ingresoMensual,
                    esUsuario: miembro.esUsuario,
                    gastoCompartidoId: gastoCompartido.id,
                },
            })

            // Si este miembro es el usuario principal, crear un registro de Gasto
            if (miembro.esUsuario) {
                // Buscar o crear categoría 'Gastos Compartidos'
                let categoria = await prisma.categoria.findFirst({ where: { nombre: 'Gastos Compartidos' } })
                if (!categoria) {
                    categoria = await prisma.categoria.create({
                        data: { nombre: 'Gastos Compartidos', color: '#ec4899', icono: 'Users' },
                    })
                }

                await prisma.gasto.create({
                    data: {
                        descripcion: `${descripcion} (Parte proporcional)`,
                        monto: parseFloat(montoCorrespondiente.toFixed(2)),
                        categoriaId: categoria.id,
                        fecha,
                        esCompartido: true,
                        gastoCompartidoId: gastoCompartido.id,
                        userId: user.id,
                    },
                })
            }
        }

        revalidatePath('/gastos-compartidos')
        revalidatePath('/') // Actualizar dashboard ya que añadimos un Gasto
        return { success: true }
    } catch (error) {
        console.error('Error adding gasto compartido:', error)
        return { success: false, error: 'Error al crear gasto compartido' }
    }
}

export async function deleteGastoCompartido(id: number) {
    try {
        await prisma.gastoCompartido.delete({
            where: { id },
        })

        revalidatePath('/gastos-compartidos')
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error('Error deleting gasto compartido:', error)
        return { success: false, error: 'Error al eliminar gasto compartido' }
    }
}

export async function updateGastoCompartido(id: number, formData: FormData) {
    try {
        const user = await getCurrentUser()
        const descripcion = formData.get('descripcion') as string
        const montoTotal = parseFloat(formData.get('montoTotal') as string)
        const miembrosIds = JSON.parse(formData.get('miembrosIds') as string) as number[]

        if (!descripcion || isNaN(montoTotal) || miembrosIds.length === 0) {
            return { success: false, error: 'Descripción, monto y al menos un miembro son requeridos' }
        }

        // 1. Obtener miembros seleccionados
        const miembros = await prisma.miembro.findMany({
            where: {
                id: { in: miembrosIds },
                userId: user.id
            }
        })

        if (miembros.length === 0) {
            return { success: false, error: 'No se encontraron los miembros seleccionados' }
        }

        const totalIngresos = miembros.reduce((sum, m) => sum + m.ingresoMensual, 0)
        if (totalIngresos === 0) {
            return { success: false, error: 'El ingreso total de los miembros seleccionados es 0' }
        }

        // Necesitamos obtener la fecha original para preservarla en el nuevo Gasto si es posible, o usar la actual.
        // Consultamos la fecha original antes de actualizar nada.
        const originalGastoCompartido = await prisma.gastoCompartido.findUnique({
            where: { id },
            select: { fecha: true }
        })
        const fechaGasto = originalGastoCompartido?.fecha || new Date()

        // 2. Actualizar GastoCompartido
        await prisma.gastoCompartido.update({
            where: { id },
            data: {
                descripcion,
                montoTotal,
            },
        })

        // 3. Eliminar instantáneas existentes y gasto personal vinculado
        await prisma.miembroGastoCompartido.deleteMany({
            where: { gastoCompartidoId: id }
        })

        // Eliminar el Gasto vinculado (personal) para recrearlo con el monto correcto
        await prisma.gasto.deleteMany({
            where: { gastoCompartidoId: id }
        })

        // 4. Crear nuevas instantáneas y gasto personal
        for (const miembro of miembros) {
            const porcentaje = miembro.ingresoMensual / totalIngresos
            const montoCorrespondiente = montoTotal * porcentaje

            await prisma.miembroGastoCompartido.create({
                data: {
                    nombre: miembro.nombre,
                    ingresoMensual: miembro.ingresoMensual,
                    esUsuario: miembro.esUsuario,
                    gastoCompartidoId: id,
                },
            })

            if (miembro.esUsuario) {
                let categoria = await prisma.categoria.findFirst({ where: { nombre: 'Gastos Compartidos' } })
                if (!categoria) {
                    categoria = await prisma.categoria.create({
                        data: { nombre: 'Gastos Compartidos', color: '#ec4899', icono: 'Users' },
                    })
                }

                await prisma.gasto.create({
                    data: {
                        descripcion: `${descripcion} (Parte proporcional)`,
                        monto: parseFloat(montoCorrespondiente.toFixed(2)),
                        categoriaId: categoria.id,
                        fecha: fechaGasto, // Mantener fecha original
                        esCompartido: true,
                        gastoCompartidoId: id,
                        userId: user.id,
                    },
                })
            }
        }

        revalidatePath('/gastos-compartidos')
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error('Error updating gasto compartido:', error)
        return { success: false, error: 'Error al actualizar gasto compartido' }
    }
}
