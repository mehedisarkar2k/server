import express from 'express';

import { corsConfig, ENV, helmetConfig, rateLimitConfig } from '@/config';
import { connectToDatabase, Logger, SendResponse, auth } from '@/core';
import {
    globalErrorHandler,
    notFoundHandler,
    corsErrorHandler,
} from '@/middlewares';
import { authRouter } from '@/features/auth/auth.route';
import { toNodeHandler } from "better-auth/node";


const app = express();

// Trust proxy for production
app.set('trust proxy', ENV.NODE_ENV === 'production');

// Security middleware
app.use(helmetConfig);
app.use(corsConfig);
app.use(corsErrorHandler);

// better-auth middleware
app.all("/api/auth/*splat", toNodeHandler(auth));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(rateLimitConfig);

// Routes
app.get('/', (req, res) => {
    SendResponse.success({
        res,
        data: { message: 'Server is running!' },
        message: 'Welcome to the Better Auth Test Server',
    });
});

app.get('/health', (req, res) => {
    SendResponse.success({
        res,
        data: {
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: ENV.NODE_ENV,
        },
        message: 'Health check successful',
    });
});

// API Routes
app.use('/api/auth', authRouter);

// ! 404 handler for routes that don't exist (MUST be after all routes)
app.use(notFoundHandler);

// ! Global error handler (MUST be last)
app.use(globalErrorHandler);

app
    .listen(ENV.PORT, async () => {
        await connectToDatabase();
        Logger.info(`Server is running on port:`, ENV.PORT);
        Logger.info(`Server URL: http://localhost:${ENV.PORT}`);
    })
    .on('error', (error) => {
        Logger.error(`Error starting server: ${error}`);
        process.exit(1);
    });
