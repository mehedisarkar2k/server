import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

import { Logger, SendResponse } from '@/core';
import { ENV } from '@/config';

interface CustomError extends Error {
    statusCode?: number;
    status?: string;
    isOperational?: boolean;
}

/**
 * Global error handling middleware for Express applications.
 * This middleware should be placed at the end of the middleware stack.
 * It handles all errors that occur during request processing.
 */
export const globalErrorHandler = (
    error: CustomError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Log the error for monitoring and debugging
    Logger.error(`Error occurred: ${error.message}`, {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        statusCode: error.statusCode,
    });

    // Handle Zod validation errors
    if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
        }));

        return SendResponse.badRequest({
            res,
            message: 'Validation failed',
            data: {
                errors: formattedErrors,
            },
        });
    }

    // Handle mongoose/mongodb errors
    if (error.name === 'MongoError' || error.name === 'MongooseError') {
        return SendResponse.internalServerError({
            res,
            message: 'Database error occurred',
            data: ENV.NODE_ENV === 'development' ? { error: error.message } : undefined,
        });
    }

    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
        return SendResponse.unauthorized({
            res,
            message: 'Invalid token',
        });
    }

    if (error.name === 'TokenExpiredError') {
        return SendResponse.unauthorized({
            res,
            message: 'Token expired',
        });
    }

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
        return SendResponse.badRequest({
            res,
            message: 'Validation error',
            data: ENV.NODE_ENV === 'development' ? { error: error.message } : undefined,
        });
    }

    // Handle duplicate key errors (MongoDB)
    if (error.name === 'MongoServerError' && (error as any).code === 11000) {
        return SendResponse.conflict({
            res,
            message: 'Resource already exists',
            data: ENV.NODE_ENV === 'development' ? { error: error.message } : undefined,
        });
    }

    // Handle custom operational errors
    if (error.isOperational && error.statusCode) {
        const statusCode = error.statusCode;

        if (statusCode >= 400 && statusCode < 500) {
            return SendResponse.badRequest({
                res,
                message: error.message || 'Bad request',
            });
        }

        if (statusCode >= 500) {
            return SendResponse.internalServerError({
                res,
                message: error.message || 'Internal server error',
                data: ENV.NODE_ENV === 'development' ? { error: error.message } : undefined,
            });
        }
    }

    // Handle rate limiting errors
    if (error.message?.includes('Too many requests')) {
        return SendResponse.tooManyRequests({
            res,
            message: 'Too many requests, please try again later',
        });
    }

    // Default case: Internal server error
    const isDevelopment = ENV.NODE_ENV === 'development';

    return SendResponse.internalServerError({
        res,
        message: isDevelopment ? error.message : 'Something went wrong',
        data: isDevelopment ? {
            error: error.message,
            stack: error.stack,
        } : undefined,
    });
};
