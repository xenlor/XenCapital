import { z } from 'zod';

export const SignupFormSchema = z.object({
    name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }).trim(),
    username: z.string().min(3, { message: 'El usuario debe tener al menos 3 caracteres.' }).trim(),
    password: z
        .string()
        .min(8, { message: 'Debe tener al menos 8 caracteres.' })
        .regex(/[a-zA-Z]/, { message: 'Debe contener al menos una letra.' })
        .regex(/[0-9]/, { message: 'Debe contener al menos un número.' })
        .regex(/[^a-zA-Z0-9]/, { message: 'Debe contener al menos un carácter especial.' })
        .trim(),
});

export type User = {
    id: string;
    name: string;
    username: string;
    password?: string;
};
