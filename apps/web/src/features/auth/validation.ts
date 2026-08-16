import { z } from 'zod';

export const UsernameSchema = z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(15, 'Username must be at most 15 characters');

export const EmailSchema = z.string().min(1, 'Email is required').pipe(z.email());

export const PasswordSchema = z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(50, 'Password must be at most 50 characters');

export const LoginSchema = z.object({
    emailOrUsername: z.string().min(1, 'Email or username is required'),
    password: PasswordSchema,
});

export const RegisterSchema = z
    .object({
        username: UsernameSchema,
        email: EmailSchema,
        password: PasswordSchema,
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

export type LoginCredentials = z.infer<typeof LoginSchema>;
export type RegisterCredentials = z.infer<typeof RegisterSchema>;
