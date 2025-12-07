import Navigation from '@/components/Navigation'
import { MobileHeader } from '@/components/MobileHeader'
import { MobileBottomNav } from '@/components/MobileBottomNav'
import { MobileMenu } from '@/components/MobileMenu'
import { getCurrentUser } from '@/lib/auth'
import { ClientLayout } from './ClientLayout'

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const user = await getCurrentUser()

    return (
        <ClientLayout user={user}>
            {children}
        </ClientLayout>
    )
}
