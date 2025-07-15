import express from 'express';

import { ENV } from '@/config'; // Ensure environment variables are loaded
import { Logger, SendResponse } from '@/core';
import { globalErrorHandler, asyncHandler, notFoundHandler } from '@/middlewares';

const app = express();

Logger.info(`Environment: ${ENV.NODE_ENV}`);

// Regular routes (no async, so no wrapper needed)
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
        data: { status: 'OK', timestamp: new Date().toISOString() },
        message: 'Health check successful',
    });
});

// Example of async route - MUST use asyncHandler
app.get('/test-async', asyncHandler(async (req, res) => {
    // This is just an example - you can remove this route
    // Simulate an async operation that might fail
    await new Promise(resolve => setTimeout(resolve, 100));

    SendResponse.success({
        res,
        data: { message: 'Async operation completed' },
        message: 'Test async route',
    });
}));

// 404 handler for routes that don't exist (MUST be after all routes)
app.use(notFoundHandler);

// Global error handler (MUST be last)
app.use(globalErrorHandler);

app.listen(ENV.PORT, () => {
    Logger.info(`Server is running on port:`, ENV.PORT);
    Logger.info(`Server URL: http://localhost:${ENV.PORT}`);
}).on('error', (error) => {
    Logger.error(`Error starting server: ${error}`);
    process.exit(1);
});