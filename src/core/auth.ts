import { ENV } from '@/config';
import { betterAuth } from 'better-auth';
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { Db } from 'mongodb';


export const getAuthHandler = (db?: Db) => {
    if (!db) {
        throw new Error('Database connection is not established');
    }

    return betterAuth({
        trustedOrigins: ENV.ALLOWED_ORIGINS.split(','),
        debug: ENV.NODE_ENV !== 'production',
        secret: ENV.BETTER_AUTH_SECRET,
        database: mongodbAdapter(db),
        user: {
            modelName: 'User',
        },
        // providers
        emailAndPassword: {
            enabled: true,
            requireEmailVerification: false,
        },
        socialProviders: {
            google: {
                enabled: true,
                clientId: ENV.GOOGLE_CLIENT_ID,
                clientSecret: ENV.GOOGLE_CLIENT_SECRET,
                redirectURI: `${ENV.BASE_URL}/profile`,
            },
        }
    })
};