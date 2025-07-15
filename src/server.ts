import express from 'express';

import { corsConfig, ENV, helmetConfig, rateLimitConfig } from '@/config';
import {
    Logger,
    SendResponse,
    connectToDatabase,
    getAuthHandler,
} from '@/core';
import {
    globalErrorHandler,
    notFoundHandler,
    corsErrorHandler,
} from '@/middlewares';
import { toNodeHandler } from 'better-auth/node';
import { addLocals } from './middlewares/add-locals';

const app = express();

const startServer = async () => {
    // Trust proxy for production
    app.set('trust proxy', ENV.NODE_ENV === 'production');

    // Security middleware
    app.use(helmetConfig);
    app.use(corsConfig);
    app.use(corsErrorHandler);

    // Connect to the database
    const mongoose = await connectToDatabase();
    const DB = mongoose.connection.db;

    // better-auth middleware - handle all auth routes
    // Temporarily commented out due to path-to-regexp error
    app.all("/api/auth/*splat", toNodeHandler(getAuthHandler(DB)));

    // Body parsing
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Add database connection to res.locals
    // This allows access to the database connection in route handlers
    Logger.info('Adding database connection to res.locals');
    app.use(addLocals(DB));

    // Rate limiting
    app.use(rateLimitConfig);

    // Routes
    app.get('/', (req, res) => {
        SendResponse.success({
            res,
            data: {
                message: 'Server is running!',
                db: res.locals.db ? 'Connected' : 'Not connected',
            },
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
    // Using custom auth routes since Better Auth handler has path-to-regexp issues
    // app.use('/api/auth', authRouter);

    // ! 404 handler for routes that don't exist (MUST be after all routes)
    app.use(notFoundHandler);

    // ! Global error handler (MUST be last)
    app.use(globalErrorHandler);

    app
        .listen(ENV.PORT, async () => {
            Logger.info(`Server is running on port:`, ENV.PORT);
            Logger.info(`Server URL: http://localhost:${ENV.PORT}`);
        })
        .on('error', (error) => {
            Logger.error(`Error starting server: ${error}`);
            process.exit(1);
        });
};

startServer();
