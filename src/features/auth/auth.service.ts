import { auth } from '@/core/auth';
import { AuthResponse } from './auth.model';

export class AuthService {
    /**
     * Sign up a new user using Better Auth server API
     */
    static async signUp(email: string, password: string, name: string): Promise<AuthResponse> {
        try {
            const response = await auth.api.signUpEmail({
                body: {
                    email,
                    password,
                    name,
                },
            });

            return {
                success: true,
                message: 'User created successfully',
                user: response.user ? {
                    id: response.user.id,
                    email: response.user.email,
                    name: response.user.name,
                    emailVerified: response.user.emailVerified,
                    image: response.user.image || undefined, // Convert null to undefined
                    createdAt: response.user.createdAt,
                    updatedAt: response.user.updatedAt,
                } : undefined,
                session: response.token ? {
                    token: response.token,
                    userId: response.user.id,
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                } : undefined,
            };
        } catch (error: any) {
            console.error('Sign up error:', error);
            return {
                success: false,
                message: error.message || 'Sign up failed',
            };
        }
    }

    /**
     * Sign in a user using Better Auth server API
     */
    static async signIn(email: string, password: string): Promise<AuthResponse> {
        try {
            const response = await auth.api.signInEmail({
                body: {
                    email,
                    password,
                },
            });

            return {
                success: true,
                message: 'Signed in successfully',
                user: response.user ? {
                    id: response.user.id,
                    email: response.user.email,
                    name: response.user.name,
                    emailVerified: response.user.emailVerified,
                    image: response.user.image || undefined, // Convert null to undefined
                    createdAt: response.user.createdAt,
                    updatedAt: response.user.updatedAt,
                } : undefined,
                session: response.token ? {
                    token: response.token,
                    userId: response.user.id,
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                } : undefined,
            };
        } catch (error: any) {
            console.error('Sign in error:', error);
            return {
                success: false,
                message: error.message || 'Invalid email or password',
            };
        }
    }

    /**
     * Sign out a user using Better Auth server API
     */
    static async signOut(token?: string): Promise<{ success: boolean; message: string }> {
        try {
            await auth.api.signOut({
                headers: token ? { 'authorization': `Bearer ${token}` } as any : {},
            });

            return {
                success: true,
                message: 'Signed out successfully',
            };
        } catch (error: any) {
            console.error('Sign out error:', error);
            return {
                success: false,
                message: error.message || 'Sign out failed',
            };
        }
    }

    /**
     * Get user session using Better Auth server API
     */
    static async getSession(token: string) {
        try {
            const response = await auth.api.getSession({
                headers: {
                    'authorization': `Bearer ${token}`,
                } as any,
            });

            return {
                success: true,
                data: response,
                message: 'Session retrieved successfully',
            };
        } catch (error: any) {
            console.error('Get session error:', error);
            return {
                success: false,
                message: error.message || 'Session not found',
            };
        }
    }
}