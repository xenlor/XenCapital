import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    trustHost: true,
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnLoginPage = nextUrl.pathname.startsWith('/login');

            // If logged in and trying to access login page, redirect to home
            if (isLoggedIn && isOnLoginPage) {
                return Response.redirect(new URL('/', nextUrl));
            }

            // If not logged in and not on login page, deny access (will redirect to login)
            if (!isLoggedIn && !isOnLoginPage) {
                return false;
            }

            // Allow access in all other cases
            return true;
        },
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
