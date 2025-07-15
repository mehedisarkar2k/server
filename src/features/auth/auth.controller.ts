import { Request, Response } from 'express';
import { SendResponse } from '@/core';
import { AuthService } from './auth.service';

export class AuthController {
    /**
     * Handle user signup
     */
    static async signUp(req: Request, res: Response) {
        try {
            // Extract validated data from request body
            const { email, password, name } = req.body;

            // Call auth service to create user
            const result = await AuthService.signUp(email, password, name);

            if (result.success) {
                return SendResponse.created({
                    res,
                    data: {
                        user: result.user,
                        session: result.session,
                    },
                    message: result.message,
                });
            } else {
                return SendResponse.badRequest({
                    res,
                    message: result.message,
                });
            }
        } catch (error: any) {
            console.error('Signup controller error:', error);
            return SendResponse.internalServerError({
                res,
                message: 'Internal server error during signup',
            });
        }
    }

    /**
     * Handle user signin
     */
    static async signIn(req: Request, res: Response) {
        try {
            // Extract validated data from request body
            const { email, password } = req.body;

            // Call auth service to sign in user
            const result = await AuthService.signIn(email, password);

            if (result.success) {
                return SendResponse.success({
                    res,
                    data: {
                        user: result.user,
                        session: result.session,
                    },
                    message: result.message,
                });
            } else {
                return SendResponse.unauthorized({
                    res,
                    message: result.message,
                });
            }
        } catch (error: any) {
            console.error('Signin controller error:', error);
            return SendResponse.internalServerError({
                res,
                message: 'Internal server error during signin',
            });
        }
    }

    /**
     * Handle user signout
     */
    static async signOut(req: Request, res: Response) {
        try {
            // Extract token from authorization header
            const token = req.headers.authorization?.replace('Bearer ', '');

            // Call auth service to sign out user
            const result = await AuthService.signOut(token);

            if (result.success) {
                return SendResponse.success({
                    res,
                    data: null,
                    message: result.message,
                });
            } else {
                return SendResponse.badRequest({
                    res,
                    message: result.message,
                });
            }
        } catch (error: any) {
            console.error('Signout controller error:', error);
            return SendResponse.internalServerError({
                res,
                message: 'Internal server error during signout',
            });
        }
    }

    /**
     * Get current user session
     */
    static async getSession(req: Request, res: Response) {
        try {
            // Extract token from authorization header
            const token = req.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                return SendResponse.unauthorized({
                    res,
                    message: 'Authorization token required',
                });
            }

            // Call auth service to get session
            const result = await AuthService.getSession(token);

            if (result.success) {
                return SendResponse.success({
                    res,
                    data: result.data,
                    message: result.message,
                });
            } else {
                return SendResponse.unauthorized({
                    res,
                    message: result.message,
                });
            }
        } catch (error: any) {
            console.error('Get session controller error:', error);
            return SendResponse.internalServerError({
                res,
                message: 'Internal server error while retrieving session',
            });
        }
    }
}