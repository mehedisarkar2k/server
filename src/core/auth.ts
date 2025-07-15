import { ENV } from '@/config';
import { betterAuth } from 'better-auth';
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { DB } from './db';

export const auth = betterAuth({
    baseURL: ENV.BASE_URL,
    debug: ENV.NODE_ENV !== 'production',
    secret: ENV.BETTER_AUTH_SECRET,
    database: mongodbAdapter(DB!),

    // providers
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,

    },
})