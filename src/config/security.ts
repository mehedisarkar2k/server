import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { Request, Response } from 'express';
import { ENV } from '@/config';
import { SendResponse } from '@/core';

// Simple helmet configuration
export const helmetConfig = helmet();

// Basic rate limiting
export const rateLimitConfig = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: ENV.NODE_ENV === 'production' ? 100 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
        return SendResponse.tooManyRequests({
            res,
            message: 'Too many requests, please try again later.',
            data: {
                retryAfter: '15 minutes',
                windowMs: 15 * 60 * 1000,
                limit: ENV.NODE_ENV === 'production' ? 100 : 1000,
            },
        });
    },
});

// Auth rate limiting (stricter)
export const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: ENV.NODE_ENV === 'production' ? 5 : 50,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
        return SendResponse.tooManyRequests({
            res,
            message: 'Too many authentication attempts, please try again later.',
            data: {
                retryAfter: '15 minutes',
                windowMs: 15 * 60 * 1000,
                limit: ENV.NODE_ENV === 'production' ? 5 : 50,
            },
        });
    },
});

// CORS configuration
export const corsConfig = cors({
    origin:
        ENV.NODE_ENV === 'production'
            ? ENV.ALLOWED_ORIGINS?.split(',') || false
            : [
                'http://localhost:3000',
                'http://localhost:3001',
                'http://localhost:5173',
            ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
});

// CORS error handler middleware
export const corsErrorHandler = (req: Request, res: Response, next: any) => {
    // Check if CORS error occurred
    const origin = req.headers.origin;
    const allowedOrigins =
        ENV.NODE_ENV === 'production'
            ? ENV.ALLOWED_ORIGINS?.split(',') || []
            : [
                'http://localhost:3000',
                'http://localhost:3001',
                'http://localhost:5173',
            ];

    if (
        origin &&
        !allowedOrigins.includes(origin) &&
        ENV.NODE_ENV === 'production'
    ) {
        return SendResponse.forbidden({
            res,
            message: 'CORS policy violation: Origin not allowed',
            data: {
                origin,
            },
        });
    }

    next();
};
