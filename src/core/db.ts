import { ENV } from '@/config';
import mongoose from 'mongoose';
import { Logger } from './logger';

let DB: mongoose.mongo.Db | undefined


async function connectToDatabase(): Promise<typeof mongoose> {
    try {
        const URI = `${ENV.MONGO_URI}/better-auth-${ENV.NODE_ENV}`;

        if (!URI) {
            throw new Error('Database URI is not defined in the configuration');
        }

        await mongoose.connect(URI, {});

        DB = mongoose.connection.db;

        Logger.info('Successfully connected to the database');

        mongoose.connection.on('disconnected', () => {
            Logger.warn('Database connection lost. Retrying...');
            connectToDatabase();
        });

        mongoose.connection.on('error', (err) => {
            DB = undefined;

            Logger.error('Unexpected database connection error:', err);
            process.exit(1);
        });

        return mongoose;
    } catch (error) {
        Logger.error('Failed to connect to the database', error);
        process.exit(1);
    }
}

export { DB, connectToDatabase };
