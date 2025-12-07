'use client'

import { useState } from 'react'
import Navigation from '@/components/Navigation'
import { MobileHeader } from '@/components/MobileHeader'
import { MobileBottomNav } from '@/components/MobileBottomNav'
import { MobileMenu } from '@/components/MobileMenu'

interface ClientLayoutProps {
    children: React.ReactNode
    user: any
}

export function ClientLayout({ children, user }: ClientLayoutProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    return (
        <>
            {/* Desktop Navigation - hidden on mobile */}
            <div className="hidden md:block">
                <Navigation userRole={user.role} />
            </div>

            {/* Mobile Header - removed as per request */}
            {/* <MobileHeader userName={user.name || user.username} userRole={user.role} /> */}

            {/* Mobile Bottom Nav - only shows on mobile */}
            <MobileBottomNav onMenuClick={() => setIsMobileMenuOpen(true)} />

            {/* Mobile Menu Drawer */}
            <MobileMenu
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                userName={user.name || user.username}
                userRole={user.role}
            />

            <main className="min-h-screen pt-20 px-4 pb-24 md:pt-32 md:pb-12">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </>
    )
}
