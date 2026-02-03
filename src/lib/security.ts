

import { z } from 'zod'

// ============================================
// VALIDACIÓN DE TIPOS COMUNES
// ============================================

/**
 * Valida que un ID sea un entero positivo
 */
export function validateId(id: unknown): { valid: true; value: number } | { valid: false; error: string } {
    if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
        return { valid: false, error: 'ID inválido' }
    }
    return { valid: true, value: id }
}

/**
 * Valida que un monto sea un número positivo razonable
 */
export function validateMonto(monto: unknown): { valid: true; value: number } | { valid: false; error: string } {
    const num = typeof monto === 'string' ? parseFloat(monto) : monto

    if (typeof num !== 'number' || isNaN(num)) {
        return { valid: false, error: 'Monto debe ser un número' }
    }

    if (num <= 0) {
        return { valid: false, error: 'El monto debe ser mayor a 0' }
    }

    if (num > 999999999) {
        return { valid: false, error: 'El monto excede el límite permitido' }
    }

    // Redondear a 2 decimales
    const rounded = Math.round(num * 100) / 100
    return { valid: true, value: rounded }
}

/**
 * Sanitiza una descripción eliminando caracteres potencialmente peligrosos
 * Prisma ya previene SQL injection, pero esto añade una capa extra
 */
export function sanitizeDescription(text: string, maxLength: number = 500): string {
    if (!text || typeof text !== 'string') return ''

    return text
        .trim()
        .slice(0, maxLength)
        // Eliminar tags HTML
        .replace(/<[^>]*>/g, '')
        // Eliminar caracteres de control
        .replace(/[\x00-\x1F\x7F]/g, '')
}

// ============================================
// SCHEMAS ZOD COMUNES
// ============================================

export const IdSchema = z.number().int().positive('ID debe ser un entero positivo')

export const MontoSchema = z.number()
    .positive('El monto debe ser mayor a 0')
    .max(999999999, 'El monto excede el límite permitido')
    .transform(val => Math.round(val * 100) / 100) // Redondear a 2 decimales

export const DescripcionSchema = z.string()
    .min(1, 'La descripción es requerida')
    .max(500, 'La descripción es muy larga')
    .transform(val => sanitizeDescription(val))

export const FechaSchema = z.string()
    .transform(val => {
        const date = new Date(val)
        if (isNaN(date.getTime())) {
            throw new Error('Fecha inválida')
        }
        return date
    })

// ============================================
// RATE LIMITING POR USUARIO
// ============================================

// Almacén simple en memoria para rate limiting por usuario
// En producción, considera usar Redis
const userRequestCounts = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT = 100 // requests
const RATE_WINDOW = 60 * 1000 // 1 minuto

/**
 * Verifica si un usuario ha excedido el límite de requests
 * @returns true si está dentro del límite, false si lo excedió
 */
export function checkRateLimit(userId: string): boolean {
    const now = Date.now()
    const userData = userRequestCounts.get(userId)

    if (!userData || now > userData.resetTime) {
        // Nuevo periodo o primer request
        userRequestCounts.set(userId, { count: 1, resetTime: now + RATE_WINDOW })
        return true
    }

    if (userData.count >= RATE_LIMIT) {
        return false
    }

    userData.count++
    return true
}

/**
 * Wrapper para aplicar rate limiting a una server action
 */
export async function withRateLimit<T>(
    userId: string,
    action: () => Promise<T>
): Promise<T | { success: false; error: string }> {
    if (!checkRateLimit(userId)) {
        return {
            success: false,
            error: 'Demasiadas solicitudes. Intenta de nuevo en un momento.'
        }
    }
    return action()
}
