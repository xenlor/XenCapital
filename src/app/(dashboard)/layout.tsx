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
