'use server';

import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { SignupFormSchema } from '@/lib/definitions';
import { redirect } from 'next/navigation';

import { RateLimiter } from 'limiter';

const limiter = new RateLimiter({ tokensPerInterval: 5, interval: 'minute' });

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    const remainingRequests = await limiter.removeTokens(1);
    if (remainingRequests < 0) {
        return 'Too many login attempts. Please try again later.';
    }

    try {
        await signIn('credentials', {
            username: formData.get('username'),
            password: formData.get('password'),
            redirect: false,
        });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }

    // If we reach here, login was successful
    redirect('/');
}

export async function register(prevState: any, formData: FormData) {
    // SEGURIDAD: Registro público deshabilitado
    // Los usuarios solo pueden ser creados por un administrador desde /admin/users
    return {
        message: 'El registro público está deshabilitado. Contacta al administrador.',
    };
}

export async function logout() {
    await signOut({ redirectTo: '/login' });
}
