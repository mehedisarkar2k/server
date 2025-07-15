import { ENV } from '@/config';
import { betterAuth } from 'better-auth';
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import mongoose from 'mongoose';

// Wait for mongoose connection and create Better Auth instance
const createAuth = () => {
    return betterAuth({
        baseURL: ENV.BASE_URL,

        debug: ENV.NODE_ENV !== 'production',
        secret: ENV.BETTER_AUTH_SECRET,
        database: mongodbAdapter(mongoose.connection.db!),

        // providers
        emailAndPassword: {
            enabled: true,
            requireEmailVerification: false,
        },
    });
};

export const auth = createAuth();