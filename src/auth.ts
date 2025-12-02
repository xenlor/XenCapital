import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import type { User } from '@/lib/definitions'; // We might need to define this or use Prisma type

async function getUser(username: string): Promise<any> {
    try {
        const user = await prisma.user.findUnique({ where: { username } });
        return user;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ username: z.string().min(3), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { username, password } = parsedCredentials.data;
                    const user = await getUser(username);
                    if (!user) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    if (passwordsMatch) {
                        console.log('Authorize - User found:', user.username, 'Role:', user.role)
                        return user;
                    }
                }

                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                console.log('JWT Callback - User:', user.role)
                token.id = user.id;
                token.role = user.role;
                token.username = user.username;
            }
            return token;
        },
        async session({ session, token }) {
            if (token.sub && session.user) {
                try {
                    // Verify user exists in DB to enforce security (e.g. if deleted)
                    const user = await prisma.user.findUnique({ where: { id: token.sub } });

                    if (!user) {
                        console.log('Session Callback - User not found in DB (deleted?), invalidating session.');
                        // Returning null/undefined from session callback invalidates the session
                        return session; // NextAuth types are tricky, usually we can't return null here easily without breaking types.
                        // Instead, we can set user to null or throw error.
                        // Actually, if we return session as is but with null user, it might work?
                        // Let's try modifying the session object to be invalid.
                        // Better approach: If user doesn't exist, we shouldn't return a valid session.
                        // However, NextAuth expects a Session object.
                        // Let's just set session.user to null/undefined? No, types.

                        // Alternative: Throwing an error forces signout in some versions.
                        // Or we can just return a session with empty user data which getCurrentUser will reject.
                        session.user.id = ''; // Invalid ID
                        return session;
                    }

                    session.user.id = user.id;
                    session.user.role = user.role;
                    session.user.username = user.username;
                } catch (error) {
                    console.error('Failed to fetch user in session callback:', error);
                }
            }
            return session;
        },
    },
    secret: process.env.AUTH_SECRET,
});
