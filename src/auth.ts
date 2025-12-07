import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import type { User } from '@/lib/definitions'; // Podríamos necesitar definir esto o usar el tipo de Prisma

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
                    // Verificar que el usuario existe en BD para reforzar seguridad (ej. si fue eliminado)
                    const user = await prisma.user.findUnique({ where: { id: token.sub } });

                    if (!user) {
                        console.log('Session Callback - User not found in DB (deleted?), invalidating session.');
                        session.user.id = ''; // ID Inválido
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
    session: {
        strategy: 'jwt',
        maxAge: 30 * 60, // 30 minutos
        updateAge: 5 * 60, // 5 minutos (actualizar sesión si se accede después de 5 min)
    },
    secret: process.env.AUTH_SECRET,
});
