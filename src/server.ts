import express from 'express';

import { ENV } from '@/config'; // Ensure environment variables are loaded
import { Logger, SendResponse } from '@/core';

const app = express();

Logger.info(`Environment: ${ENV.NODE_ENV}`);

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

app.listen(ENV.PORT, () => {
    Logger.info(`Server is running on port: ${ENV.PORT}`);
    Logger.info(`Server URL: http://localhost:${ENV.PORT}`);
}).on('error', (error) => {
    Logger.error(`Error starting server: ${error}`);
    process.exit(1);
});