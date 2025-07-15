import { z } from 'zod';

// User schema for validation
export const UserSchema = z.object({
    id: z.string(),
    email: z.email(),
    name: z.string().min(1, 'Name is required'),
    emailVerified: z.boolean().default(false),
    image: z.url().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

// User input schemas
export const SignUpSchema = z.object({
    body: z.object({
        email: z.email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        name: z.string().min(1, 'Name is required'),
    }),
});

export const SignInSchema = z.object({
    body: z.object({
        email: z.email('Invalid email address'),
        password: z.string().min(1, 'Password is required'),
    }),
});

export const UpdateProfileSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required').optional(),
        image: z.url('Invalid image URL').optional(),
    }),
});

// Types
export type User = z.infer<typeof UserSchema>;

// Response types
export interface AuthResponse {
    success: boolean;
    message: string;
    user?: Omit<User, 'password'>;
    session?: {
        token: string;
        userId: string;
        expiresAt: Date;
    };
}

export interface ProfileResponse {
    success: boolean;
    user?: Omit<User, 'password'>;
    message?: string;
}
