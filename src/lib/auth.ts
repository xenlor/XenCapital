import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export async function getCurrentUser() {
    const session = await auth()

    if (!session?.user?.username || !session.user.id) {
        redirect('/api/auth/force-logout')
    }

    return {
        id: session.user.id,
        username: session.user.username,
        name: session.user.name,
        role: session.user.role
    }
}
