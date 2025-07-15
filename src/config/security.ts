import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { ENV } from '@/config';

// Simple helmet configuration
export const helmetConfig = helmet();

// Basic rate limiting
export const rateLimitConfig = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: ENV.NODE_ENV === 'production' ? 100 : 1000,
    message: {
        error: 'Too many requests, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Auth rate limiting (stricter)
export const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: ENV.NODE_ENV === 'production' ? 5 : 50,
    message: {
        error: 'Too many authentication attempts, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// CORS configuration
export const corsConfig = cors({
    origin:
        ENV.NODE_ENV === 'production'
            ? ENV.ALLOWED_ORIGINS.split(',') || false
            : ['*'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
});
