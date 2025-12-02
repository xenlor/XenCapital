import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getCurrentUser } from './auth'
import { redirect } from 'next/navigation'

// Mock dependencies
vi.mock('@/auth', () => ({
    auth: vi.fn()
}))

vi.mock('next/navigation', () => ({
    redirect: vi.fn()
}))

import { auth } from '@/auth'

describe('getCurrentUser', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('returns user data when session is valid', async () => {
        const mockSession = {
            user: {
                id: 'user-123',
                username: 'testuser',
                name: 'Test User',
                role: 'USER'
            }
        }
        vi.mocked(auth).mockResolvedValue(mockSession as any)

        const user = await getCurrentUser()

        expect(user).toEqual({
            id: 'user-123',
            username: 'testuser',
            name: 'Test User',
            role: 'USER'
        })
        expect(redirect).not.toHaveBeenCalled()
    })

    it('redirects to /api/auth/force-logout when session is null', async () => {
        vi.mocked(auth).mockResolvedValue(null)

        try {
            await getCurrentUser()
        } catch (e) { }

        expect(redirect).toHaveBeenCalledWith('/api/auth/force-logout')
    })

    it('redirects to /api/auth/force-logout when session user is missing', async () => {
        vi.mocked(auth).mockResolvedValue({} as any)

        try {
            await getCurrentUser()
        } catch (e) { }

        expect(redirect).toHaveBeenCalledWith('/api/auth/force-logout')
    })

    it('redirects to /api/auth/force-logout when user ID is missing (deleted user)', async () => {
        const mockSession = {
            user: {
                username: 'testuser',
                // id is missing
            }
        }
        vi.mocked(auth).mockResolvedValue(mockSession as any)

        try {
            await getCurrentUser()
        } catch (e) { }

        expect(redirect).toHaveBeenCalledWith('/api/auth/force-logout')
    })

    it('redirects to /api/auth/force-logout when username is missing', async () => {
        const mockSession = {
            user: {
                id: 'user-123',
                // username is missing
            }
        }
        vi.mocked(auth).mockResolvedValue(mockSession as any)

        try {
            await getCurrentUser()
        } catch (e) { }

        expect(redirect).toHaveBeenCalledWith('/api/auth/force-logout')
    })
})
