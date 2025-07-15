import express from 'express';

import { ENV } from '@/config'; // Ensure environment variables are loaded
import { Logger } from '@/core';

const app = express();

Logger.info(`Environment: ${ENV.NODE_ENV}`);

app.listen(ENV.PORT, () => {
    Logger.info(`Server is running on port: ${ENV.PORT}`);
}).on('error', (error) => {
    Logger.error(`Error starting server: ${error}`);
});